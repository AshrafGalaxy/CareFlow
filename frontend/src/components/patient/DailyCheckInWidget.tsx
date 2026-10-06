"use client"

import { useState } from "react"
import { Smile, Meh, Frown, AlertCircle, CheckCircle2, History, Send, MessageSquare, Sparkles } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import useSWR from "swr"
import { cn } from "@/lib/utils"

interface DailyCheckInWidgetProps {
  highContrast?: boolean
  onNeedHelpSelected?: () => void
  onCheckinSuccess?: () => void
}

const fetcher = (url: string) => api.get(url).then((res) => res.data)

export function DailyCheckInWidget({
  highContrast = false,
  onNeedHelpSelected,
  onCheckinSuccess
}: DailyCheckInWidgetProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  const { data: history, mutate } = useSWR<any[]>("/api/v1/checkins/history", fetcher, {
    revalidateOnFocus: true,
  })

  const todayStr = new Date().toISOString().split("T")[0]
  const todayCheckin = history?.find((item) => item.date === todayStr)

  const statusOptions = [
    {
      id: "GOOD",
      label: "Good",
      subtitle: "Feeling well & energetic",
      emoji: "🟢",
      icon: Smile,
      color: "emerald",
      bgClass: highContrast
        ? "bg-black border-2 border-emerald-400 text-emerald-300 hover:bg-emerald-950/80"
        : "bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20",
      activeClass: highContrast
        ? "bg-emerald-400 text-black border-2 border-emerald-300 font-extrabold ring-4 ring-emerald-500/40"
        : "bg-emerald-600 text-white border-2 border-emerald-600 shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20",
    },
    {
      id: "OKAY",
      label: "Okay",
      subtitle: "Just usual, getting by",
      emoji: "🟡",
      icon: Meh,
      color: "sky",
      bgClass: highContrast
        ? "bg-black border-2 border-sky-400 text-sky-300 hover:bg-sky-950/80"
        : "bg-sky-500/10 border-2 border-sky-500/30 text-sky-800 dark:text-sky-300 hover:bg-sky-500/20",
      activeClass: highContrast
        ? "bg-sky-400 text-black border-2 border-sky-300 font-extrabold ring-4 ring-sky-500/40"
        : "bg-sky-600 text-white border-2 border-sky-600 shadow-lg shadow-sky-500/30 ring-4 ring-sky-500/20",
    },
    {
      id: "NOT_WELL",
      label: "Not Well",
      subtitle: "Tired, pain, or unwell",
      emoji: "🟠",
      icon: Frown,
      color: "amber",
      bgClass: highContrast
        ? "bg-black border-2 border-amber-400 text-amber-300 hover:bg-amber-950/80"
        : "bg-amber-500/10 border-2 border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20",
      activeClass: highContrast
        ? "bg-amber-400 text-black border-2 border-amber-300 font-extrabold ring-4 ring-amber-500/40"
        : "bg-amber-600 text-white border-2 border-amber-600 shadow-lg shadow-amber-500/30 ring-4 ring-amber-500/20",
    },
    {
      id: "NEEDS_HELP",
      label: "Need Help",
      subtitle: "Require assistance today",
      emoji: "🔴",
      icon: AlertCircle,
      color: "rose",
      bgClass: highContrast
        ? "bg-black border-2 border-rose-400 text-rose-300 hover:bg-rose-950/80"
        : "bg-rose-500/10 border-2 border-rose-500/30 text-rose-800 dark:text-rose-300 hover:bg-rose-500/20",
      activeClass: highContrast
        ? "bg-rose-500 text-white border-2 border-rose-300 font-extrabold ring-4 ring-rose-500/40"
        : "bg-rose-600 text-white border-2 border-rose-600 shadow-lg shadow-rose-500/30 ring-4 ring-rose-500/20",
    },
  ]

  const currentStatus = todayCheckin?.wellness_status || selectedStatus

  const handleSelectStatus = async (status: string) => {
    setSelectedStatus(status)
    setIsSubmitting(true)

    try {
      await api.post("/api/v1/checkins", {
        wellness_status: status,
        notes: notes.trim() || undefined,
        source: "manual",
      })

      const statusObj = statusOptions.find((o) => o.id === status)
      toast.success(`Check-in recorded: Feeling ${statusObj?.label || status}!`, {
        description: "Your health record has been updated for today.",
      })

      mutate()
      onCheckinSuccess?.()

      if (status === "NEEDS_HELP" && onNeedHelpSelected) {
        onNeedHelpSelected()
      }
    } catch (err: any) {
      toast.error("Could not record check-in", {
        description: err?.response?.data?.detail || "Please try again in a moment.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveNotes = async () => {
    const statusToUse = currentStatus || "GOOD"
    setIsSubmitting(true)
    try {
      await api.post("/api/v1/checkins", {
        wellness_status: statusToUse,
        notes: notes.trim() || undefined,
        source: "manual",
      })
      toast.success("Note saved successfully!")
      mutate()
      onCheckinSuccess?.()
    } catch (err) {
      toast.error("Could not save note")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={cn(
        "rounded-3xl border-2 p-6 shadow-sm transition-all duration-300",
        highContrast
          ? "bg-black border-yellow-400 text-white"
          : "bg-card border-border hover:border-border/80"
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
              highContrast ? "bg-yellow-400 text-black" : "bg-sky-500/10 text-sky-600 dark:text-sky-400"
            )}
          >
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              How are you feeling today?
            </h2>
            <p className={cn("text-sm font-medium", highContrast ? "text-yellow-200" : "text-muted-foreground")}>
              Tap your status below to share your daily wellness signal.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHistoryModal(true)}
          className={cn(
            "min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors border",
            highContrast
              ? "bg-zinc-900 border-yellow-400 text-yellow-300 hover:bg-zinc-800"
              : "bg-muted hover:bg-muted/80 text-foreground border-border"
          )}
        >
          <History className="w-4 h-4" />
          <span>Past Check-ins</span>
        </button>
      </div>

      {/* Recorded status notice for today */}
      {todayCheckin && (
        <div
          className={cn(
            "mb-4 p-3.5 rounded-2xl border flex items-center justify-between gap-3",
            highContrast
              ? "bg-zinc-900 border-emerald-400 text-emerald-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
          )}
        >
          <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <span>
              Recorded for today:{" "}
              <span className="underline decoration-2">
                {todayCheckin.wellness_status.replace("_", " ")}
              </span>
            </span>
          </div>
          <span className="text-xs opacity-75 hidden sm:inline">Tap another option to update</span>
        </div>
      )}

      {/* 4 Large Touch Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 mb-4">
        {statusOptions.map((opt) => {
          const isSelected = currentStatus === opt.id
          const IconComp = opt.icon

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectStatus(opt.id)}
              disabled={isSubmitting}
              className={cn(
                "min-h-[96px] sm:min-h-[112px] p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 cursor-pointer",
                isSelected ? opt.activeClass : opt.bgClass
              )}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-2xl sm:text-3xl" role="img" aria-label={opt.label}>
                  {opt.emoji}
                </span>
                <IconComp className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              </div>
              <span className="text-base sm:text-lg font-extrabold leading-tight tracking-wide">
                {opt.label}
              </span>
              <span
                className={cn(
                  "text-[11px] sm:text-xs mt-1 leading-snug line-clamp-1",
                  isSelected
                    ? highContrast ? "text-black font-semibold" : "text-white/90"
                    : highContrast ? "text-yellow-100" : "text-muted-foreground"
                )}
              >
                {opt.subtitle}
              </span>
            </button>
          )
        })}
      </div>

      {/* Optional Note Box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-border/50">
        <div className="relative flex-1">
          <MessageSquare className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              todayCheckin?.notes
                ? `Note: "${todayCheckin.notes}"`
                : "Add an optional note (e.g., 'Slept well', 'Mild knee ache')..."
            }
            className={cn(
              "w-full min-h-[44px] pl-10 pr-4 py-2 text-sm sm:text-base rounded-xl border focus:outline-none transition-colors",
              highContrast
                ? "bg-zinc-900 border-yellow-400 text-white placeholder-zinc-400 focus:ring-2 focus:ring-yellow-400"
                : "bg-background border-border focus:ring-2 focus:ring-sky-500"
            )}
          />
        </div>
        <button
          onClick={handleSaveNotes}
          disabled={isSubmitting || (!notes.trim() && !todayCheckin?.notes)}
          className={cn(
            "min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40",
            highContrast
              ? "bg-yellow-400 text-black hover:bg-yellow-300"
              : "bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
          )}
        >
          <Send className="w-4 h-4" />
          <span>Save Note</span>
        </button>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={cn(
              "rounded-3xl border-2 max-w-lg w-full p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl",
              highContrast ? "bg-black border-yellow-400 text-white" : "bg-card border-border text-foreground"
            )}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <History className="w-6 h-6 text-sky-500" />
                <h3 className="text-lg sm:text-xl font-bold">Past 30 Days Check-ins</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted font-bold text-base"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {history && history.length > 0 ? (
                history.map((item) => {
                  const statusOpt = statusOptions.find((o) => o.id === item.wellness_status)
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "p-4 rounded-2xl border flex items-center justify-between gap-3",
                        highContrast ? "bg-zinc-900 border-zinc-700" : "bg-muted/40 border-border"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{statusOpt?.emoji || "🟢"}</span>
                        <div>
                          <p className="text-sm sm:text-base font-bold">
                            {statusOpt?.label || item.wellness_status}
                          </p>
                          {item.notes && (
                            <p className="text-xs sm:text-sm text-muted-foreground italic mt-0.5">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold opacity-75 font-mono shrink-0">
                        {item.date}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No previous check-in records found.
                </p>
              )}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className={cn(
                "w-full min-h-[44px] py-2.5 rounded-xl font-bold text-sm transition-colors",
                highContrast
                  ? "bg-yellow-400 text-black hover:bg-yellow-300"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              Close History
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
