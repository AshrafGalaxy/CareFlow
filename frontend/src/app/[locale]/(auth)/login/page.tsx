"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter, Link } from "@/i18n/routing"
import { Eye, EyeOff, Loader2, AlertCircle, Activity, HeartPulse, ChevronRight, ShieldCheck, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import api, { parseApiError } from "@/lib/api"
import { warmupBackend } from "@/lib/warmup"
import { useAuthStore } from "@/store/authStore"
import { API_ROUTES, APP_ROUTES } from "@/lib/constants"
import Image from "next/image"

export default function LoginPage() {
 const [showPassword, setShowPassword] = useState(false)
 const [isLoading, setIsLoading] = useState(false)
 const [loadingSeconds, setLoadingSeconds] = useState(0)
 const [loginError, setLoginError] = useState<{ message: string; isServerWaking: boolean } | null>(null)
 const router = useRouter()
 const setAuth = useAuthStore((state) => state.setAuth)

 // Pre-warm the free-tier backend as soon as user opens login screen
 useEffect(() => {
  warmupBackend()
 }, [])

 // Progressive timer to provide reassurance during free-tier cold starts
 useEffect(() => {
  let interval: NodeJS.Timeout
  if (isLoading) {
   setLoadingSeconds(0)
   interval = setInterval(() => {
    setLoadingSeconds((prev) => prev + 1)
   }, 1000)
  }
  return () => clearInterval(interval)
 }, [isLoading])

 const {
  register,
  handleSubmit,
  getValues,
  formState: { errors },
 } = useForm<{ email: string; password: string }>()

 const onSubmit = async (data: { email: string; password: string }) => {
  setIsLoading(true)
  try {
   const res = await api.post(API_ROUTES.AUTH.LOGIN, data)
   
   if (res.data.user.role === "doctor" || res.data.user.role === "provider") {
    toast.error("Access Denied", {
     description: "You are attempting to sign in to the Patient Portal with a Provider account. Please use the Provider login page.",
     duration: 5000,
     icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
    })
    setIsLoading(false)
    return
   }

   setAuth(res.data.user, res.data.access_token, res.data.refresh_token)
   toast.success("Login Successful", {
    description: `Welcome back, ${res.data.user.name.split(" ")[0]}! Securing your connection...`,
    duration: 3000,
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
   })

   // Load this user's saved notifications (preserves history across sessions)
   const store = (await import('@/store/notificationStore')).useNotificationStore.getState()
   store.loadForUser(res.data.user.id)
   store.addNotification({
    title: "New Login Detected",
    message: `You successfully logged in to CareFlow AI on a new device/session.`,
    type: "security"
   })

   router.push(APP_ROUTES.DASHBOARD)
  } catch (err: unknown) {
   const parsed = parseApiError(err)
   setLoginError({ message: parsed.message, isServerWaking: parsed.isServerWaking })

   if (parsed.isServerWaking) {
    toast.error("Connection Timeout", {
     description: "Secure connection took longer than expected. Please try again.",
     duration: 6000,
     icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
    })
   } else {
    toast.error("Authentication Failed", {
     description: parsed.message,
     duration: 5000,
    })
   }
  } finally {
   setIsLoading(false)
  }
 }

 return (
  <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col md:flex-row relative overflow-hidden font-sans">
   {/* LEFT SIDE - CLEAN BRAND VISUAL PANEL */}
   <div className="hidden md:flex w-full md:w-5/12 lg:w-1/2 relative flex-col justify-between p-10 lg:p-14 bg-white dark:bg-black text-slate-900 dark:text-white overflow-hidden z-10 border-r border-slate-200/80 dark:border-zinc-900">
    
    {/* Subtle Ambient Radial Gradients */}
    <div className="absolute top-0 left-0 w-[45rem] h-[45rem] bg-sky-100/70 dark:bg-sky-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
    <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-emerald-100/50 dark:bg-emerald-500/5 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

    {/* Healthcare AI Neural Network SVG */}
    <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M10,20 Q30,10 50,30 T90,20" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-sky-400 dark:text-sky-600 animate-pulse" />
        <path d="M20,80 Q40,90 60,70 T100,80" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-sky-400 dark:text-sky-600 animate-pulse" style={{ animationDelay: '1s' }} />
        <path d="M10,20 L20,80 M50,30 L60,70 M90,20 L100,80" fill="none" stroke="currentColor" strokeWidth="0.1" className="text-sky-300 dark:text-zinc-800" />
        <circle cx="10" cy="20" r="0.8" className="fill-sky-400 dark:fill-sky-500 animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="50" cy="30" r="1.2" className="fill-sky-500 dark:fill-sky-400 animate-pulse" />
        <circle cx="90" cy="20" r="0.8" className="fill-sky-400 dark:fill-sky-500 animate-ping" style={{ animationDuration: '4s' }} />
        <circle cx="20" cy="80" r="1" className="fill-sky-500 dark:fill-sky-400" />
        <circle cx="60" cy="70" r="1.5" className="fill-emerald-400 dark:fill-emerald-500 animate-pulse" />
      </svg>
    </div>

    {/* Status Badges */}
    <div className="hidden lg:flex absolute top-28 right-8 xl:right-12 z-10">
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-sm text-xs font-medium text-slate-700 dark:text-zinc-300 backdrop-blur-sm">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span>Secure Connection</span>
      </div>
    </div>
    
    <div className="hidden lg:flex absolute bottom-40 right-8 xl:right-12 z-10">
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-sm text-xs font-medium text-slate-700 dark:text-zinc-300 backdrop-blur-sm">
        <Activity className="w-3.5 h-3.5 text-sky-500" />
        <span>Clinical AI Engine</span>
      </div>
    </div>

    <div className="relative z-20">
     <Link href="/" className="inline-flex items-center gap-2.5 mb-12 hover:opacity-85 transition-opacity cursor-pointer group">
      <Image src="/favicon.svg" alt="CareFlow Logo" width={34} height={34} className="drop-shadow-sm" />
      <span className="font-brand font-bold text-2xl tracking-tight text-slate-900 dark:text-white">CareFlow <span className="text-sky-500">AI</span></span>
     </Link>
     
     <div className="max-w-md mt-14 space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-zinc-900 border border-sky-200/70 dark:border-zinc-800">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">AI Engine Online</span>
      </div>
      <h1 className="text-3xl lg:text-4xl font-heading font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
       Your Health, <br />
       <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-sky-600 to-emerald-500 dark:from-sky-300 dark:to-emerald-300">Decoded by AI.</span>
      </h1>
      <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed font-normal max-w-sm">
       Access your personalized health timeline, interact with our intelligent medical assistant, and take control of your well-being securely.
      </p>
     </div>
    </div>
    
    <div className="relative z-20 flex items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-zinc-400 bg-slate-100/80 dark:bg-zinc-900/80 w-fit px-4 py-2 rounded-xl border border-slate-200/70 dark:border-zinc-800">
      <HeartPulse className="w-4 h-4 text-emerald-500" />
      <span>HIPAA Compliant & End-to-End Encrypted</span>
    </div>
   </div>

   {/* RIGHT SIDE - HANDCRAFTED COMPACT FORM */}
   <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative bg-slate-50/50 dark:bg-black">
    
    {/* Handcrafted Compact Form Card */}
    <div className="w-full max-w-[420px] relative z-10">
     
     <div className="bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800/90 p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
       
       <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
        <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Sign in to your CareFlow patient account</p>
       </div>

       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
         <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
          Email Address
         </label>
         <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          aria-invalid={!!errors.email}
          className={`w-full h-10.5 px-3.5 rounded-lg border text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none transition duration-150 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
           errors.email 
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/40 dark:bg-red-950/20" 
            : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-slate-300 dark:hover:border-zinc-700"
          }`}
          {...register("email", {
           required: "Email is required",
           pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email format" },
          })}
         />
         {errors.email && (
          <p role="alert" className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1">
           <AlertCircle className="h-3.5 w-3.5 shrink-0" />
           {errors.email.message}
          </p>
         )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
         <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
           Password
          </label>
          <Link href="#" className="text-xs font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 transition-colors">
           Forgot password?
          </Link>
         </div>
         <div className="relative">
          <input
           id="password"
           type={showPassword ? "text" : "password"}
           autoComplete="current-password"
           placeholder="••••••••"
           aria-invalid={!!errors.password}
           className={`w-full h-10.5 pl-3.5 pr-10 rounded-lg border text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none transition duration-150 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
            errors.password 
             ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/40 dark:bg-red-950/20" 
             : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-slate-300 dark:hover:border-zinc-700"
           }`}
           {...register("password", { required: "Password is required" })}
          />
          <button
           type="button"
           onClick={() => setShowPassword(!showPassword)}
           className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors rounded"
           aria-label={showPassword ? "Hide password" : "Show password"}
          >
           {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
         </div>
         {errors.password && (
          <p role="alert" className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1">
           <AlertCircle className="h-3.5 w-3.5 shrink-0" />
           {errors.password.message}
          </p>
         )}
        </div>

        <button
         type="submit"
         disabled={isLoading}
         className="w-full h-10.5 mt-5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm text-sm"
        >
         {isLoading ? (
          <>
           <Loader2 className="h-4 w-4 animate-spin shrink-0" />
           <span>
            {loadingSeconds < 4 ? "Signing In..." : "Securing Connection..."}
           </span>
          </>
         ) : (
          <>
           Sign In
           <ChevronRight className="h-4 w-4" />
          </>
         )}
        </button>

        {/* Discreet Progressive Reassurance */}
        {isLoading && loadingSeconds >= 5 && (
         <div className="mt-3 p-2.5 rounded-xl bg-slate-100/90 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-2.5 shadow-sm animate-in fade-in duration-300">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-sky-500" />
          <p className="text-[12px] text-slate-600 dark:text-zinc-400">
           Establishing encrypted healthcare session. Please hold on...
          </p>
         </div>
        )}

        {/* Discreet Retry Card on Connection Timeout */}
        {loginError && loginError.isServerWaking && !isLoading && (
         <div className="mt-3 p-3 rounded-xl bg-slate-100/90 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-sky-500 mt-0.5" />
          <div className="space-y-1.5 flex-1">
           <p className="font-semibold text-slate-800 dark:text-slate-100">Connection Timed Out</p>
           <p className="text-[11px] text-slate-600 dark:text-zinc-400">
            The secure connection took longer than expected to complete.
           </p>
           <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition shadow-sm cursor-pointer"
           >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
           </button>
          </div>
         </div>
        )}
       </form>

       {/* Cross Navigation & Sign Up */}
       <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-3">
        <Link 
         href="/register" 
         className="w-full h-10 flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/60 dark:bg-zinc-900/40 text-slate-700 dark:text-zinc-200 font-medium rounded-lg text-xs transition duration-150 hover:bg-slate-100 dark:hover:bg-zinc-900"
        >
         Create Patient Account
        </Link>

        <div className="text-center pt-1">
         <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal flex items-center justify-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-sky-500" />
          Healthcare provider?
          <Link href="/doctor/login" className="text-sky-600 dark:text-sky-400 font-medium hover:underline ml-1">
           Doctor Portal &rarr;
          </Link>
         </p>
        </div>
       </div>

     </div>

    </div>
   </div>
  </div>
 )
}

