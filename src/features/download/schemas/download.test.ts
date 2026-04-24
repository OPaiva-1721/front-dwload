import { describe, it, expect } from 'vitest'
import { validateDownloadUrl, DownloadRequestSchema } from './download'

describe('validateDownloadUrl', () => {
  it('returns null for empty string', () => {
    expect(validateDownloadUrl('')).toBeNull()
  })

  it('returns error for invalid URL', () => {
    expect(validateDownloadUrl('not-a-url')).toBe('Enter a valid URL.')
    expect(validateDownloadUrl('foo bar')).toBe('Enter a valid URL.')
  })

  it('returns error for unsupported domain', () => {
    const err = validateDownloadUrl('https://example.com/video')
    expect(err).toContain('Platform not supported')
  })

  it('returns null for supported domains', () => {
    expect(validateDownloadUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull()
    expect(validateDownloadUrl('https://youtu.be/dQw4w9WgXcQ')).toBeNull()
    expect(validateDownloadUrl('https://www.instagram.com/p/abc123/')).toBeNull()
    expect(validateDownloadUrl('https://www.tiktok.com/@user/video/123')).toBeNull()
    expect(validateDownloadUrl('https://twitter.com/user/status/123')).toBeNull()
    expect(validateDownloadUrl('https://x.com/user/status/123')).toBeNull()
    expect(validateDownloadUrl('https://vimeo.com/123456789')).toBeNull()
    expect(validateDownloadUrl('https://www.twitch.tv/videos/123')).toBeNull()
    expect(validateDownloadUrl('https://soundcloud.com/artist/track')).toBeNull()
  })
})

describe('DownloadRequestSchema', () => {
  it('accepts valid request', () => {
    const result = DownloadRequestSchema.safeParse({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      format: 'video',
      quality: '1080p',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid URL', () => {
    const result = DownloadRequestSchema.safeParse({
      url: 'not-a-url',
      format: 'video',
      quality: '1080p',
    })
    expect(result.success).toBe(false)
  })

  it('rejects unsupported domain', () => {
    const result = DownloadRequestSchema.safeParse({
      url: 'https://example.com/video',
      format: 'video',
      quality: '1080p',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid format', () => {
    const result = DownloadRequestSchema.safeParse({
      url: 'https://www.youtube.com/watch?v=abc',
      format: 'mp5',
      quality: '1080p',
    })
    expect(result.success).toBe(false)
  })
})
