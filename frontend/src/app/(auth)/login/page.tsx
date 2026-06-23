"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-heading font-bold text-slate-900">Login Successful</span>
          <span className="text-sm text-slate-600">Welcome back, {res.data.user.name.split(" ")[0]}! Securing your connection...</span>
        </div>,
        {
          icon: <div className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner"><CheckCircle className="h-4 w-4" /></div>,
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
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-1.5">Welcome back</h1>
          <p className="text-sm text-slate-500">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-slate-600 uppercase tracking-wide"
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
                className="text-xs font-semibold text-slate-600 uppercase tracking-wide"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() =>
                  toast.info("Password reset will be available soon.", {
                    icon: <Info className="h-4 w-4" />,
                  })
                }
                className="text-xs text-sky-500 hover:text-sky-600 font-medium transition-colors"
              >
                Forgot password?
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
                className={`w-full h-12 px-4 pr-12 rounded-lg border text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                  errors.password ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                }`}
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-glow w-full h-12 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href={APP_ROUTES.REGISTER}
            className="text-sky-500 font-semibold hover:text-sky-600 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
