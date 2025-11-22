import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { ok } from '../../utils/api-response'

const router = Router()

router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    const uptime = process.uptime()
    res.json(
      ok({
        status: 'ok',
        uptime,
        timestamp: new Date().toISOString(),
      }),
    )
  }),
)

export const systemRoutes = router

