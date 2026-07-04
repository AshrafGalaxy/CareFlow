"use client"

import { useState, useEffect } from "react"
import { Link } from "@/i18n/routing"
import Image from "next/image"
import { cn } from "@/lib/utils"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

import { useTranslations } from "next-intl"

export function LandingNavbar() {
 const [scrolled, setScrolled] = useState(false)
 const tAuth = useTranslations("Auth")

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
     "pointer-events-auto flex flex-wrap items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border",
     scrolled
      ? "w-full max-w-[800px] bg-card/80 /90 backdrop-blur-xl border-slate-200/50 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full px-4 md:px-6 py-3 gap-y-2"
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
     <span className="font-brand text-xl font-bold text-foreground tracking-tight">
      CareFlow <span className="text-sky-500 dark:text-sky-400">AI</span>
     </span>
    </div>

    {/* Nav Links (hidden on mobile and tablet when pill is squished) */}
    <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
     <a href="#features" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Features</a>
     <a href="#how-it-works" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">How It Works</a>
     <a href="#testimonials" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Stories</a>
     <a href="#faq" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">FAQ</a>
    </div>

    {/* CTA Buttons — always in the pill */}
    <div className="flex items-center gap-2 md:gap-3 shrink-0">
     <Link
      href="/login"
      className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors px-2 md:px-4 py-2"
     >
      {tAuth("signIn")}
     </Link>
     <Link
      href="/register"
      className={cn(
       "btn-glow text-sm font-semibold bg-sky-500 text-white shadow-sm hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400 transition-all",
       scrolled ? "px-4 py-2 rounded-full" : "px-5 py-2.5 rounded-lg"
      )}
     >
      {tAuth("signUp")}
     </Link>
    </div>
   </nav>

   {/* ── Floating controls outside the pill ── */}
   <div className="pointer-events-auto fixed top-4 right-4 flex items-center gap-2 z-50 transition-all duration-300">
    <ThemeToggle />
    <LanguageSwitcher />
   </div>
  </div>
 )
}
