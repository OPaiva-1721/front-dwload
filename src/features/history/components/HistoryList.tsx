import { useNavigate } from 'react-router-dom'
import { useDownloadStore, type Format } from '@/features/download/store'
import { expiryLabel, isExpired } from '@/features/download/lib/expiry'
import { qualityLabel } from '@/features/download/lib/qualities'
import { itemExpiresAt, useHistoryStore, type HistoryItem } from '../store'
import styles from './HistoryList.module.css'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export function HistoryList() {
  const { items, clear } = useHistoryStore()
  const { setUrl, setFormat, setQuality } = useDownloadStore()
  const navigate = useNavigate()

  // Files are deleted after an hour; "again" re-runs the same link with the same choices
  function downloadAgain(item: HistoryItem) {
    setFormat(item.format as Format)
    setQuality(item.quality)
    setUrl(item.url)
    navigate('/')
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon} aria-hidden>◎</span>
        <p className={styles.emptyText}>Nothing here yet. Your downloads will show up here.</p>
      </div>
    )
  }

  const now = Date.now()

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.count}>{items.length} download{items.length !== 1 ? 's' : ''}</span>
        <button type="button" className={styles.clearBtn} onClick={clear}>Clear all</button>
      </div>

      <ul className={styles.list}>
        {items.map((item) => {
          const expiresAt = itemExpiresAt(item)
          const expired = isExpired(expiresAt, now)
          const hasFile = !!item.downloadUrl && item.downloadUrl !== '#'

          return (
            <li key={item.id} className={styles.item}>
              {item.thumbnail && <img src={item.thumbnail} alt="" className={styles.thumbnail} />}
              <div className={styles.info}>
                <p className={styles.title}>{item.title || item.url}</p>
                <div className={styles.meta}>
                  <span className={styles.badge}>{item.format === 'audio' ? 'MP3' : 'MP4'}</span>
                  <span className={styles.badge}>{qualityLabel(item.quality)}</span>
                  <span className={styles.date}>{formatDate(item.completedAt)}</span>
                </div>
                <p className={`${styles.expiry} ${expired ? styles.expired : ''}`}>
                  {expired ? 'File deleted' : expiryLabel(expiresAt, now)}
                </p>
              </div>
              {hasFile && !expired ? (
                <a href={item.downloadUrl} download className={styles.downloadLink} aria-label={`Save ${item.title}`}>↓</a>
              ) : (
                <button type="button" className={styles.againBtn} onClick={() => downloadAgain(item)}>
                  Download again
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
