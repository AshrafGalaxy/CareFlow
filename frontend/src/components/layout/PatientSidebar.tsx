"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { usePathname } from "@/i18n/routing"
import {
 LayoutDashboard, FileText, MessageSquare, Pill, Shield, Clock, LogOut, Settings, User, ChevronLeft, ChevronRight, ClipboardList, CalendarDays, Stethoscope, PanelLeftClose, PanelLeftOpen
} from "lucide-react"
import { getInitials } from "@/lib/formatters"
import { useAuthStore } from "@/store/authStore"
import { useSidebarStore } from "@/store/sidebarStore"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

const getNavItems = (t: (key: string) => string) => [
 { name: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
 { 
   name: "My Care Team", 
   href: "/care-team", 
   icon: Stethoscope,
   subItems: [
     { name: "Appointments", href: "/appointments", icon: CalendarDays },
     { name: "Clinical Notes", href: "/memos", icon: ClipboardList }
   ]
 },
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

export function PatientSidebar() {
 const pathname = usePathname()
 const logout = useAuthStore((state) => state.logout)
 const user = useAuthStore((state) => state.user)
 const { state: sidebarState, toggle: toggleSidebar } = useSidebarStore()
 const t = useTranslations("Navigation")
 const navItems = getNavItems(t)

 const initials = getInitials(user?.name)
 const isCollapsed = sidebarState === 'collapsed'
 const [expanded, setExpanded] = useState<Record<string, boolean>>({"My Care Team": true})

 const toggleExpand = (name: string, e: React.MouseEvent) => {
   e.preventDefault()
   e.stopPropagation()
   if (!isCollapsed) {
     setExpanded(prev => ({ ...prev, [name]: !prev[name] }))
   }
 }

 const handleLogout = async () => {
  const { useNotificationStore } = await import('@/store/notificationStore')
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
       </motion.span>
      )}
     </AnimatePresence>
    </div>
    {/* Sidebar toggle — lives in the header, always visible */}
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
     const hasSub = !!item.subItems
     const isExpanded = expanded[item.name]

     return (
      <div key={item.name} className="flex flex-col">
       <Link
        href={item.href}
        title={isCollapsed ? item.name : undefined}
        className={cn(
         "relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
         isActive
          ? "bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
         isCollapsed && "justify-center px-0"
        )}
       >
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
         <item.icon className={cn(
          "h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-105",
          isActive ? "text-sky-500" : ""
         )} />
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
        </div>

        {!isCollapsed && hasSub && (
         <button
          onClick={(e) => toggleExpand(item.name, e)}
          className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
         >
          <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-200", isExpanded && "rotate-90")} />
         </button>
        )}
       </Link>

       <AnimatePresence>
        {!isCollapsed && hasSub && isExpanded && (
         <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-col gap-0.5 pl-8 pr-1 mt-0.5 overflow-hidden"
         >
          {item.subItems?.map((sub) => {
           const isSubActive = pathname === sub.href
           return (
            <Link
             key={sub.name}
             href={sub.href}
             className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              isSubActive
               ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium"
               : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
             )}
            >
             <sub.icon className="h-[14px] w-[14px] opacity-75" />
             <span>{sub.name}</span>
            </Link>
           )
          })}
         </motion.div>
        )}
       </AnimatePresence>
      </div>
     )
    })}
   </nav>

   {/* ── User / Profile Section ── */}
   <div className="shrink-0 border-t border-border">
    {/* Bottom nav: Settings + Profile */}
    <div className="px-2 py-2 space-y-0.5">
     {bottomNavItems.map((item) => {
      const isActive = pathname.includes(item.href)
      return (
       <Link
        key={item.name}
        href={item.href}
        title={isCollapsed ? item.name : undefined}
        className={cn(
         "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
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
       "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors group",
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

    {/* User identity card */}
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
        <p className="text-[11px] text-muted-foreground capitalize font-medium mt-0.5 truncate">{user?.role || "Patient"}</p>
       </motion.div>
      )}
     </AnimatePresence>
    </div>
   </div>
  </motion.div>
 )
}
