import { useEffect, useRef } from 'react'
import styles from './Cursor.module.css'

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cursorRef.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div ref={cursorRef} className={styles.cursor}>
      <div className={styles.crosshair}>
        <div className={styles.dot} />
        <div className={styles.aura} />
      </div>
    </div>
  )
}
