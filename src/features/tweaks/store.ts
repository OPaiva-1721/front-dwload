import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TweaksStore {
  accent: string
  density: number
  speed: number
  showPanel: boolean
  toggle: () => void
  set: (patch: Partial<Pick<TweaksStore, 'accent' | 'density' | 'speed'>>) => void
}

export const useTweaksStore = create<TweaksStore>()(
  persist(
    (setState) => ({
      accent: '#a78bfa',
      density: 230,
      speed: 1,
      showPanel: false,
      toggle: () => setState((s) => ({ showPanel: !s.showPanel })),
      set: (patch) => setState(patch),
    }),
    {
      name: 'dwload-tweaks',
      partialize: (s) => ({ accent: s.accent, density: s.density, speed: s.speed }),
    }
  )
)
