import { apiFetch } from '@/lib/apiClient'
import { VideoMetadataSchema, type VideoMetadata } from '../schemas/download'

export async function getMetadata(url: string): Promise<VideoMetadata> {
  const raw = await apiFetch<unknown>(`/api/metadata?url=${encodeURIComponent(url)}`)
  return VideoMetadataSchema.parse(raw)
}
