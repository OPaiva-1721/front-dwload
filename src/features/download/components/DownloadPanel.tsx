import { useEffect, useRef, useState } from 'react'
import { useDownloadStore } from '../store'
import { useJobStream } from '../hooks/useJobStream'
import { useCreateDownload } from '../hooks/useCreateDownload'
import { useMetadata } from '../hooks/useMetadata'
import { IdleView } from './IdleView'
import { DownloadingView } from './DownloadingView'
import { DoneView } from './DoneView'
import { ErrorView } from './ErrorView'
import { useHistoryStore } from '@/features/history/store'
import styles from './DownloadPanel.module.css'

export function DownloadPanel() {
  const [glitch, setGlitch] = useState(false)
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const { url, format, quality, setUrl, setFormat, setQuality } = useDownloadStore()

  const createDownload = useCreateDownload()
  const { status, step, percent, result, error } = useJobStream(jobId)
  const addToHistory = useHistoryStore((s) => s.add)
  const { data: metadata, isLoading: metaLoading } = useMetadata(url)

  useEffect(() => {
    if (status === 'done' && result && jobId) {
      addToHistory({
        id: jobId,
        url,
        title: result.title,
        format,
        quality,
        completedAt: new Date().toISOString(),
        thumbnail: result.thumbnail,
        downloadUrl: result.downloadUrl,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    function scheduleGlitch() {
      glitchTimer.current = setTimeout(() => {
        setGlitch(true)
        setTimeout(() => {
          setGlitch(false)
          scheduleGlitch()
        }, 140)
      }, 4500 + Math.random() * 6000)
    }

    const initial = setTimeout(scheduleGlitch, 3500)
    return () => {
      clearTimeout(initial)
      if (glitchTimer.current) clearTimeout(glitchTimer.current)
    }
  }, [])

  function handleLaunch() {
    createDownload.mutate(
      { url, format, quality, title: metadata?.title, thumbnailUrl: metadata?.thumbnailUrl, duration: metadata?.duration },
      { onSuccess: ({ jobId: id }) => setJobId(id) }
    )
  }

  function handleRestart() {
    createDownload.reset()
    setJobId(null)
    setUrl('')
    setFormat('video')
    setQuality('1080p')
  }

  const isIdle = status === 'idle' && !createDownload.isError
  const isDownloading = status === 'resolving' || status === 'downloading'
  const isDone = status === 'done'
  const isFailed = status === 'failed' || createDownload.isError

  return (
    <section className={styles.page}>
      <div className={styles.eyebrow}>
        <span className={styles.eyebrowLine} />
        DOWNLOAD FROM THE VOID
        <span className={`${styles.eyebrowLine} ${styles.eyebrowLineRight}`} />
      </div>

      <h1 className={styles.title}>
        <span className={styles.titleLine1}>Capture</span>
        <span className={`${styles.titleLine2} ${glitch ? styles.glitch : ''}`}>
          Any Signal
        </span>
      </h1>

      <p className={styles.subtitle}>
        Paste any URL. Choose your format. Launch into the void.
      </p>

      <div className={styles.cardWrap}>
        <div className={styles.auroraBorder} />
        <div className={styles.card}>
          {isIdle && (
            <IdleView onLaunch={handleLaunch} isPending={createDownload.isPending} metadata={metadata} metaLoading={metaLoading} />
          )}
          {isDownloading && (
            <DownloadingView step={step} percent={percent} />
          )}
          {isDone && result && (
            <DoneView result={result} onRestart={handleRestart} />
          )}
          {isFailed && (
            <ErrorView
              message={
                error ??
                (createDownload.error instanceof Error
                  ? createDownload.error.message
                  : 'Something went wrong. Please try again.')
              }
              onRetry={handleRestart}
            />
          )}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>4K+</span>
          <span className={styles.statLabel}>RESOLUTIONS</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>15+</span>
          <span className={styles.statLabel}>PLATFORMS</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{'< 30s'}</span>
          <span className={styles.statLabel}>AVG. TIME</span>
        </div>
      </div>
    </section>
  )
}
