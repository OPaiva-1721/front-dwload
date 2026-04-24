import { describe, it, expect, beforeEach } from 'vitest'
import { useHistoryStore } from './store'

const ITEM_A = {
  id: 'job-1',
  url: 'https://youtube.com/watch?v=abc',
  title: 'Test Video A',
  format: 'video',
  quality: '1080p',
  completedAt: '2026-04-24T10:00:00.000Z',
  thumbnail: 'https://img.youtube.com/vi/abc/mqdefault.jpg',
}

const ITEM_B = {
  id: 'job-2',
  url: 'https://youtube.com/watch?v=xyz',
  title: 'Test Video B',
  format: 'audio',
  quality: '320kbps',
  completedAt: '2026-04-24T11:00:00.000Z',
}

describe('useHistoryStore', () => {
  beforeEach(() => {
    useHistoryStore.setState({ items: [] })
  })

  it('starts empty', () => {
    expect(useHistoryStore.getState().items).toHaveLength(0)
  })

  it('adds items at the beginning (newest first)', () => {
    const { add } = useHistoryStore.getState()
    add(ITEM_A)
    add(ITEM_B)
    const { items } = useHistoryStore.getState()
    expect(items).toHaveLength(2)
    expect(items[0].id).toBe('job-2')
    expect(items[1].id).toBe('job-1')
  })

  it('clears all items', () => {
    const { add, clear } = useHistoryStore.getState()
    add(ITEM_A)
    add(ITEM_B)
    clear()
    expect(useHistoryStore.getState().items).toHaveLength(0)
  })

  it('persists optional fields', () => {
    useHistoryStore.getState().add(ITEM_A)
    const item = useHistoryStore.getState().items[0]
    expect(item.thumbnail).toBe(ITEM_A.thumbnail)
    expect(item.downloadUrl).toBeUndefined()
  })
})
