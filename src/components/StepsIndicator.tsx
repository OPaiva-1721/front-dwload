import styles from './StepsIndicator.module.css'

const STEPS = ['resolving', 'fetching', 'transcoding', 'packaging'] as const
export type Step = (typeof STEPS)[number]

const STEP_LABELS: Record<Step, string> = {
  resolving: 'Resolving',
  fetching: 'Fetching',
  transcoding: 'Transcoding',
  packaging: 'Packaging',
}

interface Props {
  currentStep: Step
}

export function StepsIndicator({ currentStep }: Props) {
  const currentIndex = STEPS.indexOf(currentStep)

  return (
    <div className={styles.root}>
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex
        const isActive = i === currentIndex
        const statusClass = isDone ? styles.done : isActive ? styles.active : styles.pending

        return (
          <div key={step} className={styles.item}>
            <div className={styles.stepCol}>
              <div className={`${styles.circle} ${statusClass}`}>
                {isDone ? '✓' : i + 1}
              </div>
              <span className={`${styles.label} ${statusClass}`}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`${styles.connector} ${isDone ? styles.connectorDone : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
