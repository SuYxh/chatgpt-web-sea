import { useAuthStore } from '@/store'

const baseUrl = import.meta.env.VITE_GLOB_API_URL as string

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const authStore = useAuthStore()
  const token = authStore.token

  const defaultHeaders: any = {
    'Content-Type': 'application/json',
  }
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`
  }

  const fetchInit: RequestInit = {
    ...init,
    headers: { ...defaultHeaders, ...init?.headers || {} },
  }

  const url = /^https?:/i.test(input.toString()) ? input : `${baseUrl}${input}`
  const response = await fetch(url, fetchInit)

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Error: ${text}`)
  }
  return response
}

export default fetchWithAuth
