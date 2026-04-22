import type { Format } from '../store'
import styles from './QualityPicker.module.css'

const QUALITIES: Record<Format, readonly string[]> = {
  video: ['2160p', '1080p', '720p', '480p'],
  audio: ['320kbps', '256kbps', '192kbps', '128kbps'],
}

interface Props {
  format: Format
  value: string
  onChange: (quality: string) => void
}

export function QualityPicker({ format, value, onChange }: Props) {
  return (
    <div className={styles.row}>
      {QUALITIES[format].map((q) => (
        <button
          key={q}
          type="button"
          className={`${styles.pill} ${value === q ? styles.active : ''}`}
          onClick={() => onChange(q)}
        >
          {q}
        </button>
      ))}
    </div>
  )
}
