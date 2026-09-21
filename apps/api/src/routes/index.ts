import { implement } from '@orpc/server'
import { contract } from '@qingshaner/contract'

import type { ResponseHeadersHandlerPluginContext } from '@orpc/server/plugins'

const implementer = implement(contract)

const base = implementer.$context<ResponseHeadersHandlerPluginContext>()

const ping = base.ping.handler(() => {
  return { message: 'pong' }
})
const users = base.users.handler(({ errors }) => {
  throw errors['FORBIDDEN::USER_NOT_FOUND']()
})

export const router = implementer.router({
  ping,
  users
})
