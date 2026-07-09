"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { usePathname } from "@/i18n/routing"
import {
 LayoutDashboard, FileText, MessageSquare, Pill, Shield, Clock, LogOut, Settings, User, ChevronLeft, ChevronRight
} from "lucide-react"
import { getInitials } from "@/lib/formatters"
import { useAuthStore } from "@/store/authStore"
import { useSidebarStore } from "@/store/sidebarStore"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

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
 const { state: sidebarState, toggle: toggleSidebar } = useSidebarStore()
 const t = useTranslations("Navigation")
 const navItems = getNavItems(t)

 const initials = getInitials(user?.name)
 const isCollapsed = sidebarState === 'collapsed'

 const handleLogout = async () => {
  const { useNotificationStore } = await import('@/store/notificationStore')
  // saveAndEject writes current notifications to user's personal localStorage key
  // then clears in-memory state. Data is preserved for next login.
  useNotificationStore.getState().saveAndEject()
  logout()
  toast.success("Signed Out", {
   description: "You have been securely logged out.",
   duration: 3000,
   icon: <LogOut className="w-5 h-5 text-sky-500" />
  })
  window.location.href = "/login"
 }

 return (
  <motion.div 
   initial={false}
   animate={{ 
    width: isCollapsed ? 80 : 256,
   }}
   transition={{ type: "spring", stiffness: 300, damping: 30 }}
   className="hidden md:flex flex-col border-r border-border bg-card h-screen shrink-0 relative z-20"
  >


   {/* Brand */}
   <div className="flex items-center gap-2 p-5 border-b border-border bg-card h-[72px] shrink-0 relative overflow-hidden">
    <Image 
     src="/favicon.svg" 
     alt="CareFlow Logo" 
     width={32} 
     height={32} 
     className="h-8 w-8 shrink-0"
     priority
    />
    <AnimatePresence>
     {!isCollapsed && (
      <motion.span 
       initial={{ opacity: 0, width: 0 }}
       animate={{ opacity: 1, width: "auto" }}
       exit={{ opacity: 0, width: 0 }}
       className="font-brand text-xl font-bold text-foreground tracking-tight whitespace-nowrap overflow-hidden"
      >
       CareFlow <span className="text-sky-500">AI</span>
      </motion.span>
     )}
    </AnimatePresence>
   </div>

  {/* Nav Items */}
   <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto no-scrollbar" aria-label="Main navigation">
    {navItems.map((item) => {
     const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
     return (
      <Link
       key={item.name}
       href={item.href}
       title={isCollapsed ? item.name : undefined}
       className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
        isActive
         ? "text-primary dark:text-sky-400"
         : "text-muted-foreground hover:text-foreground",
        isCollapsed && "justify-center px-0"
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
       <AnimatePresence>
        {!isCollapsed && (
         <motion.span 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          className="relative z-10 whitespace-nowrap overflow-hidden"
         >
          {item.name}
         </motion.span>
        )}
       </AnimatePresence>
      </Link>
     )
    })}
   </nav>

   {/* User Block */}
   <div className="border-t border-border p-3 bg-muted/20 shrink-0">
    <div className={cn("flex items-center gap-3 mb-4", isCollapsed ? "justify-center px-0" : "px-2")}>
     <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
      {initials}
     </div>
     <AnimatePresence>
      {!isCollapsed && (
       <motion.div 
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "auto" }}
        exit={{ opacity: 0, width: 0 }}
        className="flex-1 min-w-0 overflow-hidden"
       >
        <p className="text-sm font-semibold text-foreground truncate">{user?.name || "User"}</p>
        <p className="text-xs text-muted-foreground capitalize font-medium mt-0.5">{user?.role || "Patient"}</p>
       </motion.div>
      )}
     </AnimatePresence>
    </div>
    
    {/* FOOTER */}
    <div className="space-y-1.5">
     {bottomNavItems.map((item) => {
      const isActive = pathname.includes(item.href)
      return (
       <Link
        key={item.name}
        href={item.href}
        title={isCollapsed ? item.name : undefined}
        className={cn(
         "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
         isActive
          ? "text-primary dark:text-sky-400"
          : "text-muted-foreground hover:text-foreground",
         isCollapsed && "justify-center px-0"
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
        <AnimatePresence>
         {!isCollapsed && (
          <motion.span 
           initial={{ opacity: 0, width: 0 }}
           animate={{ opacity: 1, width: "auto" }}
           exit={{ opacity: 0, width: 0 }}
           className="relative z-10 whitespace-nowrap overflow-hidden"
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
       "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground group transition-all duration-300",
       isCollapsed && "justify-center px-0"
      )}
     >
      <div className="absolute inset-0 bg-destructive/0 group-hover:bg-destructive/10 rounded-xl transition-colors duration-300" />
      <LogOut className="h-[18px] w-[18px] shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110 group-active:scale-95 group-hover:text-destructive" />
      <AnimatePresence>
       {!isCollapsed && (
        <motion.span 
         initial={{ opacity: 0, width: 0 }}
         animate={{ opacity: 1, width: "auto" }}
         exit={{ opacity: 0, width: 0 }}
         className="relative z-10 group-hover:text-destructive transition-colors duration-300 whitespace-nowrap overflow-hidden"
        >
         Sign Out
        </motion.span>
       )}
      </AnimatePresence>
     </button>
     
     {/* Sidebar Toggle Button */}
     <button
      onClick={toggleSidebar}
      title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      className={cn(
       "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground group transition-all duration-300 mt-2 border border-border/50 bg-muted/30 hover:bg-muted",
       isCollapsed && "justify-center px-0"
      )}
     >
      <div className="relative z-10 shrink-0 flex items-center justify-center h-[18px] w-[18px]">
       {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </div>
      <AnimatePresence>
       {!isCollapsed && (
        <motion.span 
         initial={{ opacity: 0, width: 0 }}
         animate={{ opacity: 1, width: "auto" }}
         exit={{ opacity: 0, width: 0 }}
         className="relative z-10 whitespace-nowrap overflow-hidden"
        >
         Collapse
        </motion.span>
       )}
      </AnimatePresence>
     </button>
    </div>
   </div>
  </motion.div>
 )
}
