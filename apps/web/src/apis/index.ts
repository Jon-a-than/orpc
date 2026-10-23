import { createORPCClient } from '@orpc/client'
import { OpenAPILink } from '@orpc/openapi/fetch'
import { createTanstackQueryUtils, type RouterUtils } from '@orpc/tanstack-query'
import { contract } from '@qingshaner/contract'
import { createAuthClient } from 'better-auth/react'

import type { RouterContractClient } from '@orpc/contract'

export const authApi = createAuthClient({
  basePath: '/api/auth',
  baseURL: import.meta.env.VITE_API_BASE_URL
})

const link = new OpenAPILink(contract, {
  fetch: (url, init) => fetch(url, { ...init, credentials: 'include' }),
  origin: import.meta.env.VITE_API_BASE_URL,
  url: '/api'
})
const contractClient: RouterContractClient<typeof contract> = createORPCClient(link)
export const api: RouterUtils<RouterContractClient<typeof contract>> = createTanstackQueryUtils(contractClient)
