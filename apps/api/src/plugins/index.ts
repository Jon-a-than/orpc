import { nitroPlugin } from '@qingshaner/utility-orpc'

import { logger } from '../infra'

export default nitroPlugin({
  features: {
    requestId: true,
    serverTiming: import.meta.dev
  },
  logger
})
