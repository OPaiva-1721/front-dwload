import { formatBytes, qualityLabel, type QualityOption } from '../lib/qualities'
import styles from './QualityPicker.module.css'

interface Props {
  options: QualityOption[]
  value: string
  onChange: (quality: string) => void
  disabled?: boolean
}

export function QualityPicker({ options, value, onChange, disabled = false }: Props) {
  return (
    <fieldset className={styles.row} disabled={disabled}>
      <legend className={styles.legend}>Quality</legend>
      {options.map((option) => (
        <label key={option.value} className={`${styles.pill} ${value === option.value ? styles.active : ''}`}>
          <input
            type="radio"
            name="quality"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className={styles.radio}
          />
          <span className={styles.value}>{qualityLabel(option.value)}</span>
          {option.sizeBytes !== undefined && (
            <span className={styles.size}>~{formatBytes(option.sizeBytes)}</span>
          )}
        </label>
      ))}
    </fieldset>
  )
}
