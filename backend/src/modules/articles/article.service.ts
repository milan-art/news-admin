import crypto from 'node:crypto'
import type { Prisma, ArticleStatus } from '@prisma/client'
import { prisma } from '../../config/prisma'
import { HttpError } from '../../utils/http-error'
import { parsePagination, type PaginationQuery } from '../../utils/pagination'
import { slugify } from '../../utils/slugify'
import {
  articleFilterSchema,
  bulkActionSchema,
  createArticleSchema,
  updateArticleSchema,
} from './article.schema'

type UiStatus = 'draft' | 'published' | 'archived'

const STATUS_MAP: Record<UiStatus, ArticleStatus> = {
  draft: 'DRAFT',
  published: 'PUBLISHED',
  archived: 'ARCHIVED',
}

const toDbStatus = (status?: UiStatus) => (status ? STATUS_MAP[status] : undefined)
const toUiStatus = (status: ArticleStatus): UiStatus =>
  (status.toLowerCase() as UiStatus) ?? 'draft'

const toDateOrNull = (value?: string | null) => (value ? new Date(value) : null)

const upsertTags = async (tx: Prisma.TransactionClient, incomingTags: string[]) => {
  const uniqueTags = Array.from(new Set(incomingTags.map((tag) => tag.trim()).filter(Boolean)))

  if (!uniqueTags.length) {
    return []
  }

  const results = await Promise.all(
    uniqueTags.map((tag) =>
      tx.articleTag.upsert({
        where: { slug: slugify(tag) },
        update: { name: tag },
        create: { id: crypto.randomUUID(), name: tag, slug: slugify(tag) },
      }),
    ),
  )

  return results.map((tag) => tag.id)
}

type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: {
    author: { select: { id: true; name: true; email: true } }
    category: true
    tags: { include: { tag: true } }
    views: true
  }
}>

const mapArticle = (article: ArticleWithRelations | null) => {
  if (!article) return null

  const viewCount = article.views.reduce((acc, entry) => acc + entry.views, 0)

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    contentHtml: article.contentHtml,
    status: toUiStatus(article.status),
    heroImageUrl: article.heroImageUrl,
    publishedAt: article.publishedAt,
    scheduledAt: article.scheduledAt,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    viewCount,
    category: article.category
      ? {
          id: article.category.id,
          name: article.category.name,
          color: article.category.color,
        }
      : null,
    author: article.author
      ? {
          id: article.author.id,
          name: article.author.name,
          email: article.author.email,
        }
      : null,
    tags: article.tags.map((tagMap) => ({
      id: tagMap.tag.id,
      name: tagMap.tag.name,
      slug: tagMap.tag.slug,
    })),
  }
}

const buildUniqueSlug = async (title: string, excludeId?: string) => {
  const base = slugify(title)
  let slug = base
  let counter = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.article.findFirst({
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

export const listArticles = async (query: Record<string, unknown>) => {
  const filters = articleFilterSchema.parse(query)
  const { skip, take, page, pageSize } = parsePagination(query as PaginationQuery, 10)

  const where: Prisma.ArticleWhereInput = {}

  if (filters.status) {
    const status = toDbStatus(filters.status)
    if (status) {
      where.status = status
    }
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters.search) {
    const term = filters.search
    where.OR = [
      { title: { contains: term } },
      { excerpt: { contains: term } },
    ]
  }

  const [rows, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: { include: { tag: true } },
        views: true,
      },
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take,
    }),
    prisma.article.count({ where }),
  ])

  return {
    data: rows.map((article) => mapArticle(article)!),
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  }
}

export const getArticleById = (id: string) =>
  prisma.article.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: true,
      tags: { include: { tag: true } },
      views: true,
    },
  })

const resolveAuthorId = async (tx: Prisma.TransactionClient, authorId?: string) => {
  if (authorId) {
    const existing = await tx.user.findUnique({ where: { id: authorId }, select: { id: true } })
    if (existing) {
      return authorId
    }
  }

  const fallback = await tx.user.findFirst({
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  })

  if (!fallback) {
    throw new HttpError(400, 'No author available to associate with the article')
  }

  return fallback.id
}

