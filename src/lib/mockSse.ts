export type SseEventType = 'resolved' | 'progress' | 'done' | 'failed'

interface MockEvent {
  type: SseEventType
  data: unknown
  delay: number
}

function buildSequence(jobId: string): MockEvent[] {
  return [
    {
      type: 'resolved',
      delay: 600,
      data: { jobId, title: 'Rick Astley - Never Gonna Give You Up', duration: '3:33', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
    },
    { type: 'progress', delay: 800,  data: { step: 'fetching',    percent: 15 } },
    { type: 'progress', delay: 900,  data: { step: 'fetching',    percent: 40 } },
    { type: 'progress', delay: 800,  data: { step: 'transcoding', percent: 55 } },
    { type: 'progress', delay: 900,  data: { step: 'transcoding', percent: 75 } },
    { type: 'progress', delay: 700,  data: { step: 'packaging',   percent: 90 } },
    {
      type: 'done',
      delay: 600,
      data: { downloadUrl: '#', title: 'Rick Astley - Never Gonna Give You Up', duration: '3:33', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', size: '47.2 MB', expiresAt: 'in 24h' },
    },
  ]
}

type Listener = (event: MessageEvent) => void

export function createMockEventSource(jobId: string): EventSource {
  const listeners: Partial<Record<SseEventType, Set<Listener>>> = {}
  let closed = false
  const timers: ReturnType<typeof setTimeout>[] = []

  let elapsed = 0
  for (const mock of buildSequence(jobId)) {
    elapsed += mock.delay
    const t = setTimeout(() => {
      if (closed) return
      const event = new MessageEvent(mock.type, { data: JSON.stringify(mock.data) })
      listeners[mock.type]?.forEach((fn) => fn(event))
    }, elapsed)
    timers.push(t)
  }

  const source = {
    readyState: 1,
    url: `mock://${jobId}`,
    withCredentials: false,
    CONNECTING: 0,
    OPEN: 1,
    CLOSED: 2,
    onopen: null,
    onmessage: null,
    onerror: null,
    addEventListener(type: string, listener: Listener) {
      const key = type as SseEventType
      if (!listeners[key]) listeners[key] = new Set()
      listeners[key]!.add(listener)
    },
    removeEventListener(type: string, listener: Listener) {
      listeners[type as SseEventType]?.delete(listener)
    },
    dispatchEvent(_event: Event) { return true },
    close() {
      closed = true
      timers.forEach(clearTimeout)
    },
  }

  return source as unknown as EventSource
}
