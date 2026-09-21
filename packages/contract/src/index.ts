import { oc } from '@orpc/contract'
import { openapi } from '@orpc/openapi'
import * as v from 'valibot'

const base = oc.meta(
  openapi({
    inputStructure: 'detailed',
    requestBodyHint: 'json',
    responseBodyHint: 'json'
  })
)

const users = base.meta(
  openapi({
    method: 'GET',
    tags: ['User Management']
  })
)

const tasks = base.meta(openapi({ tags: ['Tasks'] }))

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
  tasks: {
    create: tasks
      .meta(
        openapi({
          method: 'POST',
          operationId: 'createTask',
          path: '/tasks',
          successStatus: 201
        })
      )
      .input(
        v.object({
          body: v.object({
            description: v.string(),
            title: v.string()
          })
        })
      ),
    list: tasks
      .meta(
        openapi({
          description: 'List all tasks',
          method: 'QUERY',
          operationId: 'queryTasks',
          path: '/tasks'
        })
      )
      .input(
        v.object({
          query: v.object({
            page: v.fallback(v.optional(v.pipe(v.number(), v.minValue(1, 'page must be at least 1'))), 1),
            pageSize: v.fallback(v.optional(v.pipe(v.number(), v.maxValue(100, 'pageSize must be at most 100'))), 10)
          })
        })
      )
      .output(
        v.array(
          v.object({
            createdAt: v.pipe(v.string(), v.isoTimestamp()),
            description: v.string(),
            id: v.string(),
            title: v.string(),
            updatedAt: v.pipe(v.string(), v.isoTimestamp())
          })
        )
      )
  },
  users: users
    .meta(
      openapi({
        method: 'QUERY',
        operationId: 'queryUserProfile',
        path: '/users'
      })
    )
    .errors({
      'FORBIDDEN::USER_NOT_FOUND': {
        data: v.void(),
        message: 'user not found'
      }
    })
    .input(
      v.object({
        body: v.object({
          username: v.pipe(v.string(), v.minLength(1, 'username must be at least 1 character long'))
        })
      })
    )
    .output(
      v.object({
        avatar: v.string(),
        username: v.string()
      })
    )
}
