# @qingshaner/web

<p align="center">
  <a href="https://jsr.io/@qingshaner/web"><img src="https://jsr.io/badges/@qingshaner/web" alt="JSR package" /></a>
  <a href="https://www.npmjs.com/@qingshaner/web" target="_blank"
    ><img src="https://img.shields.io/npm/v/@qingshaner/web" alt="NPM Version" /></a
  >
  <img alt="LICENSE" src="https://img.shields.io/github/license/tsingshaner/orpc" />
  <a href="https://github.com/tsingshaner/orpc/actions/workflows/ci.yml"
    ><img src="https://github.com/tsingshaner/orpc/actions/workflows/ci.yml/badge.svg" alt="unit-test" /></a
  >
  <a href="https://biomejs.dev"
    ><img
      alt="Linted with Biome"
      src="https://img.shields.io/badge/Linted_with-Biome-60a5fa?style=flat&logo=biome"
    /></a
  >
  <a href="https://biomejs.dev" target="_blank"
    ><img alt="Static Badge" src="https://img.shields.io/badge/Formatted_with-Biome-60a5fa?style=flat&logo=biome" /></a
  >
</p>

A web app for orpc client

## Account UI

Run the API with `pnpm dev`, then start the web app with `pnpm --filter @qingshaner/web dev`.
Set `VITE_API_BASE_URL=http://localhost:3000` in `apps/web/.env` and open `http://localhost:5173` (the API's configured trusted origin). Use the same hostname throughout the OAuth flow.

The homepage supports GitHub sign-in, email/password registration and sign-in, session restoration, and sign-out. Signed-in users can edit their name and avatar URL; an empty URL removes the avatar. Avatar file uploads, email verification, and password-reset email delivery are not configured.

For GitHub, configure the API's GitHub credentials and set the OAuth App callback to `http://localhost:3000/api/auth/callback/github`. Successful authentication returns to the current web origin.
