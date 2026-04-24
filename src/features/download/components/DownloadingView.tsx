import { StepsIndicator, type Step } from '@/components/StepsIndicator'
import { ProgressBar } from '@/components/ProgressBar'
import styles from './DownloadingView.module.css'

const STEP_MESSAGES: Record<Step, string> = {
  resolving: 'Resolving media URL...',
  fetching: 'Fetching media stream...',
  transcoding: 'Transcoding to target format...',
  packaging: 'Packaging final file...',
}

interface Props {
  step: Step
  percent: number
}

export function DownloadingView({ step, percent }: Props) {
  return (
    <div className={styles.root}>
      <StepsIndicator currentStep={step} />
      <p className={styles.message}>{STEP_MESSAGES[step]}</p>
      <ProgressBar percent={percent} />
      <span className={styles.percent}>{percent}%</span>
    </div>
  )
}
