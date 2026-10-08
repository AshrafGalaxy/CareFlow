/**
 * Background connection pre-warming utility for cloud services.
 * Proactively verifies API connectivity when users land on entry pages.
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
  }).catch(() => {
    // Non-blocking fire-and-forget probe
  })
}
