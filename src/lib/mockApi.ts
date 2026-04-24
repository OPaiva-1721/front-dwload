import type { DownloadJobCreated, DownloadRequest } from '@/features/download/schemas/download'

export async function mockCreateDownload(_req: DownloadRequest): Promise<DownloadJobCreated> {
  await new Promise((r) => setTimeout(r, 400))
  return { jobId: 'mock-123' }
}
