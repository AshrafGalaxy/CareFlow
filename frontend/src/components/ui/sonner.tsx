"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

/**
 * We CANNOT use Tailwind `dark:` variant classes inside Sonner's `icons` prop
 * because Sonner renders toasts into a portal/shadow DOM that does NOT inherit
 * the root `<html class="dark">` Tailwind cascade.
 *
 * The ONLY reliable solution is to:
 *  1. Use `resolvedTheme` from next-themes (gives us "light" or "dark" explicitly)
 *  2. Pass `theme` prop directly to <Sonner> (tells Sonner to set its own data-theme attribute)
 *  3. Use inline CSS colors on icon wrappers (not Tailwind dark: classes)
 */

type ThemeAwareIconProps = {
  isDark: boolean
  color: { light: string; dark: string }
  bg: { light: string; dark: string }
  children: React.ReactNode
}

function ThemeAwareIcon({ isDark, color, bg, children }: ThemeAwareIconProps) {
  return (
    <div
      style={{
        height: 24,
        width: 24,
        flexShrink: 0,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDark ? bg.dark : bg.light,
        color: isDark ? color.dark : color.light,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      {children}
    </div>
  )
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()
  // Default to light until we know the real theme (avoids flicker)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // resolvedTheme is "light" or "dark" — never "system"
  const isDark = mounted ? resolvedTheme === "dark" : false
  const sonnerTheme = isDark ? "dark" : "light"

  const iconSize = { height: 14, width: 14 }

  return (
    <Sonner
      theme={sonnerTheme}
      className="toaster group"
      icons={{
        success: (
          <ThemeAwareIcon
            isDark={isDark}
            color={{ light: "#059669", dark: "#34d399" }}
            bg={{ light: "#d1fae5", dark: "rgba(6,78,59,0.6)" }}
          >
            <CircleCheckIcon style={iconSize} />
          </ThemeAwareIcon>
        ),
        info: (
          <ThemeAwareIcon
            isDark={isDark}
            color={{ light: "#0284c7", dark: "#38bdf8" }}
            bg={{ light: "#e0f2fe", dark: "rgba(8,47,73,0.6)" }}
          >
            <InfoIcon style={iconSize} />
          </ThemeAwareIcon>
        ),
        warning: (
          <ThemeAwareIcon
            isDark={isDark}
            color={{ light: "#d97706", dark: "#fbbf24" }}
            bg={{ light: "#fef3c7", dark: "rgba(69,26,3,0.6)" }}
          >
            <TriangleAlertIcon style={iconSize} />
          </ThemeAwareIcon>
        ),
        error: (
          <ThemeAwareIcon
            isDark={isDark}
            color={{ light: "#dc2626", dark: "#f87171" }}
            bg={{ light: "#fee2e2", dark: "rgba(69,10,10,0.6)" }}
          >
            <OctagonXIcon style={iconSize} />
          </ThemeAwareIcon>
        ),
        loading: (
          <ThemeAwareIcon
            isDark={isDark}
            color={{ light: "#64748b", dark: "#94a3b8" }}
            bg={{ light: "#f1f5f9", dark: "rgba(15,23,42,0.8)" }}
          >
            <Loader2Icon style={{ ...iconSize, animation: "spin 1s linear infinite" }} />
          </ThemeAwareIcon>
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
