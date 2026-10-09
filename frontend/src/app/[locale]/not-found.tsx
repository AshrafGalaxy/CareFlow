"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { FileSearch, ChevronRight } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

export default function NotFound() {
  const user = useAuthStore((state) => state.user)
  const isDoctor = user?.role === "doctor" || user?.role === "provider" || user?.role === "admin"
  const dashboardHref = isDoctor ? "/doctor/dashboard" : "/dashboard"
  const homeHref = isDoctor ? "/doctor/dashboard" : "/"
  const homeText = isDoctor ? "Back to Doctor Portal" : "Back to Homepage"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Subtle Ambient Radial Gradients */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Healthcare AI Grid & Card */}
      <div className="w-full max-w-[480px] bg-white/90 dark:bg-zinc-950/90 border border-slate-200/80 dark:border-zinc-800 p-8 sm:p-10 rounded-3xl shadow-xl dark:shadow-2xl text-center relative z-10 backdrop-blur-xl">
        {/* Top Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">404 Error</span>
        </div>

        <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <FileSearch className="h-10 w-10 text-sky-600 dark:text-sky-400" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground mb-3 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed max-w-sm mx-auto">
          The requested medical report, patient route, or clinical page could not be located. Your session and patient data remain secure.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href={dashboardHref}
            className="w-full h-12 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            Return to Dashboard
            <ChevronRight className="h-4 w-4" />
          </Link>

          <Link
            href={homeHref}
            className="w-full h-12 border border-border hover:bg-muted text-foreground font-semibold rounded-xl flex items-center justify-center transition-all active:scale-98"
          >
            {homeText}
          </Link>
        </div>

        {/* Footer Branding */}
        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-center gap-2 text-muted-foreground">
          <Image src="/favicon.svg" alt="CareFlow Logo" width={16} height={16} className="opacity-80" />
          <span className="font-brand font-semibold text-xs tracking-tight">CareFlow AI</span>
        </div>
      </div>
    </div>
  )
}
