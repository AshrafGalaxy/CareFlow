import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar as CalendarIcon, Clock, Loader2, AlertCircle, CheckCircle2, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface RequestFollowUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RequestFollowUpModal({ isOpen, onClose, onSuccess }: RequestFollowUpModalProps) {
  const [loading, setLoading] = useState(false)
  const minDate = React.useMemo(() => new Date().toISOString().split('T')[0], [])
  const maxDate = React.useMemo(() => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], [])
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([])
  const [doctorsLoading, setDoctorsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setDoctorsLoading(true)
      api.get('/api/dashboard/my-doctors').then(res => {
        setDoctors(res.data)
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, doctor_name: res.data[0].name }))
        }
      }).catch(err => console.error(err))
      .finally(() => setDoctorsLoading(false))
    }
  }, [isOpen])

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    doctor_name: '',
    reason_type: 'Routine Checkup',
    urgency: 'Normal',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.date || !formData.time) {
      toast.error('Please select a date and time')
      return
    }

    if (formData.urgency === 'Normal') {
      const d = new Date(formData.date);
      if (d.getUTCDay() === 0) {
        toast.error("Normal appointments cannot be requested on Sundays. Please mark as Urgent for Sunday visits.");
        return;
      }
    }

    setLoading(true)
    try {
      const datetime = new Date(`${formData.date}T${formData.time}`).toISOString()
      
      const formattedNotes = `[${formData.urgency}] Type: ${formData.reason_type}\n\n${formData.notes || 'No additional notes provided.'}`

      await api.post('/api/follow-ups/', {
        appointment_date: datetime,
        notes: formattedNotes,
        doctor_name: formData.doctor_name || undefined
      })
      
      toast.success('Follow-up requested successfully')
      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to request follow-up')
    } finally {
      setLoading(false)
    }
  }

  const reasonTypes = ["Routine Checkup", "Medication Review", "Symptom Review", "Test Results", "Other"]

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Request Appointment</h2>
                <p className="text-sm text-muted-foreground mt-1">Send a follow-up request to your doctor.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select Doctor</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={formData.doctor_name}
                    onChange={e => setFormData({ ...formData, doctor_name: e.target.value })}
                    disabled={doctorsLoading || doctors.length === 0}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 appearance-none disabled:opacity-50"
                  >
                    {doctorsLoading ? (
                      <option>Loading doctors...</option>
                    ) : doctors.length === 0 ? (
                      <option>No doctors assigned</option>
                    ) : (
                      doctors.map(doc => (
                        <option key={doc.id} value={doc.name}>
                          Dr. {doc.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Preferred Date</label>
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
                        setFormData({ ...formData, date: dateVal })
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Preferred Time</label>
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

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Reason for Visit</label>
                <div className="flex flex-wrap gap-2">
                  {reasonTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, reason_type: type })}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                        formData.reason_type === type 
                          ? "bg-sky-500 text-white border-sky-500" 
                          : "bg-background text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Urgency</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, urgency: 'Normal' })}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
                      formData.urgency === 'Normal' 
                        ? "bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-400" 
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Normal Priority
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, urgency: 'Urgent' })}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
                      formData.urgency === 'Urgent' 
                        ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400" 
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Urgent
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Additional Notes</label>
                <textarea
                  placeholder="Describe your symptoms or reason for the follow-up in more detail..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 min-h-[100px] resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Request
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
