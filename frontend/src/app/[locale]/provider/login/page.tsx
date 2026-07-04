"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "@/i18n/routing"
import { Link } from "@/i18n/routing"
import { Eye, EyeOff, Loader2, AlertCircle, Stethoscope, Lock } from "lucide-react"
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

      setAuth(access_token, user)
      toast.success("Successfully logged into Provider Portal!")
      
      router.push("/provider/dashboard")
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row relative">
      <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center rounded-2xl mb-6 shadow-sm border border-sky-200/50 dark:border-sky-800/50">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
              Provider Portal
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Securely access patient records, review lab reports, and manage CareFlow prescriptions.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/50 dark:border-red-900/50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    type="email"
                    placeholder="doctor@hospital.com"
                    className="input-base pl-4 pr-4"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-medium text-red-500 mt-1">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    {...register("password", { required: "Password is required" })}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="input-base pl-11 pr-12 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-red-500 mt-1">
                    {errors.password.message as string}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-glow bg-sky-500 hover:bg-sky-600 text-white font-semibold h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In securely"
              )}
            </button>
          </form>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-500 hover:text-sky-600 transition-colors"
            >
              ← Back to Patient Portal
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:flex md:w-1/2 bg-sky-600 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10 text-center px-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-md mb-8 border border-white/20">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-heading font-bold text-white mb-6">
            CareFlow for Providers
          </h2>
          <p className="text-lg text-sky-100/90 font-medium leading-relaxed max-w-lg mx-auto">
            Empowering doctors with AI-summarized insights, automated adherence tracking, and seamless patient communication.
          </p>
        </div>
      </div>
    </div>
  )
}
