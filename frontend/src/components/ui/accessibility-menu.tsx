"use client"

import { useEffect, useState } from "react"
import { useElderStore } from "@/store/elderStore"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SlidersHorizontal, Eye, ShieldCheck, RotateCcw, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function AccessibilityMenu() {
  const [mounted, setMounted] = useState(false)
  const {
    isElderMode,
    highContrast,
    fontSize,
    toggleElderMode,
    toggleHighContrast,
    setFontSize,
    resetDefaults
  } = useElderStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync global CSS classes to root HTML element
  useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement

    if (highContrast) {
      root.classList.add("high-contrast-mode")
    } else {
      root.classList.remove("high-contrast-mode")
    }

    root.classList.remove("font-scale-large", "font-scale-xlarge")
    if (fontSize === "large") {
      root.classList.add("font-scale-large")
    } else if (fontSize === "xlarge") {
      root.classList.add("font-scale-xlarge")
    }
  }, [highContrast, fontSize])

  const isCustomized = isElderMode || highContrast || fontSize !== "normal"

  return (
    <Popover>
      <PopoverTrigger
        className="relative inline-flex items-center justify-center rounded-full w-10 h-10 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 focus:outline-none transition-colors"
        aria-label="Display and Accessibility Settings"
        title="Display & Accessibility"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {mounted && isCustomized && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-sky-500 ring-2 ring-background animate-pulse" />
        )}
        <span className="sr-only">Display & Accessibility</span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-4 shadow-xl border-border/60 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">View & Accessibility</h4>
              <p className="text-[11px] text-muted-foreground">Personalize your reading experience</p>
            </div>
          </div>
          {mounted && isCustomized && (
            <button
              onClick={resetDefaults}
              className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset all settings to default"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        {/* Option 1: Senior / Accessible Mode */}
        <div className="flex items-center justify-between gap-3 py-1">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">Senior / Accessible View</span>
              {isElderMode && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Simplified routines, larger targets & direct action cards
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isElderMode}
            onClick={toggleElderMode}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 cursor-pointer p-0.5",
              isElderMode ? "bg-emerald-500" : "bg-slate-200 dark:bg-zinc-700"
            )}
          >
            <span
              className={cn(
                "block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform",
                isElderMode ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Option 2: High Contrast Mode */}
        <div className="flex items-center justify-between gap-3 py-1">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">High Contrast</span>
              {highContrast && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-400/30">
                  On
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Enhanced contrast borders & legibility
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={highContrast}
            onClick={toggleHighContrast}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 cursor-pointer p-0.5",
              highContrast ? "bg-yellow-400" : "bg-slate-200 dark:bg-zinc-700"
            )}
          >
            <span
              className={cn(
                "block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform",
                highContrast ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Option 3: Text Size Zoom */}
        <div className="space-y-2 pt-1 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Text Size Zoom</span>
            <span className="text-[11px] font-medium text-muted-foreground">
              {fontSize === "normal" ? "100%" : fontSize === "large" ? "115%" : "130%"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/60 rounded-xl">
            {(
              [
                { id: "normal", label: "Default" },
                { id: "large", label: "Large" },
                { id: "xlarge", label: "X-Large" },
              ] as const
            ).map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => setFontSize(size.id)}
                className={cn(
                  "py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer",
                  fontSize === size.id
                    ? "bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
