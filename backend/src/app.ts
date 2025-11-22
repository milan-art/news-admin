import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import fs from 'node:fs'
import { env } from './config/env'
import { registerRoutes } from './routes'
import { errorHandler, notFoundHandler } from './middleware/error-handler'

const app = express()

// Ensure upload directory exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true })
}

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)
app.use(helmet())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: () => env.NODE_ENV === 'test',
  }),
)

app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)))

registerRoutes(app)

app.use(notFoundHandler)
app.use(errorHandler)

export { app }

