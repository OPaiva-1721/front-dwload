import { useEffect, useRef, useState } from 'react'
import type { DownloadResult } from '../hooks/useJobStream'
import { expiryLabel } from '../lib/expiry'
import { formatDuration, parseDuration } from '../lib/qualities'
import styles from './DoneView.module.css'

export type { DownloadResult }

interface Props {
  result: DownloadResult
  onRestart: () => void
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

// The API may send "00:03:43" (from metadata) or "3:43" (from yt-dlp); show one style
function displayDuration(value: string) {
  const seconds = parseDuration(value)
  return seconds > 0 ? formatDuration(seconds) : value
}

export function DoneView({ result, onRestart }: Props) {
  const saveRef = useRef<HTMLAnchorElement>(null)
  const autoStarted = useRef(false)
  const now = useNow(30_000)
  const expires = result.expiresAtUtc ? expiryLabel(result.expiresAtUtc, now) : `Link expires ${result.expiresAt}`
  const expired = !!result.expiresAtUtc && Date.parse(result.expiresAtUtc) <= now
  const hasFile = result.downloadUrl && result.downloadUrl !== '#'

  // Start the file download on its own: the server sends it as an attachment, so the page stays put.
  // The button remains as a fallback if the browser blocks automatic downloads.
  useEffect(() => {
    if (autoStarted.current || !hasFile) return
    autoStarted.current = true
    saveRef.current?.click()
  }, [hasFile])

  return (
    <div className={styles.root}>
      <div className={styles.badge} role="status">
        <span className={styles.badgeIcon} aria-hidden>✓</span>
        <span className={styles.badgeText}>Ready — your download should start automatically</span>
      </div>

      <div className={styles.meta}>
        {result.thumbnail && <img src={result.thumbnail} alt="" className={styles.thumbnail} />}
        <div className={styles.info}>
          <p className={styles.title} title={result.title}>{result.title}</p>
          <p className={styles.details}>
            {[displayDuration(result.duration), result.size].filter(Boolean).join(' · ')}
          </p>
          <p className={`${styles.expires} ${expired ? styles.expired : ''}`}>{expires}</p>
        </div>
      </div>

      <div className={styles.actions}>
        {hasFile && !expired && (
          <a ref={saveRef} href={result.downloadUrl} download className={styles.saveBtn}>
            ↓ Save file
          </a>
        )}
        <button type="button" className={styles.restartBtn} onClick={onRestart}>
          New download
        </button>
      </div>
    </div>
  )
}
