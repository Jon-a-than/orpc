import { defineConfig } from 'tsdown'

export default defineConfig({
  alias: {
    '@': 'src'
  },
  dts: {
    tsgo: {}
  },
  entry: 'src/index.ts',
  fixedExtension: false,
  format: 'esm',
  tsconfig: 'tsconfig.build.json'
})
