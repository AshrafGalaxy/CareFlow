import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar as CalendarIcon, Clock, Loader2, StickyNote } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface ScheduleFollowUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  patientId: string
  patientName: string
  requestId?: string
}

export function ScheduleFollowUpModal({ isOpen, onClose, onSuccess, patientId, patientName, requestId }: ScheduleFollowUpModalProps) {
  const [loading, setLoading] = useState(false)
  const minDate = React.useMemo(() => new Date().toISOString().split('T')[0], [])
  const maxDate = React.useMemo(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], [])
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.date || !formData.time) {
      toast.error('Please select a date and time')
      return
    }

    setLoading(true)
    try {
      const datetime = new Date(`${formData.date}T${formData.time}`).toISOString()
      
      if (requestId) {
        await api.post(`/api/follow-ups/${requestId}/schedule`, {
          appointment_date: datetime,
          notes: formData.notes || null,
        })
      } else {
        await api.post('/api/follow-ups/', {
          appointment_date: datetime,
          patient_id: patientId,
          notes: formData.notes || null,
        })
      }
      
      toast.success('Follow-up scheduled successfully')
      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to schedule follow-up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Schedule Follow-up</h2>
                <p className="text-sm text-muted-foreground mt-1">For {patientName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      required
                      min={minDate}
                      max={maxDate}
                      value={formData.date}
                      onChange={e => {
                        const dateVal = e.target.value;
                        if (!dateVal) {
                          setFormData({ ...formData, date: dateVal });
                          return;
                        }
                        const d = new Date(dateVal);
                        if (d.getUTCDay() === 0) {
                          toast.error("Appointments cannot be scheduled on Sundays");
                          return;
                        }
                        setFormData({ ...formData, date: dateVal })
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="time"
                      required
                      min="09:00"
                      max="21:00"
                      value={formData.time}
                      onChange={e => {
                        const timeVal = e.target.value;
                        if (timeVal && (timeVal < "09:00" || timeVal > "21:00")) {
                          toast.error("Appointments must be between 09:00 AM and 09:00 PM");
                          return;
                        }
                        setFormData({ ...formData, time: timeVal })
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notes / Instructions (Optional)</label>
                <textarea
                  placeholder="Any instructions for the patient prior to the visit..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 min-h-[100px] resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Schedule Slot
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
