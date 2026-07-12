"use client"

import { useTranslations } from "next-intl"
import { useAuthStore } from "@/store/authStore"
import { Link } from "@/i18n/routing"
import { Stethoscope, Mail, Phone, CalendarDays, ArrowRight, MessageSquare, Plus, Clock, User, CheckCircle } from "lucide-react"
import api from "@/lib/api"
import useSWR from "swr"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { motion } from "framer-motion"

const fetcher = (url: string) => api.get(url).then(res => res.data)

export default function CareTeamPage() {
  const t = useTranslations("Dashboard")
  const user = useAuthStore((state) => state.user)

  const { data: myDoctor, error, isLoading } = useSWR(
    '/api/dashboard/my-doctor',
    fetcher
  )
  
  const { data: followUps, isLoading: followUpsLoading } = useSWR<any[]>(
    '/api/follow-ups/',
    fetcher
  )

  const pendingAppointments = followUps?.filter(f => f.status === 'scheduled') || []
  const pastAppointments = followUps?.filter(f => f.status === 'completed') || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !myDoctor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Stethoscope className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">No Care Team Assigned</h2>
        <p className="text-muted-foreground">It looks like you haven't been assigned a primary care doctor yet.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">My Care Team</h1>
        <p className="text-muted-foreground text-sm">Your dedicated primary care provider</p>
      </div>

      {/* Doctor Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-card border border-border rounded-3xl overflow-hidden shadow-sm"
      >
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 -mt-12 sm:-mt-16 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-lg ring-1 ring-border">
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Dr. {myDoctor.name}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mt-1">
                  <Stethoscope className="w-4 h-4" />
                  <span>Primary Care Physician</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/en/dashboard" 
                className="btn-glow flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Memo</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-border">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" /> Contact Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-medium">{myDoctor.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Phone className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-medium">{myDoctor.phone || "Not provided"}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" /> Availability & Quick Actions
              </h3>
              <div className="space-y-3">
                 <Link href="/en/appointments" className="group flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Request Appointment</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                 </Link>
                 <Link href="/en/reports" className="group flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:border-sky-500/50 hover:bg-sky-50 dark:hover:bg-sky-900/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground group-hover:text-sky-700 dark:group-hover:text-sky-400">Share Health Report</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                 </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Appointments with this doctor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Upcoming Appointments</h3>
          {followUpsLoading ? (
            <Skeleton className="h-32 w-full rounded-2xl" />
          ) : pendingAppointments.length > 0 ? (
            <div className="space-y-3">
              {pendingAppointments.map((apt) => (
                <div key={apt.id} className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                      {new Date(apt.appointment_date).getDate()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{new Date(apt.appointment_date).toLocaleDateString(undefined, { weekday: 'long', month: 'short' })}</h4>
                      <p className="text-sm text-muted-foreground">{new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          ) : (
             <div className="bg-muted/30 border border-border border-dashed rounded-2xl p-8 text-center text-muted-foreground">
               No upcoming appointments.
             </div>
          )}
        </div>

        {/* Past */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Recent Visits</h3>
          {followUpsLoading ? (
            <Skeleton className="h-32 w-full rounded-2xl" />
          ) : pastAppointments.length > 0 ? (
            <div className="space-y-3">
              {pastAppointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between opacity-80">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold">
                      {new Date(apt.appointment_date).getDate()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{new Date(apt.appointment_date).toLocaleDateString(undefined, { weekday: 'long', month: 'short' })}</h4>
                      <p className="text-sm text-muted-foreground">{new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          ) : (
             <div className="bg-muted/30 border border-border border-dashed rounded-2xl p-8 text-center text-muted-foreground">
               No past visits recorded.
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
