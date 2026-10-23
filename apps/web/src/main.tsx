import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'

import { routeTree } from './routeTree.gen'
import './global.css'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
declare global {
  interface Window {
    // biome-ignore lint/style/useNamingConvention: devtools global variable
    __TANSTACK_QUERY_CLIENT__?: import('@tanstack/react-query').QueryClient
  }
}

const rootElement = document.getElementById('app')
if (!rootElement) {
  throw new Error('Root element #app not found')
}

const router = createRouter({
  basepath: import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, ''),
  defaultPreload: 'intent',
  routeTree,
  scrollRestoration: true
})

if (!rootElement.innerHTML) {
  const queryClient = new QueryClient()
  window.__TANSTACK_QUERY_CLIENT__ = import.meta.env.DEV ? queryClient : undefined

  createRoot(rootElement).render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
