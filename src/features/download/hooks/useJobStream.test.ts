import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useJobStream } from './useJobStream'

type Listener = (e: MessageEvent) => void

function makeMockHandle() {
  const listeners: Record<string, Set<Listener>> = {}
  return {
    on: vi.fn((event: string, fn: Listener) => {
      if (!listeners[event]) listeners[event] = new Set()
      listeners[event].add(fn)
    }),
    off: vi.fn((event: string, fn: Listener) => {
      listeners[event]?.delete(fn)
    }),
    close: vi.fn(),
    emit(event: string, data: unknown) {
      const msg = new MessageEvent(event, { data: JSON.stringify(data) })
      listeners[event]?.forEach((fn) => fn(msg))
    },
  }
}

vi.mock('@/lib/sse', () => ({
  createSseHandle: vi.fn(),
}))

import { createSseHandle } from '@/lib/sse'

describe('useJobStream', () => {
  let handle: ReturnType<typeof makeMockHandle>

  beforeEach(() => {
    handle = makeMockHandle()
    vi.mocked(createSseHandle).mockReturnValue(handle as unknown as ReturnType<typeof createSseHandle>)
  })

  it('starts idle when jobId is null', () => {
    const { result } = renderHook(() => useJobStream(null))
    expect(result.current.status).toBe('idle')
  })

  it('moves to preparing when jobId is set', () => {
    const { result } = renderHook(() => useJobStream('job-1'))
    expect(result.current.status).toBe('preparing')
  })

  it('transitions preparing → downloading → converting on progress events', async () => {
    const { result } = renderHook(() => useJobStream('job-1'))

    await act(async () => {
      handle.emit('progress', { step: 'downloading', percent: 40 })
    })
    expect(result.current.status).toBe('downloading')
    expect(result.current.percent).toBe(40)

    await act(async () => {
      handle.emit('progress', { step: 'converting', percent: 99 })
    })
    expect(result.current.status).toBe('converting')
  })

  it('never lets progress go backwards', async () => {
    const { result } = renderHook(() => useJobStream('job-1'))

    await act(async () => {
      handle.emit('progress', { step: 'downloading', percent: 60 })
      handle.emit('progress', { step: 'downloading', percent: 20 })
    })
    expect(result.current.percent).toBe(60)
  })

  it('transitions to cancelled and closes the stream', async () => {
    const { result } = renderHook(() => useJobStream('job-1'))

    await act(async () => {
      handle.emit('cancelled', {})
    })
    expect(result.current.status).toBe('cancelled')
    expect(handle.close).toHaveBeenCalled()
  })

  it('transitions to done with result', async () => {
    const { result } = renderHook(() => useJobStream('job-1'))
    const fakeResult = { downloadUrl: '#', title: 'Test', duration: '1:00', thumbnail: '', size: '10MB', expiresAt: 'in 24h' }

    await act(async () => {
      handle.emit('done', fakeResult)
    })
    expect(result.current.status).toBe('done')
    expect(result.current.percent).toBe(100)
    expect(result.current.result).toMatchObject(fakeResult)
  })

  it('transitions to failed with error message', async () => {
    const { result } = renderHook(() => useJobStream('job-1'))

    await act(async () => {
      handle.emit('failed', { message: 'Video unavailable' })
    })
    expect(result.current.status).toBe('failed')
    expect(result.current.error).toBe('Video unavailable')
  })

  it('closes the handle on unmount', async () => {
    const { unmount } = renderHook(() => useJobStream('job-1'))
    unmount()
    await waitFor(() => expect(handle.close).toHaveBeenCalledOnce())
  })
})
