import { PGlite } from '@electric-sql/pglite'
import { getLogger } from '@logtape/drizzle-orm'
import { drizzle as postgresDrizzle } from 'drizzle-orm/node-postgres'
import { drizzle as pgliteDrizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { Pool } from 'pg'

import { getConfig, onShutdown } from '../infra'
import { relations } from './relation'

type Database =
  | ReturnType<typeof pgliteDrizzle<typeof relations>>
  | ReturnType<typeof postgresDrizzle<typeof relations>>

let $db: Promise<Database>

const createDatabase = async () => {
  const logger = getLogger({ category: ['api', 'orm'] })
  const { database } = await getConfig()

  if (database.driver === 'postgres') {
    const client = new Pool({ connectionString: database.url })
    onShutdown(() => client.end())

    return postgresDrizzle({ client, logger, relations })
  }

  const client = new PGlite({ dataDir: database.dataDir })
  onShutdown(() => client.close())

  const db = pgliteDrizzle({ client, logger, relations })
  await migrate(db, { migrationsFolder: './drizzle' })

  return db
}

export * as schema from './schema'
export const getDatabase = () => {
  if (!$db) {
    $db = createDatabase()
  }

  return $db
}
