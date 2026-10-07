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
      subtitle: "Feeling well",
      emoji: "🟢",
      icon: Smile,
      color: "emerald",
      bgClass: highContrast
        ? "bg-black border border-emerald-400 text-emerald-300 hover:bg-emerald-950/80"
        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20",
      activeClass: highContrast
        ? "bg-emerald-400 text-black border border-emerald-300 font-bold ring-2 ring-emerald-500/40"
        : "bg-emerald-600 text-white border border-emerald-600 shadow-sm ring-2 ring-emerald-500/25",
    },
    {
      id: "OKAY",
      label: "Okay",
      subtitle: "Just usual",
      emoji: "🟡",
      icon: Meh,
      color: "yellow",
      bgClass: highContrast
        ? "bg-black border border-yellow-400 text-yellow-300 hover:bg-yellow-950/80"
        : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/20",
      activeClass: highContrast
        ? "bg-yellow-400 text-black border border-yellow-300 font-bold ring-2 ring-yellow-500/40"
        : "bg-yellow-600 text-white border border-yellow-600 shadow-sm ring-2 ring-yellow-500/25",
    },
    {
      id: "NOT_WELL",
      label: "Not Well",
      subtitle: "Unwell or pain",
      emoji: "🟠",
      icon: Frown,
      color: "amber",
      bgClass: highContrast
        ? "bg-black border border-amber-400 text-amber-300 hover:bg-amber-950/80"
        : "bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20",
      activeClass: highContrast
        ? "bg-amber-400 text-black border border-amber-300 font-bold ring-2 ring-amber-500/40"
        : "bg-amber-600 text-white border border-amber-600 shadow-sm ring-2 ring-amber-500/25",
    },
    {
      id: "NEEDS_HELP",
      label: "Need Help",
      subtitle: "Need assist",
      emoji: "🔴",
      icon: AlertCircle,
      color: "rose",
      bgClass: highContrast
        ? "bg-black border border-rose-400 text-rose-300 hover:bg-rose-950/80"
        : "bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20",
      activeClass: highContrast
        ? "bg-rose-500 text-white border border-rose-300 font-bold ring-2 ring-rose-500/40"
        : "bg-rose-600 text-white border border-rose-600 shadow-sm ring-2 ring-rose-500/25",
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
        "rounded-2xl border p-5 shadow-xs transition-all duration-300",
        highContrast
          ? "bg-black border-yellow-400 text-white"
          : "bg-card border-border hover:border-border/80"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
              highContrast ? "bg-yellow-400 text-black" : "bg-sky-500/10 text-sky-600 dark:text-sky-400"
            )}
          >
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              How are you feeling today?
            </h2>
            <p className={cn("text-xs font-medium", highContrast ? "text-yellow-200" : "text-muted-foreground")}>
              Daily wellness check-in
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHistoryModal(true)}
          className={cn(
            "h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border cursor-pointer",
            highContrast
              ? "bg-zinc-900 border-yellow-400 text-yellow-300 hover:bg-zinc-800"
              : "bg-muted hover:bg-muted/80 text-foreground border-border"
          )}
        >
          <History className="w-3.5 h-3.5" />
          <span>History</span>
        </button>
      </div>

      {/* Recorded status notice for today */}
      {todayCheckin && (
        <div
          className={cn(
            "mb-3 p-2.5 px-3 rounded-xl border flex items-center justify-between gap-2.5 text-xs",
            highContrast
              ? "bg-zinc-900 border-emerald-400 text-emerald-300"
              : "bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-200"
          )}
        >
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>
              Recorded today:{" "}
              <span className="font-bold underline decoration-1">
                {todayCheckin.wellness_status.replace("_", " ")}
              </span>
            </span>
          </div>
          <span className="text-[11px] opacity-75 hidden sm:inline">Tap to update</span>
        </div>
      )}

      {/* 4 Status Option Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        {statusOptions.map((opt) => {
          const isSelected = currentStatus === opt.id

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectStatus(opt.id)}
              disabled={isSubmitting}
              className={cn(
                "p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-150 active:scale-95 cursor-pointer",
                isSelected ? opt.activeClass : opt.bgClass
              )}
            >
              <span className="text-lg leading-none mb-1" role="img" aria-label={opt.label}>
                {opt.emoji}
              </span>
              <span className="text-xs font-bold leading-tight">
                {opt.label}
              </span>
              <span
                className={cn(
                  "text-[10px] mt-0.5 leading-tight line-clamp-1 hidden sm:block",
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
      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <div className="relative flex-1">
          <MessageSquare className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              todayCheckin?.notes
                ? `Note: "${todayCheckin.notes}"`
                : "Add a quick note (e.g., 'Slept well')..."
            }
            className={cn(
              "w-full h-8 pl-8 pr-3 text-xs rounded-lg border focus:outline-none transition-colors",
              highContrast
                ? "bg-zinc-900 border-yellow-400 text-white placeholder-zinc-400 focus:ring-1 focus:ring-yellow-400"
                : "bg-background border-border focus:ring-1 focus:ring-sky-500"
            )}
          />
        </div>
        <button
          onClick={handleSaveNotes}
          disabled={isSubmitting || (!notes.trim() && !todayCheckin?.notes)}
          className={cn(
            "h-8 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 cursor-pointer",
            highContrast
              ? "bg-yellow-400 text-black hover:bg-yellow-300"
              : "bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
          )}
        >
          <Send className="w-3 h-3" />
          <span>Save</span>
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
