import { apiFetch } from '@/lib/apiClient'
import { env } from '@/lib/env'
import { mockCreateDownload } from '@/lib/mockApi'
import { DownloadJobCreatedSchema, type DownloadJobCreated, type DownloadRequest } from '../schemas/download'

export async function createDownload(req: DownloadRequest): Promise<DownloadJobCreated> {
  if (env.useMockSse) return mockCreateDownload(req)

  const raw = await apiFetch<unknown>('/downloads', {
    method: 'POST',
    body: JSON.stringify(req),
  })

  return DownloadJobCreatedSchema.parse(raw)
}
