import { type FSWatcher, watch } from 'node:fs'

import { defineConfig } from 'nitro'

import { errorSourceDirs, generateErrorStatusMap } from '../../packages/contract/scripts/generate-error-status-map'

const errorWatchers: FSWatcher[] = []

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
    },
    plugins: [
      {
        buildStart() {
          generateErrorStatusMap()
          if (this.meta.watchMode && errorWatchers.length === 0) {
            for (const directory of errorSourceDirs) {
              const watcher = watch(directory, { recursive: true }, (_, filename) => {
                if (filename && (!filename.endsWith('.ts') || filename.endsWith('.gen.ts'))) {
                  return
                }
                try {
                  generateErrorStatusMap()
                } catch (error) {
                  this.warn(`Error status map generation failed: ${error}`)
                }
              })
              watcher.on('error', (error) => this.warn(`Error status map watcher failed: ${error}`))
              errorWatchers.push(watcher)
            }
          }
        },
        closeWatcher() {
          for (const watcher of errorWatchers.splice(0)) {
            watcher.close()
          }
        },
        name: 'error-status-map'
      }
    ]
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
