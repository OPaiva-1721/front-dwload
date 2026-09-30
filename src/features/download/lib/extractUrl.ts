const URL_PATTERN = /https?:\/\/[^\s<>"']+/i

/**
 * Pulls the first link out of free text. Share sheets and copied captions often wrap the link
 * ("Check this out https://youtu.be/abc via @app"), so a raw paste isn't always a clean URL.
 */
export function extractUrl(text: string | null | undefined): string | null {
  if (!text) return null
  const match = text.match(URL_PATTERN)
  // Trailing punctuation from prose ("…see https://x.com/a/status/1.") isn't part of the link
  return match ? match[0].replace(/[).,;!?]+$/, '') : null
}
