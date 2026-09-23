# @qingshaner/api

A Nitro HTTP API server that implements the shared [Contract](../../packages/contract/README.md) with oRPC, provides GitHub sign-in through Better Auth, and accesses PGlite or PostgreSQL through Drizzle ORM.

## Development

Run from the repository root:

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
# Configure .env as described below
pnpm dev
```

The default address is `http://localhost:3000`. No separate Contract build is required.

## Environment configuration

Configuration starts in [nitro.config.ts](nitro.config.ts) and is validated with `zod/mini` and cached by [src/infra/config.ts](src/infra/config.ts). Put environment variables in this module's `.env` file.

| Variable | Required | Description |
| --- | --- | --- |
| `NITRO_AUTH_SECRET` | Yes | At least 32 characters. Generate one with `node -e "console.log(crypto.randomUUID())"` |
| `NITRO_AUTH_GITHUB_CLIENT_ID` | Yes | GitHub OAuth App client ID |
| `NITRO_AUTH_GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App client secret |
| `NITRO_DATABASE_DRIVER` | Yes | `pglite` or `postgres` |
| `NITRO_DATABASE_DATA_DIR` | No | PGlite data directory. The example uses `memory://`, which loses data on restart |
| `NITRO_DATABASE_URL` | When using `postgres` | PostgreSQL connection URL |
| `NITRO_STORE_DRIVER` | Yes | `upstash` or `fs-lite` |
| `NITRO_STORE_UPSTASH_BASE` | Yes | Maps to `store.base` and is validated for both store drivers |
| `NITRO_STORE_UPSTASH_SCAN_COUNT` | No | The configuration schema requires a number |
| `NITRO_STORE_UPSTASH_TTL` | No | The configuration schema requires a number |

`store` currently has configuration and validation only; application reads and writes do not use it yet. The application does not explicitly convert strings for the optional numeric settings, so check their loaded types before using them.

`baseURL` defaults to `http://localhost:3000` in `nitro.config.ts`. Set the GitHub OAuth App Homepage URL to the server address and the Authorization callback URL to `{baseURL}/api/auth/callback/github`.

## Endpoints and authentication

Application endpoints use the `/api` prefix, and authentication endpoints live under `/api/auth`. `ping` is public. All task operations pass through `requireSession`, which validates the request's session cookie or Bearer session token.

```bash
curl http://localhost:3000/api/ping
# {"message":"pong"}

# Replace SESSION_TOKEN with a valid session token
curl -X POST http://localhost:3000/api/tasks \
  -H 'Authorization: Bearer SESSION_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Read the docs","description":"Understand the API contract"}'

curl -X QUERY 'http://localhost:3000/api/tasks?page=1&pageSize=10' \
  -H 'Authorization: Bearer SESSION_TOKEN'
```

Task queries currently use the `QUERY` method. The list returns only tasks created by the current user, ordered by ascending ID, with keyword search across titles and descriptions. Updating or deleting a task requires its creator's session. See the generated API reference for inputs, outputs, and error codes.

| Path | Content |
| --- | --- |
| `/openapi.html` | Scalar API reference with application and authentication sources |
| `/spec.json` | Application OpenAPI document |
| `/auth-spec.json` | Better Auth OpenAPI document |

Application schemas are converted by `ZodToJsonSchemaConverter` from `@orpc/zod` in [src/spec.ts](src/spec.ts).

Both JSON documents are generated dynamically during development and generated as static assets during builds. Update and delete operations do not declare explicit URLs in the contract; refer to the generated `/spec.json` for their resolved paths.

## Database and migrations

[src/db/schema.ts](src/db/schema.ts) defines authentication and task tables, [src/db/relation.ts](src/db/relation.ts) defines relations, and `drizzle/` contains migrations.

- PGlite automatically applies migrations on the first `getDatabase()` call. Set `NITRO_DATABASE_DATA_DIR` to `./.data/pglite` for local persistence.
- PostgreSQL connects through `pg.Pool`. The server does not run migrations automatically; apply them separately.
- Database connections are released when Nitro shuts down.

Run from the repository root:

```bash
# Generate a migration after changing the schema
pnpm --filter @qingshaner/api exec drizzle-kit generate

# Apply migrations to the configured database
pnpm --filter @qingshaner/api exec drizzle-kit migrate
```

The Drizzle configuration loads `.env.example` followed by `.env`. Confirm the effective connection settings before applying migrations, since the command modifies the target database.

## Code layout

| File or directory | Responsibility |
| --- | --- |
| `src/index.ts` | Dispatch authentication, OpenAPI, and application requests; handle unmatched routes |
| `src/router/index.ts` | Contract implementations, task queries, and authorization checks |
| `src/middlewares/auth.ts` | Better Auth initialization and session middleware |
| `src/db/` | Database connections, tables, and relations |
| `src/infra/` | Configuration validation, logging, and shutdown cleanup |
| `src/plugins/index.ts` | Request IDs, timing, and request/response logging |
| `src/spec.ts` | OpenAPI document generation |
| `src/error.ts` | Nitro error handling |

Logs are written to `.logs/api.log` relative to the working directory. Development mode also logs to the console.

To add an endpoint, update Contract first, implement it in `src/router/index.ts`, and add session checks, migrations, and route tests as needed. Nitro development and builds scan API and Contract sources to generate the error status map. Do not edit the generated file manually.

## Building and previewing

Run from the repository root:

```bash
# Build with the default Vercel preset
pnpm build

# Build Node server output for a local preview
pnpm --filter @qingshaner/api exec nitro build --preset node-server
pnpm preview
```

`preview` loads `.env` from the API directory and runs `.output/server/index.mjs`. Database migrations use the relative path `./drizzle`, so keep that directory available and start the PGlite server from the API directory.

## Validation

```bash
pnpm test apps/api/src/router/index.test.ts apps/api/src/spec.test.ts
pnpm check:type
```

Route tests use in-memory PGlite and test sessions to cover task CRUD, user isolation, unauthenticated access, the health check, pagination fallback, and task ID validation. OpenAPI tests verify generated request and response schemas.
