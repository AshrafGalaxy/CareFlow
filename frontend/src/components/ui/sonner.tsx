"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
 const { theme = "system" } = useTheme()

 return (
  <Sonner
   theme={theme as ToasterProps["theme"]}
   className="toaster group"
   icons={{
    success: (
     <div className="h-6 w-6 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-sm">
      <CircleCheckIcon className="h-3.5 w-3.5" />
     </div>
    ),
    info: (
     <div className="h-6 w-6 bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center shadow-sm">
      <InfoIcon className="h-3.5 w-3.5" />
     </div>
    ),
    warning: (
     <div className="h-6 w-6 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center shadow-sm">
      <TriangleAlertIcon className="h-3.5 w-3.5" />
     </div>
    ),
    error: (
     <div className="h-6 w-6 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center shadow-sm">
      <OctagonXIcon className="h-3.5 w-3.5" />
     </div>
    ),
    loading: (
     <div className="h-6 w-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full flex items-center justify-center shadow-sm">
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
     toast: "cn-toast",
    },
   }}
   {...props}
  />
 )
}

export { Toaster }
