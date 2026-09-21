import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { Writable } from 'node:stream'

import {
  getLogger as $getLogger,
  configure,
  getAnsiColorFormatter,
  getConsoleSink,
  getJsonLinesFormatter,
  getStreamSink
} from '@logtape/logtape'

type Category = 'orm' | 'auth' | (string & {})

const name = 'app'

const consoleSink = import.meta.dev
  ? getConsoleSink({
      formatter: getAnsiColorFormatter({
        category: ':',
        format: ({ timestamp, level, category, message }) => `${level} ${timestamp} ${category} ${message}`,
        level: (level) => level,
        timestamp: 'time'
      }),
      levelMap: { debug: 'error', error: 'error', fatal: 'error', info: 'error', trace: 'error', warning: 'error' }
    })
  : () => {}

const initLogger = async () => {
  await mkdir('.logs', { recursive: true })

  await configure({
    loggers: [
      {
        category: name,
        lowestLevel: import.meta.dev ? 'trace' : 'info',
        sinks: import.meta.dev ? ['console', 'file'] : ['file']
      },
      { category: ['logtape', 'meta'], lowestLevel: 'warning', sinks: ['console'] }
    ],
    sinks: {
      console: consoleSink,
      file: getStreamSink(Writable.toWeb(createWriteStream('.logs/api.log', { flags: 'a' })), {
        formatter: getJsonLinesFormatter()
      })
    }
  })
}

await initLogger()

export const getLogger = (category?: Category | Category[]) =>
  $getLogger(category ? [name, ...(Array.isArray(category) ? category : [category])] : name)

export const logger = getLogger()
