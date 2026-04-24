import { useEffect, useRef, useState } from 'react'
import { useDownloadStore } from '../store'
import { useJobStream } from '../hooks/useJobStream'
import { IdleView } from './IdleView'
import { DownloadingView } from './DownloadingView'
import { DoneView } from './DoneView'
import styles from './DownloadPanel.module.css'

export function DownloadPanel() {
  const [glitch, setGlitch] = useState(false)
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const { url, format, quality, setUrl, setFormat, setQuality } = useDownloadStore()

  const { status, step, percent, result } = useJobStream(jobId)

  // Periodic glitch animation on the title
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
    console.log('[DownloadPanel] launch', { url, format, quality })
    // Task 12 substituirá isso pela mutation real; por ora usa jobId mock
    setJobId('mock-123')
  }

  function handleRestart() {
    setJobId(null)
    setUrl('')
    setFormat('video')
    setQuality('1080p')
  }

  const isIdle = status === 'idle'
  const isDownloading = status === 'resolving' || status === 'downloading'
  const isDone = status === 'done'

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
          {isIdle && <IdleView onLaunch={handleLaunch} />}
          {isDownloading && (
            <DownloadingView step={step} percent={percent} />
          )}
          {isDone && result && (
            <DoneView result={result} onRestart={handleRestart} />
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
