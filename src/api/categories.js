import { apiClient } from './client'

export const fetchCategories = async () => {
  const response = await apiClient.get('/categories')
  return (response.data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    color: category.color ?? '#6c7a99',
    description: category.description ?? '',
    sortOrder: category.sortOrder ?? 0,
    articleCount: category.articleCount ?? 0,
  }))
}

