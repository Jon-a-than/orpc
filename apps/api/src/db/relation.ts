import { defineRelations } from 'drizzle-orm'

import * as schema from './schema'

export const relations = defineRelations(schema, (r) => ({
  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id
    })
  },

  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id
    })
  },
  users: {
    accounts: r.many.accounts({
      from: r.users.id,
      to: r.accounts.userId
    }),
    sessions: r.many.sessions({
      from: r.users.id,
      to: r.sessions.userId
    })
  }
}))
