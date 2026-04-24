import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useCreateDownload } from './useCreateDownload'

vi.mock('../api/downloadsApi', () => ({
  createDownload: vi.fn(),
}))

import { createDownload } from '../api/downloadsApi'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

const VALID_REQ = {
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  format: 'video' as const,
  quality: '1080p',
}

describe('useCreateDownload', () => {
  beforeEach(() => vi.resetAllMocks())

  it('starts idle', () => {
    const { result } = renderHook(() => useCreateDownload(), { wrapper })
    expect(result.current.isPending).toBe(false)
    expect(result.current.data).toBeUndefined()
  })

  it('returns jobId on success', async () => {
    vi.mocked(createDownload).mockResolvedValue({ jobId: 'job-abc' })

    const { result } = renderHook(() => useCreateDownload(), { wrapper })

    act(() => { result.current.mutate(VALID_REQ) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.jobId).toBe('job-abc')
  })

  it('sets error on failure', async () => {
    vi.mocked(createDownload).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useCreateDownload(), { wrapper })

    act(() => { result.current.mutate(VALID_REQ) })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Network error')
  })
})
