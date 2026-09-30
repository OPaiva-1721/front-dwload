import { useEffect, useRef, useState } from 'react'
import styles from './DownloadPanel.module.css'

/** Own component so the periodic glitch re-renders only the heading, not the whole form. */
export function HeroTitle() {
  const [glitch, setGlitch] = useState(false)
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    function scheduleGlitch() {
      glitchTimer.current = setTimeout(() => {
        setGlitch(true)
        glitchTimer.current = setTimeout(() => {
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

  return (
    <h1 className={styles.title}>
      <span className={styles.titleLine1}>Capture</span>
      <span className={`${styles.titleLine2} ${glitch ? styles.glitch : ''}`}>
        Any Signal
      </span>
    </h1>
  )
}
