import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { ok } from '../../utils/api-response'
import { createCategory, deleteCategory, listCategories, updateCategory } from './category.service'
import { deleteCategorySchema, upsertCategorySchema } from './category.schema'

const router = Router()

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await listCategories()
    const payload = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      color: category.color ?? undefined,
      description: category.description ?? undefined,
      sortOrder: category.sortOrder,
      articleCount: category._count.articles,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }))
    res.json(ok(payload))
  }),
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = upsertCategorySchema.parse(req.body)
    const payload: {
      name: string
      color?: string
      description?: string | null
      sortOrder?: number
    } = { name: data.name }
    if (data.color !== undefined) payload.color = data.color
    if (data.description !== undefined) payload.description = data.description
    if (data.sortOrder !== undefined) payload.sortOrder = data.sortOrder

    const category = await createCategory(payload)
    res.status(201).json(
      ok({
        id: category.id,
        name: category.name,
        slug: category.slug,
        color: category.color,
        description: category.description,
        sortOrder: category.sortOrder,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        articleCount: category._count?.articles ?? 0,
      }),
    )
  }),
)

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string }
    const data = upsertCategorySchema.partial().parse(req.body)
    const payload: {
      name?: string
      color?: string
      description?: string | null
      sortOrder?: number
    } = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.color !== undefined) payload.color = data.color
    if (data.description !== undefined) payload.description = data.description
    if (data.sortOrder !== undefined) payload.sortOrder = data.sortOrder

    const category = await updateCategory(id, payload)
    res.json(
      ok({
        id: category.id,
        name: category.name,
        slug: category.slug,
        color: category.color,
        description: category.description,
        sortOrder: category.sortOrder,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        articleCount: category._count?.articles ?? 0,
      }),
    )
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string }
    const query = deleteCategorySchema.parse(req.query)
    const result = await deleteCategory(id, query.transferToCategoryId)
    res.json(ok(result))
  }),
)

export const categoryRoutes = router

