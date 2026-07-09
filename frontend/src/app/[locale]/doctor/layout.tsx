"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "@/i18n/routing"
import { Loader2, LogOut, ChevronLeft } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Button } from "@/components/ui/button"

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
  } else if (user?.role !== "provider" && user?.role !== "admin") {
   router.replace("/dashboard")
  }
 }, [user, token, hasHydrated, router, pathname])

 const handleLogout = async () => {
  const store = (await import('@/store/notificationStore')).useNotificationStore.getState()
  store.addNotification({
   title: "Securely Signed Out",
   message: "You have been logged out of the Provider Portal.",
   type: "info"
  })

  logout()
  const { toast } = await import('sonner')
  const { LogOut } = await import('lucide-react')
  toast.success(
   <div className="flex flex-col gap-1">
    <span className="font-heading font-bold text-foreground">Signed Out</span>
    <span className="text-sm text-muted-foreground">You have securely exited the clinical portal.</span>
   </div>,
   {
    icon: <div className="h-8 w-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center shadow-inner"><LogOut className="h-4 w-4" /></div>,
    duration: 3000,
   }
  )
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

 if (!token || (user?.role !== "provider" && user?.role !== "admin")) return null

 return (
  <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-background font-sans">
   {/* Header */}
   <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-card flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
    <div className="flex items-center gap-6">
     <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/doctor/dashboard")}>
      <span className="font-brand text-xl font-bold text-foreground tracking-tight">
       CareFlow <span className="text-sky-500">AI</span> <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded ml-1">Doctor Portal</span>
      </span>
     </div>

     {isDetailPage && (
      <Button
       variant="ghost"
       size="sm"
       onClick={() => router.push("/doctor/dashboard")}
       className="text-slate-600 dark:text-slate-400 hover:text-foreground flex items-center gap-1.5"
      >
       <ChevronLeft className="h-4 w-4" />
       <span>Back to Dashboard</span>
      </Button>
     )}
    </div>

    <div className="flex items-center gap-4">
     <div className="text-right hidden sm:block">
      <p className="text-sm font-semibold text-foreground">{user?.name}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
     </div>

     <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="flex items-center gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-foreground transition-colors"
     >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
     </Button>
    </div>
   </header>

   {/* Content Area */}
   <main className="flex-1 p-6 overflow-auto max-w-7xl w-full mx-auto">
    <ErrorBoundary>{children}</ErrorBoundary>
   </main>
  </div>
 )
}
