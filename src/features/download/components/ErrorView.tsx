import styles from './ErrorView.module.css'

interface Props {
  message: string
  /** Back to the form with the same link, e.g. to pick another quality. */
  onRetry: () => void
  onStartOver: () => void
}

export function ErrorView({ message, onRetry, onStartOver }: Props) {
  return (
    <div className={styles.root} role="alert">
      <span className={styles.icon} aria-hidden>✕</span>
      <p className={styles.title}>Download failed</p>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button className={styles.retryBtn} type="button" onClick={onRetry}>
          ↺ Try again
        </button>
        <button className={styles.secondaryBtn} type="button" onClick={onStartOver}>
          Start over
        </button>
      </div>
    </div>
  )
}
