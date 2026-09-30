import { formatDuration, parseDuration } from '../lib/qualities'
import type { VideoMetadata } from '../schemas/download'
import styles from './VideoPreview.module.css'

interface Props {
  metadata?: VideoMetadata
  loading: boolean
  error?: string
  compact?: boolean
}

export function VideoPreview({ metadata, loading, error, compact = false }: Props) {
  if (error) {
    return (
      <div className={`${styles.root} ${styles.error}`} role="alert">
        <span className={styles.errorIcon} aria-hidden>!</span>
        <p className={styles.errorText}>{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`${styles.root} ${compact ? styles.compact : ''}`} aria-busy="true" aria-label="Loading video details">
        <div className={`${styles.thumb} ${styles.skeleton}`} />
        <div className={styles.info}>
          <div className={`${styles.line} ${styles.skeleton}`} />
          <div className={`${styles.lineShort} ${styles.skeleton}`} />
        </div>
      </div>
    )
  }

  if (!metadata) return null

  const seconds = parseDuration(metadata.duration)

  return (
    <div className={`${styles.root} ${compact ? styles.compact : ''}`}>
      {metadata.thumbnailUrl
        ? <img src={metadata.thumbnailUrl} alt="" className={styles.thumb} />
        : <div className={styles.thumb} aria-hidden />}
      <div className={styles.info}>
        <p className={styles.title} title={metadata.title}>{metadata.title}</p>
        {seconds > 0 && <p className={styles.meta}>{formatDuration(seconds)}</p>}
      </div>
    </div>
  )
}
