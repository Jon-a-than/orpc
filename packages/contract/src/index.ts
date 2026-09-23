import { oc } from '@orpc/contract'
import { openapi } from '@orpc/openapi'
import * as z from 'zod/mini'

const base = oc
  .meta(
    openapi({
      inputStructure: 'detailed',
      requestBodyHint: 'json',
      responseBodyHint: 'json'
    })
  )
  .errors({
    'NOT_IMPLEMENTED::FEATURE_NOT_IMPLEMENTED': {
      data: z.void(),
      message: 'This feature is not implemented yet'
    },
    'UNAUTHORIZED::NOT_SIGN_IN': {
      data: z.void(),
      message: 'You must be logged in to access this resource'
    }
  })

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
    .output(z.object({ message: z.string() })),
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
        z.object({
          body: z.object({
            description: z.string(),
            title: z.string()
          })
        })
      ),
    delete: tasks
      .meta(
        openapi({
          description: 'Delete a task by its ID',
          method: 'DELETE',
          operationId: 'deleteTask'
        })
      )
      .errors({
        'FORBIDDEN::TASK_NOT_AUTHOR': {
          data: z.void(),
          message: 'You are not the author of this task'
        },
        'NOT_FOUND::TASK_NOT_FOUND': {
          data: z.void(),
          message: 'Task not found or has already been deleted'
        }
      })
      .input(
        z.object({
          body: z.object({
            id: z.number().check(z.int(), z.minimum(1, 'id must be a positive integer'))
          })
        })
      )
      .output(
        z.object({
          status: z.literal(true)
        })
      ),
    list: tasks
      .meta(
        openapi({
          description: 'Query user tasks',
          method: 'QUERY',
          operationId: 'queryTasks',
          path: '/tasks'
        })
      )
      .input(
        z.object({
          query: z.object({
            keyword: z.optional(z.string()),
            page: z.catch(z.optional(z.number().check(z.minimum(1, 'page must be at least 1'))), 1),
            pageSize: z.catch(z.optional(z.number().check(z.maximum(100, 'pageSize must be at most 100'))), 10)
          })
        })
      )
      .output(
        z.array(
          z.object({
            createdAt: z.iso.datetime({ offset: true }),
            description: z.string(),
            id: z.number(),
            title: z.string(),
            updatedAt: z.iso.datetime({ offset: true })
          })
        )
      ),
    update: tasks
      .meta(
        openapi({
          description: 'Update a task by its ID',
          method: 'PUT',
          operationId: 'updateTask'
        })
      )
      .errors({
        'FORBIDDEN::TASK_NOT_AUTHOR': {
          data: z.void(),
          message: 'You are not the author of this task'
        },
        'NOT_FOUND::TASK_NOT_FOUND': {
          data: z.void(),
          message: 'Task not found or has already been deleted'
        }
      })
      .input(
        z.object({
          body: z.object({
            description: z.optional(z.string()),
            id: z.number().check(z.int(), z.minimum(1, 'id must be a positive integer')),
            title: z.optional(z.string())
          })
        })
      )
      .output(
        z.object({
          status: z.literal(true)
        })
      )
  }
}

export { type ErrorCode, ErrorStatusMap } from './error-status-map.gen'
