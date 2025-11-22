export interface PaginationQuery {
  page?: string | number | string[]
  pageSize?: string | number | string[]
}

export const parsePagination = (query: PaginationQuery, defaultPageSize = 10) => {
  const parseValue = (value?: string | number | string[]) => {
    if (Array.isArray(value)) {
      return Number(value[0])
    }
    return Number(value)
  }

  const rawPage = parseValue(query.page)
  const rawPageSize = parseValue(query.pageSize)

  const page = Math.max(1, Number.isFinite(rawPage) && !Number.isNaN(rawPage) ? (rawPage as number) : 1)
  const pageSize = Math.min(
    100,
    Math.max(
      1,
      Number.isFinite(rawPageSize) && !Number.isNaN(rawPageSize)
        ? (rawPageSize as number)
        : defaultPageSize,
    ),
  )

  const skip = (page - 1) * pageSize
  const take = pageSize

  return { page, pageSize, skip, take }
}

