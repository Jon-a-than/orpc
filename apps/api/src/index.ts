import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { onError } from '@orpc/server'
import { ErrorStatusMap } from '@qingshaner/contract'
import { measure } from '@qingshaner/utility-orpc'

import type { ServerRequest } from 'nitro/types'
import './error-code.d.ts'

import { logger } from './infra'
import { authBasePath, getAuth } from './middlewares'
import { router } from './router'
import { apiPrefix, generateOpenAPISpec } from './spec'

const app = new OpenAPIHandler(router, {
  errorStatusMap: ErrorStatusMap,
  interceptors: [
    onError((error, { request, context }) => {
      const e = error instanceof Error ? error : new Error('Unknown error', { cause: error })
      const url = new URL(`http://localhost${request.url}`)
      logger.error(e.message, {
        ...e,
        headers: request.headers,
        method: request.method,
        pathname: url.pathname,
        query: url.search,
        requestId: context?.requestId,
        stack: e.stack
      })
    })
  ]
})

export default {
  async fetch(req: ServerRequest): Promise<Response> {
    const isDevOrPrerender = import.meta.dev || import.meta.prerender
    if (isDevOrPrerender && req.method === 'GET') {
      if (req._url?.pathname === '/spec.json') {
        return generateOpenAPISpec()
      }
      if (req._url?.pathname === '/auth-spec.json') {
        return Response.json(await (await getAuth()).api.generateOpenAPISchema())
      }
    }

    if (req._url?.pathname.startsWith(authBasePath) && (req.method === 'POST' || req.method === 'GET')) {
      const auth = await getAuth()
      return measure('better-auth', () => auth.handler(req), {
        description: 'auth handler'
      })
    }

    const { matched, response } = await measure(
      'handler',
      () =>
        app.handle(req, {
          context: {
            ...req.context,
            reqHeaders: req.headers
          },
          prefix: apiPrefix
        }),
      {
        description: 'api handler'
      }
    )

    return matched
      ? response
      : Response.json({ code: 'NOT_FOUND', message: 'This api endpoint is undefined' }, { status: 404 })
  }
}
