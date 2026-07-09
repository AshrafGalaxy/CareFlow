"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { usePathname } from "@/i18n/routing"
import {
 LayoutDashboard, FileText, MessageSquare, Pill, Shield, Clock, LogOut, Settings, User
} from "lucide-react"
import { getInitials } from "@/lib/formatters"
import { useAuthStore } from "@/store/authStore"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

import { useTranslations } from "next-intl"

const getNavItems = (t: (key: string) => string) => [
 { name: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
 { name: t("reports"), href: "/reports", icon: FileText },
 { name: t("chat"), href: "/chat", icon: MessageSquare },
 { name: t("medications"), href: "/medications", icon: Pill },
 { name: t("insurance"), href: "/insurance", icon: Shield },
 { name: "My Timeline", href: "/timeline", icon: Clock },
]

const bottomNavItems = [
 { name: "Settings", href: "/settings", icon: Settings },
 { name: "Profile", href: "/profile", icon: User },
]

import { toast } from "sonner"

export function PatientSidebar() {
 const pathname = usePathname()
 const logout = useAuthStore((state) => state.logout)
 const user = useAuthStore((state) => state.user)
 const t = useTranslations("Navigation")
 const navItems = getNavItems(t)

 const initials = getInitials(user?.name)

 const handleLogout = async () => {
  // SECURITY: Purge all notifications before clearing auth so no data
  // bleeds into a future session (different user, same device).
  const { useNotificationStore } = await import('@/store/notificationStore')
  useNotificationStore.getState().purgeForUser()
  logout()
  toast.success(
   <div className="flex flex-col gap-1">
    <span className="font-heading font-bold text-foreground">Signed Out</span>
    <span className="text-sm text-muted-foreground">You have been securely logged out.</span>
   </div>,
   {
    icon: <div className="h-8 w-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center shadow-inner"><LogOut className="h-4 w-4" /></div>,
    duration: 3000,
   }
  )
  window.location.href = "/login"
 }

 return (
  <div className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen shrink-0">
   {/* Brand */}
   <div className="flex items-center gap-2 p-5 border-b border-border bg-card">
    <Image 
     src="/favicon.svg" 
     alt="CareFlow Logo" 
     width={32} 
     height={32} 
     className="h-8 w-8"
     priority
    />
    <span className="font-brand text-xl font-bold text-foreground tracking-tight">CareFlow <span className="text-sky-500">AI</span></span>
   </div>

   {/* Nav Items */}
   <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto" aria-label="Main navigation">
    {navItems.map((item) => {
     const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
     return (
      <Link
       key={item.name}
       href={item.href}
       className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
        isActive
         ? "text-primary dark:text-sky-400"
         : "text-muted-foreground hover:text-foreground"
       )}
      >
       {isActive && (
        <motion.div
         layoutId="sidebar-active-indicator"
         className="absolute inset-0 bg-primary/10 dark:bg-sky-500/15 rounded-xl"
         initial={false}
         transition={{ type: "spring", stiffness: 400, damping: 35 }}
        />
       )}
       {/* Subtle hover background for inactive items */}
       {!isActive && (
        <div className="absolute inset-0 bg-muted/0 group-hover:bg-muted/60 rounded-xl transition-colors duration-300" />
       )}
       <item.icon className="h-[18px] w-[18px] shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" />
       <span className="relative z-10">{item.name}</span>
      </Link>
     )
    })}
   </nav>

   {/* User Block */}
   <div className="border-t border-border p-4 bg-muted/20">
    <div className="flex items-center gap-3 px-2 mb-4">
     <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
      {initials}
     </div>
     <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">{user?.name || "User"}</p>
      <p className="text-xs text-muted-foreground capitalize font-medium mt-0.5">{user?.role || "Patient"}</p>
     </div>
    </div>
    
    {/* FOOTER */}
    <div className="space-y-1.5">
     {bottomNavItems.map((item) => {
      const isActive = pathname.includes(item.href)
      return (
       <Link
        key={item.name}
        href={item.href}
        className={cn(
         "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
         isActive
          ? "text-primary dark:text-sky-400"
          : "text-muted-foreground hover:text-foreground"
        )}
       >
        {isActive && (
         <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute inset-0 bg-primary/10 dark:bg-sky-500/15 rounded-xl"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
         />
        )}
        {!isActive && (
         <div className="absolute inset-0 bg-muted/0 group-hover:bg-muted/60 rounded-xl transition-colors duration-300" />
        )}
        <item.icon className="h-[18px] w-[18px] shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" />
        <span className="relative z-10">{item.name}</span>
       </Link>
      )
     })}
     <button
      onClick={handleLogout}
      className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground group transition-all duration-300"
     >
      <div className="absolute inset-0 bg-destructive/0 group-hover:bg-destructive/10 rounded-xl transition-colors duration-300" />
      <LogOut className="h-[18px] w-[18px] shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110 group-active:scale-95 group-hover:text-destructive" />
      <span className="relative z-10 group-hover:text-destructive transition-colors duration-300">Sign Out</span>
     </button>
    </div>
   </div>
  </div>
 )
}
