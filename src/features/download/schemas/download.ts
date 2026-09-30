import { z } from 'zod'

const ALLOWED_DOMAINS = [
  'youtube.com', 'youtu.be',
  'instagram.com',
  'tiktok.com',
  'twitter.com', 'x.com',
  'vimeo.com',
  'twitch.tv',
  'soundcloud.com',
  'dailymotion.com',
]

export const SUPPORTED_PLATFORMS = ['YouTube', 'TikTok', 'Instagram', 'X', 'Vimeo', 'SoundCloud', 'Twitch', 'Dailymotion']

function isAllowedDomain(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return ALLOWED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))
  } catch {
    return false
  }
}

export function validateDownloadUrl(url: string): string | null {
  if (!url) return null
  try { new URL(url) } catch { return "That doesn't look like a valid link." }
  if (!isAllowedDomain(url)) return `This site isn't supported yet. Try ${SUPPORTED_PLATFORMS.join(', ')}.`
  return null
}

export const DownloadRequestSchema = z.object({
  url: z.string().url().refine(isAllowedDomain, { message: 'Platform not supported.' }),
  format: z.enum(['video', 'audio']),
  quality: z.string().min(1),
  title: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  duration: z.string().optional(),
})

export const DownloadJobCreatedSchema = z.object({
  jobId: z.string(),
})

export const FormatInfoSchema = z.object({
  id: z.string(),
  extension: z.string(),
  quality: z.string(),
  fileSizeBytes: z.number().nullable(),
  height: z.number().nullable(),
  hasVideo: z.boolean().default(false),
  hasAudio: z.boolean().default(false),
  audioBitrateKbps: z.number().nullable().default(null),
})

export const VideoMetadataSchema = z.object({
  title: z.string(),
  thumbnailUrl: z.string(),
  duration: z.string(),
  availableFormats: z.array(FormatInfoSchema),
})

export type DownloadRequest = z.infer<typeof DownloadRequestSchema>
export type DownloadJobCreated = z.infer<typeof DownloadJobCreatedSchema>
export type FormatInfo = z.infer<typeof FormatInfoSchema>
export type VideoMetadata = z.infer<typeof VideoMetadataSchema>
