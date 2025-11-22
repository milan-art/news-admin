import { Router } from 'express'
import { loginSchema, refreshSchema } from './auth.schema'
import { asyncHandler } from '../../utils/async-handler'
import { loginUser, refreshTokens } from './auth.service'
import { ok } from '../../utils/api-response'
import { authenticate } from '../../middleware/auth'

const router = Router()

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body)
    const result = await loginUser(body.email, body.password)
    res.json(ok(result))
  }),
)

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const body = refreshSchema.parse(req.body)
    const tokens = await refreshTokens(body.refreshToken)
    res.json(ok({ tokens }))
  }),
)

router.post(
  '/logout',
  authenticate,
  asyncHandler(async (_req, res) => {
    res.json(ok({ success: true }))
  }),
)

export const authRoutes = router

