"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { FileSearch, ChevronRight, Activity, ShieldCheck, HeartPulse } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

export default function NotFound() {
 const user = useAuthStore((state) => state.user)
 const isDoctor = user?.role === "doctor" || user?.role === "provider" || user?.role === "admin"
 const dashboardHref = isDoctor ? "/doctor/dashboard" : "/dashboard"
 const homeHref = isDoctor ? "/doctor/dashboard" : "/"
 const homeText = isDoctor ? "Back to Doctor Portal" : "Back to Homepage"

 return (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row relative overflow-hidden font-sans">
   {/* Animated Radial Gradients */}
   <div className="absolute top-0 left-0 w-[50rem] h-[50rem] bg-sky-200/50 dark:bg-sky-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '8s' }}></div>
   <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-emerald-100/60 dark:bg-emerald-500/10 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3"></div>
   <div className="absolute top-1/2 left-1/2 w-[30rem] h-[30rem] bg-sky-100/60 dark:bg-sky-400/10 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2"></div>

   {/* Healthcare AI Neural Network SVG Background */}
   <div className="absolute inset-0 opacity-40 dark:opacity-30 pointer-events-none">
     <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
       <path d="M10,20 Q30,10 50,30 T90,20" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-sky-300 dark:text-sky-700 animate-pulse" />
       <path d="M20,80 Q40,90 60,70 T100,80" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-sky-300 dark:text-sky-700 animate-pulse" style={{ animationDelay: '1s' }} />
       <path d="M10,20 L20,80 M50,30 L60,70 M90,20 L100,80" fill="none" stroke="currentColor" strokeWidth="0.1" className="text-sky-200 dark:text-sky-800" />
       <circle cx="10" cy="20" r="0.8" className="fill-sky-400 dark:fill-sky-500 animate-ping" style={{ animationDuration: '3s' }} />
       <circle cx="50" cy="30" r="1.2" className="fill-sky-500 dark:fill-sky-400 animate-pulse" />
       <circle cx="90" cy="20" r="0.8" className="fill-sky-400 dark:fill-sky-500 animate-ping" style={{ animationDuration: '4s' }} />
       <circle cx="20" cy="80" r="1" className="fill-sky-500 dark:fill-sky-400" />
       <circle cx="60" cy="70" r="1.5" className="fill-emerald-400 dark:fill-emerald-500 animate-pulse" />
     </svg>
   </div>

   {/* Main Content Container */}
   <div className="w-full flex items-center justify-center p-6 sm:p-12 relative z-10">
    
    {/* Subtle grid background */}
    <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}>
    </div>

    {/* Glassmorphism Card */}
    <div className="w-full max-w-[500px] backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 p-8 sm:p-12 rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] text-center relative overflow-hidden group/card">
      
      {/* Top Status Indicator */}
      <div className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 rounded-full bg-rose-50/80 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 backdrop-blur-md">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-400">Error 404</span>
      </div>

      <div className="h-24 w-24 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-8 border border-slate-200 dark:border-slate-700 shadow-sm relative group-hover/card:scale-105 transition-transform duration-500">
       <div className="absolute inset-0 bg-sky-400/20 rounded-3xl blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
       <FileSearch className="h-12 w-12 text-slate-400 dark:text-slate-500 relative z-10 group-hover/card:text-sky-500 transition-colors" />
      </div>

      <h1 className="text-4xl font-heading font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
       Lost in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">Network</span>
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-base mb-10 leading-relaxed font-medium">
       The medical record or page you're searching for seems to have vanished or never existed. Let's redirect you to a secure portal.
      </p>

      <div className="flex flex-col gap-4">
       <Link
        href={dashboardHref}
        className="w-full h-14 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transform hover:-translate-y-1 group"
       >
        Return to Dashboard
        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
       </Link>
       
       <Link
        href={homeHref}
        className="w-full h-14 border-2 border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center justify-center transition-all duration-300 group backdrop-blur-sm"
       >
        {homeText}
       </Link>
      </div>

      {/* Footer Branding */}
      <div className="mt-12 flex items-center justify-center gap-2 opacity-60">
        <Image src="/favicon.svg" alt="Logo" width={16} height={16} className="opacity-80" />
        <span className="font-brand font-bold text-sm tracking-tight text-slate-900 dark:text-white">CareFlow AI</span>
      </div>
    </div>
   </div>
  </div>
 )
}
