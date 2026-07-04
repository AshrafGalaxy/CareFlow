"use client"

import { useState, useEffect } from "react"
import { Link } from "@/i18n/routing"
import Image from "next/image"
import { cn } from "@/lib/utils"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none">
      <nav
        className={cn(
          "pointer-events-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border",
          scrolled
            ? "w-full max-w-[800px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full px-6 py-3"
            : "w-full max-w-6xl bg-transparent border-transparent px-2 py-2"
        )}
      >
        <div className="flex items-center gap-2.5">
          <Image
            src="/favicon.svg"
            alt="CareFlow AI Logo"
            width={32}
            height={32}
            className={cn("transition-all duration-300", scrolled ? "h-7 w-7" : "h-8 w-8")}
            priority
          />
          <span className="font-brand text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            CareFlow <span className="text-sky-500">AI</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-sky-500 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-sky-500 transition-colors">How It Works</a>
          <a href="#testimonials" className="hover:text-sky-500 transition-colors">Stories</a>
          <a href="#faq" className="hover:text-sky-500 transition-colors">FAQ</a>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher />
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className={cn(
              "btn-glow text-sm font-semibold bg-sky-500 text-white shadow-sm hover:bg-sky-600 transition-all",
              scrolled ? "px-4 py-2 rounded-full" : "px-5 py-2.5 rounded-lg"
            )}
          >
            Start for Free
          </Link>
        </div>
      </nav>
    </div>
  )
}
