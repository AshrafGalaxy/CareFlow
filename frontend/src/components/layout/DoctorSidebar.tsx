"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { usePathname } from "@/i18n/routing"
import {
 LayoutDashboard, Pill, LogOut, Settings, User, Users, ChevronRight, CalendarDays, PanelLeftClose, PanelLeftOpen
} from "lucide-react"
import { getInitials } from "@/lib/formatters"
import { useAuthStore } from "@/store/authStore"
import { useSidebarStore } from "@/store/sidebarStore"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

const getNavItems = (t: (key: string) => string) => [
 { name: t("dashboard"), href: "/doctor/dashboard", icon: LayoutDashboard },
 { name: "Patient Directory", href: "/doctor/patients", icon: Users },
 { name: "Appointments & Requests", href: "/doctor/appointments", icon: CalendarDays },
 { name: "Clinical Medications", href: "/doctor/medications", icon: Pill },
]

const bottomNavItems = [
 { name: "Settings", href: "/doctor/settings", icon: Settings },
 { name: "Profile", href: "/doctor/profile", icon: User },
]

export function DoctorSidebar() {
 const pathname = usePathname()
 const logout = useAuthStore((state) => state.logout)
 const user = useAuthStore((state) => state.user)
 const { state: sidebarState, toggle: toggleSidebar } = useSidebarStore()
 const t = useTranslations("Navigation")
 const navItems = getNavItems(t)

 const initials = getInitials(user?.name)
 const isCollapsed = sidebarState === 'collapsed'

 const handleLogout = async () => {
  const { useNotificationStore } = await import('@/store/notificationStore')
  useNotificationStore.getState().saveAndEject()
  logout()
  toast.success("Signed Out", {
   description: "You have been securely logged out.",
   duration: 3000,
   icon: <LogOut className="w-5 h-5 text-sky-500" />
  })
  window.location.href = "/doctor/login"
 }

 return (
  <motion.div 
   initial={false}
   animate={{ width: isCollapsed ? 72 : 256 }}
   transition={{ type: "spring", stiffness: 300, damping: 30 }}
   className="hidden md:flex flex-col border-r border-border bg-card h-screen shrink-0 relative z-20"
  >
   {/* ── Brand Header ── */}
   <div className="flex items-center h-[64px] px-4 border-b border-border shrink-0">
    <div className="flex items-center gap-3 flex-1 min-w-0">
     <Image 
      src="/favicon.svg" 
      alt="CareFlow Logo" 
      width={30} 
      height={30} 
      className="h-[30px] w-[30px] shrink-0"
      priority
     />
     <AnimatePresence>
      {!isCollapsed && (
       <motion.span 
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "auto" }}
        exit={{ opacity: 0, width: 0 }}
        transition={{ duration: 0.2 }}
        className="font-brand text-[17px] font-bold text-foreground tracking-tight whitespace-nowrap overflow-hidden"
       >
        CareFlow <span className="text-sky-500">AI</span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded ml-2 align-middle">Doctor</span>
       </motion.span>
      )}
     </AnimatePresence>
    </div>
    {/* Sidebar toggle — lives in the header */}
    <button
     onClick={toggleSidebar}
     title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
     className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
    >
     {isCollapsed
      ? <PanelLeftOpen className="h-[17px] w-[17px]" />
      : <PanelLeftClose className="h-[17px] w-[17px]" />
     }
    </button>
   </div>

   {/* ── Main Nav ── */}
   <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
    {navItems.map((item) => {
     const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
     return (
      <Link
       key={item.name}
       href={item.href}
       title={isCollapsed ? item.name : undefined}
       className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
        isActive
         ? "bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400"
         : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        isCollapsed && "justify-center px-0"
       )}
      >
       <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-sky-500" : "")} />
       <AnimatePresence>
        {!isCollapsed && (
         <motion.span 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.15 }}
          className="whitespace-nowrap overflow-hidden"
         >
          {item.name}
         </motion.span>
        )}
       </AnimatePresence>
      </Link>
     )
    })}
   </nav>

   {/* ── User / Profile Section ── */}
   <div className="shrink-0 border-t border-border">
    {/* Bottom nav: Settings + Profile + Sign Out */}
    <div className="px-2 py-2 space-y-0.5">
     {bottomNavItems.map((item) => {
      const isActive = pathname.includes(item.href)
      return (
       <Link
        key={item.name}
        href={item.href}
        title={isCollapsed ? item.name : undefined}
        className={cn(
         "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
         isActive
          ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
         isCollapsed && "justify-center px-0"
        )}
       >
        <item.icon className={cn("h-[17px] w-[17px] shrink-0", isActive ? "text-sky-500" : "")} />
        <AnimatePresence>
         {!isCollapsed && (
          <motion.span
           initial={{ opacity: 0, width: 0 }}
           animate={{ opacity: 1, width: "auto" }}
           exit={{ opacity: 0, width: 0 }}
           transition={{ duration: 0.15 }}
           className="whitespace-nowrap overflow-hidden"
          >
           {item.name}
          </motion.span>
         )}
        </AnimatePresence>
       </Link>
      )
     })}
     <button
      onClick={handleLogout}
      title={isCollapsed ? "Sign Out" : undefined}
      className={cn(
       "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors",
       isCollapsed && "justify-center px-0"
      )}
     >
      <LogOut className="h-[17px] w-[17px] shrink-0" />
      <AnimatePresence>
       {!isCollapsed && (
        <motion.span
         initial={{ opacity: 0, width: 0 }}
         animate={{ opacity: 1, width: "auto" }}
         exit={{ opacity: 0, width: 0 }}
         transition={{ duration: 0.15 }}
         className="whitespace-nowrap overflow-hidden"
        >
         Sign Out
        </motion.span>
       )}
      </AnimatePresence>
     </button>
    </div>

    {/* User identity card — always visible at the very bottom */}
    <div className={cn(
     "flex items-center gap-3 px-4 py-3 border-t border-border bg-muted/30",
     isCollapsed && "justify-center px-3"
    )}>
     <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ring-2 ring-sky-500/20">
      {initials}
     </div>
     <AnimatePresence>
      {!isCollapsed && (
       <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "auto" }}
        exit={{ opacity: 0, width: 0 }}
        transition={{ duration: 0.15 }}
        className="flex-1 min-w-0 overflow-hidden"
       >
        <p className="text-[13px] font-semibold text-foreground truncate leading-tight">{user?.name || "User"}</p>
        <p className="text-[11px] text-muted-foreground capitalize font-medium mt-0.5 truncate">{user?.role || "Doctor"}</p>
       </motion.div>
      )}
     </AnimatePresence>
    </div>
   </div>
  </motion.div>
 )
}
