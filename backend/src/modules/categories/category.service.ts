import { prisma } from '../../config/prisma'
import { HttpError } from '../../utils/http-error'
import { slugify } from '../../utils/slugify'

const buildUniqueSlug = async (name: string, excludeId?: string) => {
  const base = slugify(name)
  let slug = base
  let counter = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.category.findFirst({
      where: excludeId
        ? {
            slug,
            NOT: { id: excludeId },
          }
        : { slug },
      select: { id: true },
    })

    if (!existing) {
      return slug
    }

    counter += 1
    slug = `${base}-${counter}`
  }
}

export const listCategories = () =>
  prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { articles: true },
      },
    },
  })

export const createCategory = async (input: {
  name: string
  color?: string | undefined
  description?: string | null | undefined
  sortOrder?: number | undefined
}) => {
  const slug = await buildUniqueSlug(input.name)

  return prisma.category.create({
    data: {
      name: input.name,
      slug,
      color: input.color ?? null,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
    include: {
      _count: { select: { articles: true } },
    },
  })
}

export const updateCategory = async (
  id: string,
  input: {
    name?: string | undefined
    color?: string | undefined
    description?: string | null | undefined
    sortOrder?: number | undefined
  },
) => {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) {
    throw new HttpError(404, 'Category not found')
  }

  let slug: string | undefined
  if (input.name && input.name !== category.name) {
    slug = await buildUniqueSlug(input.name, id)
  }

  return prisma.category.update({
    where: { id },
    data: {
      name: input.name ?? category.name,
      slug: slug ?? category.slug,
      color: input.color ?? category.color,
      description: input.description ?? category.description,
      sortOrder: input.sortOrder ?? category.sortOrder,
    },
    include: {
      _count: { select: { articles: true } },
    },
  })
}

export const deleteCategory = async (id: string, transferToCategoryId?: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { articles: true } },
    },
  })
  if (!category) {
    throw new HttpError(404, 'Category not found')
  }

  if (category._count.articles > 0) {
    if (!transferToCategoryId) {
      throw new HttpError(400, 'transferToCategoryId is required to move existing articles')
    }

    if (transferToCategoryId === id) {
      throw new HttpError(400, 'transferToCategoryId must be different than the deleted category')
    }

    const target = await prisma.category.findUnique({ where: { id: transferToCategoryId } })
    if (!target) {
      throw new HttpError(400, 'Target category does not exist')
    }

    await prisma.article.updateMany({
      where: { categoryId: { equals: id } },
      data: { categoryId: transferToCategoryId },
    })
  }

  await prisma.category.delete({ where: { id } })

  return { success: true }
}

