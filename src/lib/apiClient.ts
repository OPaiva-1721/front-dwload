import { env } from './env'

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const NETWORK_ERROR = "Can't reach the server. Check your connection and try again."
const RATE_LIMITED = 'Too many requests. Please wait a minute and try again.'
const SERVER_ERROR = 'Something went wrong on our side. Please try again.'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${env.apiUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      ...init,
    })
  } catch (err) {
    // Aborts are the caller's own doing — let them through untouched
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError(0, NETWORK_ERROR)
  }

  if (!res.ok) {
    if (res.status === 429) throw new ApiError(429, RATE_LIMITED)
    const body = await res.json().catch(() => ({})) as { detail?: string; title?: string }
    // The API puts a user-facing message in `detail` and the error code in `title`
    const message = res.status >= 500 ? SERVER_ERROR : body.detail ?? SERVER_ERROR
    throw new ApiError(res.status, message, body.title)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
