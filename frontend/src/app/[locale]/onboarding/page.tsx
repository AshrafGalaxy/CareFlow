"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "@/i18n/routing"
import { APP_ROUTES } from "@/lib/constants"
import { useAuthStore } from "@/store/authStore"
import { Loader2, ArrowRight, ShieldCheck, HeartPulse } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"

type OnboardingData = {
 abha_id: string
 state_residence: string
 preferred_locale: string
 blood_group: string
 date_of_birth: string
 emergency_contact_name: string
 emergency_contact_phone: string
}

export default function OnboardingPage() {
 const router = useRouter()
 const user = useAuthStore((state) => state.user)
 const [isLoading, setIsLoading] = useState(false)
 
 const { register, handleSubmit, formState: { errors } } = useForm<OnboardingData>({
  defaultValues: {
   preferred_locale: "en",
  }
 })

 const onSubmit = async (data: OnboardingData) => {
  setIsLoading(true)
  try {
   await api.patch("/api/auth/profile", data)
   toast.success("Profile setup complete!")
   router.push(APP_ROUTES.DASHBOARD)
  } catch (error) {
   toast.error("Failed to save profile. You can complete this later.")
  } finally {
   setIsLoading(false)
  }
 }

 const handleSkip = () => {
  router.push(APP_ROUTES.DASHBOARD)
 }

 return (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
   <div className="w-full max-w-3xl bg-card rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row">
    
    {/* Left Branding Panel */}
    <div className="hidden md:flex flex-col bg-sky-500 dark:bg-sky-600 w-1/3 p-8 text-white justify-between relative overflow-hidden">
     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
     <div className="relative z-10 space-y-4">
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
       <HeartPulse className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-2xl font-bold leading-tight">Complete Your Health Profile</h2>
      <p className="text-sky-100 text-sm opacity-90">
       Adding your localized identification and baseline health metrics allows CareFlow AI to personalize your care.
      </p>
     </div>
     <div className="relative z-10 flex items-center gap-2 text-sm font-medium text-sky-100">
      <ShieldCheck className="h-4 w-4" />
      Secure & Private
     </div>
    </div>

    {/* Right Form Panel */}
    <div className="flex-1 p-8 md:p-10">
     <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name || "Patient"}!</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Let's set up your profile for a localized experience.</p>
     </div>

     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {/* ABHA ID */}
       <div className="space-y-1.5 md:col-span-2">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
         ABHA Health ID (Optional)
        </label>
        <input
         type="text"
         placeholder="14-digit ABHA ID"
         className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-background text-sm outline-none focus:border-sky-500"
         {...register("abha_id")}
        />
       </div>

       {/* DOB */}
       <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
         Date of Birth
        </label>
        <input
         type="date"
         className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-background text-sm outline-none focus:border-sky-500"
         {...register("date_of_birth")}
        />
       </div>

       {/* Blood Group */}
       <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
         Blood Group
        </label>
        <select
         className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-background text-sm outline-none focus:border-sky-500"
         {...register("blood_group")}
        >
         <option value="">Select...</option>
         <option value="A+">A+</option>
         <option value="A-">A-</option>
         <option value="B+">B+</option>
         <option value="B-">B-</option>
         <option value="AB+">AB+</option>
         <option value="AB-">AB-</option>
         <option value="O+">O+</option>
         <option value="O-">O-</option>
        </select>
       </div>

       {/* State */}
       <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
         State of Residence
        </label>
        <input
         type="text"
         placeholder="e.g. Maharashtra"
         className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-background text-sm outline-none focus:border-sky-500"
         {...register("state_residence")}
        />
       </div>

       {/* Locale */}
       <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
         Preferred Language
        </label>
        <select
         className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-background text-sm outline-none focus:border-sky-500"
         {...register("preferred_locale")}
        >
         <option value="en">English</option>
         <option value="hi">Hindi (हिंदी)</option>
         <option value="mr">Marathi (मराठी)</option>
         <option value="bn">Bengali (বাংলা)</option>
         <option value="gu">Gujarati (ગુજરાતી)</option>
         <option value="ur">Urdu (اردو)</option>
        </select>
       </div>

       {/* Emergency Contact */}
       <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
         Emergency Contact Name
        </label>
        <input
         type="text"
         className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-background text-sm outline-none focus:border-sky-500"
         {...register("emergency_contact_name")}
        />
       </div>
       <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
         Emergency Phone
        </label>
        <input
         type="tel"
         className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-background text-sm outline-none focus:border-sky-500"
         {...register("emergency_contact_phone")}
        />
       </div>
      </div>

      <div className="pt-6 flex items-center justify-between">
       <button
        type="button"
        onClick={handleSkip}
        className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
       >
        Skip for now
       </button>
       <button
        type="submit"
        disabled={isLoading}
        className="btn-glow bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-sm px-6 py-2.5 flex items-center gap-2 disabled:opacity-60 transition-colors"
       >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Continue"}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
       </button>
      </div>
     </form>
    </div>
   </div>
  </div>
 )
}
