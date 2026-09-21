import { OpenAPIGenerator } from '@orpc/openapi'
import { ValibotToJsonSchemaConverter } from '@orpc/valibot'

import { router } from './routes'

export const apiPrefix = '/api'

/**
 * @internal
 * Generates the OpenAPI 3.2.0 specification document for the API.
 * @returns OpenAPI 3.2.0 specification document for the API.
 */
export const generateOpenAPISpec = async (): Promise<Response> => {
  const openAPIGenerator = new OpenAPIGenerator({
    converters: [new ValibotToJsonSchemaConverter()]
  })

  return Response.json(
    await openAPIGenerator.generate(router, {
      base: {
        components: {
          securitySchemes: {
            bearerAuth: {
              scheme: 'bearer',
              type: 'http'
            }
          }
        },
        info: {
          title: 'Orpc Playground',
          version: '1.0.0'
        },
        security: [{ bearerAuth: [] }],
        servers: [{ url: apiPrefix }]
      }
    })
  )
}
