import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { type Context, onError } from '@orpc/server'

import type { FetchHandlerPlugin } from '@orpc/server/fetch'
import type { ServerRequest } from 'nitro/types'

import { appContext, applyMetrics } from './context'
import { logger } from './logger'
import { router } from './routes'
import { apiPrefix, generateOpenAPISpec } from './spec'

export const metricsPlugin: FetchHandlerPlugin<Context> = {
  initFetchHandlerOptions(options) {
    return {
      ...options,
      fetchInterceptors: [
        ({ next }) => {
          const requestId = crypto.randomUUID()
          const metrics = {}

          return appContext.run({ metrics, requestId }, async () => {
            const result = await next()

            if (result.matched) {
              result.response.headers.set('X-Request-ID', requestId)
              applyMetrics(result.response.headers, metrics)
            }

            return result
          })
        },
        ...(options.fetchInterceptors ?? [])
      ]
    }
  },
  name: 'app-metrics'
}

const app = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      logger.error({
        error
      })
    })
  ],
  plugins: [metricsPlugin]
})

const NotFound = Response.json({ code: 'NOT_FOUND', message: 'This api endpoint is undefined' }, { status: 404 })

export default {
  async fetch(req: ServerRequest): Promise<Response> {
    const isDevOrPrerender = import.meta.dev || import.meta.prerender
    if (isDevOrPrerender && req.method === 'GET' && req._url?.pathname === '/spec.json') {
      return generateOpenAPISpec()
    }

    const { matched, response } = await app.handle(req, {
      context: {},
      prefix: apiPrefix
    })

    return matched ? response : NotFound
  }
}
