import styles from './LaunchButton.module.css'

interface Props {
  label: string
  disabled?: boolean
  loading?: boolean
}

export function LaunchButton({ label, disabled, loading }: Props) {
  return (
    <button type="submit" className={styles.btn} disabled={disabled || loading} aria-busy={loading}>
      {loading ? 'Starting…' : label}
    </button>
  )
}
