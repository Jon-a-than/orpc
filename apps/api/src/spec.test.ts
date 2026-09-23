import { describe, expect, test } from 'vitest'

import { generateOpenAPISpec } from './spec'

describe('generateOpenAPISpec', () => {
  test('generates request and response schemas from Zod Mini contracts', async () => {
    const response = await generateOpenAPISpec()
    const spec = await response.json()

    expect(spec).toHaveProperty('openapi', '3.2.0')
    expect(spec).toHaveProperty(['paths', '/tasks', 'post', 'requestBody', 'content', 'application/json', 'schema'], {
      properties: { description: { type: 'string' }, title: { type: 'string' } },
      required: ['description', 'title'],
      type: 'object'
    })
    expect(spec).toHaveProperty(
      ['paths', '/ping', 'get', 'responses', '200', 'content', 'application/json', 'schema'],
      expect.objectContaining({
        properties: { message: { type: 'string' } },
        required: ['message'],
        type: 'object'
      })
    )
  })
})
