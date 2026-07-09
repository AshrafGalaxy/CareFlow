"use client"

import { Bell, Info, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useNotificationStore } from "@/store/notificationStore"
import { usePathname } from "@/i18n/routing"
import { getGreeting, getInitials } from "@/lib/formatters"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

const pageTitles: Record<string, string> = {
 "/dashboard": "Dashboard",
 "/reports": "My Reports",
 "/reports/upload": "Upload Report",
 "/chat": "AI Health Chat",
 "/medications": "Medications",
 "/insurance": "Insurance Navigator",
 "/timeline": "Health Timeline",
}

const iconMap = {
 success: <CheckCircle2 className="h-4 w-4" />,
 info: <Info className="h-4 w-4" />,
 warning: <AlertTriangle className="h-4 w-4" />,
 error: <XCircle className="h-4 w-4" />,
 security: <ShieldCheck className="h-4 w-4" />,
}

const colorMap = {
 success: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
 info: "text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400",
 warning: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
 error: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
 security: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400",
}

export function TopNav() {
 const user = useAuthStore((state) => state.user)
 const { notifications, markAllAsRead, markAsRead, _hasHydrated } = useNotificationStore()
 const pathname = usePathname()

 const initials = getInitials(user?.name)
 const title = Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] || "CareFlow AI"
 const greeting = getGreeting()

 const unreadCount = notifications.filter(n => !n.isRead).length

 return (
  <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm transition-colors duration-300">
   <div className="flex flex-col">
    <h2 className="text-base font-semibold text-foreground leading-tight">{title}</h2>
    <p className="text-xs text-slate-500 font-medium">{greeting}, {user?.name?.split(" ")[0] || "User"}</p>
   </div>

   <div className="flex items-center gap-4">
    {/* Notification Bell with Popover */}
    <Popover>
     <PopoverTrigger aria-label="Notifications" className="relative p-2 text-slate-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl transition-all duration-300 group">
      <Bell className="h-5 w-5 group-active:scale-95 transition-transform" />
      <AnimatePresence>
       {_hasHydrated && unreadCount > 0 && (
        <motion.span
         initial={{ scale: 0 }}
         animate={{ scale: 1 }}
         exit={{ scale: 0 }}
         className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-background animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"
        />
       )}
      </AnimatePresence>
     </PopoverTrigger>
     <PopoverContent className="w-[340px] p-0 mr-6 mt-2 shadow-2xl border-white/40 dark:border-white/10 backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 rounded-2xl overflow-hidden" align="end">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
       <h3 className="font-brand font-bold text-foreground text-base tracking-tight">Notifications</h3>
       {unreadCount > 0 && (
        <span className="text-xs font-bold text-sky-600 bg-sky-100 dark:bg-sky-900/40 dark:text-sky-400 px-2.5 py-0.5 rounded-full ring-1 ring-sky-200 dark:ring-sky-800/50 shadow-inner">
         {unreadCount} New
        </span>
       )}
      </div>
      <div className="flex flex-col max-h-[360px] overflow-y-auto">
       <AnimatePresence initial={false}>
        {_hasHydrated && notifications.length === 0 ? (
         <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="p-8 flex flex-col items-center justify-center text-center gap-3"
         >
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
           <Bell className="w-5 h-5 opacity-50" />
          </div>
          <p className="text-sm font-semibold text-foreground">You're all caught up!</p>
          <p className="text-xs text-slate-500 font-medium">No new notifications right now.</p>
         </motion.div>
        ) : (
         notifications.map((notif) => (
          <motion.div
           key={notif.id}
           layout
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95 }}
           onClick={() => !notif.isRead && markAsRead(notif.id)}
           className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex gap-4 ${
            !notif.isRead ? 'bg-sky-50/30 dark:bg-sky-900/10' : ''
           }`}
          >
           <div className={`mt-0.5 h-9 w-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${colorMap[notif.type]}`}>
            {iconMap[notif.type]}
           </div>
           <div className="flex flex-col gap-1.5 min-w-0 flex-1 pt-0.5">
            <div className="flex items-start justify-between gap-2">
             <p className={`text-sm font-semibold leading-tight truncate ${!notif.isRead ? 'text-foreground' : 'text-slate-600 dark:text-slate-300'}`}>
              {notif.title}
             </p>
             {!notif.isRead && <span className="mt-1 h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_5px_rgba(14,165,233,0.5)] shrink-0" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-2 line-clamp-2">
             {notif.message}
            </p>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 tracking-wide">
             <span className="uppercase">{formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}</span>
             <span className="opacity-70">{new Date(notif.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
           </div>
          </motion.div>
         ))
        )}
       </AnimatePresence>
      </div>
      {notifications.length > 0 && (
       <div className="p-3 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/80 dark:bg-slate-950/80 text-center backdrop-blur-md">
        <button 
         onClick={markAllAsRead}
         className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors w-full py-1.5"
        >
         Mark all as read
        </button>
       </div>
      )}
     </PopoverContent>
    </Popover>

    {/* Theme Toggle & Language */}
    <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-800/30 p-1 rounded-xl">
     <ThemeToggle />
     <LanguageSwitcher />
    </div>

    {/* Avatar */}
    <div className="h-9 w-9 ml-1 rounded-full bg-gradient-to-tr from-sky-500 to-emerald-400 text-white flex items-center justify-center text-xs font-bold ring-2 ring-sky-100 dark:ring-slate-800 shadow-sm transition-transform hover:scale-105 cursor-pointer">
     {initials}
    </div>
   </div>
  </header>
 )
}
