import { describe, it, expect } from 'vitest'
import type { FormatInfo } from '../schemas/download'
import {
  defaultQuality,
  deriveAudioOptions,
  deriveVideoOptions,
  formatBytes,
  formatDuration,
  parseDuration,
} from './qualities'

const MB = 1_048_576

function fmt(partial: Partial<FormatInfo>): FormatInfo {
  return {
    id: 'x', extension: 'mp4', quality: '0', fileSizeBytes: null, height: null,
    hasVideo: false, hasAudio: false, audioBitrateKbps: null, ...partial,
  }
}

const audio = fmt({ id: '140', extension: 'm4a', hasAudio: true, audioBitrateKbps: 129, fileSizeBytes: 3.5 * MB })

describe('deriveVideoOptions', () => {
  it('offers only the heights the video has, highest first', () => {
    const options = deriveVideoOptions([
      fmt({ height: 1080, hasVideo: true }),
      fmt({ height: 720, hasVideo: true }),
      fmt({ height: 360, hasVideo: true }),
      audio,
    ])

    expect(options.map((o) => o.value)).toEqual(['1080p', '720p', '360p'])
  })

  it('never offers 1080p for a 240p video', () => {
    const options = deriveVideoOptions([fmt({ height: 240, hasVideo: true }), fmt({ height: 144, hasVideo: true })])

    expect(options.map((o) => o.value)).toEqual(['240p', '144p'])
  })

  it('estimates size from the most efficient mp4 plus the audio track', () => {
    const [option] = deriveVideoOptions([
      fmt({ height: 1080, hasVideo: true, fileSizeBytes: 51 * MB }),
      fmt({ height: 1080, hasVideo: true, fileSizeBytes: 15 * MB }),
      fmt({ height: 1080, hasVideo: true, extension: 'webm', fileSizeBytes: 10 * MB }),
      audio,
    ])

    expect(option.sizeBytes).toBe(15 * MB + 3.5 * MB)
  })

  it('ignores audio-only formats and falls back to a non-standard height', () => {
    const options = deriveVideoOptions([fmt({ height: 406, hasVideo: true }), audio])

    expect(options.map((o) => o.value)).toEqual(['406p'])
  })
})

describe('deriveAudioOptions', () => {
  it('drops bitrates that would only inflate the file', () => {
    const options = deriveAudioOptions([audio], 223)

    expect(options.map((o) => o.value)).toEqual(['192kbps', '128kbps'])
  })

  it('estimates size from bitrate and duration', () => {
    const [option] = deriveAudioOptions([audio], 100)

    expect(option.sizeBytes).toBe((192_000 * 100) / 8)
  })

  it('offers everything when the source bitrate is unknown', () => {
    expect(deriveAudioOptions([], 0).map((o) => o.value)).toEqual(['320kbps', '256kbps', '192kbps', '128kbps'])
  })
})

describe('defaultQuality', () => {
  it('prefers 1080p over higher resolutions', () => {
    expect(defaultQuality('video', [{ value: '2160p' }, { value: '1080p' }, { value: '720p' }])).toBe('1080p')
  })

  it('uses the best available when below 1080p', () => {
    expect(defaultQuality('video', [{ value: '720p' }, { value: '360p' }])).toBe('720p')
  })

  it('uses the lowest when every option is above 1080p', () => {
    expect(defaultQuality('video', [{ value: '2160p' }, { value: '1440p' }])).toBe('1440p')
  })

  it('uses the best audio tier', () => {
    expect(defaultQuality('audio', [{ value: '192kbps' }, { value: '128kbps' }])).toBe('192kbps')
  })
})

describe('formatting', () => {
  it('parses and formats durations', () => {
    expect(parseDuration('00:03:43')).toBe(223)
    expect(formatDuration(223)).toBe('3:43')
    expect(formatDuration(3725)).toBe('1:02:05')
  })

  it('formats byte sizes', () => {
    expect(formatBytes(18.6 * MB)).toBe('19 MB')
    expect(formatBytes(500 * 1024)).toBe('500 KB')
  })
})
