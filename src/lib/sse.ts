import { env } from './env'
import { createMockEventSource } from './mockSse'

export type { SseEventType } from './mockSse'

type Listener = (event: MessageEvent) => void

export interface SseHandle {
  on(event: string, listener: Listener): void
  off(event: string, listener: Listener): void
  close(): void
}

function createRealSseHandle(jobId: string): SseHandle {
  let source = new EventSource(`${env.apiUrl}/downloads/${jobId}/stream`)
  let closed = false

  function reconnect() {
    if (closed) return
    source.close()
    source = new EventSource(`${env.apiUrl}/downloads/${jobId}/stream`)
  }

  source.onerror = () => {
    if (source.readyState === EventSource.CLOSED) reconnect()
  }

  return {
    on(event, listener) { source.addEventListener(event, listener) },
    off(event, listener) { source.removeEventListener(event, listener) },
    close() {
      closed = true
      source.close()
    },
  }
}

function createMockSseHandle(jobId: string): SseHandle {
  const source = createMockEventSource(jobId)
  return {
    on(event, listener) { source.addEventListener(event, listener) },
    off(event, listener) { source.removeEventListener(event, listener) },
    close() { source.close() },
  }
}

export function createSseHandle(jobId: string): SseHandle {
  return env.useMockSse
    ? createMockSseHandle(jobId)
    : createRealSseHandle(jobId)
}
