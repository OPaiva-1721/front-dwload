import { useEffect, useState } from 'react'
import { createSseHandle } from '@/lib/sse'

export interface DownloadResult {
  downloadUrl: string
  title: string
  duration: string
  thumbnail: string
  size: string
  expiresAt: string
  /** Exact moment the server deletes the file (ISO 8601). */
  expiresAtUtc?: string
}

/**
 * preparing   – queued / fetching video info, no progress yet
 * downloading – streams coming in, percent is meaningful
 * converting  – ffmpeg merging or encoding, no percent available
 */
export type JobStatus = 'idle' | 'preparing' | 'downloading' | 'converting' | 'done' | 'failed' | 'cancelled'

interface JobStreamState {
  status: JobStatus
  percent: number
  result: DownloadResult | null
  error: string | null
}

const INITIAL: JobStreamState = {
  status: 'idle',
  percent: 0,
  result: null,
  error: null,
}

const GENERIC_FAILURE = 'The download failed. Please try again in a moment.'

export function useJobStream(jobId: string | null) {
  const [state, setState] = useState<JobStreamState>(INITIAL)

  useEffect(() => {
    if (!jobId) {
      setState(INITIAL)
      return
    }

    setState({ ...INITIAL, status: 'preparing' })

    const handle = createSseHandle(jobId)

    function onProgress(e: MessageEvent) {
      const data = JSON.parse(e.data) as { step?: string; percent: number }
      const status: JobStatus = data.step === 'converting' ? 'converting' : 'downloading'
      // Progress only moves forward, even if a reconnect replays older events
      setState((s) => ({ ...s, status, percent: Math.max(s.percent, data.percent) }))
    }

    function onDone(e: MessageEvent) {
      const data = JSON.parse(e.data) as DownloadResult
      setState((s) => ({ ...s, status: 'done', percent: 100, result: data }))
      handle.close()
    }

    function onFailed(e: MessageEvent) {
      const data = JSON.parse(e.data) as { message?: string }
      setState((s) => ({ ...s, status: 'failed', error: data.message || GENERIC_FAILURE }))
      handle.close()
    }

    function onCancelled() {
      setState((s) => ({ ...s, status: 'cancelled' }))
      handle.close()
    }

    handle.on('progress', onProgress)
    handle.on('done', onDone)
    handle.on('failed', onFailed)
    handle.on('cancelled', onCancelled)

    return () => {
      handle.off('progress', onProgress)
      handle.off('done', onDone)
      handle.off('failed', onFailed)
      handle.off('cancelled', onCancelled)
      handle.close()
    }
  }, [jobId])

  return state
}
