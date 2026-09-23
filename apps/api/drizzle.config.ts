import { resolve } from 'node:path'
import { loadEnvFile } from 'node:process'

import { defineConfig } from 'drizzle-kit'
import * as z from 'zod/mini'

void ['.env.example', '.env'].forEach((path) => {
  try {
    loadEnvFile(resolve(import.meta.dirname, path))
  } catch (_e) {}
})

const database = z.parse(
  z.discriminatedUnion('driver', [
    z.object({
      dataDir: z.optional(z.string().check(z.minLength(1))),
      driver: z.literal('pglite')
    }),
    z.object({
      driver: z.literal('postgres'),
      url: z.url()
    })
  ]),
  {
    dataDir: process.env.NITRO_DATABASE_DATA_DIR,
    driver: process.env.NITRO_DATABASE_DRIVER,
    url: process.env.NITRO_DATABASE_URL
  }
)

export default defineConfig({
  dialect: 'postgresql',
  out: './drizzle',
  schema: './src/db/schema.ts',

  ...(database.driver === 'pglite'
    ? { dbCredentials: { url: database.dataDir }, driver: 'pglite' }
    : { dbCredentials: { url: database.url } })
})
