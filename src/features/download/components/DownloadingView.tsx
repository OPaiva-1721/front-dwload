import { StepsIndicator } from '@/components/StepsIndicator'
import { ProgressBar } from '@/components/ProgressBar'
import type { JobStatus } from '../hooks/useJobStream'
import type { VideoMetadata } from '../schemas/download'
import { VideoPreview } from './VideoPreview'
import styles from './DownloadingView.module.css'

const STEPS = ['Preparing', 'Downloading', 'Converting'] as const

const STEP_INDEX: Partial<Record<JobStatus, number>> = { preparing: 0, downloading: 1, converting: 2 }

interface Props {
  status: JobStatus
  percent: number
  format: 'video' | 'audio'
  metadata?: VideoMetadata
  onCancel: () => void
  cancelling: boolean
}

export function DownloadingView({ status, percent, format, metadata, onCancel, cancelling }: Props) {
  const message =
    status === 'preparing' ? 'Getting the video ready…'
    : status === 'converting' ? (format === 'audio' ? 'Converting to MP3…' : 'Merging video and audio…')
    : `Downloading… ${percent}%`

  return (
    <div className={styles.root}>
      <VideoPreview metadata={metadata} loading={false} compact />
      <StepsIndicator steps={STEPS} current={STEP_INDEX[status] ?? 0} />
      <p className={styles.message} aria-live="polite">{message}</p>
      <ProgressBar
        percent={percent}
        indeterminate={status !== 'downloading'}
        label="Download progress"
      />
      <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={cancelling}>
        {cancelling ? 'Cancelling…' : 'Cancel'}
      </button>
    </div>
  )
}
