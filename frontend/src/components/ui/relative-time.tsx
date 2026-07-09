"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"

interface RelativeTimeProps {
  timestamp: string
  className?: string
}

export function RelativeTime({ timestamp, className = "" }: RelativeTimeProps) {
  const [mounted, setMounted] = useState(false)
  const [timeStr, setTimeStr] = useState("")

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      setTimeStr(formatDistanceToNow(new Date(timestamp), { addSuffix: true }))
    }
    
    updateTime()
    // Update the relative time every minute
    const intervalId = setInterval(updateTime, 60000)
    
    return () => clearInterval(intervalId)
  }, [timestamp])

  if (!mounted) {
    return <span className={className}>...</span>
  }

  return <span className={className}>{timeStr}</span>
}
