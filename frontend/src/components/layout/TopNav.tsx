"use client"

import { Bell, CheckCircle2, Info } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { usePathname } from "@/i18n/routing"
import { getGreeting, getInitials } from "@/lib/formatters"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

const pageTitles: Record<string, string> = {
 "/dashboard": "Dashboard",
 "/reports": "My Reports",
 "/reports/upload": "Upload Report",
 "/chat": "AI Health Chat",
 "/medications": "Medications",
 "/insurance": "Insurance Navigator",
 "/timeline": "Health Timeline",
}

export function TopNav() {
 const user = useAuthStore((state) => state.user)
 const pathname = usePathname()

 const initials = getInitials(user?.name)

 const title = Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] || "CareFlow AI"

 const greeting = getGreeting()

 return (
  <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-10">
   <div className="flex flex-col">
    <h2 className="text-base font-semibold text-foreground leading-tight">{title}</h2>
    <p className="text-xs text-slate-500">{greeting}, {user?.name?.split(" ")[0] || "User"}</p>
   </div>

   <div className="flex items-center gap-3">
    {/* Notification Bell with Popover */}
    <Popover>
     <PopoverTrigger aria-label="Notifications" className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-200">
      <Bell className="h-5 w-5" />
      <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-background" />
     </PopoverTrigger>
     <PopoverContent className="w-80 p-0 mr-4 mt-2 shadow-xl border-border backdrop-blur-xl bg-card/95 text-card-foreground rounded-xl overflow-hidden" align="end">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
       <h3 className="font-heading font-semibold text-foreground">Notifications</h3>
       <span className="text-xs font-medium text-sky-600 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded-full">2 New</span>
      </div>
      <div className="flex flex-col max-h-[300px] overflow-y-auto">
       <div className="p-4 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3">
        <div className="mt-0.5 h-8 w-8 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center shrink-0">
         <Info className="h-4 w-4" />
        </div>
        <div className="flex flex-col gap-1">
         <p className="text-sm font-medium text-foreground">Welcome to CareFlow AI!</p>
         <p className="text-xs text-muted-foreground">Your profile has been successfully set up. You can now start managing your health journey.</p>
         <span className="text-[10px] font-semibold text-muted-foreground mt-1">Just now</span>
        </div>
       </div>
       <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3">
        <div className="mt-0.5 h-8 w-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0">
         <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="flex flex-col gap-1">
         <p className="text-sm font-medium text-foreground">Account Secured</p>
         <p className="text-xs text-muted-foreground">Your connection is fully encrypted and secured.</p>
         <span className="text-[10px] font-semibold text-muted-foreground mt-1">2 mins ago</span>
        </div>
       </div>
      </div>
      <div className="p-3 border-t border-border/50 text-center">
       <button className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors">
        Mark all as read
       </button>
      </div>
     </PopoverContent>
    </Popover>

    {/* Theme Toggle & Language */}
    <ThemeToggle />
    <LanguageSwitcher />

    {/* Avatar */}
    <div className="h-9 w-9 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-sky-100 dark:ring-sky-900">
     {initials}
    </div>
   </div>
  </header>
 )
}
