import { definePlugin } from 'nitro'

import { cleanup, logger } from '../infra'

export default definePlugin((nitro) => {
  nitro.hooks.hook('request', ({ req }) => {
    let requestId = req.headers.get('x-request-id')
    if (!requestId) {
      requestId = crypto.randomUUID()
      req.headers.set('x-request-id', requestId)
    }
    performance.mark(`req-start:${requestId}`)

    req.context = {
      ...req.context,
      requestId,
      startTime: performance.now()
    }

    logger.debug('request start', {
      headers: Object.fromEntries(req.headers),
      method: req.method,
      pathname: req._url?.pathname,
      query: req._url?.search,
      requestId,
      runtime: req.runtime?.name
    })
  })

  nitro.hooks.hook('response', (res, { req }) => {
    const durationMs =
      typeof req.context?.startTime === 'number'
        ? Math.round((performance.now() - req.context?.startTime) * 100) / 100
        : undefined

    logger.info('request end', {
      durationMs,
      headers: Object.fromEntries(res.headers),
      method: req.method,
      pathname: req._url?.pathname,
      query: req._url?.search,
      requestId: req.context?.requestId,
      runtime: req.runtime?.name,
      status: res.status
    })
  })

  nitro.hooks.hook('close', cleanup)
})
