// cspell:ignore ilike
import { type Context, implement } from '@orpc/server'
import { contract } from '@qingshaner/contract'
import { and, asc, eq, ilike, or } from 'drizzle-orm'

import { getDatabase, schema } from '../db'
import { requireSession } from '../middlewares'

interface AppContext extends Context {
  reqHeaders: Headers
}

const implementer = implement(contract)

const base = implementer.$context<AppContext>()

const ping = base.ping.handler(() => {
  return { message: 'pong' }
})

const tasks = base.use(requireSession).tasks

export const router = implementer.router({
  ping,
  tasks: {
    create: tasks.create.handler(async ({ input, context }) => {
      const db = await getDatabase()
      await db.insert(schema.tasks).values({ ...input.body, creatorId: context.session.user.id })
    }),
    delete: tasks.delete.handler(async ({ input, context, errors }) => {
      const db = await getDatabase()
      const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, input.body.id))
      if (task && task.creatorId !== context.session.user.id) {
        throw errors['FORBIDDEN::TASK_NOT_AUTHOR']()
      }
      const deleted = await db
        .delete(schema.tasks)
        .where(and(eq(schema.tasks.id, input.body.id), eq(schema.tasks.creatorId, context.session.user.id)))
        .returning()
      if (deleted.length === 0) {
        throw errors['NOT_FOUND::TASK_NOT_FOUND']()
      }
      return { status: true }
    }),
    list: tasks.list.handler(async ({ input, context }) => {
      const db = await getDatabase()
      const { keyword, page = 1, pageSize = 10 } = input.query
      const rows = await db
        .select()
        .from(schema.tasks)
        .where(
          and(
            eq(schema.tasks.creatorId, context.session.user.id),
            keyword
              ? or(ilike(schema.tasks.title, `%${keyword}%`), ilike(schema.tasks.description, `%${keyword}%`))
              : undefined
          )
        )
        .orderBy(asc(schema.tasks.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize)
      return rows.map(({ creatorId: _, createdAt, updatedAt, ...task }) => ({
        ...task,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString()
      }))
    }),
    update: tasks.update.handler(async ({ input, context, errors }) => {
      const db = await getDatabase()
      const { id, ...changes } = input.body
      const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id))
      if (!task) {
        throw errors['NOT_FOUND::TASK_NOT_FOUND']()
      }
      if (task.creatorId !== context.session.user.id) {
        throw errors['FORBIDDEN::TASK_NOT_AUTHOR']()
      }
      await db
        .update(schema.tasks)
        .set({ ...changes, updatedAt: new Date() })
        .where(and(eq(schema.tasks.id, id), eq(schema.tasks.creatorId, context.session.user.id)))
      return { status: true }
    })
  }
})
