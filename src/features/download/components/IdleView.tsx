import { useEffect, useMemo } from 'react'
import { useDownloadStore } from '../store'
import { validateDownloadUrl, type FormatInfo, type VideoMetadata } from '../schemas/download'
import { UrlInput } from './UrlInput'
import { FormatPicker } from './FormatPicker'
import { QualityPicker } from './QualityPicker'
import { LaunchButton } from './LaunchButton'

const VIDEO_QUALITY_ORDER = ['2160p', '1080p', '720p', '480p']

function deriveVideoQualities(formats: FormatInfo[]): string[] {
  const heights = formats
    .filter((f) => f.height !== null)
    .map((f) => f.height!)

  if (heights.length === 0) return VIDEO_QUALITY_ORDER

  const max = Math.max(...heights)
  const available = VIDEO_QUALITY_ORDER.filter((q) => max >= parseInt(q))
  return available.length > 0 ? available : VIDEO_QUALITY_ORDER
}

interface Props {
  onLaunch: () => void
  isPending?: boolean
  metadata?: VideoMetadata
  metaLoading?: boolean
}

export function IdleView({ onLaunch, isPending, metadata, metaLoading = false }: Props) {
  const { url, format, quality, setUrl, setFormat, setQuality } = useDownloadStore()

  const videoQualityOptions = useMemo(
    () => (metadata ? deriveVideoQualities(metadata.availableFormats) : undefined),
    [metadata],
  )

  const qualityOptions = format === 'video' ? videoQualityOptions : undefined

  useEffect(() => {
    if (qualityOptions && !qualityOptions.includes(quality)) {
      setQuality(qualityOptions[0])
    }
  }, [qualityOptions, quality, setQuality])

  const urlError = url.length > 0 ? validateDownloadUrl(url) : null
  const canLaunch = url.length > 0 && urlError === null && !metaLoading

  return (
    <>
      <FormatPicker value={format} onChange={setFormat} />
      <UrlInput value={url} onChange={setUrl} error={urlError ?? undefined} loading={metaLoading && url.length > 0 && urlError === null} />
      <QualityPicker
        format={format}
        value={quality}
        onChange={setQuality}
        options={qualityOptions}
        loading={metaLoading && url.length > 0 && urlError === null}
      />
      <LaunchButton onClick={onLaunch} disabled={!canLaunch} loading={isPending} />
    </>
  )
}
