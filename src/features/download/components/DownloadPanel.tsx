import { useEffect, useRef, useState } from 'react'
import { useDownloadStore } from '../store'
import { IdleView } from './IdleView'
import { DownloadingView } from './DownloadingView'
import { DoneView, type DownloadResult } from './DoneView'
import type { Step } from '@/components/StepsIndicator'
import styles from './DownloadPanel.module.css'

type JobState = 'idle' | 'downloading' | 'done'

const DEBUG_STEPS: Step[] = ['resolving', 'fetching', 'transcoding', 'packaging']

export function DownloadPanel() {
  const [glitch, setGlitch] = useState(false)
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [jobState, setJobState] = useState<JobState>('idle')
  const [debugStepIndex, setDebugStepIndex] = useState(0)
  const { url, format, quality, setUrl, setFormat, setQuality } = useDownloadStore()

  const FAKE_RESULT: DownloadResult = {
    downloadUrl: '#',
    title: 'Rick Astley - Never Gonna Give You Up (Official Video)',
    duration: '3:33',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    size: '47.2 MB',
    expiresAt: 'in 24h',
  }

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
    setJobState('downloading')
    setDebugStepIndex(0)
  }

  function handleRestart() {
    setJobState('idle')
    setDebugStepIndex(0)
    setUrl('')
    setFormat('video')
    setQuality('1080p')
  }

  function handleDebugNextStep() {
    if (jobState === 'idle') {
      setJobState('downloading')
      setDebugStepIndex(0)
    } else if (jobState === 'downloading') {
      if (debugStepIndex < DEBUG_STEPS.length - 1) {
        setDebugStepIndex((i) => i + 1)
      } else {
        setJobState('done')
      }
    } else {
      setJobState('idle')
      setDebugStepIndex(0)
    }
  }

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
          {jobState === 'idle' && <IdleView onLaunch={handleLaunch} />}
          {jobState === 'downloading' && (
            <DownloadingView
              step={DEBUG_STEPS[debugStepIndex]}
              percent={Math.round(((debugStepIndex) / DEBUG_STEPS.length) * 100)}
            />
          )}
          {jobState === 'done' && (
            <DoneView result={FAKE_RESULT} onRestart={handleRestart} />
          )}
        </div>
      </div>

      <button
        onClick={handleDebugNextStep}
        style={{
          marginTop: 16,
          background: 'rgba(120,90,220,0.15)',
          border: '1px solid rgba(120,90,220,0.3)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.15em',
          padding: '6px 16px',
          borderRadius: 6,
          cursor: 'none',
        }}
      >
        [DEBUG] {jobState.toUpperCase()} → NEXT
      </button>

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
