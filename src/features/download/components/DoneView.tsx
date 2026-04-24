import styles from './DoneView.module.css'

export interface DownloadResult {
  downloadUrl: string
  title: string
  duration: string
  thumbnail: string
  size: string
  expiresAt: string
}

interface Props {
  result: DownloadResult
  onRestart: () => void
}

export function DoneView({ result, onRestart }: Props) {
  return (
    <div className={styles.root}>
      <div className={styles.badge}>
        <span className={styles.badgeIcon}>✓</span>
        <span className={styles.badgeText}>TRANSMISSION COMPLETE</span>
      </div>

      <div className={styles.meta}>
        {result.thumbnail && (
          <img
            src={result.thumbnail}
            alt={result.title}
            className={styles.thumbnail}
          />
        )}
        <div className={styles.info}>
          <p className={styles.title}>{result.title}</p>
          <div className={styles.details}>
            <span className={styles.detail}>{result.duration}</span>
            <span className={styles.detailSep}>·</span>
            <span className={styles.detail}>{result.size}</span>
          </div>
          <p className={styles.expires}>
            Link expires {result.expiresAt}
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <a
          href={result.downloadUrl}
          download
          className={styles.saveBtn}
        >
          ↓ SAVE FILE
        </a>
        <button type="button" className={styles.restartBtn} onClick={onRestart}>
          ↺ NEW DOWNLOAD
        </button>
      </div>
    </div>
  )
}
