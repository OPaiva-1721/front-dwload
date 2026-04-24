import { HistoryList } from './HistoryList'
import styles from './HistoryPage.module.css'

export function HistoryPage() {
  return (
    <section className={styles.page}>
      <div className={styles.eyebrow}>
        <span className={styles.line} />
        TRANSMISSION LOG
        <span className={`${styles.line} ${styles.lineRight}`} />
      </div>
      <h1 className={styles.title}>Download History</h1>
      <HistoryList />
    </section>
  )
}
