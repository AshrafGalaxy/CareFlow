"use client"

import { Link } from "@/i18n/routing"
import { usePathname } from "@/i18n/routing"
import { LayoutDashboard, FileText, MessageSquare, Shield } from "lucide-react"

const mobileNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { name: "Reports", href: "/reports", icon: FileText, enabled: true },
  { name: "Chat", href: "/chat", icon: MessageSquare, enabled: false, badge: "P2" },
  { name: "Insurance", href: "/insurance", icon: Shield, enabled: false, badge: "P3" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex items-stretch h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return item.enabled ? (
            <Link
              key={item.name}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 pt-1 transition-colors duration-200 ${
                isActive ? "text-sky-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-sky-500" : ""}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
              {isActive && (
                <span className="absolute top-0 h-0.5 w-8 bg-sky-500 rounded-full" />
              )}
            </Link>
          ) : (
            <div
              key={item.name}
              className="flex-1 flex flex-col items-center justify-center gap-1 pt-1 opacity-40 cursor-not-allowed relative"
            >
              <item.icon className="h-5 w-5 text-slate-400" />
              <span className="text-[10px] font-medium text-slate-400">{item.name}</span>
              {item.badge && (
                <span className="absolute top-2 right-[calc(50%-16px)] text-[8px] font-bold bg-slate-200 text-slate-500 px-1 rounded-full">
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
