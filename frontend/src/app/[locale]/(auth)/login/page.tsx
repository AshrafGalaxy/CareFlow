"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter, Link } from "@/i18n/routing"
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Activity, HeartPulse, ChevronRight, Stethoscope } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { API_ROUTES, APP_ROUTES } from "@/lib/constants"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Image from "next/image"

export default function LoginPage() {
 const [showPassword, setShowPassword] = useState(false)
 const [isLoading, setIsLoading] = useState(false)
 const router = useRouter()
 const setAuth = useAuthStore((state) => state.setAuth)

 const {
  register,
  handleSubmit,
  formState: { errors },
 } = useForm<{ email: string; password: string }>()

 const onSubmit = async (data: { email: string; password: string }) => {
  setIsLoading(true)
  try {
   const res = await api.post(API_ROUTES.AUTH.LOGIN, data)
   setAuth(res.data.user, res.data.access_token, res.data.refresh_token)
   toast(
    <div className="flex flex-col gap-1">
     <span className="font-heading font-bold text-foreground">Login Successful</span>
     <span className="text-sm text-slate-600 dark:text-slate-300">Welcome back, {res.data.user.name.split(" ")[0]}! Securing your connection...</span>
    </div>,
    {
     icon: <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-inner"><CheckCircle className="h-4 w-4" /></div>,
     duration: 3000,
    }
   )
   router.push(APP_ROUTES.DASHBOARD)
  } catch (err: unknown) {
   toast.error(
    (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Failed to sign in. Please check your credentials and try again."
   )
  } finally {
   setIsLoading(false)
  }
 }

 return (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row relative overflow-hidden">
   {/* Floating Controls */}
   <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
    <ThemeToggle />
   </div>

   {/* LEFT SIDE - VISUAL PANEL */}
   <div className="hidden md:flex w-full md:w-5/12 lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 dark:from-sky-800 dark:via-sky-900 dark:to-slate-900 text-white overflow-hidden">
    {/* Abstract Background SVG / Shapes */}
    <div className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none">
      <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="30" r="40" fill="url(#grad1)" />
        <circle cx="80" cy="70" r="50" fill="url(#grad1)" />
        <circle cx="10" cy="90" r="20" fill="url(#grad1)" />
      </svg>
    </div>
    
    <div className="absolute -top-32 -left-32 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
    <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-sky-300 opacity-20 rounded-full blur-3xl"></div>

    <div className="relative z-10">
     <div className="flex items-center gap-2.5 mb-16">
      <Image src="/favicon.svg" alt="CareFlow Logo" width={40} height={40} className="drop-shadow-lg" />
      <span className="font-heading font-bold text-2xl tracking-tight">CareFlow</span>
     </div>
     
     <div className="max-w-md mt-12 space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-xs font-semibold uppercase tracking-wider text-white/90">System Online</span>
      </div>
      <h1 className="text-4xl lg:text-5xl font-heading font-bold leading-tight">
       Your Health, <br />
       <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">Decoded by AI.</span>
      </h1>
      <p className="text-sky-100/90 text-lg leading-relaxed font-medium">
       Access your personalized health timeline, interact with our intelligent medical assistant, and take control of your well-being securely.
      </p>
     </div>
    </div>
    
    <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-sky-100/80">
      <HeartPulse className="w-5 h-5 opacity-70" />
      <span>HIPAA Compliant & End-to-End Encrypted</span>
    </div>
   </div>

   {/* RIGHT SIDE - FORM CONTAINER */}
   <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50 dark:bg-slate-950">
    
    {/* Subtle grid background for the right side */}
    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '40px 40px' }}>
    </div>

    <div className="w-full max-w-[440px] relative z-10">
     <div className="mb-8">
      <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Welcome back</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium">Sign in to your CareFlow patient account</p>
     </div>

     <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Email */}
      <div className="space-y-1.5">
       <label htmlFor="email" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Email Address
       </label>
       <input
        id="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        aria-invalid={!!errors.email}
        className={`w-full h-12 px-4 rounded-xl border text-foreground text-sm placeholder:text-muted-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm ${
         errors.email ? "border-red-400 bg-red-50 dark:bg-red-950/50" : "border-border bg-white dark:bg-slate-900"
        }`}
        {...register("email", {
         required: "Email is required",
         pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
        })}
       />
       {errors.email && (
        <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-500 mt-1">
         <AlertCircle className="h-3.5 w-3.5 shrink-0" />
         {errors.email.message}
        </p>
       )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
       <div className="flex items-center justify-between">
        <label htmlFor="password" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
         Password
        </label>
        <Link href="#" className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors">
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
         className={`w-full h-12 pl-4 pr-11 rounded-xl border text-foreground text-sm placeholder:text-muted-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm ${
          errors.password ? "border-red-400 bg-red-50 dark:bg-red-950/50" : "border-border bg-white dark:bg-slate-900"
         }`}
         {...register("password", { required: "Password is required" })}
        />
        <button
         type="button"
         onClick={() => setShowPassword(!showPassword)}
         className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
         aria-label={showPassword ? "Hide password" : "Show password"}
        >
         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
       </div>
       {errors.password && (
        <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-500 mt-1">
         <AlertCircle className="h-3.5 w-3.5 shrink-0" />
         {errors.password.message}
        </p>
       )}
      </div>

      <button
       type="submit"
       disabled={isLoading}
       className="w-full h-12 mt-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-sky-600/20 hover:shadow-lg hover:shadow-sky-600/30 transform hover:-translate-y-0.5 active:translate-y-0"
      >
       {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
       ) : (
        <>
         Sign In
         <ChevronRight className="h-4 w-4" />
        </>
       )}
      </button>
     </form>

     {/* Cross Navigation & Sign Up */}
     <div className="mt-8 space-y-4">
      <div className="relative">
       <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
       <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 dark:bg-slate-950 px-2 text-muted-foreground font-semibold tracking-wider">New to CareFlow?</span></div>
      </div>
      
      <Link 
       href="/register" 
       className="w-full h-12 flex items-center justify-center gap-2 border-2 border-border hover:border-slate-300 dark:hover:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all duration-200"
      >
       Create Patient Account
      </Link>

      <div className="pt-6 mt-6 border-t border-border/50 text-center">
       <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-2">
        <Stethoscope className="w-4 h-4" />
        Are you a healthcare provider?
        <Link href="/doctor/login" className="text-sky-600 dark:text-sky-400 font-bold hover:underline underline-offset-4">
         Doctor Portal
        </Link>
       </p>
      </div>
     </div>
    </div>
   </div>
  </div>
 )
}
