export type SseEventType = 'progress' | 'done' | 'failed' | 'cancelled'

interface MockEvent {
  type: SseEventType
  data: unknown
  delay: number
}

function buildSequence(_jobId: string): MockEvent[] {
  return [
    { type: 'progress', delay: 900, data: { step: 'downloading', percent: 15 } },
    { type: 'progress', delay: 700, data: { step: 'downloading', percent: 40 } },
    { type: 'progress', delay: 700, data: { step: 'downloading', percent: 75 } },
    { type: 'progress', delay: 600, data: { step: 'downloading', percent: 99 } },
    { type: 'progress', delay: 300, data: { step: 'converting', percent: 99 } },
    {
      type: 'done',
      delay: 1200,
      data: {
        downloadUrl: '#',
        title: 'Rick Astley - Never Gonna Give You Up',
        duration: '3:33',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        size: '47.2 MB',
        expiresAt: 'in 1 hour',
        expiresAtUtc: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
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
