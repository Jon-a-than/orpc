import { ORPCError, os } from '@orpc/server'
import { measure } from '@qingshaner/utility-orpc'
import { type Auth, type BetterAuthOptions, betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { bearer, jwt, openAPI } from 'better-auth/plugins'

import type { RequestHeadersHandlerPluginContext } from '@orpc/server/plugins'

import { getDatabase, schema } from '../db'
import { getConfig, getLogger } from '../infra'

export const authBasePath = '/api/auth'

type Options = BetterAuthOptions & {
  plugins: [ReturnType<typeof bearer>, ReturnType<typeof jwt>, ReturnType<typeof openAPI>]
}

let $auth: Auth<Options>

const getBetterAuthOptions = async (): Promise<Options> => {
  const logger = getLogger('auth')
  const config = await getConfig()
  return {
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
      log: (level: 'error' | 'debug' | 'info' | 'warn', message: string, ...args: unknown[]) => {
        const properties = args.length > 0 ? { args } : undefined

        logger[level](message, properties)
      }
    },
    plugins: [bearer(), jwt(), openAPI()],
    secret: config.auth.secret,
    socialProviders: {
      github: config.auth.github
    }
  } as const satisfies BetterAuthOptions
}

export const getAuth = async (): Promise<typeof $auth> => {
  if (!$auth) {
    $auth = betterAuth(await getBetterAuthOptions())
  }

  return $auth
}

interface ServerContext extends RequestHeadersHandlerPluginContext {}

const base = os.$context<ServerContext>()

export const requireSession = base.middleware(({ context, next }) =>
  measure('middleware.requireSession', async () => {
    const auth = await getAuth()
    const session = await auth.api.getSession({
      headers: context.reqHeaders ?? new Headers()
    })

    if (!session) {
      throw new ORPCError('FORBIDDEN::REQUIRE_LOGIN', {
        message: 'You must be logged in to access this resource'
      })
    }

    return next({ context: { session } })
  })
)
