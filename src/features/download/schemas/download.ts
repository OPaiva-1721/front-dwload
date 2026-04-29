import { z } from 'zod'

const ALLOWED_DOMAINS = [
  'youtube.com', 'youtu.be',
  'instagram.com',
  'tiktok.com',
  'twitter.com', 'x.com',
  'vimeo.com',
  'twitch.tv',
  'soundcloud.com',
  'spotify.com',
  'dailymotion.com',
]

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
  try { new URL(url) } catch { return 'Enter a valid URL.' }
  if (!isAllowedDomain(url)) return 'Platform not supported. Supported: YouTube, Instagram, TikTok, Twitter/X, Vimeo, Twitch, SoundCloud, Spotify.'
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
