import { resolve } from 'node:path'
import { loadEnvFile } from 'node:process'

import { defineConfig } from 'drizzle-kit'
import * as v from 'valibot'

void ['.env.example', '.env'].forEach((path) => {
  try {
    loadEnvFile(resolve(import.meta.dirname, path))
  } catch (_e) {}
})

const database = v.parse(
  v.variant('driver', [
    v.object({
      dataDir: v.optional(v.pipe(v.string(), v.nonEmpty())),
      driver: v.literal('pglite')
    }),
    v.object({
      driver: v.literal('postgres'),
      url: v.pipe(v.string(), v.url(), v.nonEmpty())
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
