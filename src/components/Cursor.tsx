import { useEffect, useRef, useState } from 'react'
import styles from './Cursor.module.css'

// Touch screens have no pointer to follow; the custom cursor would sit frozen in a corner
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [enabled] = useState(() => window.matchMedia?.(FINE_POINTER).matches ?? false)

  useEffect(() => {
    const el = cursorRef.current
    if (!enabled || !el) return

    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
      el.style.opacity = '1'
    }
    const onLeave = () => { el.style.opacity = '0' }

    window.addEventListener('mousemove', onMove)
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={cursorRef} className={styles.cursor} aria-hidden>
      <div className={styles.crosshair}>
        <div className={styles.dot} />
        <div className={styles.aura} />
      </div>
    </div>
  )
}
