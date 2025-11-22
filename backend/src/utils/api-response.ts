export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  meta?: Record<string, unknown>
}

export const ok = <T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> => ({
  success: true,
  data,
  ...(meta ? { meta } : {}),
})

export const created = <T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> => ({
  success: true,
  data,
  ...(meta ? { meta } : {}),
})

export const failure = (message: string, meta?: Record<string, unknown>): ApiResponse<never> => ({
  success: false,
  message,
  ...(meta ? { meta } : {}),
})

