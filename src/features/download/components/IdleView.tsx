import { useEffect, useMemo, type FormEvent } from 'react'
import { useDownloadStore } from '../store'
import { validateDownloadUrl, type VideoMetadata } from '../schemas/download'
import { defaultQuality, deriveOptions, parseDuration, qualityLabel } from '../lib/qualities'
import { UrlInput } from './UrlInput'
import { FormatPicker } from './FormatPicker'
import { QualityPicker } from './QualityPicker'
import { LaunchButton } from './LaunchButton'
import { VideoPreview } from './VideoPreview'

interface Props {
  onLaunch: () => void
  isPending?: boolean
  metadata?: VideoMetadata
  metaLoading?: boolean
  metaError?: string
}

export function IdleView({ onLaunch, isPending, metadata, metaLoading = false, metaError }: Props) {
  const { url, format, quality, setUrl, setFormat, setQuality } = useDownloadStore()

  const options = useMemo(
    () => (metadata ? deriveOptions(format, metadata.availableFormats, parseDuration(metadata.duration)) : null),
    [metadata, format],
  )

  // Keep the selection valid for this video: a 240p clip can't be downloaded at 1080p
  useEffect(() => {
    if (options && !options.some((o) => o.value === quality)) {
      setQuality(defaultQuality(format, options))
    }
  }, [options, quality, format, setQuality])

  const urlError = url.length > 0 ? validateDownloadUrl(url) : null
  const hasValidUrl = url.length > 0 && urlError === null
  const ready = hasValidUrl && !!metadata && !metaLoading && !metaError
  const formatName = format === 'video' ? 'MP4' : 'MP3'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (ready) onLaunch()
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormatPicker value={format} onChange={setFormat} />
      <UrlInput
        value={url}
        onChange={setUrl}
        error={urlError ?? undefined}
        loading={hasValidUrl && metaLoading}
      />
      {hasValidUrl && (
        <VideoPreview metadata={metadata} loading={metaLoading} error={metaError} />
      )}
      {ready && options && (
        <QualityPicker options={options} value={quality} onChange={setQuality} />
      )}
      <LaunchButton
        label={
          ready ? `Download ${formatName} · ${qualityLabel(quality)}`
          : !hasValidUrl ? 'Paste a link to start'
          : metaError ? "This link can't be downloaded"
          : 'Reading video…'
        }
        disabled={!ready}
        loading={isPending}
      />
    </form>
  )
}
