'use client'

import { useState, useEffect } from 'react'
import { Pill, CheckCircle, XCircle, Clock, MoreVertical, Trash2, Undo2, FileText, Calendar, Flame, Timer, Info, Syringe, Droplet, Package, Beaker } from 'lucide-react'
import api from '@/lib/api'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  times_of_day: string[]
  is_active: boolean
  start_date: string
  end_date?: string
  notes?: string
  status?: string
}

interface MedicationLog {
  id: string
  medication_id: string
  status: string
  scheduled_time: string
  taken_at?: string
}

interface MedicationCardProps {
  medication: Medication
  streak?: number
  onLogSuccess?: () => void
}

export function MedicationCard({ medication, streak = 0, onLogSuccess }: MedicationCardProps) {
  const router = useRouter()
  const [loggingTime, setLoggingTime] = useState<string | null>(null)
  const [todayLogs, setTodayLogs] = useState<Record<string, MedicationLog>>({})
  const [loadingLogs, setLoadingLogs] = useState(true)

  const todayStr = new Date().toISOString().split('T')[0]
  const isUpcoming = medication.start_date > todayStr
  const isPending = medication.status === 'pending'
  const isInactive = !medication.is_active || (medication.end_date && medication.end_date < todayStr)

  useEffect(() => {
    const fetchRecentLogs = async () => {
      try {
        const res = await api.get(`/api/medications/${medication.id}/logs?limit=50`)
        const logs: MedicationLog[] = res.data
        const todayLogsMap: Record<string, MedicationLog> = {}
        const today = new Date().toDateString()
        
        for (const log of logs) {
          const logDateObj = new Date(log.scheduled_time)
          if (logDateObj.toDateString() === today) {
            const h = logDateObj.getHours().toString().padStart(2, '0')
            const m = logDateObj.getMinutes().toString().padStart(2, '0')
            todayLogsMap[`${h}:${m}`] = log
          }
        }
        setTodayLogs(todayLogsMap)
      } catch (e) {
        console.error("Failed to fetch logs:", e)
      } finally {
        setLoadingLogs(false)
      }
    }

    if (!isUpcoming && !isInactive && !isPending) {
      fetchRecentLogs()
    } else {
      setLoadingLogs(false)
    }
  }, [medication.id, isUpcoming, isInactive, isPending])

  const logDose = async (status: 'taken' | 'missed' | 'skipped', timeOfDay: string) => {
    setLoggingTime(timeOfDay)
    try {
      const [h, m] = timeOfDay.split(':').map(Number)
      const scheduledDate = new Date()
      scheduledDate.setHours(h, m, 0, 0)
      
      const res = await api.post(`/api/medications/${medication.id}/log`, { 
        status,
        scheduled_time: scheduledDate.toISOString()
      })
      
      setTodayLogs(prev => ({ ...prev, [timeOfDay]: res.data }))
      toast.success(`Dose marked as ${status}`)
      onLogSuccess?.()
    } catch (e) {
      toast.error("Failed to log dose")
      console.error(e)
    } finally {
      setLoggingTime(null)
    }
  }

  const undoLog = async (timeOfDay: string) => {
    const log = todayLogs[timeOfDay]
    if (!log) return
    setLoggingTime(timeOfDay)
    try {
      await api.delete(`/api/medications/logs/${log.id}`)
      setTodayLogs(prev => {
        const next = { ...prev }
        delete next[timeOfDay]
        return next
      })
      toast.success("Dose log undone")
      onLogSuccess?.()
    } catch (e) {
      toast.error("Failed to undo log")
      console.error(e)
    } finally {
      setLoggingTime(null)
    }
  }

  const handleDelete = async () => {
    toast("Are you sure?", {
      description: `Do you want to delete ${medication.name}?`,
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await api.delete(`/api/medications/${medication.id}`)
            toast.success("Medication deleted")
            onLogSuccess?.()
          } catch (e) {
            toast.error("Failed to delete medication")
            console.error(e)
          }
        }
      },
      cancel: { label: "Cancel", onClick: () => {} },
    })
  }

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`
  }

  const formatMedDate = (d: string) => {
    const dt = new Date(d);
    return new Date(dt.getTime() + (dt.getTimezoneOffset() * 60000)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  let durationStr = `Started ${formatMedDate(medication.start_date)}`
  let daysRemaining: number | null = null
  if (medication.end_date) {
    durationStr = `${formatMedDate(medication.start_date)} - ${formatMedDate(medication.end_date)}`
    const endObj = new Date(medication.end_date)
    const todayObj = new Date(todayStr)
    const diffTime = Math.max(0, endObj.getTime() - todayObj.getTime())
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getNextDoseStr = () => {
    if (isUpcoming || isInactive || !medication.times_of_day?.length) return null
    const now = new Date()
    const currentMins = now.getHours() * 60 + now.getMinutes()
    let nextTimeStr = null
    let nextMinsDiff = Infinity
    for (const t of medication.times_of_day) {
      if (todayLogs[t]?.status === 'taken') continue // Skip already taken doses
      const [h, m] = t.split(':').map(Number)
      const totalMins = h * 60 + m
      if (totalMins > currentMins && (totalMins - currentMins) < nextMinsDiff) {
        nextMinsDiff = totalMins - currentMins
        nextTimeStr = t
      }
    }
    if (nextTimeStr) {
      const hrs = Math.floor(nextMinsDiff / 60)
      const mins = nextMinsDiff % 60
      return `Next dose in ${hrs > 0 ? `${hrs}h ` : ''}${mins}m`
    }
    return null
  }
  const nextDoseStr = getNextDoseStr()

  const getIconForDosage = () => {
    const d = (medication.dosage || '').toLowerCase()
    if (d.includes('ml') || d.includes('liquid') || d.includes('syrup') || d.includes('tonic') || d.includes('drops')) return Droplet
    if (d.includes('injection') || d.includes('mcg') || d.includes('pen') || d.includes('syringe')) return Syringe
    if (d.includes('packet') || d.includes('sachet') || d.includes('powder')) return Package
    if (d.includes('spoon') || d.includes('tbsp') || d.includes('tsp')) return Beaker
    return Pill
  }
  const MedIcon = getIconForDosage()

  return (
    <div className={`bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group ${isInactive ? 'opacity-60 grayscale-[0.3]' : ''}`}>
      
      {/* Absolute Badges */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {streak > 1 && !isInactive && !isUpcoming && !isPending && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-bold text-xs shadow-sm">
            <Flame size={12} className="fill-orange-500 text-orange-500" />
            {streak} Day Streak
          </div>
        )}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
              <MoreVertical size={16} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" className="min-w-[160px] bg-card border border-border rounded-lg shadow-xl p-1 z-[100] animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
              <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md cursor-pointer outline-none" onClick={handleDelete}>
                <Trash2 size={14} /> Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div className="flex items-start gap-4 mb-4 pr-24">
        <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
          <MedIcon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg truncate">{medication.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{medication.dosage} · {medication.frequency}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {isInactive ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Inactive
          </span>
        ) : isUpcoming ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400">
            <Calendar size={12} /> Starts {format(new Date(medication.start_date), 'MMM d')}
          </span>
        ) : isPending ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
            <Clock size={12} /> Pending Approval
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
            Active
          </span>
        )}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800">
          <Calendar size={13} className="text-sky-500" />
          {durationStr}
        </div>
        {daysRemaining !== null && daysRemaining > 0 && !isInactive && (
          <div className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-2 py-1 rounded-full">
            {daysRemaining} Days Left
          </div>
        )}
      </div>

      {medication.notes && (
        <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg mb-4 text-sm text-muted-foreground border border-slate-100 dark:border-slate-800/50">
          <Info size={16} className="shrink-0 text-sky-500 mt-0.5" />
          <p className="italic leading-snug break-words">{medication.notes}</p>
        </div>
      )}

      {nextDoseStr && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg mb-4 inline-flex">
          <Timer size={14} className="animate-pulse" />
          {nextDoseStr}
        </div>
      )}

      {!isUpcoming && !isInactive && !isPending && (
        <div className="mt-2 pt-4 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-3">Today&apos;s Doses</p>

          {loadingLogs ? (
            <div className="h-[38px] flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : medication.times_of_day?.length > 0 ? (
            <div className="space-y-3">
              {medication.times_of_day.map((t) => {
                const log = todayLogs[t]
                const isLogging = loggingTime === t
                return (
                  <div key={t} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 font-medium text-sm w-24 shrink-0">
                      <Clock size={14} className="text-muted-foreground" />
                      {formatTime(t)}
                    </div>
                    
                    <div className="flex-1 flex justify-end">
                      {log ? (
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold
                            ${log.status === 'taken' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : ''}
                            ${log.status === 'missed' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' : ''}
                            ${log.status === 'skipped' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' : ''}
                          `}>
                            {log.status === 'taken' && <><CheckCircle size={12} /> Taken</>}
                            {log.status === 'missed' && <><XCircle size={12} /> Missed</>}
                            {log.status === 'skipped' && <><XCircle size={12} /> Skipped</>}
                          </div>
                          <button disabled={loggingTime !== null} onClick={() => undoLog(t)} className="text-xs text-muted-foreground hover:text-rose-500 transition-colors disabled:opacity-50" title="Undo / Edit Log">
                            <Undo2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => logDose('taken', t)} disabled={loggingTime !== null} className="flex items-center justify-center py-1.5 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 rounded-md text-xs font-semibold transition-colors disabled:opacity-50">
                            {isLogging ? '...' : 'Take'}
                          </button>
                          <button onClick={() => logDose('missed', t)} disabled={loggingTime !== null} className="flex items-center justify-center py-1.5 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 rounded-md text-xs font-semibold transition-colors disabled:opacity-50">
                            {isLogging ? '...' : 'Miss'}
                          </button>
                          <button onClick={() => logDose('skipped', t)} disabled={loggingTime !== null} className="flex items-center justify-center py-1.5 px-3 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60 rounded-md text-xs font-semibold transition-colors disabled:opacity-50">
                            {isLogging ? '...' : 'Skip'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No times scheduled for this medication.</p>
          )}
        </div>
      )}
      
      {isUpcoming && (
        <div className="mt-2 pt-4 border-t border-border flex items-center justify-center text-sm text-sky-600 dark:text-sky-400 font-medium bg-sky-50 dark:bg-sky-900/20 py-2 rounded-lg">
          Starts {durationStr.replace('Started ', '')}
        </div>
      )}
    </div>
  )
}
