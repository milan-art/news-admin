import { z } from 'zod'

const dataImageRegex = /^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+$/i

const imageUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (!value) return false
      if (dataImageRegex.test(value)) return true
      try {
        const parsed = new URL(value)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      } catch {
        return false
      }
    },
    { message: 'Invalid image URL. Provide an http(s) URL or a base64 data URL.' },
  )

const optionalImageUrlSchema = z
  .union([imageUrlSchema, z.literal('')])
  .optional()
  .transform((value) => {
    if (!value || value === '') {
      return undefined
    }
    return value
  })

export const articleStatusEnum = z.enum(['draft', 'published', 'archived'])

export const articleFilterSchema = z.object({
  status: articleStatusEnum.optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
})

const optionalDatetimeSchema = z
  .union([z.string().datetime(), z.literal(''), z.null()])
  .optional()
  .transform((value) => {
    if (!value || value === '') {
      return undefined
    }
    return value
  })

export const baseArticleSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().min(10),
  contentHtml: z.string().min(10),
  status: articleStatusEnum.default('draft'),
  categoryId: z.string().min(1),
  heroImageUrl: optionalImageUrlSchema,
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  tags: z.array(z.string().min(1)).optional(),
  scheduledAt: optionalDatetimeSchema,
})

export const createArticleSchema = baseArticleSchema.extend({
  publishedAt: optionalDatetimeSchema,
})

export const updateArticleSchema = baseArticleSchema.partial().extend({
  publishedAt: optionalDatetimeSchema,
})

export const bulkActionSchema = z.object({
  action: z.enum(['publish', 'unpublish', 'delete', 'move']),
  articleIds: z.array(z.string().min(1)).min(1),
  targetCategoryId: z.string().optional(),
})

