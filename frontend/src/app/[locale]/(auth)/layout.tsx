"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "@/i18n/routing"
import { useEffect } from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const router = useRouter()

  useEffect(() => {
    if (hasHydrated && user) {
      if (user.role === "doctor") {
        router.replace("/doctor/dashboard")
      } else {
        router.replace("/dashboard")
      }
    }
  }, [user, hasHydrated, router])

  // Optional: Prevent flashing the login screen while redirecting back
  if (hasHydrated && user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#F8FAFC] flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-[440px] mb-8 flex items-center justify-center">
        <Link 
          href="/"
          className="flex items-center gap-3 hover:scale-105 active:scale-95 transition-transform duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl p-2"
        >
          <Image 
            src="/favicon.svg" 
            alt="CareFlow AI Logo" 
            width={40} 
            height={40} 
            className="h-10 w-10"
            priority
          />
          <span className="font-brand text-3xl font-bold text-slate-900 tracking-tight">
            CareFlow <span className="text-sky-500">AI</span>
          </span>
        </Link>
      </div>
      {children}
    </div>
  )
}
