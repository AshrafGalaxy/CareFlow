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
        "space-y-5 transition-all duration-200",
        highContrast ? "bg-black text-white p-3 sm:p-5 rounded-2xl border border-yellow-400" : ""
      )}
    >
      {/* Senior Mode Active Indicator */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 p-3.5 px-4 rounded-xl border transition-colors",
          highContrast
            ? "bg-zinc-950 border-yellow-400 text-yellow-300"
            : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/20"
        )}
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Senior & Accessible View Active <span className="font-normal text-muted-foreground hidden sm:inline">· You can switch back or adjust display scale anytime in the top bar.</span>
          </p>
        </div>
      </div>

      {/* 1. Emergency Help Surface */}
      <HelpWidget
        highContrast={highContrast}
        assignedDoctorName={kpiData?.assigned_doctor_name}
        assignedDoctorPhone={kpiData?.assigned_doctor_phone}
        emergencyContactName={patient?.emergency_contact_name}
        emergencyContactPhone={patient?.emergency_contact_phone}
        variant="banner"
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
          emergencyContactName={patient?.emergency_contact_name}
          emergencyContactPhone={patient?.emergency_contact_phone}
        />
      </div>
    </div>
  )
}
