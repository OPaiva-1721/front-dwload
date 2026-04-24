import { useDownloadStore } from '../store'
import { validateDownloadUrl } from '../schemas/download'
import { UrlInput } from './UrlInput'
import { FormatPicker } from './FormatPicker'
import { QualityPicker } from './QualityPicker'
import { LaunchButton } from './LaunchButton'

interface Props {
  onLaunch: () => void
  isPending?: boolean
}

export function IdleView({ onLaunch, isPending }: Props) {
  const { url, format, quality, setUrl, setFormat, setQuality } = useDownloadStore()

  const urlError = url.length > 0 ? validateDownloadUrl(url) : null
  const canLaunch = url.length > 0 && urlError === null

  return (
    <>
      <FormatPicker value={format} onChange={setFormat} />
      <UrlInput value={url} onChange={setUrl} error={urlError ?? undefined} />
      <QualityPicker format={format} value={quality} onChange={setQuality} />
      <LaunchButton onClick={onLaunch} disabled={!canLaunch} loading={isPending} />
    </>
  )
}
