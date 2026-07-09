"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * DIAGNOSTIC NOTES — READ BEFORE MODIFYING:
 *
 * 1. DO NOT add `richColors` prop to <Toaster> in layout.tsx.
 *    richColors hardcodes Sonner's own white/black backgrounds and
 *    completely overrides the CSS variable approach below.
 *
 * 2. DO NOT pass a custom `icon` prop in individual toast() calls
 *    (e.g. toast.success("msg", { icon: <div className="h-8 w-8">...</div> })).
 *    Sonner allocates ~16px for its icon slot. Oversized icons bleed
 *    over the text. Use the global `icons` config here instead.
 *
 * 3. DO NOT pass JSX as the first argument to toast() (e.g. toast.success(<div>...)).
 *    Always use: toast.success("Title", { description: "subtitle" })
 *    Passing JSX as the message disrupts Sonner's internal flex layout.
 *
 * 4. `dark:` Tailwind classes work inside Sonner toasts because the portal
 *    is appended to <body> which is inside <html class="dark">. The cascade
 *    DOES reach it. However `richColors` (see point 1) disables this.
 *
 * 5. Use `resolvedTheme` (not `theme`) — resolvedTheme is never "system",
 *    always "light" or "dark". This ensures Sonner's own data-theme
 *    attribute is set correctly for its built-in styles.
 */

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  // resolvedTheme is "light" | "dark" | undefined (undefined only during SSR)
  // We pass it directly so Sonner sets the correct data-theme on its container
  const theme = (resolvedTheme ?? "light") as ToasterProps["theme"]

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          // These group-[.toaster] selectors target elements whose
          // ancestor has class="toaster". Sonner adds "toaster" to its
          // container, so this cascade is reliable.
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
          success:
            "group-[.toaster]:border-emerald-200 dark:group-[.toaster]:border-emerald-900/50",
          error:
            "group-[.toaster]:border-red-200 dark:group-[.toaster]:border-red-900/50",
          warning:
            "group-[.toaster]:border-amber-200 dark:group-[.toaster]:border-amber-900/50",
          info:
            "group-[.toaster]:border-sky-200 dark:group-[.toaster]:border-sky-900/50",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
