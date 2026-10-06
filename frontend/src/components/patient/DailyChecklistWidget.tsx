"use client"

import { useState } from "react"
import { CheckSquare, CheckCircle2, XCircle, Clock, Pill, Droplet, Activity, Heart, RefreshCw, AlertTriangle, Sparkles } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import useSWR from "swr"
import { cn } from "@/lib/utils"

interface DailyChecklistWidgetProps {
  highContrast?: boolean
  onItemUpdated?: () => void
}

interface ChecklistItem {
  id: string
  title: string
  category: string
  scheduled_time?: string
  priority?: string
  recurrence?: string
  active?: boolean
}

interface ChecklistLog {
  id: string
  item_id: string
  patient_id: string
  scheduled_for: string
  completed_at?: string | null
  status: "PENDING" | "COMPLETED" | "SKIPPED" | "MISSED" | string
  source: string
  item: ChecklistItem
}

const fetcher = (url: string) => api.get(url).then((res) => res.data)

export function DailyChecklistWidget({
  highContrast = false,
  onItemUpdated
}: DailyChecklistWidgetProps) {
  const { data: checklistLogs, mutate, isLoading } = useSWR<ChecklistLog[]>(
    "/api/v1/checklist/today",
    fetcher,
    { revalidateOnFocus: true }
  )
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleComplete = async (logId: string, title: string) => {
    setUpdatingId(logId)
    try {
      await api.post(`/api/v1/checklist/${logId}/complete`)
      toast.success(`Completed: ${title}! 🎉`, {
        description: "Great progress on today's routine.",
      })
      mutate()
      onItemUpdated?.()
    } catch (err: any) {
      toast.error("Could not complete checklist item", {
        description: err?.response?.data?.detail || "Please try again.",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSkip = async (logId: string, title: string) => {
    setUpdatingId(logId)
    try {
      await api.post(`/api/v1/checklist/${logId}/skip`)
      toast.info(`Skipped: ${title}`, {
        description: "Marked as skipped for today.",
      })
      mutate()
      onItemUpdated?.()
    } catch (err: any) {
      toast.error("Could not skip checklist item", {
        description: err?.response?.data?.detail || "Please try again.",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const totalCount = checklistLogs?.length || 0
  const completedCount = checklistLogs?.filter((l) => l.status === "COMPLETED").length || 0
  const skippedCount = checklistLogs?.filter((l) => l.status === "SKIPPED").length || 0
  const pendingCount = checklistLogs?.filter((l) => l.status === "PENDING" || l.status === "MISSED").length || 0
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "medication":
        return <Pill className="w-5 h-5 text-indigo-500" />
      case "hydration":
        return <Droplet className="w-5 h-5 text-sky-500" />
      case "exercise":
      case "movement":
        return <Activity className="w-5 h-5 text-emerald-500" />
      case "vitals":
        return <Heart className="w-5 h-5 text-rose-500" />
      default:
        return <CheckSquare className="w-5 h-5 text-amber-500" />
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
              highContrast ? "bg-yellow-400 text-black" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            )}
          >
            <CheckSquare className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Today's Care Checklist
            </h2>
            <p className={cn("text-xs font-medium", highContrast ? "text-yellow-200" : "text-muted-foreground")}>
              {totalCount > 0
                ? `${completedCount} of ${totalCount} completed today`
                : "Your daily scheduled health items"}
            </p>
          </div>
        </div>

        <button
          onClick={() => mutate()}
          disabled={isLoading}
          className={cn(
            "h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border cursor-pointer",
            highContrast
              ? "bg-zinc-900 border-yellow-400 text-yellow-300 hover:bg-zinc-800"
              : "bg-muted hover:bg-muted/80 text-foreground border-border"
          )}
          title="Refresh today's items"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Progress Bar & Cheer */}
      {totalCount > 0 && (
        <div
          className={cn(
            "mb-3.5 p-3 rounded-xl border",
            highContrast
              ? "bg-zinc-900 border-yellow-400/50"
              : "bg-muted/30 border-border/60"
          )}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <span>Today's Progress</span>
              {progressPercent === 100 && <Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
            </span>
            <span
              className={cn(
                "text-xs font-bold",
                progressPercent === 100
                  ? "text-emerald-500"
                  : highContrast
                  ? "text-yellow-300"
                  : "text-foreground"
              )}
            >
              {progressPercent}% Done ({completedCount}/{totalCount})
            </span>
          </div>

          <div
            className={cn(
              "w-full h-2 rounded-full overflow-hidden",
              highContrast ? "bg-zinc-800 border border-yellow-400" : "bg-muted"
            )}
          >
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                highContrast
                  ? "bg-yellow-400"
                  : progressPercent === 100
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-emerald-500 to-sky-500"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {progressPercent === 100 && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
              <span>🎉 Excellent job! You've completed all tasks for today!</span>
            </p>
          )}
        </div>
      )}

      {/* Checklist items list */}
      <div className="space-y-2.5">
        {isLoading && !checklistLogs ? (
          <div className="py-6 text-center text-muted-foreground text-xs space-y-2">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading checklist items...</p>
          </div>
        ) : checklistLogs && checklistLogs.length > 0 ? (
          checklistLogs.map((log) => {
            const isCompleted = log.status === "COMPLETED"
            const isSkipped = log.status === "SKIPPED"
            const isMissed = log.status === "MISSED"
            const item = log.item || {}
            const isHighPriority = item.priority === "high"

            return (
              <div
                key={log.id}
                className={cn(
                  "p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200",
                  isCompleted
                    ? highContrast
                      ? "bg-zinc-950 border-emerald-400/80 text-zinc-300"
                      : "bg-emerald-500/10 border-emerald-500/25 text-foreground"
                    : isSkipped
                    ? highContrast
                      ? "bg-zinc-900 border-zinc-700 text-zinc-400 opacity-60"
                      : "bg-muted/40 border-muted text-muted-foreground opacity-60"
                    : highContrast
                    ? "bg-black border-yellow-400 text-white"
                    : "bg-background border-border hover:border-sky-500/40"
                )}
              >
                {/* Item Details */}
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0 mt-0.5",
                      highContrast
                        ? "bg-zinc-800 text-yellow-300 border border-yellow-400/40"
                        : "bg-muted/60"
                    )}
                  >
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={cn(
                          "text-sm font-semibold leading-snug",
                          isCompleted && "line-through opacity-75"
                        )}
                      >
                        {item.title}
                      </h3>

                      {isHighPriority && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          High
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {item.scheduled_time && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded",
                            highContrast
                              ? "bg-zinc-800 text-yellow-200"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{item.scheduled_time}</span>
                        </span>
                      )}

                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                          highContrast
                            ? "bg-zinc-800 text-white"
                            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        )}
                      >
                        {item.category || "routine"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badges & Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!isCompleted && !isSkipped && (
                    <>
                      <button
                        onClick={() => handleComplete(log.id, item.title)}
                        disabled={updatingId === log.id}
                        className={cn(
                          "h-8 px-3 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer",
                          highContrast
                            ? "bg-emerald-400 text-black hover:bg-emerald-300 border border-emerald-300"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                        )}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Done</span>
                      </button>

                      <button
                        onClick={() => handleSkip(log.id, item.title)}
                        disabled={updatingId === log.id}
                        className={cn(
                          "h-8 px-2.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer",
                          highContrast
                            ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground border-border"
                        )}
                      >
                        <span>Skip</span>
                      </button>
                    </>
                  )}

                  {isCompleted && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs border",
                        highContrast
                          ? "bg-emerald-950 border-emerald-400 text-emerald-300"
                          : "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Completed</span>
                    </span>
                  )}

                  {isSkipped && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs border",
                        highContrast
                          ? "bg-zinc-900 border-zinc-700 text-zinc-400"
                          : "bg-muted border-border text-muted-foreground"
                      )}
                    >
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Skipped</span>
                    </span>
                  )}

                  {isMissed && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Missed</span>
                    </span>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-8 text-center text-muted-foreground rounded-2xl border border-dashed border-border p-6">
            <CheckSquare className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="font-semibold text-base">No tasks scheduled for today.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your care team will add recurring daily items here as needed.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
