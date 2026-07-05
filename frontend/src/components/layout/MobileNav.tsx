"use client"

import { Link } from "@/i18n/routing"
import { usePathname } from "@/i18n/routing"
import { LayoutDashboard, FileText, MessageSquare, Shield } from "lucide-react"

import { useTranslations } from "next-intl"

const mobileNavItems = [
 { name: "dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
 { name: "reports", href: "/reports", icon: FileText, enabled: true },
 { name: "chat", href: "/chat", icon: MessageSquare, enabled: false, badge: "P2" },
 { name: "insurance", href: "/insurance", icon: Shield, enabled: false, badge: "P3" },
]

export function MobileNav() {
 const t = useTranslations("Navigation")
 const pathname = usePathname()

 return (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.4)]">
   <div className="flex items-stretch h-16">
    {mobileNavItems.map((item) => {
     const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
     return item.enabled ? (
      <Link
       key={item.name}
       href={item.href}
       className={`flex-1 flex flex-col items-center justify-center gap-1 pt-1 transition-colors duration-200 ${
        isActive ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground hover:text-foreground"
       }`}
      >
       <item.icon className={`h-5 w-5 ${isActive ? "text-sky-500" : ""}`} />
       <span className="text-[10px] font-medium text-center leading-tight truncate w-full px-1">{t(item.name as any)}</span>
       {isActive && (
        <span className="absolute top-0 h-0.5 w-8 bg-sky-500 rounded-full" />
       )}
      </Link>
     ) : (
      <div
       key={item.name}
       className="flex-1 flex flex-col items-center justify-center gap-1 pt-1 opacity-40 cursor-not-allowed relative"
      >
       <item.icon className="h-5 w-5 text-muted-foreground" />
       <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight truncate w-full px-1">{t(item.name as any)}</span>
       {item.badge && (
        <span className="absolute top-2 right-[calc(50%-16px)] text-[8px] font-bold bg-muted text-muted-foreground px-1 rounded-full">
         {item.badge}
        </span>
       )}
      </div>
     )
    })}
   </div>
  </nav>
 )
}
