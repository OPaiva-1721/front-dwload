import { useEffect, useState } from 'react'
import { useDownloadStore } from '../store'
import { useJobStream } from '../hooks/useJobStream'
import { useCreateDownload } from '../hooks/useCreateDownload'
import { useMetadata } from '../hooks/useMetadata'
import { cancelDownload } from '../api/downloadsApi'
import { extractUrl } from '../lib/extractUrl'
import { SUPPORTED_PLATFORMS } from '../schemas/download'
import { IdleView } from './IdleView'
import { DownloadingView } from './DownloadingView'
import { DoneView } from './DoneView'
import { ErrorView } from './ErrorView'
import { HeroTitle } from './HeroTitle'
import { useHistoryStore } from '@/features/history/store'
import styles from './DownloadPanel.module.css'

const GENERIC_ERROR = 'Something went wrong. Please try again.'

/**
 * Links arrive from the OS share sheet (share_target in manifest.webmanifest) as ?link= or,
 * from apps that only share text, inside ?text=. ?url= also works in production (the Vite dev
 * server reserves it). Read once, then drop them from the address bar.
 */
function useSharedLink(onLink: (url: string) => void) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const url = ['link', 'url', 'text', 'title']
      .map((name) => extractUrl(params.get(name)))
      .find(Boolean)
    if (!url) return
    onLink(url)
    window.history.replaceState(null, '', window.location.pathname)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export function DownloadPanel() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const { url, format, quality, setUrl, setFormat } = useDownloadStore()

  const createDownload = useCreateDownload()
  const { status, percent, result, error } = useJobStream(jobId)
  const addToHistory = useHistoryStore((s) => s.add)
  const metadataQuery = useMetadata(url)
  const metadata = metadataQuery.data
  const metaError = metadataQuery.error
    ? (metadataQuery.error instanceof Error ? metadataQuery.error.message : GENERIC_ERROR)
    : undefined

  useSharedLink(setUrl)

  useEffect(() => {
    if (status === 'done' && result && jobId) {
      addToHistory({
        id: jobId,
        url,
        title: result.title,
        format,
        quality,
        completedAt: new Date().toISOString(),
        expiresAtUtc: result.expiresAtUtc,
        thumbnail: result.thumbnail,
        downloadUrl: result.downloadUrl,
      })
    }
    // A cancelled job goes straight back to the form, link and choices intact
    if (status === 'cancelled') {
      setCancelling(false)
      setJobId(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  function handleLaunch() {
    createDownload.mutate(
      { url, format, quality, title: metadata?.title, thumbnailUrl: metadata?.thumbnailUrl, duration: metadata?.duration },
      { onSuccess: ({ jobId: id }) => setJobId(id) }
    )
  }

  async function handleCancel() {
    if (!jobId) return
    setCancelling(true)
    try {
      await cancelDownload(jobId)
      // Mock mode has no server to confirm; the real API confirms via the stream's "cancelled" event
      if (!jobId.startsWith('mock')) return
    } catch {
      // Already finished (409) or gone: the stream will report the real outcome
      setCancelling(false)
      return
    }
    setCancelling(false)
    setJobId(null)
  }

  /** Back to the form, keeping the link so the user can retry or pick another quality. */
  function handleRetry() {
    createDownload.reset()
    setJobId(null)
  }

  function handleStartOver() {
    handleRetry()
    setUrl('')
    setFormat('video')
  }

  const isDownloading = status === 'preparing' || status === 'downloading' || status === 'converting'
  const isDone = status === 'done'
  const isFailed = status === 'failed' || createDownload.isError
  const isIdle = !isDownloading && !isDone && !isFailed

  return (
    <section className={styles.page}>
      <div className={styles.eyebrow}>
        <span className={styles.eyebrowLine} />
        DOWNLOAD FROM THE VOID
        <span className={`${styles.eyebrowLine} ${styles.eyebrowLineRight}`} />
      </div>

      <HeroTitle />

      <p className={styles.subtitle}>
        Paste a link, pick video or audio, and save it in seconds.
      </p>

      <div className={styles.cardWrap}>
        <div className={styles.auroraBorder} />
        <div className={styles.card}>
          {isIdle && (
            <IdleView
              onLaunch={handleLaunch}
              isPending={createDownload.isPending}
              metadata={metadata}
              metaLoading={metadataQuery.isLoading}
              metaError={metaError}
            />
          )}
          {isDownloading && (
            <DownloadingView
              status={status}
              percent={percent}
              format={format}
              metadata={metadata}
              onCancel={handleCancel}
              cancelling={cancelling}
            />
          )}
          {isDone && result && (
            <DoneView result={result} onRestart={handleStartOver} />
          )}
          {isFailed && (
            <ErrorView
              message={
                error ??
                (createDownload.error instanceof Error ? createDownload.error.message : GENERIC_ERROR)
              }
              onRetry={handleRetry}
              onStartOver={handleStartOver}
            />
          )}
        </div>
      </div>

      <p className={styles.platforms}>
        <span className={styles.platformsLabel}>Works with</span>
        {SUPPORTED_PLATFORMS.map((name) => (
          <span key={name} className={styles.platform}>{name}</span>
        ))}
      </p>
    </section>
  )
}
