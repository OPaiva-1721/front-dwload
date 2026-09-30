import type { FormatInfo } from '../schemas/download'
import type { Format } from '../store'

export interface QualityOption {
  /** Value sent to the API: "720p" or "192kbps". */
  value: string
  /** Estimated output size in bytes, when the platform reports enough to guess. */
  sizeBytes?: number
}

const VIDEO_HEIGHTS = [2160, 1440, 1080, 720, 480, 360, 240, 144]
const AUDIO_KBPS = [320, 256, 192, 128]
const DEFAULT_MAX_VIDEO_HEIGHT = 1080
const MAX_VIDEO_OPTIONS = 5

// Transcoding lossy AAC/Opus to MP3 needs ~1.5x the source bitrate to keep its quality;
// anything above that only makes the file bigger.
const MP3_HEADROOM = 1.5

/** "00:03:43" or "3:43" → seconds. */
export function parseDuration(value: string): number {
  const parts = value.split(':').map(Number)
  if (parts.some(Number.isNaN)) return 0
  return parts.reduce((total, part) => total * 60 + part, 0)
}

/** Seconds → "3:43" or "1:02:05". */
export function formatDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`
  if (bytes >= 1_048_576) return `${Math.round(bytes / 1_048_576)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function smallestKnownSize(formats: FormatInfo[]): number | undefined {
  const sizes = formats.map((f) => f.fileSizeBytes).filter((s): s is number => s !== null && s > 0)
  return sizes.length ? Math.min(...sizes) : undefined
}

/** The audio track yt-dlp merges into an mp4 (m4a preferred), for size estimates. */
function audioTrackSize(formats: FormatInfo[]): number {
  const audioOnly = formats.filter((f) => f.hasAudio && !f.hasVideo && f.fileSizeBytes)
  const m4a = audioOnly.filter((f) => f.extension === 'm4a')
  const pool = m4a.length ? m4a : audioOnly
  return pool.length ? Math.max(...pool.map((f) => f.fileSizeBytes!)) : 0
}

/**
 * Resolutions the video actually has, highest first. Each standard height is offered only if
 * a stream exists at that height; the size mirrors yt-dlp's pick (most efficient mp4 at that
 * height + the m4a audio track), which matched real downloads within ~1%.
 */
export function deriveVideoOptions(formats: FormatInfo[]): QualityOption[] {
  const video = formats.filter((f) => f.hasVideo && f.height)
  const heights = new Set(video.map((f) => f.height!))
  const audioSize = audioTrackSize(formats)

  const options = VIDEO_HEIGHTS.filter((h) => heights.has(h)).map((h) => {
    const atHeight = video.filter((f) => f.height === h)
    const mp4 = atHeight.filter((f) => f.extension === 'mp4')
    const videoSize = smallestKnownSize(mp4) ?? smallestKnownSize(atHeight)
    return { value: `${h}p`, sizeBytes: videoSize ? videoSize + audioSize : undefined }
  })

  if (options.length > 0) return options.slice(0, MAX_VIDEO_OPTIONS)

  // Non-standard heights only (e.g. a 406p vertical clip): offer the best one there is
  const best = Math.max(0, ...heights)
  return best > 0 ? [{ value: `${best}p` }] : [{ value: '1080p' }]
}

/** MP3 bitrates worth offering for this source, highest first (always at least 128 kbps). */
export function deriveAudioOptions(formats: FormatInfo[], durationSeconds: number): QualityOption[] {
  const sourceKbps = Math.max(
    0,
    ...formats.filter((f) => f.hasAudio && f.audioBitrateKbps).map((f) => f.audioBitrateKbps!),
  )
  const ceiling = sourceKbps > 0 ? sourceKbps * MP3_HEADROOM : Infinity
  const tiers = AUDIO_KBPS.filter((k) => k <= ceiling)
  const offered = tiers.length ? tiers : [128]

  return offered.map((kbps) => ({
    value: `${kbps}kbps`,
    sizeBytes: durationSeconds > 0 ? Math.round((kbps * 1000 * durationSeconds) / 8) : undefined,
  }))
}

export function deriveOptions(format: Format, formats: FormatInfo[], durationSeconds: number): QualityOption[] {
  return format === 'video' ? deriveVideoOptions(formats) : deriveAudioOptions(formats, durationSeconds)
}

/** 1080p when available (best size/quality trade-off), else the highest below it; best MP3 tier. */
export function defaultQuality(format: Format, options: QualityOption[]): string {
  if (format === 'audio') return options[0].value
  const underCap = options.find((o) => parseInt(o.value) <= DEFAULT_MAX_VIDEO_HEIGHT)
  return (underCap ?? options[options.length - 1]).value
}

/** "720p" → "720p", "192kbps" → "192 kbps". */
export function qualityLabel(value: string): string {
  return value.replace(/kbps$/, ' kbps')
}
