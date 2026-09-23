import { resolve } from 'node:path'

import { PGlite } from '@electric-sql/pglite'
import { createRouterClient } from '@orpc/server'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import * as database from '../db'
import { relations } from '../db/relation'
import { router } from './index'

const client = new PGlite()
const db = drizzle({ client, relations })
const api = (token = 'alice-token') =>
  createRouterClient(router, { context: { reqHeaders: new Headers({ authorization: `Bearer ${token}` }) } })

beforeAll(async () => {
  await migrate(db, { migrationsFolder: resolve(import.meta.dirname, '../../drizzle') })
  vi.spyOn(database, 'getDatabase').mockResolvedValue(db)
  for (const id of ['alice', 'bob']) {
    await db.insert(database.schema.users).values({ email: `${id}@example.com`, id, name: id })
    await db.insert(database.schema.sessions).values({
      expiresAt: new Date('2099-01-01'),
      id,
      token: `${id}-token`,
      userId: id
    })
  }
})

beforeEach(async () => {
  await db.delete(database.schema.tasks)
})

afterAll(async () => {
  vi.restoreAllMocks()
  await client.close()
})

describe('tasks router', () => {
  test('created tasks appear in the author task list', async () => {
    await api().tasks.create({ body: { description: 'First task', title: 'Read' } })

    await expect(api().tasks.list({ query: {} })).resolves.toEqual([
      {
        createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        description: 'First task',
        id: expect.any(Number),
        title: 'Read',
        updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/)
      }
    ])
  })

  test('list searches title and description, paginates, and excludes other authors', async () => {
    await api().tasks.create({ body: { description: 'one', title: 'Alpha' } })
    await api().tasks.create({ body: { description: 'ALPHA notes', title: 'Beta' } })
    await api().tasks.create({ body: { description: 'three', title: 'Other' } })
    await api('bob-token').tasks.create({ body: { description: 'hidden', title: 'Alpha private' } })

    const result = await api().tasks.list({ query: { keyword: 'alpha', page: 2, pageSize: 1 } })
    expect(result.map(({ title }) => title)).toEqual(['Beta'])
    await expect(api().tasks.list({ query: { keyword: 'alpha', page: 3, pageSize: 1 } })).resolves.toEqual([])
  })

  test('authors can update a task without replacing omitted fields', async () => {
    await api().tasks.create({ body: { description: 'Keep me', title: 'Original' } })
    const [task] = await api().tasks.list({ query: {} })

    await expect(api().tasks.update({ body: { id: task.id, title: 'Changed' } })).resolves.toEqual({ status: true })
    const [updated] = await api().tasks.list({ query: {} })
    expect(updated).toMatchObject({ description: 'Keep me', id: task.id, title: 'Changed' })
  })

  test('another user cannot update a task', async () => {
    await api().tasks.create({ body: { description: 'Keep me', title: 'Original' } })
    const [task] = await api().tasks.list({ query: {} })
    await expect(api('bob-token').tasks.update({ body: { id: task.id, title: 'Stolen' } })).rejects.toMatchObject({
      code: 'FORBIDDEN::TASK_NOT_AUTHOR'
    })
    await expect(api().tasks.list({ query: {} })).resolves.toEqual([task])
  })

  test('updating a missing task reports not found', async () => {
    await expect(api().tasks.update({ body: { id: 2147483647, title: 'Missing' } })).rejects.toMatchObject({
      code: 'NOT_FOUND::TASK_NOT_FOUND'
    })
  })

  test('authors can delete their tasks', async () => {
    await api().tasks.create({ body: { description: 'Task', title: 'Remove' } })
    const [task] = await api().tasks.list({ query: {} })
    await expect(api().tasks.delete({ body: { id: task.id } })).resolves.toEqual({ status: true })
    await expect(api().tasks.list({ query: {} })).resolves.toEqual([])
  })

  test('another user cannot delete a task', async () => {
    await api().tasks.create({ body: { description: 'Task', title: 'Keep' } })
    const [task] = await api().tasks.list({ query: {} })
    await expect(api('bob-token').tasks.delete({ body: { id: task.id } })).rejects.toMatchObject({
      code: 'FORBIDDEN::TASK_NOT_AUTHOR'
    })
    await expect(api().tasks.list({ query: {} })).resolves.toEqual([task])
  })

  test('deleting an already deleted task reports not found', async () => {
    await api().tasks.create({ body: { description: 'Task', title: 'Remove' } })
    const [task] = await api().tasks.list({ query: {} })
    await api().tasks.delete({ body: { id: task.id } })
    await expect(api().tasks.delete({ body: { id: task.id } })).rejects.toMatchObject({
      code: 'NOT_FOUND::TASK_NOT_FOUND'
    })
  })

  test.each([
    ['create', () => api('invalid').tasks.create({ body: { description: 'Session', title: 'No' } })],
    ['list', () => api('invalid').tasks.list({ query: {} })],
    ['update', () => api('invalid').tasks.update({ body: { id: 1, title: 'No' } })],
    ['delete', () => api('invalid').tasks.delete({ body: { id: 1 } })]
  ])('%s requires a valid session', async (_, request) => {
    await expect(request()).rejects.toMatchObject({ code: 'UNAUTHORIZED::NOT_SIGN_IN' })
  })

  test('ping is available without a session', async () => {
    await expect(api('invalid').ping()).resolves.toEqual({ message: 'pong' })
  })
})
