import { resolve } from 'node:path'

import { loadConfig } from 'c12'
import { useRuntimeConfig } from 'nitro/runtime-config'
import * as v from 'valibot'

import { logger } from './logger'

const configSchema = v.object({
  auth: v.object({
    github: v.object({
      clientId: v.pipe(v.string(), v.nonEmpty()),
      clientSecret: v.pipe(v.string(), v.nonEmpty())
    }),

    secret: v.pipe(v.string(), v.nonEmpty(), v.minLength(32))
  }),

  baseURL: v.pipe(v.string(), v.url(), v.nonEmpty()),

  database: v.variant('driver', [
    v.object({
      dataDir: v.optional(v.pipe(v.string(), v.nonEmpty())),
      driver: v.literal('pglite')
    }),
    v.object({
      driver: v.literal('postgres'),
      url: v.pipe(v.string(), v.url(), v.nonEmpty())
    })
  ]),

  store: v.variant('driver', [
    v.object({
      base: v.pipe(v.pipe(v.string(), v.nonEmpty())),
      driver: v.literal('fs-lite')
    }),
    v.object({
      base: v.pipe(v.pipe(v.string(), v.nonEmpty())),
      driver: v.literal('upstash'),
      scanCount: v.optional(v.number()),
      ttl: v.optional(v.number())
    })
  ])
})

let $config: Promise<v.InferOutput<typeof configSchema>>

const readConfig = async () => {
  const config = !import.meta.nitro
    ? (
        await loadConfig({
          configFile: 'nitro.config',
          cwd: resolve(import.meta.dirname, '../..'),
          dotenv: {
            fileName: ['.env', '.env.local']
          },
          giget: false,
          rcFile: false
        })
      ).config.runtimeConfig
    : // biome-ignore lint/correctness/useHookAtTopLevel: not react hooks
      useRuntimeConfig()

  const result = v.safeParse(configSchema, config)

  if (!result.success) {
    logger.fatal(new Error(`Invalid config: ${JSON.stringify(v.flatten(result.issues))}`), {
      code: 'CONFIG_INVALID',
      position: 'infra.config'
    })

    process.exit(1)
  }
  logger.info('Config loaded successfully', { config: result.output })

  return result.output
}

export const getConfig = () => {
  if (!$config) {
    $config = readConfig()
  }

  return $config
}
