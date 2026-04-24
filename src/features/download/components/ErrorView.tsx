import styles from './ErrorView.module.css'

interface Props {
  message: string
  onRetry: () => void
}

export function ErrorView({ message, onRetry }: Props) {
  return (
    <div className={styles.root}>
      <span className={styles.icon}>✕</span>
      <p className={styles.title}>Transmission Failed</p>
      <p className={styles.message}>{message}</p>
      <button className={styles.retryBtn} type="button" onClick={onRetry}>
        ↺ TRY AGAIN
      </button>
    </div>
  )
}
