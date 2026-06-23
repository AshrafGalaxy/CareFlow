"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { AnimatedLogo } from "./animated-logo"
import { cn } from "@/lib/utils"

export function PageTransition() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isAnimating, setIsAnimating] = useState(true) // Play on initial load too
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Trigger animation overlay when route changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAnimating(true)
    setIsFadingOut(false)

    // The entire draw + fill + bounce takes about 1.5 seconds.
    // Start fading out the overlay at 1.5s, completely remove it at 1.8s
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 1500)

    const unmountTimer = setTimeout(() => {
      setIsAnimating(false)
    }, 1800)

    return () => {
      clearTimeout(fadeOutTimer)
      clearTimeout(unmountTimer)
    }
  }, [pathname, searchParams])

  if (!isAnimating) return null

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-opacity duration-300",
        isFadingOut ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Force re-render of logo to restart CSS animations when pathname changes */}
        <AnimatedLogo key={pathname} className="w-24 h-24" />
      </div>
    </div>
  )
}
