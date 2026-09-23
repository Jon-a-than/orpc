import { oc } from '@orpc/contract'
import { openapi } from '@orpc/openapi'
import * as v from 'valibot'

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
      data: v.void(),
      message: 'This feature is not implemented yet'
    },
    'UNAUTHORIZED::NOT_SIGN_IN': {
      data: v.void(),
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
          data: v.void(),
          message: 'You are not the author of this task'
        },
        'NOT_FOUND::TASK_NOT_FOUND': {
          data: v.void(),
          message: 'Task not found or has already been deleted'
        }
      })
      .input(
        v.object({
          body: v.object({
            id: v.pipe(v.number(), v.integer(), v.minValue(1, 'id must be a positive integer'))
          })
        })
      )
      .output(
        v.object({
          status: v.literal(true)
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
        v.object({
          query: v.object({
            keyword: v.optional(v.string()),
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
            id: v.number(),
            title: v.string(),
            updatedAt: v.pipe(v.string(), v.isoTimestamp())
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
          data: v.void(),
          message: 'You are not the author of this task'
        },
        'NOT_FOUND::TASK_NOT_FOUND': {
          data: v.void(),
          message: 'Task not found or has already been deleted'
        }
      })
      .input(
        v.object({
          body: v.object({
            description: v.optional(v.string()),
            id: v.pipe(v.number(), v.integer(), v.minValue(1, 'id must be a positive integer')),
            title: v.optional(v.string())
          })
        })
      )
      .output(
        v.object({
          status: v.literal(true)
        })
      )
  }
}

export { type ErrorCode, ErrorStatusMap } from './error-status-map.gen'
