"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
 const { resolvedTheme, setTheme } = useTheme()

 const toggle = () => {
  setTheme(resolvedTheme === "light" ? "dark" : "light")
 }

 return (
  <Button
   variant="ghost"
   size="icon"
   onClick={toggle}
   aria-label={resolvedTheme === "light" ? "Switch to Dark mode" : "Switch to Light mode"}
   className="relative rounded-full w-10 h-10 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
  >
   <Sun className="h-[1.2rem] w-[1.2rem] absolute transition-all duration-300 dark:opacity-0 dark:scale-0 opacity-100 scale-100" />
   <Moon className="h-[1.2rem] w-[1.2rem] absolute transition-all duration-300 opacity-0 scale-0 dark:opacity-100 dark:scale-100" />
   <span className="sr-only">Toggle theme</span>
  </Button>
 )
}
