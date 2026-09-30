import styles from './StepsIndicator.module.css'

interface Props {
  steps: readonly string[]
  /** Index of the step in progress; steps before it render as done. */
  current: number
}

export function StepsIndicator({ steps, current }: Props) {
  return (
    <ol className={styles.root}>
      {steps.map((label, i) => {
        const isDone = i < current
        const isActive = i === current
        const statusClass = isDone ? styles.done : isActive ? styles.active : styles.pending

        return (
          <li key={label} className={styles.item} aria-current={isActive ? 'step' : undefined}>
            <div className={styles.stepCol}>
              <div className={`${styles.circle} ${statusClass}`} aria-hidden>
                {isDone ? '✓' : i + 1}
              </div>
              <span className={`${styles.label} ${statusClass}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`${styles.connector} ${isDone ? styles.connectorDone : ''}`} aria-hidden />
            )}
          </li>
        )
      })}
    </ol>
  )
}
