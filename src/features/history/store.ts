import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface HistoryItem {
  id: string
  url: string
  title: string
  format: string
  quality: string
  completedAt: string
  thumbnail?: string
  downloadUrl?: string
}

interface HistoryStore {
  items: HistoryItem[]
  add: (item: HistoryItem) => void
  clear: () => void
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
