"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/routing"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

const locales = [
 { code: "en", name: "English" },
 { code: "hi", name: "हिन्दी" },
 { code: "mr", name: "मराठी" },
 { code: "bn", name: "বাংলা" },
 { code: "gu", name: "ગુજરાતી" },
 { code: "ta", name: "தமிழ்" },
 { code: "te", name: "తెలుగు" },
 { code: "ur", name: "اردو" }
]

export function LanguageSwitcher() {
 const locale = useLocale()
 const router = useRouter()
 const pathname = usePathname()

 const handleLanguageChange = (newLocale: string) => {
  // Use next-intl's built-in locale switching — correctly rewrites the locale prefix
  router.replace(pathname, { locale: newLocale })
 }

 return (
  <DropdownMenu>
   <DropdownMenuTrigger
    className="inline-flex items-center justify-center rounded-full w-10 h-10 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 focus:outline-none transition-colors"
    aria-label="Toggle Language"
   >
    <Globe className="h-5 w-5" />
    <span className="sr-only">Toggle Language</span>
   </DropdownMenuTrigger>
   <DropdownMenuContent align="end" className="w-40 bg-card/95 dark:bg-zinc-900/95 backdrop-blur-md border-slate-200 dark:border-zinc-700">
    {locales.map((l) => (
     <DropdownMenuItem
      key={l.code}
      onClick={() => handleLanguageChange(l.code)}
      className={`cursor-pointer font-medium ${
       locale === l.code
        ? "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
        : "text-slate-700 dark:text-slate-300"
      }`}
     >
      {l.name}
     </DropdownMenuItem>
    ))}
   </DropdownMenuContent>
  </DropdownMenu>
 )
}
