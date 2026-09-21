import { resolve } from 'node:path'

import { defineConfig } from 'vitest/config'

const ROOT = import.meta.dirname

export default defineConfig({
  resolve: {
    alias: {
      '@qingshaner/contract': resolve(ROOT, 'packages/contract/src')
    }
  },
  test: {
    projects: [
      {
        test: {
          include: ['apps/api/src/**/*.test.ts'],
          name: 'api'
        }
      }
    ]
  }
})
