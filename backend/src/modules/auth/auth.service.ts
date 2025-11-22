import bcrypt from 'bcrypt'
import { prisma } from '../../config/prisma'
import { HttpError } from '../../utils/http-error'
import { AuthenticatedUser } from '../../middleware/auth'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt'

const sanitizeUser = (user: Awaited<ReturnType<typeof prisma.user.findUnique>>) => {
  if (!user) return null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user
  return rest
}

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new HttpError(401, 'Invalid email or password')
  }

  if (user.status !== 'ACTIVE') {
    throw new HttpError(403, 'Account is not active')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw new HttpError(401, 'Invalid email or password')
  }

  const payload: AuthenticatedUser = {
    id: user.id,
    email: user.email,
    role: user.role,
  }

  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  return {
    user: sanitizeUser(user),
    tokens: {
      accessToken,
      refreshToken,
    },
  }
}

export const refreshTokens = async (token: string) => {
  try {
    const payload = verifyRefreshToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    })

    if (!user || user.status !== 'ACTIVE') {
      throw new HttpError(401, 'User not found or inactive')
    }

    const newPayload: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    }

    return {
      accessToken: generateAccessToken(newPayload),
      refreshToken: generateRefreshToken(newPayload),
    }
  } catch (error) {
    throw new HttpError(401, 'Invalid refresh token', error)
  }
}

