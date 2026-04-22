import type { Format } from '../store'
import styles from './FormatPicker.module.css'

interface Props {
  value: Format
  onChange: (format: Format) => void
}

export function FormatPicker({ value, onChange }: Props) {
  return (
    <div className={styles.toggle}>
      <button
        type="button"
        className={`${styles.btn} ${value === 'video' ? styles.active : ''}`}
        onClick={() => onChange('video')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <polygon points="10,8 16,12 10,16" />
        </svg>
        VIDEO MP4
      </button>

      <button
        type="button"
        className={`${styles.btn} ${value === 'audio' ? styles.active : ''}`}
        onClick={() => onChange('audio')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        AUDIO MP3
      </button>
    </div>
  )
}
