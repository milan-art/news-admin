import { app } from './app'
import { connectDatabase } from './config/prisma'
import { env } from './config/env'
import { logger } from './config/logger'

const bootstrap = async () => {
  await connectDatabase()

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    logger.info(`🚀 Daily Pulse API running on http://${env.APP_HOST}:${env.APP_PORT}`)
  })
}

bootstrap().catch((error) => {
  logger.error('Failed to bootstrap application', { error })
  process.exit(1)
})

