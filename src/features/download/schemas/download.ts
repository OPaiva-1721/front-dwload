import { z } from 'zod'

export const DownloadRequestSchema = z.object({
  url: z.string().url(),
  format: z.enum(['video', 'audio']),
  quality: z.string().min(1),
})

export const DownloadJobCreatedSchema = z.object({
  jobId: z.string(),
})

export type DownloadRequest = z.infer<typeof DownloadRequestSchema>
export type DownloadJobCreated = z.infer<typeof DownloadJobCreatedSchema>
