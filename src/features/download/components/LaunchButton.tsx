import styles from './LaunchButton.module.css'

interface Props {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export function LaunchButton({ onClick, disabled, loading }: Props) {
  return (
    <button
      type="button"
      className={styles.btn}
      onClick={onClick}
      disabled={disabled || loading}
    >
      🚀 {loading ? 'LAUNCHING...' : 'LAUNCH DOWNLOAD'}
    </button>
  )
}
