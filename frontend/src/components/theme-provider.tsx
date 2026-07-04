"use client"

import * as React from "react"

type Theme = "dark" | "light" | "warm" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

interface ThemeProviderState {
  theme: Theme
  resolvedTheme: "dark" | "light" | "warm"
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)

  // Restore from localStorage on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("careflow-theme") as Theme | null
    if (savedTheme && ["light", "dark", "warm", "system"].includes(savedTheme)) {
      setThemeState(savedTheme)
    }
  }, [])

  // Apply theme class to <html>
  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark", "warm")

    let resolved: "dark" | "light" | "warm" = "light"

    if (theme === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    } else {
      resolved = theme as "dark" | "light" | "warm"
    }

    root.classList.add(resolved)
  }, [theme])

  const resolvedTheme = React.useMemo<"dark" | "light" | "warm">(() => {
    if (theme === "system") {
      if (typeof window !== "undefined") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      }
      return "light"
    }
    return theme as "dark" | "light" | "warm"
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem("careflow-theme", newTheme)
    setThemeState(newTheme)
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, resolvedTheme, setTheme }}>
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
