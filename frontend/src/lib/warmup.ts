/**
 * Background pre-warming utility for free-tier cloud backends (Render/Railway).
 * Pings /api/health as soon as the user opens the landing or login pages
 * so the cold-start container boots up before the user finishes typing credentials.
 */

let isWarming = false
let warmedAt = 0

export const warmupBackend = () => {
  if (typeof window === 'undefined') return
  const now = Date.now()
  // Re-warm if more than 10 minutes have elapsed since last ping
  if (isWarming && now - warmedAt < 10 * 60 * 1000) return

  isWarming = true
  warmedAt = now

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  fetch(`${apiUrl}/api/health`, {
    method: 'GET',
    headers: { 'Cache-Control': 'no-cache' },
    keepalive: true,
  })
    .catch(() => {
      // Fire-and-forget: catch and ignore errors; the goal is solely to wake up the server container
    })
}
