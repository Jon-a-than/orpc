import { oc } from '@orpc/contract'
import { openapi } from '@orpc/openapi'
import * as v from 'valibot'

const base = oc.meta()

const users = base.meta(
  openapi({
    method: 'GET',
    operationId: 'getUserProfile',
    tags: ['User Info']
  })
)

export const contract = {
  ping: base
    .meta(
      openapi({
        method: 'GET',
        operationId: 'ping',
        path: '/ping',
        tags: ['Health Check']
      })
    )
    .output(v.object({ message: v.string() })),
  users: users
    .errors({
      'FORBIDDEN::USER_NOT_FOUND': {
        data: v.void(),
        message: 'user not found'
      }
    })
    .input(
      v.object({
        username: v.pipe(v.string(), v.minLength(1, 'username must be at least 1 character long'))
      })
    )
    .output(
      v.object({
        avatar: v.string(),
        username: v.string()
      })
    )
}
