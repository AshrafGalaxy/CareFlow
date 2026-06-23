// CareFlow AI — Shared Formatters
// Reusable display helpers used across all phases

/**
 * Format a date string or Date object into a human-readable date
 * e.g. "Jun 22, 2025"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—"
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date))
  } catch {
    return String(date)
  }
}

/**
 * Format a date-time string into a full readable format
 * e.g. "Jun 22, 2025, 4:30 PM"
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—"
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  } catch {
    return String(date)
  }
}

/**
 * Format bytes into human-readable file size
 * e.g. 2457600 → "2.3 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

/**
 * Format a date as a relative time string
 * e.g. "2 days ago", "just now", "3 months ago"
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "—"
  try {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)
    const diffMon = Math.floor(diffDay / 30)

    if (diffSec < 60) return "just now"
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`
    if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`
    if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`
    return `${diffMon} month${diffMon !== 1 ? "s" : ""} ago`
  } catch {
    return String(date)
  }
}

/**
 * Get a time-based greeting
 * e.g. "Good morning", "Good afternoon", "Good evening"
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

/**
 * Get user initials from a full name (max 2 chars)
 * e.g. "Priya Sharma" → "PS"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "U"
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()
}

/**
 * Truncate a string to a max length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + "..."
}
