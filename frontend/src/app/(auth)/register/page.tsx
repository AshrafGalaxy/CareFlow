"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, AlertCircle, UserCircle2, Stethoscope } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { API_ROUTES, APP_ROUTES } from "@/lib/constants"

type FormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
  terms: boolean
}

// ── Password Strength Meter ────────────────────────────────
function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
  textColor: string
} {
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
              i <= score ? color : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColor}`}>{label} password</p>
    </div>
  )
}

// ── Register Page ──────────────────────────────────────────
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [role, setRole] = useState<"patient" | "doctor">("patient")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ mode: "onBlur" })

  const passwordValue = watch("password", "")

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await api.post(API_ROUTES.AUTH.REGISTER, {
        name: data.name,
        email: data.email,
        password: data.password,
        role,
      })
      const loginRes = await api.post(API_ROUTES.AUTH.LOGIN, {
        email: data.email,
        password: data.password,
      })
      setAuth(loginRes.data.user, loginRes.data.access_token, loginRes.data.refresh_token)
      toast.success("Account created! Welcome to CareFlow AI.")
      router.push(APP_ROUTES.DASHBOARD)
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to sign in. Please check your credentials and try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[440px]">


      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 mb-1.5">Create your account</h1>
          <p className="text-sm text-slate-500">
            Join thousands of patients managing their health
          </p>
        </div>

        {/* Role Selector */}
        <div
          role="group"
          aria-label="Account type"
          className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-6"
        >
          <button
            type="button"
            aria-pressed={role === "patient"}
            onClick={() => setRole("patient")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              role === "patient"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <UserCircle2 className="h-4 w-4" />
            Patient
          </button>
          <button
            type="button"
            aria-pressed={role === "doctor"}
            onClick={() => setRole("doctor")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              role === "doctor"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Stethoscope className="h-4 w-4" />
            Doctor / Provider
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Priya Sharma"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={`w-full h-12 px-4 rounded-lg border text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                errors.name ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
              }`}
              {...register("name", {
                required: "Full name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
                pattern: {
                  value: /^[a-zA-Z\s'-]+$/,
                  message: "Name can only contain letters and spaces",
                },
              })}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "reg-email-error" : undefined}
              className={`w-full h-12 px-4 rounded-lg border text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                errors.email ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
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
              <p id="reg-email-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                aria-invalid={!!errors.password}
                aria-describedby="password-hint reg-password-error"
                className={`w-full h-12 px-4 pr-12 rounded-lg border text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                  errors.password ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                }`}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Minimum 8 characters required" },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p id="password-hint" className="text-xs text-slate-400">
              Use 8+ characters, uppercase, numbers, and symbols for a strong password
            </p>
            {errors.password && (
              <p id="reg-password-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.password.message}
              </p>
            )}
            <PasswordStrength password={passwordValue} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                className={`w-full h-12 px-4 pr-12 rounded-lg border text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                  errors.confirmPassword ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                }`}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === passwordValue || "Passwords do not match",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirm-password-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="pt-1">
            <label htmlFor="terms" className="flex items-start gap-3 cursor-pointer group">
              <input
                id="terms"
                type="checkbox"
                aria-describedby={errors.terms ? "terms-error" : undefined}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 cursor-pointer shrink-0"
                {...register("terms", {
                  required: "You must accept the Terms of Service to continue",
                })}
              />
              <span className="text-xs text-slate-500 leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-sky-500 hover:text-sky-600 font-medium underline-offset-2 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-sky-500 hover:text-sky-600 font-medium underline-offset-2 hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.terms && (
              <p id="terms-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.terms.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-glow w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href={APP_ROUTES.LOGIN}
            className="text-sky-500 font-semibold hover:text-sky-600 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
