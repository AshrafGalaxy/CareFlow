"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useRouter, Link } from "@/i18n/routing"
import { Eye, EyeOff, Loader2, AlertCircle, Activity, ShieldCheck, ChevronRight, UserCircle2, Stethoscope, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { API_ROUTES, APP_ROUTES } from "@/lib/constants"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

type FormData = {
 name: string
 email: string
 password: string
 confirmPassword: string
 terms: boolean
 nmcRegistrationNumber?: string
 medicalCouncil?: string
 qualificationDegree?: string
}

// ── Password Strength Meter ────────────────────────────────
function getPasswordStrength(password: string) {
 if (!password) return { score: 0, label: "", color: "", textColor: "" }
 const checks = [
  password.length >= 8,
  /[A-Z]/.test(password),
  /[0-9]/.test(password),
  /[^a-zA-Z0-9]/.test(password),
 ]
 const score = checks.filter(Boolean).length
 const map = [
  { label: "", color: "", textColor: "" },
  { label: "Weak", color: "bg-red-400", textColor: "text-red-500" },
  { label: "Fair", color: "bg-amber-400", textColor: "text-amber-500" },
  { label: "Good", color: "bg-sky-400", textColor: "text-sky-600" },
  { label: "Strong", color: "bg-emerald-400", textColor: "text-emerald-600" },
 ]
 return { score, ...map[score] }
}

function PasswordStrength({ password }: { password: string }) {
 const { score, label, color, textColor } = getPasswordStrength(password)
 if (!password) return null
 return (
  <div className="mt-2 space-y-1">
   <div className="flex gap-1">
    {[1, 2, 3, 4].map((i) => (
     <div
      key={i}
      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
       i <= score ? color : "bg-slate-200 dark:bg-slate-700"
      }`}
     />
    ))}
   </div>
   <p className={`text-xs font-bold ${textColor}`}>{label} password</p>
  </div>
 )
}

export default function RegisterPage() {
 const [showPassword, setShowPassword] = useState(false)
 const [showConfirmPassword, setShowConfirmPassword] = useState(false)
 const [role, setRole] = useState<"patient" | "doctor">("patient")
 const [isLoading, setIsLoading] = useState(false)
 const router = useRouter()
 const setAuth = useAuthStore((state) => state.setAuth)

 const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({ mode: "onBlur" })
 const passwordValue = useWatch({ control, name: "password", defaultValue: "" })

 const onSubmit = async (data: FormData) => {
  setIsLoading(true)
  try {
   await api.post(API_ROUTES.AUTH.REGISTER, {
    name: data.name,
    email: data.email,
    password: data.password,
    role,
    nmc_registration_number: role === "doctor" ? data.nmcRegistrationNumber : undefined,
    medical_council: role === "doctor" ? data.medicalCouncil : undefined,
    qualification_degree: role === "doctor" ? data.qualificationDegree : undefined,
   })
   const loginRes = await api.post(API_ROUTES.AUTH.LOGIN, { email: data.email, password: data.password })
   setAuth(loginRes.data.user, loginRes.data.access_token, loginRes.data.refresh_token)
   toast.success("Account created successfully!")
   router.push(role === "doctor" ? "/doctor/dashboard" : APP_ROUTES.DASHBOARD)
  } catch (err: unknown) {
   toast.error(
    (err as any).response?.data?.detail || "Failed to register. Please try again."
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
    <LanguageSwitcher />
   </div>

   {/* LEFT SIDE - VISUAL PANEL */}
   <div className={`hidden md:flex w-full md:w-5/12 lg:w-1/2 relative flex-col justify-between p-12 text-white overflow-hidden transition-all duration-700 ${role === "patient" ? "bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-700 dark:from-sky-900 dark:via-sky-950 dark:to-indigo-950" : "bg-gradient-to-br from-indigo-800 via-blue-900 to-slate-900 dark:from-indigo-950 dark:via-blue-950 dark:to-slate-950"}`}>
    {/* Abstract Background SVG / Shapes */}
    <div className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none">
      <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradReg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,50 Q25,20 50,50 T100,50 V100 H0 Z" fill="url(#gradReg)" className="animate-pulse" style={{ animationDuration: '8s' }} />
        <circle cx="80" cy="20" r="30" fill="url(#gradReg)" />
      </svg>
    </div>
    
    <div className="absolute -top-32 -left-32 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
    <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>

    <div className="relative z-10">
     <div className="flex items-center gap-2 mb-16">
      <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-xl">
       <Activity className="h-6 w-6 text-white" />
      </div>
      <span className="font-heading font-bold text-2xl tracking-tight">CareFlow<span className="text-sky-200">AI</span></span>
     </div>
     
     <div className="max-w-md mt-12 space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-xs font-semibold uppercase tracking-wider text-white/90">Join the Network</span>
      </div>
      <h1 className="text-4xl lg:text-5xl font-heading font-bold leading-tight transition-all duration-300">
       {role === "patient" ? (
         <>Your Health, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">Decoded by AI.</span></>
       ) : (
         <>Empowering <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">Healthcare Providers.</span></>
       )}
      </h1>
      <p className="text-sky-100/90 text-lg leading-relaxed font-medium transition-all duration-300">
       {role === "patient" 
         ? "Create your secure patient account to access personalized health timelines and AI insights." 
         : "Join the CareFlow network to securely access patient records, prescribe medications, and review labs."}
      </p>
     </div>
    </div>
    
    <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-sky-100/80">
      <ShieldCheck className="w-5 h-5 opacity-70" />
      <span>Enterprise Grade Security & HIPAA Compliant</span>
    </div>
   </div>

   {/* RIGHT SIDE - FORM CONTAINER */}
   <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50 dark:bg-slate-950 overflow-y-auto">
    
    {/* Subtle grid background for the right side */}
    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '40px 40px' }}>
    </div>

    <div className="w-full max-w-[500px] relative z-10 py-8">
     <div className="mb-8">
      <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Create an Account</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium">Join CareFlow to get started</p>
     </div>

     {/* Role Selector */}
     <div className="flex p-1 mb-8 bg-slate-200 dark:bg-slate-800 rounded-xl">
      <button
       type="button"
       onClick={() => setRole("patient")}
       className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
        role === "patient" ? "bg-white dark:bg-slate-950 text-sky-600 dark:text-sky-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
       }`}
      >
       <UserCircle2 className="w-4 h-4" /> Patient
      </button>
      <button
       type="button"
       onClick={() => setRole("doctor")}
       className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
        role === "doctor" ? "bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
       }`}
      >
       <Stethoscope className="w-4 h-4" /> Doctor
      </button>
     </div>

     <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      
      {/* Grid for Name and Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
         <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
         <input
          placeholder="John Doe"
          className={`w-full h-12 px-4 rounded-xl border text-sm focus:ring-2 shadow-sm outline-none transition-all ${errors.name ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-border bg-white dark:bg-slate-900 focus:ring-sky-500"}`}
          {...register("name", { required: "Name is required" })}
         />
         {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
         <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</label>
         <input
          type="email"
          placeholder="you@example.com"
          className={`w-full h-12 px-4 rounded-xl border text-sm focus:ring-2 shadow-sm outline-none transition-all ${errors.email ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-border bg-white dark:bg-slate-900 focus:ring-sky-500"}`}
          {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })}
         />
         {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email.message}</p>}
        </div>
      </div>

      {/* Grid for Passwords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
         <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
         <div className="relative">
          <input
           type={showPassword ? "text" : "password"}
           placeholder="••••••••"
           className={`w-full h-12 pl-4 pr-10 rounded-xl border text-sm focus:ring-2 shadow-sm outline-none transition-all ${errors.password ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-border bg-white dark:bg-slate-900 focus:ring-sky-500"}`}
           {...register("password", { required: "Required", minLength: { value: 8, message: "Min 8 chars" } })}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
           {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
         </div>
         {errors.password && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>}
         <PasswordStrength password={passwordValue} />
        </div>

        <div className="space-y-1.5">
         <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm</label>
         <div className="relative">
          <input
           type={showConfirmPassword ? "text" : "password"}
           placeholder="••••••••"
           className={`w-full h-12 pl-4 pr-10 rounded-xl border text-sm focus:ring-2 shadow-sm outline-none transition-all ${errors.confirmPassword ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-border bg-white dark:bg-slate-900 focus:ring-sky-500"}`}
           {...register("confirmPassword", { required: "Required", validate: (val) => val === passwordValue || "Passwords mismatch" })}
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
           {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
         </div>
         {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 font-medium">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      {/* Doctor Extra Fields (Animated Collapse) */}
      <div className={`grid grid-cols-1 gap-5 overflow-hidden transition-all duration-500 ease-in-out ${role === "doctor" ? "max-h-[500px] opacity-100 pt-2" : "max-h-0 opacity-0"}`}>
       <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">NMC Registration Number</label>
        <input
         placeholder="e.g. 12345"
         className="w-full h-12 px-4 rounded-xl border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none"
         {...register("nmcRegistrationNumber", { required: role === "doctor" ? "Required for doctors" : false })}
        />
        {errors.nmcRegistrationNumber && <p className="text-xs text-red-500 mt-1">{errors.nmcRegistrationNumber.message}</p>}
       </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
         <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Medical Council</label>
          <input
           placeholder="e.g. SMC"
           className="w-full h-12 px-4 rounded-xl border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none"
           {...register("medicalCouncil", { required: role === "doctor" ? "Required" : false })}
          />
         </div>
         <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Degree</label>
          <input
           placeholder="e.g. MBBS, MD"
           className="w-full h-12 px-4 rounded-xl border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none"
           {...register("qualificationDegree", { required: role === "doctor" ? "Required" : false })}
          />
         </div>
       </div>
      </div>

      <div className="flex items-start gap-3 py-2">
       <input
        type="checkbox"
        id="terms"
        className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600 cursor-pointer"
        {...register("terms", { required: "You must accept the terms" })}
       />
       <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
        I agree to CareFlow's <Link href="#" className="text-sky-600 hover:underline">Terms of Service</Link> and <Link href="#" className="text-sky-600 hover:underline">Privacy Policy</Link>.
       </label>
      </div>
      {errors.terms && <p className="text-xs text-red-500 mt-0 font-medium">{errors.terms.message}</p>}

      <button
       type="submit"
       disabled={isLoading}
       className={`w-full h-12 mt-4 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md transform hover:-translate-y-0.5 active:translate-y-0 ${
        role === "patient" ? "bg-sky-600 hover:bg-sky-700 active:bg-sky-800 shadow-sky-600/20 hover:shadow-sky-600/30" : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-600/20 hover:shadow-indigo-600/30"
       }`}
      >
       {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create Account <ChevronRight className="h-4 w-4" /></>}
      </button>
     </form>

     <div className="mt-8 text-center border-t border-border/50 pt-6">
      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
       Already have an account?{" "}
       <Link href={role === "patient" ? "/login" : "/doctor/login"} className="text-sky-600 dark:text-sky-400 font-bold hover:underline underline-offset-4">
        Sign in here
       </Link>
      </p>
     </div>
    </div>
   </div>
  </div>
 )
}
