import { ORPCError, os } from '@orpc/server'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { bearer, jwt } from 'better-auth/plugins'

import type { RequestHeadersHandlerPluginContext } from '@orpc/server/plugins'

import { getDatabase, schema } from '../db'
import { getConfig, getLogger } from '../infra'

// The `jwt` plugin's endpoint types embed a non-portable internal zod type,
// which breaks `.d.ts` emission for this module (better-auth/better-auth#4250).
// We hand-roll the slice of the `auth` instance we actually consume so the
// exported type stays portable.
// type AuthSession = typeof schema.sessions.$inferSelect
// type AuthUser = typeof schema.users.$inferSelect

// interface AppAuth {
//   api: {
//     getSession: (input: { headers: Headers }) => Promise<{ session: AuthSession; user: AuthUser } | null>
//   }
//   handler: (request: Request) => Promise<Response>
// }

export const authBasePath = '/api/auth'
let $auth: ReturnType<typeof createAuth>
const createAuth = async () => {
  const logger = getLogger('auth')
  const config = await getConfig()
  return betterAuth({
    basePath: authBasePath,
    baseURL: config.baseURL,
    database: drizzleAdapter(await getDatabase(), {
      debugLogs: true,
      provider: 'pg',
      schema,
      usePlural: true
    }),
    logger: {
      level: 'debug',
      log: (level, message, ...args) => {
        const properties = args.length > 0 ? { args } : undefined

        logger[level](message, properties)
      }
    },
    plugins: [bearer(), jwt()],
    secret: config.auth.secret,
    socialProviders: {
      github: config.auth.github
    }
  })
}

export const getAuth = (): typeof $auth => {
  if (!$auth) {
    $auth = createAuth()
  }

  return $auth
}

interface ServerContext extends RequestHeadersHandlerPluginContext {}

const base = os.$context<ServerContext>()

export const requireSession = base.middleware(async ({ context, next }) => {
  const auth = await getAuth()
  const session = await auth.api.getSession({
    headers: context.reqHeaders ?? new Headers()
  })

  if (!session) {
    throw new ORPCError('UNAUTHORIZED', {
      message: 'You must be logged in to access this resource'
    })
  }

  return next({ context: { session } })
})
