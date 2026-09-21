import { defineConfig } from 'nitro'

export default defineConfig({
  $development: {
    debug: true,
    experimental: {
      tracingLogger: true
    },
    tracingChannel: true
  },
  alias: {
    '@qingshaner/contract': '../../packages/contract/src/index.ts'
  },
  builder: 'rolldown',
  errorHandler: './src/error.ts',
  prerender: {
    routes: ['/spec.json']
  },
  preset: 'node_server',
  rolldownConfig: {
    external: ['giget', 'chokidar'],
    output: {
      minify: true
    }
  },
  runtimeConfig: {
    auth: {
      github: {
        clientId: process.env.NITRO_AUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.NITRO_AUTH_GITHUB_CLIENT_SECRET
      },
      secret: process.env.NITRO_AUTH_SECRET
    },
    baseURL: 'http://localhost:3000',
    database: {
      dataDir: process.env.NITRO_DATABASE_DATA_DIR,
      driver: process.env.NITRO_DATABASE_DRIVER,
      url: process.env.NITRO_DATABASE_URL
    },

    store: {
      base: process.env.NITRO_STORE_UPSTASH_BASE,
      driver: process.env.NITRO_STORE_DRIVER,
      scanCount: process.env.NITRO_STORE_UPSTASH_SCAN_COUNT,
      ttl: process.env.NITRO_STORE_UPSTASH_TTL
    }
  },
  serverDir: './src',
  serverEntry: './src/index.ts',
  sourcemap: true
})
