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
        "rounded-2xl border p-5 shadow-xs transition-all duration-300 flex flex-col justify-between",
        highContrast
          ? "bg-black border-yellow-400 text-white"
          : "bg-card border-border hover:border-border/80"
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                highContrast ? "bg-yellow-400 text-black" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              )}
            >
              <Pill className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Medication Tracker
              </span>
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Next Medication
              </h2>
            </div>
          </div>

          <Link
            href="/medications"
            className={cn(
              "text-xs font-semibold flex items-center gap-1 hover:underline shrink-0",
              highContrast ? "text-yellow-300" : "text-sky-600 dark:text-sky-400"
            )}
          >
            <span>All Meds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Medication Card Details */}
        {nextMedication && !markedTakenLocally ? (
          <div
            className={cn(
              "p-3.5 rounded-xl border mb-3",
              highContrast
                ? "bg-zinc-900 border-indigo-400/80 text-white"
                : "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/70 dark:border-indigo-800/50"
            )}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  {nextMedication.name}
                </h3>
                {nextMedication.dosage && (
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    Dose: {nextMedication.dosage}
                  </p>
                )}
                {nextMedication.notes && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 italic">
                    "{nextMedication.notes}"
                  </p>
                )}
              </div>

              {isDueSoon && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-pulse border border-amber-500/30">
                  <Clock className="w-3 h-3" />
                  Due Soon
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-indigo-200/50 dark:border-indigo-800/30">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">
                Scheduled: <span className="font-bold">{formattedTime}</span>
              </span>
            </div>
          </div>
        ) : markedTakenLocally ? (
          <div
            className={cn(
              "p-3.5 rounded-xl border flex items-center gap-2.5 mb-3",
              highContrast
                ? "bg-zinc-900 border-emerald-400 text-emerald-300"
                : "bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-200"
            )}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="font-bold text-xs">Dose recorded as taken!</p>
              <p className="text-[11px] opacity-80">Staying on track with your routine.</p>
            </div>
          </div>
        ) : allTaken ? (
          <div className="p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="font-bold text-xs">All medications taken today!</p>
              <p className="text-[11px] opacity-80">
                Completed all {totalToday} doses for today. Great job!
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-dashed border-border text-center text-muted-foreground mb-3">
            <Pill className="w-6 h-6 mx-auto text-muted-foreground/40 mb-1" />
            <p className="text-xs font-semibold">No upcoming medications</p>
            <p className="text-[11px] mt-0.5">Check schedule or add prescription.</p>
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
              "w-full h-9 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-xs cursor-pointer",
              highContrast
                ? "bg-emerald-400 text-black hover:bg-emerald-300 border border-emerald-300"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
            )}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{isSubmitting ? "Recording Dose..." : "Mark as Taken"}</span>
          </button>
        ) : (
          <Link
            href="/medications"
            className={cn(
              "w-full h-9 px-3.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border text-center",
              highContrast
                ? "bg-zinc-900 border-yellow-400 text-yellow-300 hover:bg-zinc-800"
                : "bg-muted hover:bg-muted/80 text-foreground border-border"
            )}
          >
            <span>View Medication Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
