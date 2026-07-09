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
import Image from "next/image"

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
  { label: "Good", color: "bg-sky-400", textColor: "text-sky-500" },
  { label: "Strong", color: "bg-emerald-400", textColor: "text-emerald-500" },
 ]
 return { score, ...map[score] }
}

function PasswordStrength({ password }: { password: string }) {
 const { score, label, color, textColor } = getPasswordStrength(password)
 if (!password) return null
 return (
  <div className="mt-2.5 space-y-1.5 ml-1">
   <div className="flex gap-1">
    {[1, 2, 3, 4].map((i) => (
     <div
      key={i}
      className={`h-1.5 flex-1 rounded-full transition-all duration-300 shadow-inner ${
       i <= score ? color : "bg-slate-200 dark:bg-slate-800"
      }`}
     />
    ))}
   </div>
   <p className={`text-[10px] uppercase tracking-widest font-bold ${textColor}`}>{label} password</p>
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
   toast.success("Registration Successful", {
    description: "Welcome to CareFlow! Loading your secure environment...",
    duration: 3000,
   })

   // New account — loadForUser first (starts fresh), then add welcome notification
   const store = (await import('@/store/notificationStore')).useNotificationStore.getState()
   store.loadForUser(loginRes.data.user.id)
   store.addNotification({
    title: "Welcome to CareFlow AI!",
    message: "Your secure health portal is ready. Explore features and take control of your health journey.",
    type: "success"
   })

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
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row relative overflow-hidden font-sans">
   {/* Floating Controls */}
   <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
    <ThemeToggle />
   </div>

   {/* LEFT SIDE - ULTRA PREMIUM VISUAL PANEL */}
   <div className="hidden md:flex w-full md:w-5/12 lg:w-1/2 relative flex-col justify-between p-12 lg:p-16 bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden shadow-[10px_0_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-2xl z-10 border-r border-slate-100 dark:border-slate-800/50 transition-colors duration-1000">
    
    {/* Animated Radial Gradients */}
    <div className="absolute top-0 left-0 w-[50rem] h-[50rem] bg-sky-200/50 dark:bg-sky-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '8s' }}></div>
    <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-emerald-100/60 dark:bg-emerald-500/10 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3"></div>
    <div className="absolute top-1/2 left-1/2 w-[30rem] h-[30rem] bg-sky-100/60 dark:bg-sky-400/10 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2"></div>

    {/* Healthcare AI Neural Network SVG */}
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

    {/* Floating Glassmorphism Cards */}
    <div className="hidden lg:flex absolute top-32 right-8 xl:right-12 z-10 animate-float" style={{ animationDuration: '8s' }}>
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <UserCircle2 className="w-4 h-4 text-emerald-500" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Identity Verified</span>
      </div>
    </div>
    
    <div className="hidden lg:flex absolute bottom-48 right-8 xl:right-12 z-10 animate-float" style={{ animationDuration: '7s', animationDelay: '1s' }}>
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <ShieldCheck className="w-4 h-4 text-sky-500" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">HIPAA Compliant</span>
      </div>
    </div>

    <div className="relative z-20">
     <Link href="/" className="inline-flex items-center gap-3 mb-16 hover:opacity-80 transition-opacity cursor-pointer group">
      <div className="relative">
       <div className="absolute inset-0 bg-sky-200 dark:bg-sky-400 blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
       <Image src="/favicon.svg" alt="CareFlow Logo" width={44} height={44} className="relative drop-shadow-sm dark:drop-shadow-xl" />
      </div>
      <span className="font-brand font-bold text-3xl tracking-tight text-slate-900 dark:text-white">CareFlow <span className="text-sky-500">AI</span></span>
     </Link>
     
     <div className="max-w-md mt-20 space-y-6">
      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-sky-50/80 dark:bg-white/5 border border-sky-100 dark:border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(56,189,248,0.1)] dark:shadow-[0_0_15px_rgba(56,189,248,0.15)]">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-sky-700 dark:text-sky-100">Join the Network</span>
      </div>
      <h1 className="text-4xl lg:text-5xl font-heading font-extrabold leading-[1.15] tracking-tight text-slate-800 dark:text-white">
       {role === "patient" ? (
         <>Your Health, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-sky-600 to-emerald-500 dark:from-sky-300 dark:via-sky-100 dark:to-white drop-shadow-sm">Decoded by AI.</span></>
       ) : (
         <>Empowering <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-sky-600 to-emerald-500 dark:from-sky-300 dark:via-sky-100 dark:to-white drop-shadow-sm">Healthcare Providers.</span></>
       )}
      </h1>
      <p className="text-slate-700 dark:text-sky-100/80 text-base leading-relaxed font-medium max-w-sm">
       {role === "patient" 
         ? "Create your secure patient account to access personalized health timelines and AI insights." 
         : "Join the CareFlow network to securely access patient records, prescribe medications, and review labs."}
      </p>
     </div>
    </div>
    
    <div className="relative z-20 flex items-center gap-4 text-sm font-semibold text-slate-600 dark:text-sky-200/50 backdrop-blur-sm bg-white/50 dark:bg-white/5 w-fit px-6 py-3 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-sm dark:shadow-none">
      <ShieldCheck className="w-5 h-5 text-emerald-400/70" />
      <span>Enterprise Grade Security & HIPAA Compliant</span>
    </div>
   </div>

   {/* RIGHT SIDE - FORM CONTAINER */}
   <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50 dark:bg-slate-950/40 overflow-y-auto">
    
    {/* Subtle grid background for the right side */}
    <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}>
    </div>

    <div className="w-full max-w-[500px] relative z-10 py-8">
     
     {/* Card Container */}
     <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]">
       
       <div className="mb-8">
        <h2 className="text-3xl font-heading font-bold text-foreground mb-3 tracking-tight">Create an Account</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Join CareFlow to get started</p>
       </div>

       {/* Animated Role Selector */}
       <div className="flex p-1.5 mb-8 bg-slate-100/80 dark:bg-slate-950/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 relative shadow-inner">
        <div 
         className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-white dark:bg-slate-800 rounded-xl shadow-md transition-all duration-300 ease-spring`}
         style={{ left: role === 'patient' ? '6px' : 'calc(50%)' }}
        />
        <button
         type="button"
         onClick={() => setRole("patient")}
         className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 relative z-10 ${
          role === "patient" ? "text-sky-600 dark:text-sky-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
         }`}
        >
         <UserCircle2 className="w-4 h-4" /> Patient
        </button>
        <button
         type="button"
         onClick={() => setRole("doctor")}
         className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 relative z-10 ${
          role === "doctor" ? "text-sky-600 dark:text-sky-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
         }`}
        >
         <Stethoscope className="w-4 h-4" /> Doctor
        </button>
       </div>

       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        
        {/* Grid for Name and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
           <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
           <div className="relative group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
             <input
              placeholder="John Doe"
              className={`relative w-full h-14 px-5 rounded-xl border text-foreground text-sm focus:ring-4 focus:ring-sky-500/20 shadow-sm outline-none transition-all duration-300 ${errors.name ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 focus:border-sky-500 hover:border-sky-300 dark:hover:border-sky-700"}`}
              {...register("name", { 
               required: "Name is required",
               pattern: { value: /^[A-Za-z\s]+$/, message: "Only letters and spaces allowed" },
               minLength: { value: 2, message: "Minimum 2 characters" },
               maxLength: { value: 50, message: "Maximum 50 characters" }
              })}
             />
           </div>
           {errors.name && <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500 mt-1.5 ml-1"><AlertCircle className="h-3.5 w-3.5 shrink-0" />{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
           <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Email</label>
           <div className="relative group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
             <input
              type="email"
              placeholder="you@example.com"
              className={`relative w-full h-14 px-5 rounded-xl border text-foreground text-sm focus:ring-4 focus:ring-sky-500/20 shadow-sm outline-none transition-all duration-300 ${errors.email ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 focus:border-sky-500 hover:border-sky-300 dark:hover:border-sky-700"}`}
              {...register("email", { 
               required: "Email is required", 
               pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email format" } 
              })}
             />
           </div>
           {errors.email && <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500 mt-1.5 ml-1"><AlertCircle className="h-3.5 w-3.5 shrink-0" />{errors.email.message}</p>}
          </div>
        </div>

        {/* Grid for Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
           <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Password</label>
           <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <input
             type={showPassword ? "text" : "password"}
             placeholder="••••••••"
             className={`relative w-full h-14 pl-5 pr-12 rounded-xl border text-foreground text-sm focus:ring-4 focus:ring-sky-500/20 shadow-sm outline-none transition-all duration-300 ${errors.password ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 focus:border-sky-500 hover:border-sky-300 dark:hover:border-sky-700"}`}
             {...register("password", { 
              required: "Password is required", 
              minLength: { value: 8, message: "Minimum 8 characters" },
              pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-#])[A-Za-z\d@$!%*?&\-#]{8,}$/, message: "Must include uppercase, lowercase, number, and special char" }
             })}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-sky-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 z-10">
             {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
           </div>
           {errors.password && <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500 mt-1.5 ml-1"><AlertCircle className="h-3.5 w-3.5 shrink-0" />{errors.password.message}</p>}
           <PasswordStrength password={passwordValue} />
          </div>

          <div className="space-y-2">
           <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
           <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <input
             type={showConfirmPassword ? "text" : "password"}
             placeholder="••••••••"
             className={`relative w-full h-14 pl-5 pr-12 rounded-xl border text-foreground text-sm focus:ring-4 focus:ring-sky-500/20 shadow-sm outline-none transition-all duration-300 ${errors.confirmPassword ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 focus:border-sky-500 hover:border-sky-300 dark:hover:border-sky-700"}`}
             {...register("confirmPassword", { required: "Required", validate: (val) => val === passwordValue || "Passwords mismatch" })}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-sky-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 z-10">
             {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
           </div>
           {errors.confirmPassword && <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500 mt-1.5 ml-1"><AlertCircle className="h-3.5 w-3.5 shrink-0" />{errors.confirmPassword.message}</p>}
          </div>
        </div>

        {/* Doctor Extra Fields (Animated Collapse) */}
        <div className={`grid grid-cols-1 gap-5 overflow-hidden transition-all duration-500 ease-in-out ${role === "doctor" ? "max-h-[500px] opacity-100 pt-2" : "max-h-0 opacity-0"}`}>
         <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">NMC Registration Number</label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <input
             placeholder="e.g. 12345"
             className={`relative w-full h-14 px-5 rounded-xl border text-foreground text-sm focus:ring-4 focus:ring-sky-500/20 shadow-sm outline-none transition-all duration-300 ${errors.nmcRegistrationNumber ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 focus:border-sky-500 hover:border-sky-300 dark:hover:border-sky-700"}`}
             {...register("nmcRegistrationNumber", { 
              required: role === "doctor" ? "Required for doctors" : false,
              pattern: { value: /^[A-Z0-9-]+$/i, message: "Only alphanumeric and hyphens allowed" },
              minLength: { value: 4, message: "Minimum 4 characters" },
              maxLength: { value: 20, message: "Maximum 20 characters" }
             })}
            />
          </div>
          {errors.nmcRegistrationNumber && <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500 mt-1.5 ml-1"><AlertCircle className="h-3.5 w-3.5 shrink-0" />{errors.nmcRegistrationNumber.message}</p>}
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
           <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Medical Council</label>
            <div className="relative group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
             <input
              placeholder="e.g. SMC"
              className={`relative w-full h-14 px-5 rounded-xl border text-foreground text-sm focus:ring-4 focus:ring-sky-500/20 shadow-sm outline-none transition-all duration-300 ${errors.medicalCouncil ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 focus:border-sky-500 hover:border-sky-300 dark:hover:border-sky-700"}`}
              {...register("medicalCouncil", { 
               required: role === "doctor" ? "Required" : false,
               pattern: { value: /^[A-Za-z\s]+$/, message: "Only letters and spaces allowed" },
               minLength: { value: 2, message: "Minimum 2 characters" },
               maxLength: { value: 50, message: "Maximum 50 characters" }
              })}
             />
            </div>
            {errors.medicalCouncil && <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500 mt-1.5 ml-1"><AlertCircle className="h-3.5 w-3.5 shrink-0" />{errors.medicalCouncil.message}</p>}
           </div>
           <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Degree</label>
            <div className="relative group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
             <input
              placeholder="e.g. MBBS, MD"
              className={`relative w-full h-14 px-5 rounded-xl border text-foreground text-sm focus:ring-4 focus:ring-sky-500/20 shadow-sm outline-none transition-all duration-300 ${errors.qualificationDegree ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 focus:border-sky-500 hover:border-sky-300 dark:hover:border-sky-700"}`}
              {...register("qualificationDegree", { 
               required: role === "doctor" ? "Required" : false,
               pattern: { value: /^[A-Za-z.,\s-]+$/, message: "Only letters, dots, commas, and hyphens" },
               minLength: { value: 2, message: "Minimum 2 characters" }
              })}
             />
            </div>
            {errors.qualificationDegree && <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500 mt-1.5 ml-1"><AlertCircle className="h-3.5 w-3.5 shrink-0" />{errors.qualificationDegree.message}</p>}
           </div>
         </div>
        </div>

        <div className="flex items-start gap-3 py-2 pl-1">
         <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
           type="checkbox"
           id="terms"
           className="peer h-5 w-5 appearance-none rounded border-2 border-slate-300 dark:border-slate-600 bg-transparent text-sky-600 checked:border-sky-600 checked:bg-sky-600 focus:ring-2 focus:ring-sky-500/30 transition-all cursor-pointer"
           {...register("terms", { required: "You must accept the terms" })}
          />
          <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
         </div>
         <label htmlFor="terms" className="text-[13px] font-medium text-slate-600 dark:text-slate-400 cursor-pointer leading-relaxed pt-[2px]">
          I agree to CareFlow's <Link href="#" className="text-sky-600 dark:text-sky-400 font-bold hover:text-sky-500 transition-colors">Terms of Service</Link> and <Link href="#" className="text-sky-600 dark:text-sky-400 font-bold hover:text-sky-500 transition-colors">Privacy Policy</Link>.
         </label>
        </div>
        {errors.terms && <p className="text-xs text-red-500 mt-0 font-semibold ml-1">{errors.terms.message}</p>}

        <button
         type="submit"
         disabled={isLoading}
         className={`w-full h-14 mt-6 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transform hover:-translate-y-1 active:translate-y-0 group ${
          role === "patient" ? "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500" : "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500"
         }`}
        >
         {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create Account <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
        </button>
       </form>
     </div>

     <div className="mt-8 text-center">
      <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">
       Already have an account?{" "}
       <Link href={role === "patient" ? "/login" : "/doctor/login"} className="text-sky-600 dark:text-sky-400 font-bold hover:text-sky-500 transition-colors px-2 py-1 rounded hover:bg-sky-50 dark:hover:bg-sky-950/50">
        Sign in here &rarr;
       </Link>
      </p>
     </div>
    </div>
   </div>
  </div>
 )
}
