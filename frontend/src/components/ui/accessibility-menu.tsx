"use client"

import { useEffect, useState } from "react"
import { useElderStore } from "@/store/elderStore"
import { useTheme } from "@/components/theme-provider"
import { useLocale } from "next-intl"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  SlidersHorizontal,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  Globe,
  Sparkles,
  Check,
  Eye,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

const locales = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "mr", name: "मराठी" },
  { code: "bn", name: "বাংলা" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "ur", name: "اردو" },
]

export function AccessibilityMenu() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const locale = useLocale()

  const {
    isElderMode,
    highContrast,
    fontSize,
    toggleElderMode,
    toggleHighContrast,
    setFontSize,
    resetDefaults,
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

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return

    const hostname = window.location.hostname
    const domains = ["", ` domain=${hostname};`, ` domain=.${hostname};`]

    domains.forEach((d) => {
      if (newLocale === "en") {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${d}`
      } else {
        document.cookie = `googtrans=/en/${newLocale}; path=/;${d}`
      }
    })

    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`

    const currentPath = window.location.pathname
    let pathWithoutLocale = currentPath.replace(
      /^\/(en|hi|mr|ur|ta|te|bn|gu)(?=\/|$)/,
      ""
    )
    if (!pathWithoutLocale) pathWithoutLocale = "/"

    const newUrl =
      newLocale === "en"
        ? pathWithoutLocale
        : `/${newLocale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`

    window.location.href = newUrl
  }

  const isCustomized =
    isElderMode ||
    highContrast ||
    fontSize !== "normal" ||
    (theme && theme !== "system")

  const handleResetAll = () => {
    resetDefaults()
    setTheme("system")
  }

  return (
    <Popover>
      <PopoverTrigger
        className="relative inline-flex items-center justify-center rounded-full w-10 h-10 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 focus:outline-none transition-colors cursor-pointer"
        aria-label="Display, Accessibility and Language Settings"
        title="Display & Accessibility"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="sr-only">Display, Accessibility & Language</span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-84 sm:w-88 p-4 shadow-2xl border-border/60 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-2xl space-y-4 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground leading-tight">
                Display & Preferences
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Theme, accessibility & language
              </p>
            </div>
          </div>
          {mounted && isCustomized && (
            <button
              onClick={handleResetAll}
              className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset all settings to default"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        {/* ── 1. Theme Mode (Segmented Control) ── */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-foreground">Theme & Appearance</span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-zinc-800/60 rounded-xl">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                mounted && theme === "light"
                  ? "bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                mounted && theme === "dark"
                  ? "bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={cn(
                "py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                mounted && theme === "system"
                  ? "bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>System</span>
            </button>
          </div>
        </div>

        {/* ── 2. Accessible View & Contrast ── */}
        <div className="space-y-2.5 pt-2 border-t border-border/40">
          <span className="text-xs font-bold text-foreground">Accessible Views</span>

          {/* Senior View Toggle */}
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">Senior & Accessible Mode</span>
                {isElderMode && (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Simplified layouts with prominent emergency & care cards
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

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">High Contrast</span>
                {highContrast && (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-400/30">
                    On
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Maximum visibility borders & high-contrast elements
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
        </div>

        {/* ── 3. Text Size Zoom ── */}
        <div className="space-y-1.5 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Text Scale Zoom</span>
            <span className="text-[11px] font-medium text-muted-foreground font-mono">
              {fontSize === "normal" ? "100%" : fontSize === "large" ? "115%" : "130%"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-zinc-800/60 rounded-xl">
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
                  "py-1.5 px-2 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer",
                  fontSize === size.id
                    ? "bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 4. Language Selector ── */}
        <div className="space-y-1.5 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Regional Language</span>
            <span className="text-[10px] font-medium text-muted-foreground">
              Instant AI translation
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 skiptranslate" translate="no">
            {locales.map((l) => {
              const isSelected = locale === l.code
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleLanguageChange(l.code)}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer border leading-tight",
                    isSelected
                      ? "bg-sky-500/15 border-sky-500/40 text-sky-700 dark:text-sky-300 font-bold"
                      : "bg-slate-50 dark:bg-zinc-800/50 border-border/50 text-foreground hover:bg-slate-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <span>{l.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
