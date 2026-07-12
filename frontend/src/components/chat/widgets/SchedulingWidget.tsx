'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, parse } from 'date-fns'
import api from '@/lib/api'

const AVAILABLE_SLOTS = ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"]

export function SchedulingWidget() {
  const [step, setStep] = useState<'date' | 'time' | 'confirm' | 'success'>('date')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setStep('time')
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep('confirm')
  }

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return
    setIsLoading(true)
    setError(null)

    try {
      // Parse "09:00 AM" and combine with selectedDate
      const parsedTime = parse(selectedTime, 'hh:mm a', selectedDate)
      
      await api.post('/api/follow-ups/', {
        appointment_date: parsedTime.toISOString(),
        notes: "Requested via AI Assistant"
      })
      
      setStep('success')
    } catch (err) {
      console.error("Booking failed", err)
      setError("Failed to book appointment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Generate next 5 days for the mini-calendar
  const nextDays = Array.from({ length: 5 }).map((_, i) => addDays(new Date(), i + 1))

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm w-full max-w-sm mb-4 font-sans">
      <div className="flex items-center gap-3 text-sky-500 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 bg-sky-50 dark:bg-sky-950/30 rounded-xl">
          <CalendarIcon size={20} />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200">Doctor Appointment</h4>
      </div>

      <AnimatePresence mode="wait">
        {step === 'date' && (
          <motion.div
            key="date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col gap-3"
          >
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select a date for your visit:</p>
            <div className="grid grid-cols-5 gap-2">
              {nextDays.map((date, i) => (
                <button
                  key={i}
                  onClick={() => handleDateSelect(date)}
                  className="flex flex-col items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 hover:text-sky-600 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{format(date, 'EEE')}</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{format(date, 'd')}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'time' && (
          <motion.div
            key="time"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {selectedDate && format(selectedDate, 'EEEE, MMM d')}
              </p>
              <button onClick={() => setStep('date')} className="text-xs text-sky-500 font-semibold hover:underline">Change</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className="py-2 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
                >
                  <Clock size={14} className="text-sky-500" />
                  {time}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Confirm Appointment</h5>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')} <br/>
                at <strong className="text-slate-700 dark:text-slate-300">{selectedTime}</strong>
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('time')} disabled={isLoading} className="flex-1 py-3 text-slate-600 dark:text-slate-400 text-sm font-bold bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                Back
              </button>
              <button onClick={handleConfirm} disabled={isLoading} className="flex-[2] py-3 text-white text-sm font-bold bg-sky-500 rounded-xl hover:bg-sky-600 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    Confirm
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
            {error && <p className="text-xs text-rose-500 text-center font-medium mt-1">{error}</p>}
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 mb-4 shadow-sm border border-emerald-200 dark:border-emerald-900/50">
              <CheckCircle2 size={32} />
            </div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200">Appointment Booked!</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-4 leading-relaxed">
              You are scheduled for {selectedDate && format(selectedDate, 'MMM d')} at {selectedTime}. We'll send a reminder.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
