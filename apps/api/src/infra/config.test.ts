import { describe } from 'vitest'

import { getConfig } from './config'

describe('test', (test) => {
  test('test', async ({ expect }) => {
    const config = await getConfig()
    expect(config).toBeDefined()
  })
})
