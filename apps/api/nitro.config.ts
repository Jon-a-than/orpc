import { defineConfig } from 'nitro'

export default defineConfig({
  alias: {
    '@qingshaner/contract': '../../packages/contract/src/index.ts'
  },
  debug: true,
  entry: './src/index.ts',
  prerender: {
    routes: ['/spec.json']
  },
  preset: 'node',
  sourcemap: true
})
