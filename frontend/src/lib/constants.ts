// CareFlow AI — Shared Constants
// Single source of truth for file types, status enums, and limits

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
export const MAX_FILE_SIZE_LABEL = "10MB"

export const ACCEPTED_FILE_TYPES = {
 "application/pdf": [".pdf"],
 "image/jpeg": [".jpeg", ".jpg"],
 "image/png": [".png"],
} as const

export const ACCEPTED_FILE_LABELS = ["PDF", "JPG", "PNG"]

export type ReportStatus = "pending" | "processing" | "done" | "failed"
export const REPORT_STATUS = {
 PENDING: "pending" as ReportStatus,
 PROCESSING: "processing" as ReportStatus,
 DONE: "done" as ReportStatus,
 FAILED: "failed" as ReportStatus,
}

export type UserRole = "patient" | "doctor" | "admin"
export const USER_ROLE = {
 PATIENT: "patient" as UserRole,
 DOCTOR: "doctor" as UserRole,
 ADMIN: "admin" as UserRole,
}

export const API_ROUTES = {
 AUTH: {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  REFRESH: "/api/auth/refresh",
  ME: "/api/auth/me",
  PROFILE: "/api/auth/profile",
 },
 REPORTS: {
  UPLOAD: "/api/reports/upload",
  LIST: "/api/reports/",
  DETAIL: (id: string) => `/api/reports/${id}`,
 },
 DASHBOARD: {
  KPIS: "/api/dashboard/kpis",
 },
} as const

export const APP_ROUTES = {
 HOME: "/",
 LOGIN: "/login",
 REGISTER: "/register",
 DASHBOARD: "/dashboard",
 REPORTS: "/reports",
 REPORT_UPLOAD: "/reports/upload",
 REPORT_DETAIL: (id: string) => `/reports/${id}`,
 CHAT: "/chat",
 MEDICATIONS: "/medications",
 INSURANCE: "/insurance",
 TIMELINE: "/timeline",
 ONBOARDING: "/onboarding",
 PROFILE: "/profile",
 DOCTOR_DASHBOARD: "/doctor/dashboard",
} as const
