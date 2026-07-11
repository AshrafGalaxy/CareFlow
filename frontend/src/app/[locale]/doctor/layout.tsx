"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "@/i18n/routing"
import { Loader2, LogOut, ChevronLeft } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { DoctorSidebar } from "@/components/layout/DoctorSidebar"
import { DoctorTopNav } from "@/components/layout/DoctorTopNav"

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
 const user = useAuthStore((state) => state.user)
 const token = useAuthStore((state) => state.token)
 const hasHydrated = useAuthStore((state) => state._hasHydrated)
 const logout = useAuthStore((state) => state.logout)
 const router = useRouter()
 const pathname = usePathname()

 const isDetailPage = pathname.includes("/patients/")

 useEffect(() => {
  if (!hasHydrated) return
  const isLoginPage = pathname.endsWith("/doctor/login")
  
  if (!token) {
   if (!isLoginPage) {
    router.replace("/doctor/login")
   }
  } else if (user?.role !== "provider" && user?.role !== "doctor" && user?.role !== "admin") {
   router.replace("/dashboard")
  }
 }, [user, token, hasHydrated, router, pathname])

 const handleLogout = async () => {
  const { useNotificationStore } = await import('@/store/notificationStore')
  // saveAndEject writes current notifications to user's personal localStorage key
  // then clears in-memory state. Data is preserved for next login.
  useNotificationStore.getState().saveAndEject()
  logout()
  const { toast } = await import('sonner')
  toast.success("Signed Out", {
   description: "You have securely exited the clinical portal.",
   duration: 3000,
   icon: <LogOut className="w-5 h-5 text-sky-500" />
  })
  router.replace("/doctor/login")
 }

 // Show full-page spinner while Zustand rehydrates from localStorage
 if (!hasHydrated) {
  return (
   <div className="min-h-screen bg-slate-50 dark:bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
     <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
     <p className="text-sm text-slate-500 dark:text-slate-400">Loading CareFlow AI...</p>
    </div>
   </div>
  )
 }

 if (pathname.endsWith("/doctor/login")) {
  return (
   <div className="font-sans">
    <ErrorBoundary>{children}</ErrorBoundary>
   </div>
  )
 }

 if (!token || (user?.role !== "provider" && user?.role !== "doctor" && user?.role !== "admin")) return null

  return (
   <div className="flex h-screen overflow-hidden bg-background">
    <DoctorSidebar />
    <div className="flex-1 flex flex-col min-w-0 h-screen">
     <DoctorTopNav />
     <main className="flex-1 flex flex-col p-6 pb-24 md:pb-6 overflow-y-auto">
      <ErrorBoundary>{children}</ErrorBoundary>
     </main>
    </div>
   </div>
  )
}
