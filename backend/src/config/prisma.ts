import { PrismaClient } from '@prisma/client'
import { env } from './env'
import { logger } from './logger'

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
})

export const connectDatabase = async () => {
  try {
    await prisma.$connect()
    logger.info('Connected to MySQL database')
  } catch (error) {
    logger.error('Failed to connect to database', { error })
    throw error
  }
}

