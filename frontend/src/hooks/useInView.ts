"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Fires once when an element enters the viewport.
 * Used to trigger scroll-activated animations on the landing page.
 */
export function useInView(threshold = 0.15) {
 const ref = useRef<HTMLDivElement>(null)
 const [isInView, setIsInView] = useState(false)

 useEffect(() => {
  const el = ref.current
  if (!el) return

  const observer = new IntersectionObserver(
   ([entry]) => {
    if (entry.isIntersecting) {
     setIsInView(true)
     observer.disconnect() // Only fire once
    }
   },
   { threshold }
  )

  observer.observe(el)
  return () => observer.disconnect()
 }, [threshold])

 return { ref, isInView }
}
