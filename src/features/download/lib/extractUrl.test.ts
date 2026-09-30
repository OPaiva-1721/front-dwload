import { describe, it, expect } from 'vitest'
import { extractUrl } from './extractUrl'

describe('extractUrl', () => {
  it('returns a clean URL as-is', () => {
    expect(extractUrl('https://youtu.be/abc')).toBe('https://youtu.be/abc')
  })

  it('pulls the link out of share-sheet text', () => {
    expect(extractUrl('Watch this! https://www.tiktok.com/@u/video/1 #fyp')).toBe('https://www.tiktok.com/@u/video/1')
  })

  it('strips trailing punctuation from prose', () => {
    expect(extractUrl('see https://x.com/a/status/1.')).toBe('https://x.com/a/status/1')
  })

  it('returns null when there is no link', () => {
    expect(extractUrl('no link here')).toBeNull()
    expect(extractUrl(null)).toBeNull()
  })
})
