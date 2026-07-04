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
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">

      {/* ── Pill or Full-width nav ── */}
      <nav
        className={cn(
          "pointer-events-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border",
          scrolled
            ? "w-full max-w-[740px] bg-white/80 dark:bg-zinc-950/90 warm:bg-amber-50/90 backdrop-blur-xl border-slate-200/50 dark:border-zinc-800 warm:border-amber-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full px-6 py-3"
            : "w-full max-w-6xl bg-transparent border-transparent px-2 py-2"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Image
            src="/favicon.svg"
            alt="CareFlow AI Logo"
            width={32}
            height={32}
            className={cn("transition-all duration-300", scrolled ? "h-7 w-7" : "h-8 w-8")}
            priority
          />
          <span className="font-brand text-xl font-bold text-slate-900 dark:text-white warm:text-amber-900 tracking-tight">
            CareFlow <span className="text-sky-500 dark:text-sky-400 warm:text-amber-500">AI</span>
          </span>
        </div>

        {/* Nav Links (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 warm:text-amber-800">
          <a href="#features" className="hover:text-sky-500 dark:hover:text-sky-400 warm:hover:text-amber-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-sky-500 dark:hover:text-sky-400 warm:hover:text-amber-600 transition-colors">How It Works</a>
          <a href="#testimonials" className="hover:text-sky-500 dark:hover:text-sky-400 warm:hover:text-amber-600 transition-colors">Stories</a>
          <a href="#faq" className="hover:text-sky-500 dark:hover:text-sky-400 warm:hover:text-amber-600 transition-colors">FAQ</a>
        </div>

        {/* CTA Buttons — always in the pill */}
        <div className="flex items-center gap-3">
          {/* Theme + Language only visible inside pill when NOT scrolled */}
          {!scrolled && (
            <>
              <ThemeToggle />
              <LanguageSwitcher />
            </>
          )}
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 warm:text-amber-800 hover:text-sky-600 dark:hover:text-sky-400 warm:hover:text-amber-600 transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className={cn(
              "btn-glow text-sm font-semibold bg-sky-500 text-white shadow-sm hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400 warm:bg-amber-500 warm:hover:bg-amber-600 transition-all",
              scrolled ? "px-4 py-2 rounded-full" : "px-5 py-2.5 rounded-lg"
            )}
          >
            Start for Free
          </Link>
        </div>
      </nav>

      {/* ── Floating controls outside the pill when scrolled ── */}
      {scrolled && (
        <div className="pointer-events-auto absolute top-4 right-4 flex items-center gap-2 transition-all duration-300">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      )}
    </div>
  )
}
