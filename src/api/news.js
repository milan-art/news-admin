import { apiClient } from './client'

const mapArticleFromApi = (article) => ({
  id: article.id,
  title: article.title,
  slug: article.slug,
  excerpt: article.excerpt,
  contentHtml: article.contentHtml,
  status: article.status,
  heroImageUrl: article.heroImageUrl,
  publishedAt: article.publishedAt,
  scheduledAt: article.scheduledAt,
  createdAt: article.createdAt,
  updatedAt: article.updatedAt,
  seoTitle: article.seoTitle,
  seoDescription: article.seoDescription,
  viewCount: article.viewCount ?? 0,
  category: article.category ?? null,
  author: article.author ?? null,
  tags: (article.tags ?? []).map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  })),
})

const stripHtml = (value) =>
  typeof value === 'string'
    ? value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : ''

const normalizeTags = (tags) =>
  Array.isArray(tags)
    ? tags
        .map((tag) => (typeof tag === 'string' ? tag : tag?.name ?? ''))
        .filter(Boolean)
    : []

const mapArticleToPayload = (values) => {
  const rawContent = values.contentHtml ?? values.content ?? ''
  const stripped = stripHtml(rawContent)
  const excerptCandidate = values.excerpt ?? values.summary ?? stripped.slice(0, 200)
  const excerpt = excerptCandidate.length >= 10 ? excerptCandidate : stripped.slice(0, 200)

  const scheduledAtValue =
    values.scheduled && typeof values.scheduled === 'string'
      ? values.scheduled
      : values.scheduledAt ?? null

  return {
    title: values.title ?? values.headline ?? '',
    excerpt,
    contentHtml: rawContent,
    status: values.status ?? 'draft',
    categoryId: values.categoryId,
    heroImageUrl: values.heroImageUrl ?? values.coverImage ?? null,
    seoTitle: values.seoTitle ?? null,
    seoDescription: values.seoDescription ?? null,
    tags: normalizeTags(values.tags),
    scheduledAt: scheduledAtValue,
    publishedAt: values.publishedAt ?? null,
  }
}

export const fetchNews = async (params) => {
  const response = await apiClient.get('/articles', { params })
  const items = (response.data ?? []).map(mapArticleFromApi)
  const pagination = response.meta?.pagination ?? {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? items.length,
    total: items.length,
    totalPages: 1,
  }
  return { items, pagination }
}

export const fetchArticle = async (id) => {
  const response = await apiClient.get(`/articles/${id}`)
  return mapArticleFromApi(response.data)
}

export const createArticle = async (values) => {
  const payload = mapArticleToPayload(values)
  const response = await apiClient.post('/articles', payload)
  return mapArticleFromApi(response.data)
}

export const updateArticle = async (id, values) => {
  const payload = mapArticleToPayload(values)
  const response = await apiClient.patch(`/articles/${id}`, payload)
  return mapArticleFromApi(response.data)
}

export const deleteArticle = async (id) => {
  await apiClient.del(`/articles/${id}`)
}

export const publishArticle = async (id) => {
  const response = await apiClient.post(`/articles/${id}/publish`)
  return mapArticleFromApi(response.data)
}

export const unpublishArticle = async (id) => {
  const response = await apiClient.post(`/articles/${id}/unpublish`)
  return mapArticleFromApi(response.data)
}

export const bulkActionArticles = async ({ action, articleIds, targetCategoryId }) => {
  await apiClient.post('/articles/bulk/actions', {
    action,
    articleIds,
    targetCategoryId,
  })
}

