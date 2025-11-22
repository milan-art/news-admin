import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { AuthenticatedUser } from '../middleware/auth'

export const generateAccessToken = (payload: AuthenticatedUser) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL })

export const generateRefreshToken = (payload: AuthenticatedUser) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_TTL })

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthenticatedUser & jwt.JwtPayload

