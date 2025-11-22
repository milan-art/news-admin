/* eslint-disable no-console */
import { env } from './env'

type Level = 'info' | 'warn' | 'error' | 'debug'

const formatMessage = (level: Level, message: unknown, meta?: Record<string, unknown>) => {
  const payload = {
    level,
    message,
    ...(meta ?? {}),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  }
  return JSON.stringify(payload)
}

export const logger = {
  info(message: unknown, meta?: Record<string, unknown>) {
    console.log(formatMessage('info', message, meta))
  },
  warn(message: unknown, meta?: Record<string, unknown>) {
    console.warn(formatMessage('warn', message, meta))
  },
  error(message: unknown, meta?: Record<string, unknown>) {
    console.error(formatMessage('error', message, meta))
  },
  debug(message: unknown, meta?: Record<string, unknown>) {
    if (env.NODE_ENV !== 'production') {
      console.debug(formatMessage('debug', message, meta))
    }
  },
}

