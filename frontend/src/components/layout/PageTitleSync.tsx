"use client"

import { useEffect } from "react"
import { usePathname } from "@/i18n/routing"
import { useTranslations } from "next-intl"

export function PageTitleSync() {
  const pathname = usePathname()
  const tNav = useTranslations("Navigation")
  const tAuth = useTranslations("Auth")

  useEffect(() => {
    // If on landing/home page:
    if (!pathname || pathname === "/" || pathname === "") {
      document.title = "CareFlow AI"
      return
    }

    let pageTitle = ""

    // Route-to-title mapping
    if (pathname === "/dashboard") {
      pageTitle = tNav("dashboard") || "Dashboard"
    } else if (pathname === "/reports") {
      pageTitle = tNav("reports") || "My Reports"
    } else if (pathname === "/reports/upload") {
      pageTitle = "Upload Report"
    } else if (pathname.startsWith("/reports/detail")) {
      pageTitle = "Report Details"
    } else if (pathname === "/chat") {
      pageTitle = tNav("chat") || "AI Health Chat"
    } else if (pathname === "/medications") {
      pageTitle = tNav("medications") || "Medications"
    } else if (pathname === "/medications/add") {
      pageTitle = "Add Medication"
    } else if (pathname === "/insurance") {
      pageTitle = tNav("insurance") || "PM-JAY Insurance"
    } else if (pathname === "/appointments") {
      pageTitle = "Appointments"
    } else if (pathname === "/memos") {
      pageTitle = "Doctor Memos"
    } else if (pathname === "/care-team") {
      pageTitle = "Care Team"
    } else if (pathname === "/timeline") {
      pageTitle = "Health Timeline"
    } else if (pathname === "/profile") {
      pageTitle = "Patient Profile"
    } else if (pathname === "/settings") {
      pageTitle = "Settings"
    } else if (pathname === "/login") {
      pageTitle = tAuth("signIn") || "Sign In"
    } else if (pathname === "/register") {
      pageTitle = tAuth("signUp") || "Create Account"
    } else if (pathname === "/onboarding") {
      pageTitle = "Welcome"
    } else if (pathname === "/doctor/login") {
      pageTitle = "Doctor Login"
    } else if (pathname === "/doctor/dashboard") {
      pageTitle = "Doctor Dashboard"
    } else if (pathname === "/doctor/appointments") {
      pageTitle = "Doctor Appointments"
    } else if (pathname === "/doctor/patients") {
      pageTitle = "Patients"
    } else if (pathname.startsWith("/doctor/patients/")) {
      pageTitle = "Patient Overview"
    } else if (pathname.startsWith("/doctor/medications")) {
      pageTitle = "Medication Management"
    } else if (pathname === "/doctor/profile") {
      pageTitle = "Doctor Profile"
    } else if (pathname === "/doctor/settings") {
      pageTitle = "Doctor Settings"
    } else {
      // Fallback for subpaths
      const segments = pathname.split("/").filter(Boolean)
      const last = segments[segments.length - 1] || ""
      pageTitle = last
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    }

    document.title = pageTitle ? `${pageTitle} · CareFlow AI` : "CareFlow AI"
  }, [pathname, tNav, tAuth])

  return null
}
