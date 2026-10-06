"use client"

import { useState } from "react"
import { Pill, CheckCircle2, Clock, ArrowRight, Check, AlertCircle } from "lucide-react"
import { Link } from "@/i18n/routing"
import api from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface NextMedication {
  id: string
  name: string
  scheduled_time: string
  status: string
  dosage?: string
  notes?: string
}

interface NextMedicationWidgetProps {
  nextMedication?: NextMedication | null
  highContrast?: boolean
  onMedicationTaken?: () => void
  totalToday?: number
  takenToday?: number
}

export function NextMedicationWidget({
  nextMedication,
  highContrast = false,
  onMedicationTaken,
  totalToday = 0,
  takenToday = 0,
}: NextMedicationWidgetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [markedTakenLocally, setMarkedTakenLocally] = useState(false)

  const handleMarkAsTaken = async () => {
    if (!nextMedication) return
    setIsSubmitting(true)

    try {
      await api.post(`/api/medications/${nextMedication.id}/log`, {
        status: "taken",
        scheduled_time: nextMedication.scheduled_time,
      })

      setMarkedTakenLocally(true)
      toast.success(`Marked ${nextMedication.name} as taken! 💊`, {
        description: "Your medication adherence record has been updated.",
      })

      onMedicationTaken?.()
    } catch (err: any) {
      toast.error("Could not record dose", {
        description: err?.response?.data?.detail || "Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format scheduled time nicely
  let formattedTime = "Upcoming today"
  let isDueSoon = false
  if (nextMedication?.scheduled_time) {
    try {
      const dateObj = new Date(nextMedication.scheduled_time)
      formattedTime = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      const diffMinutes = (dateObj.getTime() - Date.now()) / (1000 * 60)
      if (diffMinutes <= 30 && diffMinutes >= -60) {
        isDueSoon = true
      }
    } catch (e) {
      formattedTime = nextMedication.scheduled_time
    }
  }

  const allTaken = totalToday > 0 && takenToday >= totalToday && !nextMedication

  return (
    <div
      className={cn(
        "rounded-3xl border-2 p-6 shadow-sm transition-all duration-300 flex flex-col justify-between",
        highContrast
          ? "bg-black border-yellow-400 text-white"
          : "bg-card border-border hover:border-border/80"
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                highContrast ? "bg-yellow-400 text-black" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              )}
            >
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Medication Tracker
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Next Medication
              </h2>
            </div>
          </div>

          <Link
            href="/medications"
            className={cn(
              "text-xs sm:text-sm font-bold flex items-center gap-1 hover:underline shrink-0",
              highContrast ? "text-yellow-300" : "text-sky-600 dark:text-sky-400"
            )}
          >
            <span>All Meds</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Medication Card Details */}
        {nextMedication && !markedTakenLocally ? (
          <div
            className={cn(
              "p-4 sm:p-5 rounded-2xl border-2 mb-4",
              highContrast
                ? "bg-zinc-900 border-indigo-400/80 text-white"
                : "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {nextMedication.name}
                </h3>
                {nextMedication.dosage && (
                  <p className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    Dose: {nextMedication.dosage}
                  </p>
                )}
                {nextMedication.notes && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    "{nextMedication.notes}"
                  </p>
                )}
              </div>

              {isDueSoon && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-pulse border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  Due Soon
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-indigo-200/60 dark:border-indigo-800/40">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">
                Scheduled for: <span className="font-extrabold">{formattedTime}</span>
              </span>
            </div>
          </div>
        ) : markedTakenLocally ? (
          <div
            className={cn(
              "p-5 rounded-2xl border flex items-center gap-3 mb-4",
              highContrast
                ? "bg-zinc-900 border-emerald-400 text-emerald-300"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
            )}
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p className="font-extrabold text-base">Dose recorded as taken!</p>
              <p className="text-xs opacity-80">Thank you for staying on track today.</p>
            </div>
          </div>
        ) : allTaken ? (
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p className="font-extrabold text-base">All medications taken today!</p>
              <p className="text-xs opacity-80">
                You've completed all {totalToday} doses scheduled for today. Great job!
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-dashed border-border text-center text-muted-foreground mb-4">
            <Pill className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-base font-semibold">No upcoming medications right now</p>
            <p className="text-xs mt-1">Check your schedule or add a new medication prescription.</p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div>
        {nextMedication && !markedTakenLocally ? (
          <button
            onClick={handleMarkAsTaken}
            disabled={isSubmitting}
            className={cn(
              "w-full min-h-[50px] px-6 py-3 rounded-2xl font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-md cursor-pointer",
              highContrast
                ? "bg-emerald-400 text-black hover:bg-emerald-300 border-2 border-emerald-300"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25"
            )}
          >
            <Check className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <span>{isSubmitting ? "Recording Dose..." : "Mark as Taken"}</span>
          </button>
        ) : (
          <Link
            href="/medications"
            className={cn(
              "w-full min-h-[48px] px-4 py-2.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors border text-center",
              highContrast
                ? "bg-zinc-900 border-yellow-400 text-yellow-300 hover:bg-zinc-800"
                : "bg-muted hover:bg-muted/80 text-foreground border-border"
            )}
          >
            <span>View Full Medication Routine</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
