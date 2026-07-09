"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter, Link } from "@/i18n/routing"
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, ChevronRight, Stethoscope, BriefcaseMedical, Activity } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

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
   toast.success("Successfully logged into Doctor Portal!")
   
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
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row relative overflow-hidden">
   {/* Floating Controls */}
   <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
    <ThemeToggle />
    <LanguageSwitcher />
   </div>

   {/* LEFT SIDE - VISUAL PANEL (DOCTOR THEME) */}
   <div className="hidden md:flex w-full md:w-5/12 lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-indigo-800 via-blue-900 to-slate-900 dark:from-indigo-950 dark:via-blue-950 dark:to-slate-950 text-white overflow-hidden">
    {/* Abstract Background SVG / Shapes */}
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradDoc" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="100,0 0,100 100,100" fill="url(#gradDoc)" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      </svg>
    </div>
    
    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

    <div className="relative z-10">
     <div className="flex items-center gap-2 mb-16">
      <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-xl">
       <BriefcaseMedical className="h-6 w-6 text-indigo-200" />
      </div>
      <span className="font-heading font-bold text-2xl tracking-tight text-white">CareFlow<span className="text-indigo-300">Provider</span></span>
     </div>
     
     <div className="max-w-md mt-12 space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-white/90">Verified Personnel Only</span>
      </div>
      <h1 className="text-4xl lg:text-5xl font-heading font-bold leading-tight">
       Modern Care, <br />
       <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-sky-200">Elevated.</span>
      </h1>
      <p className="text-indigo-100/80 text-lg leading-relaxed font-medium">
       Securely access patient records, review AI-analyzed labs, and manage prescriptions seamlessly from your clinical dashboard.
      </p>
     </div>
    </div>
    
    <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-indigo-200/60">
      <span>CareFlow for Providers v2.0 • EMR Compliant</span>
    </div>
   </div>

   {/* RIGHT SIDE - FORM CONTAINER */}
   <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50 dark:bg-slate-950">
    
    {/* Subtle grid background */}
    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '40px 40px' }}>
    </div>

    <div className="w-full max-w-[440px] relative z-10">
     <div className="mb-8">
      <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Doctor Portal</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium">Authenticate to access clinical tools</p>
     </div>

     <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {error && (
       <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/50 dark:border-red-900/50 flex items-start gap-3 mb-2">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-red-800 dark:text-red-300">
         {error}
        </p>
       </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
       <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Clinical Email
       </label>
       <input
        type="email"
        placeholder="doctor@hospital.org"
        className={`w-full h-12 px-4 rounded-xl border text-foreground text-sm placeholder:text-muted-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${
         errors.email ? "border-red-400 bg-red-50 dark:bg-red-950/50" : "border-border bg-white dark:bg-slate-900"
        }`}
        {...register("email", { required: "Email is required" })}
       />
       {errors.email && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-500 mt-1">
         <AlertCircle className="h-3.5 w-3.5 shrink-0" />
         {(errors as any).email.message}
        </p>
       )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
       <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
         Password
        </label>
       </div>
       <div className="relative">
        <input
         type={showPassword ? "text" : "password"}
         placeholder="••••••••"
         className={`w-full h-12 pl-4 pr-11 rounded-xl border text-foreground text-sm placeholder:text-muted-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${
          errors.password ? "border-red-400 bg-red-50 dark:bg-red-950/50" : "border-border bg-white dark:bg-slate-900"
         }`}
         {...register("password", { required: "Password is required" })}
        />
        <button
         type="button"
         onClick={() => setShowPassword(!showPassword)}
         className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
       </div>
      </div>

      <button
       type="submit"
       disabled={isLoading}
       className="w-full h-12 mt-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 transform hover:-translate-y-0.5 active:translate-y-0"
      >
       {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Access Dashboard <ChevronRight className="h-4 w-4" /></>}
      </button>
     </form>

     {/* Cross Navigation */}
     <div className="mt-8 space-y-4">
      <div className="relative">
       <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
       <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 dark:bg-slate-950 px-2 text-muted-foreground font-semibold tracking-wider">Staff Options</span></div>
      </div>
      
      <Link 
       href="/register" 
       className="w-full h-12 flex items-center justify-center gap-2 border-2 border-border hover:border-slate-300 dark:hover:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all duration-200"
      >
       Register new provider
      </Link>

      <div className="pt-6 mt-6 border-t border-border/50 text-center">
       <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-2">
        <Activity className="w-4 h-4" />
        Are you a patient?
        <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline underline-offset-4">
         Patient Portal
        </Link>
       </p>
      </div>
     </div>
    </div>
   </div>
  </div>
 )
}
