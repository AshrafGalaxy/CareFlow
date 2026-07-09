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
  <div className="font-sans">
   {children}
  </div>
 )
}
