import { useDownloadStore } from '../store'
import { UrlInput } from './UrlInput'
import { FormatPicker } from './FormatPicker'
import { QualityPicker } from './QualityPicker'
import { LaunchButton } from './LaunchButton'

interface Props {
  onLaunch: () => void
}

export function IdleView({ onLaunch }: Props) {
  const { url, format, quality, setUrl, setFormat, setQuality } = useDownloadStore()

  return (
    <>
      <FormatPicker value={format} onChange={setFormat} />
      <UrlInput value={url} onChange={setUrl} />
      <QualityPicker format={format} value={quality} onChange={setQuality} />
      <LaunchButton onClick={onLaunch} />
    </>
  )
}
