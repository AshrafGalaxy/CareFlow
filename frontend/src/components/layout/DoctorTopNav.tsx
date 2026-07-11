"use client"

import { LogOut, ChevronLeft } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useRouter, usePathname } from "@/i18n/routing"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { getInitials } from "@/lib/formatters"

export function DoctorTopNav() {
 const user = useAuthStore((state) => state.user)
 const logout = useAuthStore((state) => state.logout)
 const router = useRouter()
 const pathname = usePathname()

 const initials = getInitials(user?.name)
 const isDetailPage = pathname.includes("/medications/") || pathname.includes("/patients/")

 const handleLogout = () => {
  logout()
  router.push("/doctor/login")
 }

 return (
  <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-card flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm transition-colors duration-300">
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

    {/* Theme Toggle */}
    <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-800/30 p-1 rounded-xl">
     <ThemeToggle />
    </div>

    {/* Avatar / Profile Icon */}
    <div className="h-9 w-9 ml-1 rounded-full bg-gradient-to-tr from-sky-500 to-emerald-400 text-white flex items-center justify-center text-xs font-bold ring-2 ring-sky-100 dark:ring-slate-800 shadow-sm transition-transform hover:scale-105 cursor-default">
     {initials}
    </div>

    <Button
     variant="outline"
     size="sm"
     onClick={handleLogout}
     className="flex items-center gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-foreground transition-colors ml-2"
    >
     <LogOut className="h-4 w-4" />
     <span className="hidden sm:inline">Logout</span>
    </Button>
   </div>
  </header>
 )
}
