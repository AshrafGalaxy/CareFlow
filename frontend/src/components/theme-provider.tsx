"use client"

import * as React from "react"

type Theme = "dark" | "light" | "warm" | "system"
type ResolvedTheme = "dark" | "light" | "warm"

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

interface ThemeProviderState {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return getSystemTheme()
  return theme as ResolvedTheme
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  // resolvedTheme is stored as state (not useMemo) so it never accesses
  // window during SSR and only updates after the component mounts.
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>("light")

  // Restore from localStorage and set initial resolved theme on mount (client-only)
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("careflow-theme") as Theme | null
    const active = (savedTheme && ["light", "dark", "warm", "system"].includes(savedTheme))
      ? savedTheme
      : defaultTheme
    setThemeState(active)
    setResolvedTheme(resolveTheme(active))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Apply theme class to <html> and update resolvedTheme whenever theme changes
  React.useEffect(() => {
    const root = window.document.documentElement
    const resolved = resolveTheme(theme)
    root.classList.remove("light", "dark", "warm")
    root.classList.add(resolved)
    setResolvedTheme(resolved)
  }, [theme])

  // Keep resolvedTheme in sync with system preference changes
  React.useEffect(() => {
    if (theme !== "system") return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const resolved = media.matches ? "dark" : "light"
      setResolvedTheme(resolved)
      document.documentElement.classList.remove("light", "dark", "warm")
      document.documentElement.classList.add(resolved)
    }
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [theme])

  const setTheme = React.useCallback((newTheme: Theme) => {
    localStorage.setItem("careflow-theme", newTheme)
    setThemeState(newTheme)
  }, [])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
