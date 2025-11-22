import type { Express } from 'express'
import { systemRoutes } from '../modules/system/system.routes'
import { authRoutes } from '../modules/auth/auth.routes'
import { articleRoutes } from '../modules/articles/article.routes'
import { categoryRoutes } from '../modules/categories/category.routes'

export const registerRoutes = (app: Express) => {
  app.use('/api/system', systemRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/articles', articleRoutes)
  app.use('/api/categories', categoryRoutes)
}

