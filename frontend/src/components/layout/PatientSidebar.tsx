"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { usePathname } from "@/i18n/routing"
import {
 LayoutDashboard, FileText, MessageSquare, Pill, Shield, Clock, LogOut, Settings,
} from "lucide-react"
import { getInitials } from "@/lib/formatters"
import { useAuthStore } from "@/store/authStore"
import { cn } from "@/lib/utils"

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
 { name: "Settings", href: "/profile", icon: Settings },
]

import { toast } from "sonner"

export function PatientSidebar() {
 const pathname = usePathname()
 const logout = useAuthStore((state) => state.logout)
 const user = useAuthStore((state) => state.user)
 const t = useTranslations("Navigation")
 const navItems = getNavItems(t)

 const initials = getInitials(user?.name)

 const handleLogout = () => {
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
  <div className="hidden md:flex flex-col w-64 border-r border-border bg-card min-h-screen shrink-0">
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
   <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
    {navItems.map((item) => {
     const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
     return (
      <Link
       key={item.name}
       href={item.href}
       className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        isActive
         ? "bg-primary/10 text-primary dark:text-sky-400"
         : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
       )}
      >
       <item.icon className="h-4 w-4 shrink-0" />
       <span>{item.name}</span>
      </Link>
     )
    })}
   </nav>

   {/* User Block */}
   <div className="border-t border-border p-4">
    <div className="flex items-center gap-3 px-2 mb-4">
     <div className="h-9 w-9 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
      {initials}
     </div>
     <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">{user?.name || "User"}</p>
      <p className="text-xs text-muted-foreground capitalize">{user?.role || "Patient"}</p>
     </div>
    </div>
    
    {/* FOOTER */}
    <div className="space-y-1">
     {bottomNavItems.map((item) => (
      <Link
       key={item.name}
       href={item.href}
       className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        pathname.includes(item.href)
         ? "bg-primary/10 text-primary dark:text-sky-400"
         : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
       )}
      >
       <item.icon className="h-4 w-4 shrink-0" />
       <span>{item.name}</span>
      </Link>
     ))}
     <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
     >
      <LogOut className="h-4 w-4 shrink-0" />
      <span>Sign Out</span>
     </button>
    </div>
   </div>
  </div>
 )
}
