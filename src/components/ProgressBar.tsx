import styles from './ProgressBar.module.css'

interface Props {
  percent: number
}

export function ProgressBar({ percent }: Props) {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div className={styles.track}>
      <div className={styles.fill} style={{ width: `${clamped}%` }} />
    </div>
  )
}
