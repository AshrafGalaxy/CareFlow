"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "@/i18n/routing"
import { Link } from "@/i18n/routing"
import { Eye, EyeOff, Loader2, AlertCircle, Info, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { API_ROUTES, APP_ROUTES } from "@/lib/constants"

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
  <div className="w-full max-w-[440px]">


   {/* Card */}
   <div className="bg-card rounded-2xl shadow-lg border border-border p-10">
    <div className="mb-8">
     <h1 className="text-2xl font-semibold text-foreground mb-1.5">Welcome back</h1>
     <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
    </div>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
     {/* Email */}
     <div className="space-y-1.5">
      <label
       htmlFor="email"
       className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
      >
       Email Address
      </label>
      <input
       id="email"
       type="email"
       autoComplete="email"
       placeholder="you@example.com"
       aria-invalid={!!errors.email}
       aria-describedby={errors.email ? "email-error" : undefined}
       className={`w-full h-12 px-4 rounded-lg border text-foreground text-sm placeholder:text-muted-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
        errors.email ? "border-red-400 bg-red-50 dark:bg-red-950/50" : "border-border bg-card"
       }`}
       {...register("email", {
        required: "Email is required",
        pattern: {
         value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
         message: "Enter a valid email address",
        },
       })}
      />
      {errors.email && (
       <p id="email-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-500">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {errors.email.message}
       </p>
      )}
     </div>

     {/* Password */}
     <div className="space-y-1.5">
      <div className="flex items-center justify-between">
       <label
        htmlFor="password"
        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
       >
        Password
       </label>
       <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
        tabIndex={-1}
       >
        {showPassword ? "Hide" : "Show"}
       </button>
      </div>
      <div className="relative">
       <input
        id="password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="••••••••"
        aria-invalid={!!errors.password}
        aria-describedby={errors.password ? "password-error" : undefined}
        className={`w-full h-12 px-4 rounded-lg border text-foreground text-sm placeholder:text-muted-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
         errors.password ? "border-red-400 bg-red-50 dark:bg-red-950/50" : "border-border bg-card"
        }`}
        {...register("password", { required: "Password is required" })}
       />
      </div>
      {errors.password && (
       <p id="password-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-500">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {errors.password.message}
       </p>
      )}
     </div>

     {/* Forgot Password */}
     <div className="flex justify-end pt-1">
      <Link href="#" className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors">
       Forgot password?
      </Link>
     </div>

     {/* Submit */}
     <button
      type="submit"
      disabled={isLoading}
      className="w-full h-12 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
     >
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in to Dashboard"}
     </button>
    </form>

    {/* Info box */}
    <div className="mt-8 bg-muted rounded-xl p-4 flex items-start gap-3 border border-border">
     <Info className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
     <div className="text-sm text-muted-foreground">
      <p className="font-medium text-foreground mb-1">Demo Accounts Available</p>
      <p>You can create a new account via the Register page to test the flow.</p>
     </div>
    </div>

    {/* Footer Link */}
    <p className="mt-8 text-center text-sm text-muted-foreground">
     Don&apos;t have an account?{" "}
     <Link
      href={APP_ROUTES.REGISTER}
      className="font-semibold text-sky-600 hover:text-sky-700 transition-colors"
     >
      Create an account
     </Link>
    </p>
   </div>
  </div>
 )
}
