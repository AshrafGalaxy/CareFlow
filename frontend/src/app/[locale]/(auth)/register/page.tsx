"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useRouter, Link } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Eye, EyeOff, Loader2, AlertCircle, Activity, ShieldCheck, ChevronRight, UserCircle2, Stethoscope, CheckCircle, ArrowUpCircle } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { API_ROUTES, APP_ROUTES } from "@/lib/constants"
import Image from "next/image"

type FormData = {
 name: string
 email: string
 password: string
 confirmPassword: string
 gender?: string
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
  <div className="mt-1.5 space-y-1">
   <div className="flex gap-1">
    {[1, 2, 3, 4].map((i) => (
     <div
      key={i}
      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
       i <= score ? color : "bg-slate-200 dark:bg-zinc-800"
      }`}
     />
    ))}
   </div>
   <p className={`text-[10px] uppercase tracking-wider font-semibold ${textColor}`}>{label} password</p>
  </div>
 )
}

function RegisterContent() {
 const searchParams = useSearchParams()
 const defaultRole = searchParams.get("role") === "doctor" ? "doctor" : "patient"
 const [showPassword, setShowPassword] = useState(false)
 const [showConfirmPassword, setShowConfirmPassword] = useState(false)
 const [role, setRole] = useState<"patient" | "doctor">(defaultRole)
 const [isLoading, setIsLoading] = useState(false)
 const router = useRouter()
 const setAuth = useAuthStore((state) => state.setAuth)

 const { register, handleSubmit, control, watch, formState: { errors, touchedFields } } = useForm<FormData>({ mode: "onBlur" })
 const passwordValue = watch("password", "")
 const emailValue = watch("email", "")
 const [capsLock, setCapsLock] = useState(false)
 
 const checkCapsLock = (e: any) => {
  if (e.getModifierState) {
   setCapsLock(e.getModifierState("CapsLock"))
  }
 }

 const onSubmit = async (data: FormData) => {
  setIsLoading(true)
  try {
   await api.post(API_ROUTES.AUTH.REGISTER, {
    name: data.name,
    email: data.email,
    password: data.password,
    role,
    gender: data.gender || undefined,
    nmc_registration_number: role === "doctor" ? data.nmcRegistrationNumber : undefined,
    medical_council: role === "doctor" ? data.medicalCouncil : undefined,
    qualification_degree: role === "doctor" ? data.qualificationDegree : undefined,
   })
   const loginRes = await api.post(API_ROUTES.AUTH.LOGIN, { email: data.email, password: data.password })
   setAuth(loginRes.data.user, loginRes.data.access_token, loginRes.data.refresh_token)
   toast.success("Registration Successful", {
    description: "Welcome to CareFlow! Loading your secure environment...",
    duration: 3000,
    icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
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
  <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col md:flex-row relative overflow-hidden font-sans">
   {/* LEFT SIDE - CLEAN BRAND VISUAL PANEL */}
   <div className="hidden md:flex w-full md:w-5/12 lg:w-1/2 relative flex-col justify-between p-10 lg:p-14 bg-white dark:bg-black text-slate-900 dark:text-white overflow-hidden z-10 border-r border-slate-200/80 dark:border-zinc-900 transition-colors">
    
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
        <UserCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span>Identity Verified</span>
      </div>
    </div>
    
    <div className="hidden lg:flex absolute bottom-40 right-8 xl:right-12 z-10">
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-sm text-xs font-medium text-slate-700 dark:text-zinc-300 backdrop-blur-sm">
        <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
        <span>HIPAA Compliant</span>
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
        <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">Join the Network</span>
      </div>
      <h1 className="text-3xl lg:text-4xl font-heading font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
       {role === "patient" ? (
         <>Your Health, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-sky-600 to-emerald-500 dark:from-sky-300 dark:to-emerald-300">Decoded by AI.</span></>
       ) : (
         <>Empowering <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-sky-600 to-emerald-500 dark:from-sky-300 dark:to-emerald-300">Healthcare Providers.</span></>
       )}
      </h1>
      <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed font-normal max-w-sm">
       {role === "patient" 
         ? "Create your secure patient account to access personalized health timelines and AI insights." 
         : "Join the CareFlow network to securely access patient records, prescribe medications, and review labs."}
      </p>
     </div>
    </div>
    
    <div className="relative z-20 flex items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-zinc-400 bg-slate-100/80 dark:bg-zinc-900/80 w-fit px-4 py-2 rounded-xl border border-slate-200/70 dark:border-zinc-800">
      <ShieldCheck className="w-4 h-4 text-emerald-500" />
      <span>Enterprise Grade Security & HIPAA Compliant</span>
    </div>
   </div>

   {/* RIGHT SIDE - HANDCRAFTED COMPACT FORM */}
   <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative bg-slate-50/50 dark:bg-black overflow-y-auto">
    
    <div className="w-full max-w-[480px] relative z-10 py-6">
     
     {/* Card Container */}
     <div className="bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800/90 p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
       
       <div className="mb-5">
        <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Create an Account</h2>
        <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Join CareFlow to get started</p>
       </div>

       {/* Compact Role Selector */}
       <div className="flex p-1 mb-5 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200/70 dark:border-zinc-800 relative">
        <div 
         className="absolute inset-y-1 w-[calc(50%-4px)] bg-white dark:bg-zinc-800 rounded-lg shadow-sm transition-all duration-200"
         style={{ left: role === 'patient' ? '4px' : 'calc(50%)' }}
        />
        <button
         type="button"
         onClick={() => setRole("patient")}
         className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition duration-150 relative z-10 ${
          role === "patient" ? "text-sky-600 dark:text-sky-400 font-bold" : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
         }`}
        >
         <UserCircle2 className="w-3.5 h-3.5" /> Patient
        </button>
        <button
         type="button"
         onClick={() => setRole("doctor")}
         className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition duration-150 relative z-10 ${
          role === "doctor" ? "text-sky-600 dark:text-sky-400 font-bold" : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
         }`}
        >
         <Stethoscope className="w-3.5 h-3.5" /> Doctor
        </button>
       </div>

       <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        
        {/* Grid for Name and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
           <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Full Name</label>
           <input
            placeholder={role === "doctor" ? "e.g. Dr. Rajesh Sharma" : "e.g. Rajesh Sharma"}
            className={`w-full h-10.5 px-3.5 rounded-lg border text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none transition duration-150 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
             errors.name 
              ? "border-red-400 bg-red-50/40 dark:bg-red-950/20 focus:border-red-500 focus:ring-red-500/20" 
              : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-slate-300 dark:hover:border-zinc-700"
            }`}
            {...register("name", { 
             required: "Name is required",
             pattern: { value: /^[A-Za-z\s]+$/, message: "Letters and spaces only" },
             minLength: { value: 2, message: "Minimum 2 characters" },
             maxLength: { value: 50, message: "Maximum 50 characters" }
            })}
           />
           {errors.name && <p className="flex items-center gap-1 text-xs font-medium text-red-500 mt-1"><AlertCircle className="h-3 w-3 shrink-0" />{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
           <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Email Address</label>
           <div className="relative">
             <input
              type="email"
              placeholder="you@email.com"
              className={`w-full h-10.5 px-3.5 rounded-lg border text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none transition duration-150 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
               errors.email 
                ? "border-red-400 bg-red-50/40 dark:bg-red-950/20 focus:border-red-500 focus:ring-red-500/20" 
                : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-slate-300 dark:hover:border-zinc-700"
              }`}
              {...register("email", { 
               required: "Email is required", 
               pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" } 
              })}
             />
             {!errors.email && touchedFields.email && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailValue) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
               <CheckCircle size={15} />
              </div>
             )}
           </div>
           {errors.email && <p className="flex items-center gap-1 text-xs font-medium text-red-500 mt-1"><AlertCircle className="h-3 w-3 shrink-0" />{errors.email.message}</p>}
          </div>
        </div>

        {/* Optional Gender for Auto-Avatar */}
        <div className="space-y-1.5">
         <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Gender (for avatar portrait)</label>
         <div className="relative">
          <select
           className="w-full h-10.5 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition duration-150 appearance-none cursor-pointer"
           {...register("gender")}
          >
           <option value="">Select gender (optional)</option>
           <option value="female">Female</option>
           <option value="male">Male</option>
           <option value="other">Other / Non-binary</option>
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
           <ChevronRight className="w-3.5 h-3.5 rotate-90" />
          </div>
         </div>
        </div>

        {/* Grid for Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
           <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Password</label>
           <div className="relative">
            <input
             type={showPassword ? "text" : "password"}
             placeholder="••••••••"
             onKeyUp={checkCapsLock}
             onKeyDown={checkCapsLock}
             onFocus={checkCapsLock}
             className={`w-full h-10.5 pl-3.5 pr-10 rounded-lg border text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none transition duration-150 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
              errors.password 
               ? "border-red-400 bg-red-50/40 dark:bg-red-950/20 focus:border-red-500 focus:ring-red-500/20" 
               : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-slate-300 dark:hover:border-zinc-700"
             }`}
             {...register("password", { 
              required: "Password required", 
              minLength: { value: 8, message: "Min 8 characters" },
              pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-#])[A-Za-z\d@$!%*?&\-#]{8,}$/, message: "Must include uppercase, number, symbol" }
             })}
            />
            {capsLock && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2 text-amber-500" title="Caps Lock is ON">
               <ArrowUpCircle size={15} />
              </div>
             )}
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors rounded">
             {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
           </div>
           {errors.password && <p className="flex items-center gap-1 text-xs font-medium text-red-500 mt-1"><AlertCircle className="h-3 w-3 shrink-0" />{errors.password.message}</p>}
           <PasswordStrength password={passwordValue} />
          </div>

          <div className="space-y-1.5">
           <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Confirm Password</label>
           <div className="relative">
            <input
             type={showConfirmPassword ? "text" : "password"}
             placeholder="••••••••"
             className={`w-full h-10.5 pl-3.5 pr-10 rounded-lg border text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none transition duration-150 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
              errors.confirmPassword 
               ? "border-red-400 bg-red-50/40 dark:bg-red-950/20 focus:border-red-500 focus:ring-red-500/20" 
               : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-slate-300 dark:hover:border-zinc-700"
             }`}
             {...register("confirmPassword", { required: "Required", validate: (val) => val === passwordValue || "Passwords mismatch" })}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors rounded">
             {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
           </div>
           {errors.confirmPassword && <p className="flex items-center gap-1 text-xs font-medium text-red-500 mt-1"><AlertCircle className="h-3 w-3 shrink-0" />{errors.confirmPassword.message}</p>}
          </div>
        </div>

        {/* Doctor Extra Fields (Animated Collapse) */}
        <div className={`grid grid-cols-1 gap-3.5 overflow-hidden transition-all duration-300 ease-in-out ${role === "doctor" ? "max-h-[300px] opacity-100 pt-1" : "max-h-0 opacity-0"}`}>
         <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">NMC Registration Number</label>
          <input
           placeholder="e.g. 12345"
           className={`w-full h-10.5 px-3.5 rounded-lg border text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none transition duration-150 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
            errors.nmcRegistrationNumber 
             ? "border-red-400 bg-red-50/40 dark:bg-red-950/20 focus:border-red-500 focus:ring-red-500/20" 
             : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-slate-300 dark:hover:border-zinc-700"
           }`}
           {...register("nmcRegistrationNumber", { 
            required: role === "doctor" ? "Required for doctors" : false,
            pattern: { value: /^[A-Z0-9-]+$/i, message: "Alphanumeric and hyphens only" },
            minLength: { value: 4, message: "Min 4 characters" },
            maxLength: { value: 20, message: "Max 20 characters" }
           })}
          />
          {errors.nmcRegistrationNumber && <p className="flex items-center gap-1 text-xs font-medium text-red-500 mt-1"><AlertCircle className="h-3 w-3 shrink-0" />{errors.nmcRegistrationNumber.message}</p>}
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
           <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Medical Council</label>
            <input
             placeholder="e.g. SMC"
             className={`w-full h-10.5 px-3.5 rounded-lg border text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none transition duration-150 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
              errors.medicalCouncil 
               ? "border-red-400 bg-red-50/40 dark:bg-red-950/20 focus:border-red-500 focus:ring-red-500/20" 
               : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-slate-300 dark:hover:border-zinc-700"
             }`}
             {...register("medicalCouncil", { 
              required: role === "doctor" ? "Required" : false,
              pattern: { value: /^[A-Za-z\s]+$/, message: "Letters and spaces only" },
              minLength: { value: 2, message: "Min 2 characters" },
              maxLength: { value: 50, message: "Max 50 characters" }
             })}
            />
            {errors.medicalCouncil && <p className="flex items-center gap-1 text-xs font-medium text-red-500 mt-1"><AlertCircle className="h-3 w-3 shrink-0" />{errors.medicalCouncil.message}</p>}
           </div>
           <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Degree</label>
            <input
             placeholder="e.g. MBBS, MD"
             className={`w-full h-10.5 px-3.5 rounded-lg border text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none transition duration-150 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
              errors.qualificationDegree 
               ? "border-red-400 bg-red-50/40 dark:bg-red-950/20 focus:border-red-500 focus:ring-red-500/20" 
               : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-slate-300 dark:hover:border-zinc-700"
             }`}
             {...register("qualificationDegree", { 
              required: role === "doctor" ? "Required" : false,
              pattern: { value: /^[A-Za-z.,\s-]+$/, message: "Letters, dots, commas only" },
              minLength: { value: 2, message: "Min 2 characters" }
             })}
            />
            {errors.qualificationDegree && <p className="flex items-center gap-1 text-xs font-medium text-red-500 mt-1"><AlertCircle className="h-3 w-3 shrink-0" />{errors.qualificationDegree.message}</p>}
           </div>
         </div>
        </div>

        <div className="flex items-start gap-2.5 pt-1">
         <input
          type="checkbox"
          id="terms"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-zinc-700 text-sky-600 focus:ring-sky-500/30 cursor-pointer"
          {...register("terms", { required: "You must accept the terms" })}
         />
         <label htmlFor="terms" className="text-xs text-slate-600 dark:text-zinc-400 cursor-pointer leading-tight">
          I agree to CareFlow's <Link href="#" className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">Terms of Service</Link> and <Link href="#" className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">Privacy Policy</Link>.
         </label>
        </div>
        {errors.terms && <p className="text-xs text-red-500 font-medium ml-1">{errors.terms.message}</p>}

        <button
         type="submit"
         disabled={isLoading}
         className="w-full h-10.5 mt-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm text-sm"
        >
         {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account <ChevronRight className="h-4 w-4" /></>}
        </button>
       </form>
     </div>

     <div className="mt-5 text-center">
      <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
       Already have an account?{" "}
       <Link href={role === "patient" ? "/login" : "/doctor/login"} className="text-sky-600 dark:text-sky-400 font-medium hover:underline ml-0.5">
        Sign in here &rarr;
       </Link>
      </p>
     </div>
    </div>
   </div>
  </div>
 )
}

export default function RegisterPage() {
 return (
  <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>}>
   <RegisterContent />
  </Suspense>
 )
}

