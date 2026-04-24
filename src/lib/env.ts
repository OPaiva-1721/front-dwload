import { z } from 'zod'

const schema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_USE_MOCK_SSE: z.enum(['true', 'false']),
})

const parsed = schema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(
    `[env] Missing or invalid environment variables:\n${parsed.error.toString()}`
  )
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL,
  useMockSse: parsed.data.VITE_USE_MOCK_SSE === 'true',
}
