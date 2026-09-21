import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { onError } from '@orpc/server'
import { AppContextPlugin } from '@qingshaner/utility-orpc'

import type { ServerRequest } from 'nitro/types'

import { logger } from './logger'
import { router } from './routes'
import { apiPrefix, generateOpenAPISpec } from './spec'

const app = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      logger.error({
        error
      })
    })
  ],
  plugins: [
    new AppContextPlugin({
      features: {
        serverTiming: true
      }
    })
  ]
})

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

    return matched
      ? response
      : Response.json({ code: 'NOT_FOUND', message: 'This api endpoint is undefined' }, { status: 404 })
  }
}
