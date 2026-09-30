import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useMetadata, METADATA_DEBOUNCE_MS } from './useMetadata'

vi.mock('../api/metadataApi', () => ({
  getMetadata: vi.fn(),
}))

import { getMetadata } from '../api/metadataApi'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0 } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

const URL_A = 'https://www.youtube.com/watch?v=aaaaaaaaaaa'
const URL_B = 'https://www.youtube.com/watch?v=bbbbbbbbbbb'

describe('useMetadata', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(getMetadata).mockResolvedValue({
      title: 't', thumbnailUrl: '', duration: '00:01:00', availableFormats: [],
    } as never)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  it('fetches once after the URL stops changing', async () => {
    const { rerender } = renderHook(({ url }) => useMetadata(url), {
      wrapper,
      initialProps: { url: '' },
    })

    rerender({ url: URL_B })
    rerender({ url: URL_A })
    rerender({ url: URL_B })
    expect(getMetadata).not.toHaveBeenCalled()

    await act(async () => { await vi.advanceTimersByTimeAsync(METADATA_DEBOUNCE_MS) })

    expect(getMetadata).toHaveBeenCalledTimes(1)
    expect(getMetadata).toHaveBeenCalledWith(URL_B)
  })

  it('reports loading and hides stale data while the URL settles', async () => {
    const { result, rerender } = renderHook(({ url }) => useMetadata(url), {
      wrapper,
      initialProps: { url: URL_A },
    })
    await act(async () => { await vi.advanceTimersByTimeAsync(METADATA_DEBOUNCE_MS) })
    expect(result.current.data?.title).toBe('t')

    rerender({ url: URL_B })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
  })

  it('does not fetch invalid URLs', async () => {
    renderHook(() => useMetadata('not a url'), { wrapper })
    await act(async () => { await vi.advanceTimersByTimeAsync(METADATA_DEBOUNCE_MS * 2) })
    expect(getMetadata).not.toHaveBeenCalled()
  })
})
