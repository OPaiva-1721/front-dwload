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
})

export const DownloadJobCreatedSchema = z.object({
  jobId: z.string(),
})

export type DownloadRequest = z.infer<typeof DownloadRequestSchema>
export type DownloadJobCreated = z.infer<typeof DownloadJobCreatedSchema>
