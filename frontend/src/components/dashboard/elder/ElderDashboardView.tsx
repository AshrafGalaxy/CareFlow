"use client"

import { useState } from "react"
import {
  DailyCheckInWidget,
  DailyChecklistWidget,
  NextMedicationWidget,
  NextAppointmentWidget,
  FamilyShortcutWidget,
  HelpWidget
} from "@/components/patient"
import { Eye, Type, ShieldCheck, HeartHandshake } from "lucide-react"
import { cn } from "@/lib/utils"

interface ElderDashboardViewProps {
  patient?: any
  kpiData?: any
  onRefreshKpis?: () => void
  highContrast?: boolean
  onToggleHighContrast?: () => void
  largeText?: boolean
  onToggleLargeText?: () => void
}

export function ElderDashboardView({
  patient,
  kpiData,
  onRefreshKpis,
  highContrast: externalHighContrast,
  onToggleHighContrast,
  largeText: externalLargeText,
  onToggleLargeText,
}: ElderDashboardViewProps) {
  const [internalHighContrast, setInternalHighContrast] = useState(false)
  const [internalLargeText, setInternalLargeText] = useState(true)

  const highContrast = externalHighContrast ?? internalHighContrast
  const largeText = externalLargeText ?? internalLargeText

  const toggleHighContrast = onToggleHighContrast ?? (() => setInternalHighContrast(!internalHighContrast))
  const toggleLargeText = onToggleLargeText ?? (() => setInternalLargeText(!internalLargeText))

  return (
    <div
      className={cn(
        "space-y-6 transition-all duration-300 rounded-3xl",
        largeText ? "text-lg sm:text-xl" : "text-base",
        highContrast ? "bg-black text-white p-3 sm:p-5 rounded-3xl border-2 border-yellow-400" : ""
      )}
    >
      {/* Elder Accessibility Toolbar */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border-2 shadow-sm transition-colors",
          highContrast
            ? "bg-zinc-950 border-yellow-400 text-yellow-300"
            : "bg-card border-emerald-500/30"
        )}
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase text-emerald-600 dark:text-emerald-400 block">
              CareFlow Senior & Elder Mode Active
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Simplified navigation · High touch targets · Direct assistance
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleHighContrast}
            className={cn(
              "min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border cursor-pointer",
              highContrast
                ? "bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300"
                : "bg-muted hover:bg-muted/80 text-foreground border-border"
            )}
            title="Toggle high contrast color scheme"
          >
            <Eye className="w-4 h-4" />
            <span>{highContrast ? "Normal Contrast" : "High Contrast"}</span>
          </button>

          <button
            onClick={toggleLargeText}
            className={cn(
              "min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border cursor-pointer",
              largeText
                ? "bg-sky-600 text-white border-sky-600 hover:bg-sky-700"
                : "bg-muted hover:bg-muted/80 text-foreground border-border"
            )}
            title="Toggle extra large font size"
          >
            <Type className="w-4 h-4" />
            <span>{largeText ? "Standard Text" : "Large Text"}</span>
          </button>
        </div>
      </div>

      {/* 1. Emergency Help Surface */}
      <HelpWidget
        highContrast={highContrast}
        assignedDoctorName={kpiData?.assigned_doctor_name}
        assignedDoctorPhone={kpiData?.assigned_doctor_phone}
      />

      {/* 2. Daily Wellness Check-in */}
      <DailyCheckInWidget
        highContrast={highContrast}
        onCheckinSuccess={onRefreshKpis}
      />

      {/* 3. Next Medication & Next Appointment Side-by-Side or Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NextMedicationWidget
          nextMedication={kpiData?.next_medication}
          highContrast={highContrast}
          onMedicationTaken={onRefreshKpis}
          totalToday={kpiData?.medications_today_total}
          takenToday={kpiData?.medications_today_taken}
        />

        <NextAppointmentWidget
          nextAppointment={kpiData?.next_appointment}
          highContrast={highContrast}
          assignedDoctorPhone={kpiData?.assigned_doctor_phone}
        />
      </div>

      {/* 4. Daily Routine Checklist & Family Support Shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyChecklistWidget
          highContrast={highContrast}
          onItemUpdated={onRefreshKpis}
        />

        <FamilyShortcutWidget
          highContrast={highContrast}
          assignedDoctorName={kpiData?.assigned_doctor_name}
          assignedDoctorPhone={kpiData?.assigned_doctor_phone}
        />
      </div>
    </div>
  )
}
