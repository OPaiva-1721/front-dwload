/** "Link expires in 42 min" / "Link expired". Server deletes files at `expiresAtUtc`. */
export function expiryLabel(expiresAtUtc: string, now = Date.now()): string {
  const ms = Date.parse(expiresAtUtc) - now
  if (Number.isNaN(ms)) return ''
  if (ms <= 0) return 'Link expired'
  const minutes = Math.ceil(ms / 60_000)
  if (minutes < 60) return `Link expires in ${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `Link expires in ${hours} h${rest ? ` ${rest} min` : ''}`
}

export function isExpired(expiresAtUtc: string | undefined, now = Date.now()): boolean {
  return !!expiresAtUtc && Date.parse(expiresAtUtc) <= now
}
