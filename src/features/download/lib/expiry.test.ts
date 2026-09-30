import { describe, it, expect } from 'vitest'
import { expiryLabel, isExpired } from './expiry'

const NOW = Date.parse('2026-09-30T12:00:00Z')

describe('expiryLabel', () => {
  it('counts down in minutes under an hour', () => {
    expect(expiryLabel('2026-09-30T12:41:30Z', NOW)).toBe('Link expires in 42 min')
  })

  it('shows hours and minutes above an hour', () => {
    expect(expiryLabel('2026-09-30T13:30:00Z', NOW)).toBe('Link expires in 1 h 30 min')
    expect(expiryLabel('2026-09-30T14:00:00Z', NOW)).toBe('Link expires in 2 h')
  })

  it('reports expired links', () => {
    expect(expiryLabel('2026-09-30T11:59:00Z', NOW)).toBe('Link expired')
    expect(isExpired('2026-09-30T11:59:00Z', NOW)).toBe(true)
    expect(isExpired(undefined, NOW)).toBe(false)
  })
})
