import { boolean, index, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

const baseTable = {
  createdAt: timestamp('created_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
  id: text('id').primaryKey(),
  updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull()
}

export const users = pgTable('users', {
  ...baseTable,
  /** User's email address for communication and login */
  email: text('email').notNull().unique(),
  /** Whether the user's email is verified */
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  name: text('name').notNull()
})

export const sessions = pgTable(
  'sessions',
  {
    ...baseTable,
    expiresAt: timestamp('expires_at').notNull(),
    /** The IP address of the device */
    ipAddress: text('ip_address'),
    /** The unique session token */
    token: text('token').notNull().unique(),
    /** The user agent information of the device */
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
  },
  (table) => [index('sessions_userId_idx').on(table.userId)]
)

export const accounts = pgTable(
  'accounts',
  {
    ...baseTable,
    accessToken: text('access_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    /** The stable account identifier assigned by the provider */
    accountId: text('account_id').notNull(),
    /** The ID token returned from the provider */
    idToken: text('id_token'),
    password: text('password'),
    /** The provider configuration used to authenticate the account */
    providerId: text('provider_id').notNull(),
    refreshToken: text('refresh_token'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
  },
  (table) => [index('accounts_userId_idx').on(table.userId)]
)

export const verifications = pgTable(
  'verifications',
  {
    ...baseTable,
    expiresAt: timestamp('expires_at').notNull(),
    /** The identifier for the verification request */
    identifier: text('identifier').notNull(),
    /** The value to be verified */
    value: text('value').notNull()
  },
  (table) => [index('verifications_identifier_idx').on(table.identifier)]
)

export const jwkss = pgTable('jwkss', {
  alg: text('alg'),
  createdAt: timestamp('created_at').notNull(),
  crv: text('crv'),
  expiresAt: timestamp('expires_at'),
  id: text('id').primaryKey(),
  privateKey: text('private_key').notNull(),
  publicKey: text('public_key').notNull()
})

export const tasks = pgTable('tasks', {
  ...baseTable,
  creatorId: text('creator_id').notNull(),
  description: text('description').notNull(),
  id: serial('id').primaryKey(),
  title: text('title').notNull()
})
