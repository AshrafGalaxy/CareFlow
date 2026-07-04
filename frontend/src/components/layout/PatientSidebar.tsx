"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { usePathname } from "@/i18n/routing"
import {
  LayoutDashboard, FileText, MessageSquare, Pill, Shield, Clock, LogOut,
} from "lucide-react"
import { getInitials } from "@/lib/formatters"
import { useAuthStore } from "@/store/authStore"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Reports", href: "/reports", icon: FileText },
  { name: "AI Chat", href: "/chat", icon: MessageSquare, badge: { label: "Phase 2", color: "amber" } },
  { name: "Medications", href: "/medications", icon: Pill },
  { name: "Insurance", href: "/insurance", icon: Shield, badge: { label: "New", color: "emerald" } },
  { name: "My Timeline", href: "/timeline", icon: Clock },
]

import { toast } from "sonner"

export function PatientSidebar() {
  const pathname = usePathname()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  const initials = getInitials(user?.name)

  const handleLogout = () => {
    logout()
    toast.success(
      <div className="flex flex-col gap-1">
        <span className="font-heading font-bold text-slate-900">Signed Out</span>
        <span className="text-sm text-slate-600">You have been securely logged out.</span>
      </div>,
      {
        icon: <div className="h-8 w-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shadow-inner"><LogOut className="h-4 w-4" /></div>,
        duration: 3000,
      }
    )
    window.location.href = "/login"
  }

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-slate-100 bg-white min-h-screen shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 py-6 border-b border-slate-100">
        <Image 
          src="/favicon.svg" 
          alt="CareFlow AI Logo" 
          width={32} 
          height={32} 
          className="h-8 w-8"
          priority
        />
        <span className="font-brand text-xl font-bold text-slate-900 tracking-tight">CareFlow <span className="text-sky-500">AI</span></span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link key={item.name} href={item.href}>
              <div className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive
                  ? "bg-sky-50 text-sky-700 font-semibold border-l-[3px] border-sky-500"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-[3px] border-transparent"
                }
              `}>
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className="text-sm flex-1">{item.name}</span>
                {item.badge && (
                  <span className={`
                    text-[10px] font-bold px-2 py-0.5 rounded-full
                    ${item.badge.color === "amber"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                    }
                  `}>
                    {item.badge.label}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User Block */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="h-9 w-9 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || "User"}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || "Patient"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  )
}
