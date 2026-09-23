# oRPC Playground

A TypeScript API project built with Nitro, oRPC, Valibot, and Drizzle ORM, featuring GitHub sign-in and task management with per-user data isolation.

## Modules

| Module | Responsibility | Documentation |
| --- | --- | --- |
| `apps/api` | HTTP server, authentication, task routes, database access, and OpenAPI documentation | [API README](apps/api/README.md) |
| `packages/contract` | API contracts, input/output validation, and error status mapping | [Contract README](packages/contract/README.md) |

Define endpoints in Contract, then implement them in API. During development and API builds, an alias resolves Contract directly to its source, so no separate contract build is required.

## Local development

Requirements: Node.js `^22.18.0 || ^24.11.0 || >=26.0.0` and pnpm `>=12.0.0`. The repository pins pnpm `12.4.1`.

Run these commands from the repository root:

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
```

Set the secret and GitHub OAuth credentials in `.env` using the [API configuration guide](apps/api/README.md#environment-configuration), then start the server:

```bash
pnpm dev
curl http://localhost:3000/api/ping
```

The health check returns `{"message":"pong"}`. Open the [API reference](http://localhost:3000/openapi.html) to explore application and authentication endpoints.

The default database is in-memory PGlite. Migrations run on first database access, and data is lost on restart. See the API documentation for persistent storage and PostgreSQL configuration.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the API development server |
| `pnpm build` | Build the API with the default Vercel preset and generate static OpenAPI documents |
| `pnpm test` | Run Vitest tests |
| `pnpm test:cov` | Run tests with coverage |
| `pnpm check:type` | Check TypeScript types |
| `pnpm check` | Run Biome checks and automatically fix files |
| `pnpm check:cspell` | Check spelling |
| `pnpm check:knip` | Find unused files, dependencies, and exports |

Previewing a production build locally requires Node server output. See [Building and previewing](apps/api/README.md#building-and-previewing) for commands.
