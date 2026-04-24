import { useHistoryStore } from '../store'
import styles from './HistoryList.module.css'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function HistoryList() {
  const { items, clear } = useHistoryStore()

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>◎</span>
        <p className={styles.emptyText}>No transmissions recorded yet.</p>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.count}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
        <button className={styles.clearBtn} onClick={clear}>CLEAR ALL</button>
      </div>

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            {item.thumbnail && (
              <img src={item.thumbnail} alt={item.title} className={styles.thumbnail} />
            )}
            <div className={styles.info}>
              <p className={styles.title}>{item.title || item.url}</p>
              <div className={styles.meta}>
                <span className={styles.badge}>{item.format.toUpperCase()}</span>
                <span className={styles.badge}>{item.quality}</span>
                <span className={styles.date}>{formatDate(item.completedAt)}</span>
              </div>
            </div>
            {item.downloadUrl && item.downloadUrl !== '#' && (
              <a href={item.downloadUrl} download className={styles.downloadLink}>↓</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
