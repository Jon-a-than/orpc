import { resolve } from 'node:path'

import { loadConfig } from 'c12'
import { useRuntimeConfig } from 'nitro/runtime-config'
import * as z from 'zod/mini'

import { logger } from './logger'

const configSchema = z.object({
  auth: z.object({
    github: z.object({
      clientId: z.string().check(z.minLength(1)),
      clientSecret: z.string().check(z.minLength(1))
    }),

    secret: z.string().check(z.minLength(32))
  }),

  baseURL: z.url(),

  database: z.discriminatedUnion('driver', [
    z.object({
      dataDir: z.optional(z.string().check(z.minLength(1))),
      driver: z.literal('pglite')
    }),
    z.object({
      driver: z.literal('postgres'),
      url: z.url()
    })
  ]),

  store: z.discriminatedUnion('driver', [
    z.object({
      base: z.string().check(z.minLength(1)),
      driver: z.literal('fs-lite')
    }),
    z.object({
      base: z.string().check(z.minLength(1)),
      driver: z.literal('upstash'),
      scanCount: z.optional(z.number()),
      ttl: z.optional(z.number())
    })
  ])
})

let $config: Promise<z.output<typeof configSchema>>

const readConfig = async () => {
  const config =
    import.meta.prerender || !import.meta.nitro
      ? (
          await loadConfig({
            configFile: 'nitro.config',
            cwd: resolve(import.meta.dirname, import.meta.prerender ? '../../..' : '../..'),
            dotenv: {
              fileName: ['.env.example', '.env']
            },
            giget: false,
            rcFile: false
          })
        ).config.runtimeConfig
      : // biome-ignore lint/correctness/useHookAtTopLevel: not react hooks
        useRuntimeConfig()

  const result = z.safeParse(configSchema, config)

  if (!result.success) {
    // cspell:ignore treeify
    const error = new Error(`Invalid config: ${JSON.stringify(z.treeifyError(result.error))}`)
    logger.fatal(error, {
      code: 'CONFIG_INVALID',
      position: 'infra.config'
    })

    throw error
  }
  logger.info('Config loaded successfully', { config: result.data })

  return result.data
}

export const getConfig = () => {
  if (!$config) {
    $config = readConfig()
  }

  return $config
}
