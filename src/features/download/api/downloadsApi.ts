import { apiFetch } from '@/lib/apiClient'
import { env } from '@/lib/env'
import { mockCreateDownload } from '@/lib/mockApi'
import { DownloadJobCreatedSchema, type DownloadJobCreated, type DownloadRequest } from '../schemas/download'

export async function createDownload(req: DownloadRequest): Promise<DownloadJobCreated> {
  if (env.useMockSse) return mockCreateDownload(req)

  const backendFormat = req.format === 'video' ? 'mp4' : 'mp3'

  const raw = await apiFetch<unknown>('/api/downloads', {
    method: 'POST',
    body: JSON.stringify({ url: req.url, format: backendFormat, quality: req.quality }),
  })

  return DownloadJobCreatedSchema.parse(raw)
}
