"use client"

import * as React from "react"
import { Moon, Sun, Flame } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

const themeOrder = ["light", "dark", "warm"] as const
type ThemeVal = typeof themeOrder[number]

const themeLabels: Record<ThemeVal, string> = {
  light: "Switch to Dark mode",
  dark: "Switch to Warm mode",
  warm: "Switch to Light mode",
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const cycle = () => {
    const current = resolvedTheme as ThemeVal
    const idx = themeOrder.indexOf(current)
    const next = themeOrder[(idx + 1) % themeOrder.length]
    setTheme(next)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={themeLabels[resolvedTheme as ThemeVal] ?? "Toggle theme"}
      className="relative rounded-full w-10 h-10 bg-slate-100 dark:bg-zinc-800 warm:bg-amber-100 text-slate-700 dark:text-slate-300 warm:text-amber-700 hover:bg-slate-200 dark:hover:bg-zinc-700 warm:hover:bg-amber-200 transition-colors"
    >
      {/* Light icon — visible when light */}
      <Sun className="h-[1.2rem] w-[1.2rem] absolute transition-all duration-300 dark:opacity-0 dark:scale-0 warm:opacity-0 warm:scale-0 opacity-100 scale-100" />
      {/* Moon icon — visible when dark */}
      <Moon className="h-[1.2rem] w-[1.2rem] absolute transition-all duration-300 opacity-0 scale-0 dark:opacity-100 dark:scale-100" />
      {/* Flame icon — visible when warm */}
      <Flame className="h-[1.2rem] w-[1.2rem] absolute transition-all duration-300 opacity-0 scale-0 warm:opacity-100 warm:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
