import { type Context, implement } from '@orpc/server'
import { contract } from '@qingshaner/contract'

import { requireSession } from '../middlewares'

interface AppContext extends Context {
  reqHeaders: Headers
}

const implementer = implement(contract)

const base = implementer.$context<AppContext>()

const ping = base.ping.handler(() => {
  return { message: 'pong' }
})
const users = base.users.use(requireSession).handler(({ errors, context }) => {
  console.log('context', context)
  throw errors['FORBIDDEN::USER_NOT_FOUND']()
})

export const router = implementer.router({
  ping,
  users
})
