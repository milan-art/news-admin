import { z } from 'zod'

export const upsertCategorySchema = z.object({
  name: z.string().min(3),
  color: z.string().regex(/^#[0-9a-fA-F]{3,6}$/).optional(),
  description: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
})

export const deleteCategorySchema = z.object({
  transferToCategoryId: z.string().optional(),
})

