import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface HistoryItem {
  id: string
  url: string
  title: string
  format: string
  quality: string
  completedAt: string
  /** When the server deletes the file. Missing on items saved before this was tracked. */
  expiresAtUtc?: string
  thumbnail?: string
  downloadUrl?: string
}

interface HistoryStore {
  items: HistoryItem[]
  add: (item: HistoryItem) => void
  clear: () => void
}

// Server retention; used for older items that predate expiresAtUtc
const DEFAULT_RETENTION_MS = 60 * 60 * 1000

export function itemExpiresAt(item: HistoryItem): string {
  return item.expiresAtUtc ?? new Date(Date.parse(item.completedAt) + DEFAULT_RETENTION_MS).toISOString()
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => ({ items: [item, ...s.items] })),
      clear: () => set({ items: [] }),
    }),
    { name: 'dwload-history' }
  )
)
