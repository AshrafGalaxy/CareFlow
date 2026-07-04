"use client"

import { useEffect } from "react"
import { useRouter } from "@/i18n/routing"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { PatientSidebar } from "@/components/layout/PatientSidebar"
import { TopNav } from "@/components/layout/TopNav"
import { MobileNav } from "@/components/layout/MobileNav"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export default function PatientLayout({ children }: { children: React.ReactNode }) {
 const user = useAuthStore((state) => state.user)
 const token = useAuthStore((state) => state.token)
 const hasHydrated = useAuthStore((state) => state._hasHydrated)
 const router = useRouter()

 // Auth guard — redirect if not authenticated
 useEffect(() => {
  if (!hasHydrated) return
  if (!token) {
   router.replace("/login")
  } else if (user?.role === "doctor") {
   router.replace("/doctor/dashboard")
  }
 }, [user, token, hasHydrated, router])

 // ── Browser History Trap ──────────────────────────────────────────────────
 // Prevent the browser Back/Forward buttons from navigating outside the
 // dashboard when the user is logged in. We push a sentinel entry so every
 // Back press stays inside the app shell. Forward button is neutralised too.
 useEffect(() => {
  if (!token) return

  // Push a sentinel entry so the first Back press doesn't leave
  history.pushState(null, "", window.location.href)

  const handlePopState = () => {
   // Always push forward to cancel the browser navigation
   history.pushState(null, "", window.location.href)
  }

  window.addEventListener("popstate", handlePopState)
  return () => window.removeEventListener("popstate", handlePopState)
 }, [token])

 // Show full-page spinner while Zustand rehydrates from localStorage
 if (!hasHydrated) {
  return (
   <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
     <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
     <p className="text-sm text-muted-foreground">Loading CareFlow AI...</p>
    </div>
   </div>
  )
 }

 if (!token || user?.role === "doctor") return null

 return (
  <div className="flex min-h-screen bg-background">
   <PatientSidebar />
   <div className="flex-1 flex flex-col min-w-0">
    <TopNav />
    <main className="flex-1 p-6 pb-24 md:pb-6 overflow-auto">
     <ErrorBoundary>{children}</ErrorBoundary>
    </main>
   </div>
   <MobileNav />
  </div>
 )
}
