import { useEffect, useRef, useState } from 'react'
import { useDownloadStore } from '../store'
import { IdleView } from './IdleView'
import styles from './DownloadPanel.module.css'

export function DownloadPanel() {
  const [glitch, setGlitch] = useState(false)
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { url, format, quality } = useDownloadStore()

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
          <IdleView onLaunch={handleLaunch} />
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
