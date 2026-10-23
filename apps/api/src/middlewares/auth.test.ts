import { resolve } from 'node:path'

import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import * as database from '../db'
import { relations } from '../db/relation'
import * as infra from '../infra'
import { getAuth } from './auth'

const client = new PGlite()
const db = drizzle({ client, relations })
const origin = 'http://localhost:5173'

beforeAll(async () => {
  await migrate(db, { migrationsFolder: resolve(import.meta.dirname, '../../drizzle') })
  vi.spyOn(database, 'getDatabase').mockResolvedValue(db)
  vi.spyOn(infra, 'getConfig').mockResolvedValue({
    auth: {
      github: { clientId: 'test-client', clientSecret: 'test-secret' },
      secret: 'test-auth-secret-with-at-least-32-characters',
      trustedOrigins: [origin]
    },
    baseURL: 'http://localhost:3000',
    database: { driver: 'pglite' },
    store: { base: '.data/test', driver: 'fs-lite' }
  })
})

afterAll(async () => {
  vi.restoreAllMocks()
  await client.close()
})

const request = async (path: string, body?: object, cookie = '') =>
  (await getAuth()).handler(
    new Request(`http://localhost:3000/api/auth/${path}`, {
      body: body ? JSON.stringify(body) : undefined,
      headers: { 'content-type': 'application/json', cookie, origin },
      method: body ? 'POST' : 'GET'
    })
  )
const cookies = (response: Response) =>
  response.headers
    .getSetCookie()
    .map((value) => value.split(';')[0])
    .join('; ')
const register = () =>
  request('sign-up/email', {
    email: `${crypto.randomUUID()}@example.com`,
    name: 'Test User',
    password: 'test-password-123'
  })

describe('account authentication', () => {
  test('registers an email account with an authenticated session', async () => {
    const response = await register()
    expect(response.status).toBe(200)
    const session = await request('get-session', undefined, cookies(response))
    expect(await session.json()).toMatchObject({ user: { name: 'Test User' } })
  })

  test('allows password login and rejects an incorrect password', async () => {
    const account = await (await register()).json()
    const valid = await request('sign-in/email', { email: account.user.email, password: 'test-password-123' })
    expect(valid.status).toBe(200)
    const invalid = await request('sign-in/email', { email: account.user.email, password: 'wrong-password' })
    expect(invalid.status).toBe(401)
  })

  test('persists name and avatar changes and allows removing the avatar', async () => {
    const cookie = cookies(await register())
    const updated = await request(
      'update-user',
      { image: 'https://example.com/avatar.png', name: 'Updated Name' },
      cookie
    )
    expect(updated.status).toBe(200)
    const session = await request('get-session', undefined, cookie)
    expect(await session.json()).toMatchObject({
      user: { image: 'https://example.com/avatar.png', name: 'Updated Name' }
    })
    expect((await request('update-user', { image: null }, cookie)).status).toBe(200)
    expect(await (await request('get-session', undefined, cookie)).json()).toMatchObject({ user: { image: null } })
  })

  test('rejects profile updates after sign-out', async () => {
    const cookie = cookies(await register())
    expect((await request('sign-out', {}, cookie)).status).toBe(200)
    expect((await request('update-user', { name: 'Unauthorized' }, cookie)).status).toBe(401)
  })

  test('creates a GitHub authorization URL with the API callback', async () => {
    const response = await request('sign-in/social', { callbackURL: origin, disableRedirect: true, provider: 'github' })
    expect(response.status).toBe(200)
    const url = new URL((await response.json()).url)
    expect(url.hostname).toBe('github.com')
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/api/auth/callback/github')
    expect(url.searchParams.get('state')).not.toBeNull()
  })
})
