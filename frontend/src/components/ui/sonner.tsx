"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
 const { resolvedTheme, theme } = useTheme()

 return (
  <Sonner
   theme={(resolvedTheme || theme) as ToasterProps["theme"]}
   className="toaster group"
   icons={{
    success: (
     <div className="h-6 w-6 shrink-0 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-sm">
      <CircleCheckIcon className="h-3.5 w-3.5" />
     </div>
    ),
    info: (
     <div className="h-6 w-6 shrink-0 bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center shadow-sm">
      <InfoIcon className="h-3.5 w-3.5" />
     </div>
    ),
    warning: (
     <div className="h-6 w-6 shrink-0 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center shadow-sm">
      <TriangleAlertIcon className="h-3.5 w-3.5" />
     </div>
    ),
    error: (
     <div className="h-6 w-6 shrink-0 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center shadow-sm">
      <OctagonXIcon className="h-3.5 w-3.5" />
     </div>
    ),
    loading: (
     <div className="h-6 w-6 shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full flex items-center justify-center shadow-sm">
      <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
     </div>
    ),
   }}
   style={
    {
     "--normal-bg": "var(--popover)",
     "--normal-text": "var(--popover-foreground)",
     "--normal-border": "var(--border)",
     "--border-radius": "var(--radius)",
    } as React.CSSProperties
   }
   toastOptions={{
    classNames: {
     toast:
      "group toast flex gap-3 items-start w-full p-4 rounded-xl shadow-lg border border-border bg-background text-foreground",
     content: "flex-1 min-w-0 flex flex-col gap-1 overflow-hidden",
     description: "text-sm text-slate-500 dark:text-slate-400 line-clamp-2",
     title: "font-semibold text-sm",
     actionButton:
      "bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg px-3 py-1.5 transition-colors",
     cancelButton:
      "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg px-3 py-1.5 transition-colors dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700",
    },
   }}
   {...props}
  />
 )
}

export { Toaster }
