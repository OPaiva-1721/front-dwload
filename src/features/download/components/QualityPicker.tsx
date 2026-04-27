import type { Format } from '../store'
import styles from './QualityPicker.module.css'

const DEFAULT_QUALITIES: Record<Format, readonly string[]> = {
  video: ['2160p', '1080p', '720p', '480p'],
  audio: ['320kbps', '256kbps', '192kbps', '128kbps'],
}

interface Props {
  format: Format
  value: string
  onChange: (quality: string) => void
  options?: string[]
  loading?: boolean
}

export function QualityPicker({ format, value, onChange, options, loading }: Props) {
  const qualities = options ?? DEFAULT_QUALITIES[format]

  if (loading) {
    return (
      <div className={styles.row}>
        {DEFAULT_QUALITIES[format].map((q) => (
          <button key={q} type="button" className={styles.pill} disabled>
            {q}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.row}>
      {qualities.map((q) => (
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
