const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

const buildUrl = (path, params) => {
  const url = new URL(path.replace(/^\//, ''), `${API_BASE_URL.replace(/\/$/, '')}/`)
  if (params) {
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
  }
  return url.toString()
}

const request = async (path, { method = 'GET', params, body, signal, headers } = {}) => {
  const url = buildUrl(path, params)
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
    credentials: 'include',
  })

  const contentType = response.headers.get('content-type') ?? ''
  const data = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const message = typeof data === 'object' && data !== null ? data.message ?? 'Request failed' : String(data)
    throw new Error(message)
  }

  if (typeof data === 'object' && data !== null) {
    if (data.success === false) {
      throw new Error(data.message ?? 'Request failed')
    }
    return data
  }

  return { success: true, data }
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  del: (path, options) => request(path, { ...options, method: 'DELETE' }),
}

export default apiClient

