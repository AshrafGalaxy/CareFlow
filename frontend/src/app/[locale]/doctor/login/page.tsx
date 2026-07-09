"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter, Link } from "@/i18n/routing"
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, ChevronRight, Activity, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Image from "next/image"

export default function ProviderLogin() {
 const [showPassword, setShowPassword] = useState(false)
 const [isLoading, setIsLoading] = useState(false)
 const [error, setError] = useState("")
 const router = useRouter()
 const setAuth = useAuthStore((state) => state.setAuth)

 const {
  register,
  handleSubmit,
  formState: { errors },
 } = useForm()

 const onSubmit = async (data: any) => {
  try {
   setIsLoading(true)
   setError("")

   const formData = new URLSearchParams()
   formData.append("username", data.email) // Email is used as username
   formData.append("password", data.password)

   const response = await api.post("/api/auth/token", formData, {
    headers: {
     "Content-Type": "application/x-www-form-urlencoded",
    },
   })

   const { access_token, user } = response.data
   
   // Verify role is provider
   if (user.role !== "provider") {
    setError("Unauthorized access. This portal is strictly for healthcare providers.")
    setIsLoading(false)
    return
   }

   setAuth(user, access_token, response.data.refresh_token)
   toast.success(
    <div className="flex flex-col gap-1">
     <span className="font-heading font-bold text-foreground">Login Successful</span>
     <span className="text-sm text-slate-600 dark:text-slate-300">Welcome back, Dr. {user.name.split(" ")[0]}! Securing clinical portal...</span>
    </div>,
    {
     icon: <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]"><CheckCircle className="h-4 w-4" /></div>,
     duration: 3000,
    }
   )
   
   router.push("/doctor/dashboard")
  } catch (err: any) {
   console.error("Login error:", err)
   setError(
    err.response?.data?.detail || 
    "Failed to sign in. Please check your credentials."
   )
   toast.error("Authentication failed")
  } finally {
   setIsLoading(false)
  }
 }

 return (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row relative overflow-hidden font-sans">
   {/* Floating Controls */}
   <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
    <ThemeToggle />
   </div>

   {/* LEFT SIDE - ULTRA PREMIUM VISUAL PANEL (UNIFORM THEME) */}
   <div className="hidden md:flex w-full md:w-5/12 lg:w-1/2 relative flex-col justify-between p-12 lg:p-16 bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden shadow-[10px_0_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-2xl z-10 border-r border-slate-100 dark:border-slate-800/50">
    
    {/* Animated Radial Gradients (Exactly matching patient for uniform AI theme) */}
    <div className="absolute top-0 left-0 w-[50rem] h-[50rem] bg-sky-200/50 dark:bg-sky-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '8s' }}></div>
    <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-emerald-100/60 dark:bg-emerald-500/10 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3"></div>
    <div className="absolute top-1/2 left-1/2 w-[30rem] h-[30rem] bg-sky-100/60 dark:bg-sky-400/10 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2"></div>

    {/* Healthcare AI Neural Network SVG (Uniform Theme) */}
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

    <div className="relative z-20">
     <Link href="/" className="inline-flex items-center gap-3 mb-16 hover:opacity-80 transition-opacity cursor-pointer group">
      <div className="relative">
       <div className="absolute inset-0 bg-sky-200 dark:bg-sky-400 blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
       <Image src="/favicon.svg" alt="CareFlow Logo" width={44} height={44} className="relative drop-shadow-sm dark:drop-shadow-xl" />
      </div>
      <span className="font-heading font-bold text-3xl tracking-tight text-slate-900 dark:text-white">CareFlow</span>
     </Link>
     
     <div className="max-w-md mt-16 space-y-8">
      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-sky-50/80 dark:bg-white/5 border border-sky-100 dark:border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(56,189,248,0.1)] dark:shadow-[0_0_15px_rgba(56,189,248,0.15)]">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-100">Verified Personnel Only</span>
      </div>
      <h1 className="text-5xl lg:text-6xl font-heading font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white">
       Modern Care, <br />
       <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-700 dark:from-sky-300 dark:via-sky-100 dark:to-white drop-shadow-sm">Elevated.</span>
      </h1>
      <p className="text-slate-600 dark:text-sky-100/70 text-lg leading-relaxed font-medium max-w-sm">
       Securely access patient records, review AI-analyzed labs, and manage prescriptions seamlessly from your clinical dashboard.
      </p>
     </div>
    </div>
    
    <div className="relative z-20 flex items-center gap-4 text-sm font-semibold text-slate-600 dark:text-sky-200/50 backdrop-blur-sm bg-white/50 dark:bg-white/5 w-fit px-6 py-3 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-sm dark:shadow-none">
      <ShieldCheck className="w-5 h-5 text-emerald-400/70" />
      <span>CareFlow for Providers v2.0 • EMR Compliant</span>
    </div>
   </div>

   {/* RIGHT SIDE - FORM CONTAINER */}
   <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50 dark:bg-slate-950/40">
    
    {/* Subtle grid background for the right side */}
    <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}>
    </div>

    {/* Form Card with Glowing Border */}
    <div className="w-full max-w-[460px] relative z-10">
     
     {/* Card Container */}
     <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]">
       
       <div className="mb-10">
        <h2 className="text-3xl font-heading font-bold text-foreground mb-3 tracking-tight">Doctor Portal</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Authenticate to access clinical tools</p>
       </div>

       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {error && (
         <div className="p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/40 border border-red-200/50 dark:border-red-900/50 flex items-start gap-3 mb-2 backdrop-blur-sm">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
           {error}
          </p>
         </div>
        )}

        {/* Email */}
        <div className="space-y-2">
         <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
          Clinical Email
         </label>
         <div className="relative group">
           <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
           <input
            type="email"
            placeholder="doctor@hospital.org"
            className={`relative w-full h-14 px-5 rounded-xl border text-foreground text-sm placeholder:text-muted-foreground outline-none transition-all duration-300 focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm ${
             errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-950/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-sky-300 dark:hover:border-sky-700"
            }`}
            {...register("email", { required: "Email is required" })}
           />
         </div>
         {errors.email && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500 mt-1.5 ml-1">
           <AlertCircle className="h-3.5 w-3.5 shrink-0" />
           {(errors as any).email.message}
          </p>
         )}
        </div>

        {/* Password */}
        <div className="space-y-2">
         <div className="flex items-center justify-between ml-1">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
           Password
          </label>
         </div>
         <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
          <input
           type={showPassword ? "text" : "password"}
           placeholder="••••••••"
           className={`relative w-full h-14 pl-5 pr-12 rounded-xl border text-foreground text-sm placeholder:text-muted-foreground outline-none transition-all duration-300 focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm ${
            errors.password ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-950/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-sky-300 dark:hover:border-sky-700"
           }`}
           {...register("password", { required: "Password is required" })}
          />
          <button
           type="button"
           onClick={() => setShowPassword(!showPassword)}
           className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-sky-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 z-10"
          >
           {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
         </div>
        </div>

        <button
         type="submit"
         disabled={isLoading}
         className="w-full h-14 mt-8 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transform hover:-translate-y-1 active:translate-y-0 group"
        >
         {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Access Dashboard <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
        </button>
       </form>
     </div>

     {/* Cross Navigation & Sign Up */}
     <div className="mt-10 px-4 space-y-6">
      <div className="relative">
       <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-800"></span></div>
       <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-slate-50 dark:bg-slate-950 px-3 text-slate-400 font-bold">Staff Options</span></div>
      </div>
      
      <Link 
       href="/register" 
       className="w-full h-14 flex items-center justify-center gap-2 border-2 border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] group backdrop-blur-sm"
      >
       Register new provider
      </Link>

      <div className="text-center">
       <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-center gap-1.5">
        <Activity className="w-3.5 h-3.5" />
        Are you a patient?
        <Link href="/login" className="text-sky-600 dark:text-sky-400 font-bold hover:text-sky-500 transition-colors px-1 py-0.5 rounded hover:bg-sky-50 dark:hover:bg-sky-950">
         Patient Portal &rarr;
        </Link>
       </p>
      </div>
     </div>
    </div>
   </div>
  </div>
 )
}
