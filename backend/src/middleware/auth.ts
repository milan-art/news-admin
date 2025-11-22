import type { NextFunction, Request, Response } from 'express'

export type AuthenticatedUser = {
  id: string
  role: string
  email: string
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser
}

// TEMP: Authentication disabled – allow all requests and attach a dummy user
export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  req.user = {
    id: '00000000-0000-0000-0000-000000000000',
    role: 'ADMIN',
    email: 'demo@example.com',
  }
  next()
}

// TEMP: Authorization disabled – role checks are skipped
export const authorize =
  (..._roles: string[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    // roles and req.user are ignored while auth is disabled
    next()
  }

