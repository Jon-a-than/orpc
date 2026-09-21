import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    cwd: 'packages/contract',
    deps: {},
    dts: {
      tsgo: {}
    },
    fixedExtension: false,
    format: 'esm',
    tsconfig: 'tsconfig.build.json'
  }
])