export const createArticle = async (body: unknown, authorId?: string) => {
  const data = createArticleSchema.parse(body)

  return prisma.$transaction(async (tx) => {
    const tagIds = await upsertTags(tx, data.tags ?? [])
    const slug = await buildUniqueSlug(data.title)
    const resolvedAuthorId = await resolveAuthorId(tx, authorId)

    const article = await tx.article.create({
      data: {
        id: crypto.randomUUID(),
        title: data.title,
        slug,
        excerpt: data.excerpt,
        contentHtml: data.contentHtml,
        status: toDbStatus(data.status) ?? 'DRAFT',
        heroImageUrl: data.heroImageUrl ?? null,
        publishedAt:
          data.status === 'published'
            ? toDateOrNull(data.publishedAt) ?? new Date()
            : null,
        scheduledAt: toDateOrNull(data.scheduledAt),
        authorId: resolvedAuthorId,
        categoryId: data.categoryId,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
      },
    })

    if (tagIds.length) {
      await tx.articleTagMap.createMany({
        data: tagIds.map((tagId) => ({
          articleId: article.id,
          tagId,
        })),
      })
    }

    const created = await getArticleById(article.id)
    return mapArticle(created)
  })
}

export const updateArticle = async (id: string, body: unknown) => {
  const data = updateArticleSchema.parse(body)
  const existing = await getArticleById(id)
  if (!existing) {
    throw new HttpError(404, 'Article not found')
  }

  return prisma.$transaction(async (tx) => {
    const tagIds = Array.isArray(data.tags) ? await upsertTags(tx, data.tags) : null

    const newStatus = data.status ? toDbStatus(data.status) ?? existing.status : existing.status
    const shouldPublish = newStatus === 'PUBLISHED'

    let publishedAtValue = existing.publishedAt
    if (shouldPublish) {
      publishedAtValue =
        toDateOrNull(data.publishedAt) ?? existing.publishedAt ?? new Date()
    } else {
      publishedAtValue = null
    }

    await tx.article.update({
      where: { id },
      data: {
        title: data.title ?? existing.title,
        slug: data.title ? await buildUniqueSlug(data.title, id) : existing.slug,
        excerpt: data.excerpt ?? existing.excerpt,
        contentHtml: data.contentHtml ?? existing.contentHtml,
        status: newStatus,
        heroImageUrl:
          data.heroImageUrl !== undefined ? data.heroImageUrl : existing.heroImageUrl,
        publishedAt: publishedAtValue,
        scheduledAt:
          data.scheduledAt !== undefined ? toDateOrNull(data.scheduledAt) : existing.scheduledAt,
        categoryId: data.categoryId ?? existing.categoryId,
        seoTitle: data.seoTitle !== undefined ? data.seoTitle : existing.seoTitle,
        seoDescription:
          data.seoDescription !== undefined ? data.seoDescription : existing.seoDescription,
      },
    })

    if (tagIds) {
      await tx.articleTagMap.deleteMany({ where: { articleId: id } })
      if (tagIds.length) {
        await tx.articleTagMap.createMany({
          data: tagIds.map((tagId) => ({
            articleId: id,
            tagId,
          })),
        })
      }
    }

    const updated = await tx.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: { include: { tag: true } },
        views: true,
      },
    })
    if (!updated) {
      throw new HttpError(500, 'Article was not found after update')
    }
    return mapArticle(updated)!
  })
}

export const deleteArticle = async (id: string) => {
  await prisma.article.delete({ where: { id } })
  return { success: true }
}

export const publishArticle = async (id: string) => {
  await prisma.article.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: new Date(), scheduledAt: null },
  })
  const article = await getArticleById(id)
  return mapArticle(article)
}

export const unpublishArticle = async (id: string) => {
  await prisma.article.update({
    where: { id },
    data: { status: 'DRAFT', publishedAt: null },
  })
  const article = await getArticleById(id)
  return mapArticle(article)
}

export const handleBulkAction = async (body: unknown) => {
  const data = bulkActionSchema.parse(body)

  if (data.action === 'move' && !data.targetCategoryId) {
    throw new HttpError(400, 'targetCategoryId is required for move action')
  }

  if (data.action === 'move') {
    const category = await prisma.category.findUnique({
      where: { id: data.targetCategoryId! },
    })
    if (!category) {
      throw new HttpError(400, 'Target category not found')
    }
  }

  switch (data.action) {
    case 'publish':
      await prisma.article.updateMany({
        where: { id: { in: data.articleIds } },
        data: { status: 'PUBLISHED', publishedAt: new Date(), scheduledAt: null },
      })
      break
    case 'unpublish':
      await prisma.article.updateMany({
        where: { id: { in: data.articleIds } },
        data: { status: 'DRAFT', publishedAt: null },
      })
      break
    case 'delete':
      await prisma.articleTagMap.deleteMany({
        where: { articleId: { in: data.articleIds } },
      })
      await prisma.article.deleteMany({
        where: { id: { in: data.articleIds } },
      })
      break
    case 'move':
      await prisma.article.updateMany({
        where: { id: { in: data.articleIds } },
        data: { categoryId: data.targetCategoryId! },
      })
      break
    default:
      throw new HttpError(400, 'Unsupported bulk action')
  }

  return { success: true }
}
