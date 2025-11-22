import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { ok, created as createdResponse, failure } from '../../utils/api-response'
import {
  createArticle,
  deleteArticle,
  getArticleById,
  handleBulkAction,
  listArticles,
  publishArticle,
  unpublishArticle,
  updateArticle,
} from './article.service'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await listArticles(req.query)
    res.json(ok(result.data, { pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } }))
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string }
    const article = await getArticleById(id)
    if (!article) {
      res.status(404).json(failure('Article not found'))
      return
    }
    res.json(ok(article))
  }),
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const article = await createArticle(req.body)
    res.status(201).json(createdResponse(article))
  }),
)

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string }
    const article = await updateArticle(id, req.body)
    res.json(ok(article))
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string }
    const result = await deleteArticle(id)
    res.json(ok(result))
  }),
)

router.post(
  '/:id/publish',
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string }
    const article = await publishArticle(id)
    res.json(ok(article))
  }),
)

router.post(
  '/:id/unpublish',
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string }
    const article = await unpublishArticle(id)
    res.json(ok(article))
  }),
)

router.post(
  '/bulk/actions',
  asyncHandler(async (req, res) => {
    const result = await handleBulkAction(req.body)
    res.json(ok(result))
  }),
)

export const articleRoutes = router

