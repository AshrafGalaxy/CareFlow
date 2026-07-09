"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * CRITICAL RULES — DO NOT CHANGE without reading these:
 *
 * 1. NO `richColors` prop anywhere. It hardcodes Sonner's own white/black
 *    background and destroys the CSS variable approach below.
 *
 * 2. Use `resolvedTheme` (never raw `theme`). `theme` can be "system" which
 *    Sonner doesn't resolve — it would always render in light mode.
 *
 * 3. The `mounted` guard prevents an SSR hydration race. Without it, Sonner
 *    renders once on the server with no theme → stamps data-theme="light" →
 *    React skips re-rendering it even after the client resolves "dark".
 *    By returning null until mounted, the first real render always has the
 *    correct resolved theme.
 *
 * 4. `group-[.toaster]:bg-background` reads the Shadcn CSS variable
 *    `--background`. Since Sonner's portal IS inside <body> which is inside
 *    <html class="dark">, the CSS variable cascade works correctly.
 *    DO NOT fight this with inline styles — CSS variables handle dark mode
 *    automatically.
 *
 * 5. DO NOT pass JSX as the first arg to toast(). Always use:
 *    toast.success("Title", { description: "subtitle" })
 *    Passing JSX breaks Sonner's internal flex layout.
 *
 * 6. DO NOT pass a custom `icon` prop with oversized divs (h-8 w-8) in
 *    individual toast() calls. Sonner's icon slot is ~16px; oversized icons
 *    physically overlap the text.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return null on SSR and first client render to avoid hydration mismatch.
  // This guarantees the Sonner instance is always created with the correct theme.
  if (!mounted) return null

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:font-sans group-[.toaster]:text-sm",
          title:
            "group-[.toast]:font-semibold group-[.toast]:text-foreground group-[.toast]:text-[14px] group-[.toast]:leading-snug",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-[13px] group-[.toast]:mt-0.5 group-[.toast]:leading-relaxed",
          actionButton:
            "group-[.toast]:bg-sky-500 group-[.toast]:text-white group-[.toast]:font-semibold group-[.toast]:rounded-lg group-[.toast]:px-3",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:px-3",
          closeButton:
            "group-[.toast]:border-border group-[.toast]:bg-background group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
