import { AsyncLocalStorage } from 'node:async_hooks'

export const appContext = new AsyncLocalStorage<{
  requestId: string
  metrics: Record<
    string,
    {
      duration: number
      description?: string
    }
  >
}>()

export const setMetrics = (name: string, duration: number, description?: string) => {
  const store = appContext.getStore()
  if (store) {
    store.metrics[name] = {
      description,
      duration
    }
  }
}

export const applyMetrics = (
  headers?: Headers,
  metrics?: Record<string, { duration: number; description?: string }>
) => {
  if (!headers) {
    return
  }

  if (metrics) {
    const entries = Object.entries(metrics)
    if (entries.length === 0) {
      return
    }
    const preMetrics = headers.get('Server-Timing')
    headers.set(
      'Server-Timing',
      `${preMetrics ? `${preMetrics}, ` : ''}${entries.map(([name, { duration, description }]) => `${name};dur=${duration};${`desc="${description}"` || ''}`).join(', ')}`
    )
  }
}
