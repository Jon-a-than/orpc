import { defineErrorHandler } from 'nitro'

import { logger } from './infra'

export default defineErrorHandler((error, event) => {
  const e = error instanceof Error ? error : new Error('Unknown error', { cause: error })

  logger.error(e.message, {
    ...e,
    headers: Object.fromEntries(event.req.headers),
    method: event.req.method,
    pathname: event.req._url?.pathname,
    query: event.req._url?.search,
    requestId: event.req.context?.requestId,
    stack: e.stack
  })

  return Response.json(
    {
      code: 'INTERNAL_SERVER_ERROR',
      message: e.message
    },
    { status: 500 }
  )
})
