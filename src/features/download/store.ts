import { create } from 'zustand'

export type Format = 'video' | 'audio'

const DEFAULT_QUALITY: Record<Format, string> = {
  video: '1080p',
  audio: '256kbps',
}

interface DownloadStore {
  url: string
  format: Format
  quality: string
  setUrl: (url: string) => void
  setFormat: (format: Format) => void
  setQuality: (quality: string) => void
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  url: '',
  format: 'video',
  quality: DEFAULT_QUALITY.video,
  setUrl: (url) => set({ url }),
  setFormat: (format) => set({ format, quality: DEFAULT_QUALITY[format] }),
  setQuality: (quality) => set({ quality }),
}))
