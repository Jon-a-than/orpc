# @qingshaner/contract

A shared API contract template built with oRPC and Zod Mini (`zod/mini`). Define input/output schemas and OpenAPI metadata here, then implement the contracts in the [API module](../../apps/api/README.md).

## Structure

[src/index.ts](src/index.ts) is the contract entry point. Keep contract definitions separate from server concerns such as database access and authentication.

The API's Nitro configuration resolves this package directly to its source during development and API builds, so no separate Contract build is required.

Schemas import `zod/mini` from the `zod` package and use its functional API, such as `z.optional(schema)` and `z.string().check(z.minLength(1))`. Pagination uses `z.catch` to fall back on invalid values while keeping omitted values optional.

## Development

1. Define or update contracts in `src/index.ts`.
2. Implement them in the [API router](../../apps/api/src/router/index.ts).
3. Update the corresponding tests.

Run validation from the repository root:

```bash
pnpm check:type
pnpm test
```

Run `pnpm dev` to inspect the generated API documentation at `/openapi.html`.

## Building

The package's `exports` point to `dist`, while the root `pnpm build` command only builds API. Separate package build configuration lives in [tsdown.config.ts](../../tsdown.config.ts); generate and inspect Contract artifacts before publishing.
