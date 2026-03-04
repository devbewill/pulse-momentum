/**
 * Format a Unix-ms timestamp as a human-readable relative date.
 * Examples: "adesso", "5 min fa", "ieri", "12 mar"
 */
export function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hour = Math.floor(min / 60)
  const day = Math.floor(hour / 24)

  if (sec < 60) return 'adesso'
  if (min < 60) return `${min} min fa`
  if (hour < 24) return `${hour} ore fa`
  if (day === 1) return 'ieri'
  if (day < 7) return `${day} giorni fa`

  return new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}
