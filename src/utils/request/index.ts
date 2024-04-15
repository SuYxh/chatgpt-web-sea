import fetchWithAuth from './fetch'
import { useAuthStore } from '@/store'

export interface HttpOption {
  url: string
  data?: any
  method?: string
  headers?: HeadersInit
  signal?: AbortSignal | undefined // Ensure this is of type AbortSignal or null
  beforeRequest?: () => void
  afterRequest?: () => void
}

export interface Response<T = any> {
  data: T
  message: string | null
  status: string
}

async function http<T = any>(
  { url, data, method = 'GET', headers, signal, beforeRequest, afterRequest }: HttpOption,
): Promise<Response<T>> {
  beforeRequest?.()

  const options: RequestInit = {
    method,
    headers: new Headers(headers),
    signal, // Now this should be correctly typed as AbortSignal | null
  }

  if (method !== 'GET' && data) {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetchWithAuth(url, options)
    const jsonData = await response.json() as Response<T>
    afterRequest?.()

    const authStore = useAuthStore()

    if (jsonData.status === 'Success' || typeof jsonData === 'string') {
      return jsonData
    }
    else if (jsonData.status === 'Unauthorized') {
      authStore.removeToken()
      window.location.reload()
    }

    return Promise.reject(jsonData)
  }
  catch (error) {
    afterRequest?.()
    throw new Error((error as Error)?.message || 'Error')
  }
}

export async function get<T = any>(
  options: HttpOption,
): Promise<Response<T>> {
  return http<T>({ ...options, method: 'GET' })
}

export async function post<T = any>(
  options: HttpOption,
): Promise<Response<T>> {
  return http<T>({ ...options, method: 'POST' })
}

export default post
