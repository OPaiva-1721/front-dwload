import styles from './ProgressBar.module.css'

interface Props {
  percent: number
  /** No reliable percentage (queued, or ffmpeg converting): show continuous motion instead. */
  indeterminate?: boolean
  label: string
}

export function ProgressBar({ percent, indeterminate = false, label }: Props) {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : clamped}
    >
      {indeterminate
        ? <div className={styles.indeterminate} />
        : <div className={styles.fill} style={{ width: `${clamped}%` }} />}
    </div>
  )
}
