"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"

export function PageTransition() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const prevPathRef = useRef(pathname)

  // Route change completion: swiftly finish and fade out
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname
      setProgress(100)
      const timer = setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  // Only show progress on internal link transitions
  useEffect(() => {
    let t1: NodeJS.Timeout
    let t2: NodeJS.Timeout

    const handleStart = () => {
      setLoading(true)
      setProgress(25)
      t1 = setTimeout(() => setProgress(65), 180)
      t2 = setTimeout(() => setProgress(88), 450)
    }

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a")
      if (
        target &&
        target.href &&
        target.href.startsWith(window.location.origin) &&
        !target.target &&
        !target.hasAttribute("download")
      ) {
        const url = new URL(target.href)
        if (url.pathname !== window.location.pathname) {
          handleStart()
        }
      }
    }

    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("click", handleClick)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (!loading && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-200"
      style={{ opacity: progress === 100 ? 0 : 1 }}
      aria-hidden="true"
    >
      <div
        className="h-[2.5px] bg-sky-600 dark:bg-sky-400 shadow-[0_0_10px_rgba(2,132,199,0.5)] dark:shadow-[0_0_12px_rgba(56,189,248,0.7)] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
