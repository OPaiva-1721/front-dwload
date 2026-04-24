import { useEffect, useRef, useState } from 'react'
import { createSseHandle } from '@/lib/sse'
import type { DownloadResult } from '../components/DoneView'
import type { Step } from '@/components/StepsIndicator'

export type JobStatus = 'idle' | 'resolving' | 'downloading' | 'done' | 'failed'

interface JobStreamState {
  status: JobStatus
  step: Step
  percent: number
  result: DownloadResult | null
  error: string | null
}

const INITIAL: JobStreamState = {
  status: 'idle',
  step: 'resolving',
  percent: 0,
  result: null,
  error: null,
}

export function useJobStream(jobId: string | null) {
  const [state, setState] = useState<JobStreamState>(INITIAL)
  const handleRef = useRef<ReturnType<typeof createSseHandle> | null>(null)

  useEffect(() => {
    if (!jobId) {
      setState(INITIAL)
      return
    }

    setState({ ...INITIAL, status: 'resolving' })

    const handle = createSseHandle(jobId)
    handleRef.current = handle

    function onResolved() {
      setState((s) => ({ ...s, status: 'downloading', step: 'fetching' }))
    }

    function onProgress(e: MessageEvent) {
      const data = JSON.parse(e.data) as { step: Step; percent: number }
      setState((s) => ({ ...s, status: 'downloading', step: data.step, percent: data.percent }))
    }

    function onDone(e: MessageEvent) {
      const data = JSON.parse(e.data) as DownloadResult
      setState((s) => ({ ...s, status: 'done', percent: 100, result: data }))
    }

    function onFailed(e: MessageEvent) {
      const data = JSON.parse(e.data) as { message?: string }
      setState((s) => ({ ...s, status: 'failed', error: data.message ?? 'Unknown error' }))
    }

    handle.on('resolved', onResolved)
    handle.on('progress', onProgress)
    handle.on('done', onDone)
    handle.on('failed', onFailed)

    return () => {
      handle.off('resolved', onResolved)
      handle.off('progress', onProgress)
      handle.off('done', onDone)
      handle.off('failed', onFailed)
      handle.close()
      handleRef.current = null
    }
  }, [jobId])

  return state
}
