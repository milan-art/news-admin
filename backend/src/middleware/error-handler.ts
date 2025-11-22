import type { NextFunction, Request, Response } from 'express'
import { HttpError } from '../utils/http-error'
import { env } from '../config/env'
import { logger } from '../config/logger'
import { failure } from '../utils/api-response'

export const errorHandler = (
  error: Error | HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status = error instanceof HttpError ? error.statusCode : 500
  const payload = failure(error.message || 'Unexpected error')

  if (env.NODE_ENV !== 'production' && error instanceof HttpError && error.details) {
    payload.meta = { details: error.details }
  }

  logger.error(error.message, {
    stack: env.NODE_ENV !== 'production' ? error.stack : undefined,
  })

  res.status(status).json(payload)
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(failure(`Route ${req.method} ${req.originalUrl} not found`))
}

