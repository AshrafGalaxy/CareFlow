"use client"

import { useState, useEffect } from "react"
import { Link } from "@/i18n/routing"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { motion, useScroll, useTransform } from "framer-motion"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useTranslations } from "next-intl"

export function LandingNavbar() {
 const { scrollY } = useScroll()

 // Interpolate width: from max-w-6xl (approx 1152px) down to 800px
 const navMaxWidth = useTransform(scrollY, [0, 150], ["1152px", "800px"])
 
 // Interpolate padding: at top px-2 py-2, scrolled px-6 py-3
 const navPx = useTransform(scrollY, [0, 150], ["8px", "24px"])
 const navPy = useTransform(scrollY, [0, 150], ["8px", "12px"])

 // Interpolate border radius: at top 0px (or small), scrolled 9999px
 const navRadius = useTransform(scrollY, [0, 150], ["8px", "9999px"])

 // Interpolate background opacity instead of colors
 const bgOpacity = useTransform(scrollY, [0, 150], [0, 1])
 const navShadow = useTransform(scrollY, [0, 150], ["0px 0px 0px rgba(0,0,0,0)", "0px 8px 30px rgba(0,0,0,0.06)"])
 
 // Right float controls: as we scroll, they can move slightly or just fade/position
 // Actually we can just keep them fixed but animate their entry or layout

 const logoSize = useTransform(scrollY, [0, 150], [32, 28])
 
 const [isScrolled, setIsScrolled] = useState(false)
 useEffect(() => {
  return scrollY.on("change", (latest) => {
   setIsScrolled(latest > 50)
  })
 }, [scrollY])

 const tAuth = useTranslations("Auth")

 return (
  <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">

   {/* ── Pill or Full-width nav ── */}
   <motion.nav
    style={{
     maxWidth: navMaxWidth,
     paddingLeft: navPx,
     paddingRight: navPx,
     paddingTop: navPy,
     paddingBottom: navPy,
     borderRadius: navRadius,
     boxShadow: navShadow
    }}
    className="pointer-events-auto flex flex-wrap items-center justify-between w-full relative z-10"
   >
    {/* Animated background to avoid interpolating CSS variables */}
    <motion.div
     style={{
      opacity: bgOpacity,
      borderRadius: navRadius,
     }}
     className="absolute inset-0 bg-card border border-border backdrop-blur-xl -z-10"
    />

    {/* Logo */}
    <div className="flex items-center gap-2.5">
     <motion.div style={{ width: logoSize, height: logoSize }} className="relative shrink-0">
      <Image
       src="/favicon.svg"
       alt="CareFlow AI Logo"
       fill
       className="object-contain"
       priority
      />
     </motion.div>
     <span className="font-brand text-xl font-bold tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-sky-600 dark:from-white dark:to-sky-400">
      CareFlow AI
     </span>
    </div>

    {/* Nav Links */}
    <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
     <a href="#features" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Features</a>
     <a href="#how-it-works" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">How It Works</a>
     <a href="#testimonials" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Stories</a>
     <a href="#faq" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">FAQ</a>
    </div>

    {/* CTA Buttons */}
    <div className="flex items-center gap-2 md:gap-3 shrink-0">
     <Link
      href="/login"
      className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors px-2 md:px-4 py-2 whitespace-nowrap text-center"
     >
      {tAuth("signIn")}
     </Link>
     <Link
      href="/register"
      className={cn(
       "btn-glow text-sm font-semibold bg-sky-500 text-white shadow-sm hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400 transition-all whitespace-nowrap text-center",
       isScrolled ? "px-4 py-2 rounded-full" : "px-5 py-2.5 rounded-lg"
      )}
     >
      {tAuth("signUp")}
     </Link>
    </div>
   </motion.nav>

   {/* ── Floating controls outside the pill ── */}
   {/* We anchor them to the right edge. With the new layout they are properly fixed right. */}
   <div className="pointer-events-auto fixed top-6 right-4 md:right-8 flex items-center gap-2 z-50">
    <ThemeToggle />
    <LanguageSwitcher />
   </div>
  </div>
 )
}

