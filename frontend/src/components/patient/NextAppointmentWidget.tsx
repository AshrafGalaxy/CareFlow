"use client"

import { CalendarDays, Stethoscope, PhoneCall, ArrowRight, Clock, MapPin, CalendarCheck } from "lucide-react"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

interface NextAppointment {
  id: string
  doctor_name: string
  specialty?: string
  appointment_date: string
  status: string
  doctor_phone?: string
  location?: string
}

interface NextAppointmentWidgetProps {
  nextAppointment?: NextAppointment | null
  highContrast?: boolean
  assignedDoctorPhone?: string
}

export function NextAppointmentWidget({
  nextAppointment,
  highContrast = false,
  assignedDoctorPhone
}: NextAppointmentWidgetProps) {
  let formattedDate = "—"
  let formattedTime = ""
  let isTodayOrSoon = false

  if (nextAppointment?.appointment_date) {
    try {
      const apptDate = new Date(nextAppointment.appointment_date)
      const now = new Date()
      const diffHours = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (diffHours < 24 && diffHours > 0) {
        formattedDate = "Tomorrow"
        isTodayOrSoon = true
      } else if (diffHours <= 0 && diffHours > -24) {
        formattedDate = "Today"
        isTodayOrSoon = true
      } else {
        formattedDate = apptDate.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      }

      formattedTime = apptDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch (e) {
      formattedDate = nextAppointment.appointment_date
    }
  }

  const phoneToCall = nextAppointment?.doctor_phone || assignedDoctorPhone

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
                highContrast ? "bg-yellow-400 text-black" : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
              )}
            >
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Appointments
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Next Visit
              </h2>
            </div>
          </div>

          <Link
            href="/appointments"
            className={cn(
              "text-xs sm:text-sm font-bold flex items-center gap-1 hover:underline shrink-0",
              highContrast ? "text-yellow-300" : "text-violet-600 dark:text-violet-400"
            )}
          >
            <span>All Visits</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card Details */}
        {nextAppointment ? (
          <div
            className={cn(
              "p-4 sm:p-5 rounded-2xl border-2 mb-4",
              highContrast
                ? "bg-zinc-900 border-violet-400/80 text-white"
                : "bg-violet-50/50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/60"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-bold text-xs uppercase tracking-wide">
                  <Stethoscope className="w-4 h-4" />
                  <span>{nextAppointment.specialty || "Care Provider"}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mt-1">
                  Dr. {nextAppointment.doctor_name}
                </h3>
              </div>

              {isTodayOrSoon && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-700 dark:text-violet-300 animate-pulse border border-violet-500/30">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  Upcoming
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-violet-200/60 dark:border-violet-800/40 text-sm font-bold text-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>{formattedDate}</span>
              </div>
              {formattedTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>{formattedTime}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-dashed border-border text-center text-muted-foreground mb-4">
            <CalendarDays className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-base font-semibold">No visits currently scheduled</p>
            <p className="text-xs mt-1">
              You can schedule or request a consultation anytime with your care team.
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {phoneToCall && (
          <a
            href={`tel:${phoneToCall}`}
            className={cn(
              "flex-1 min-h-[48px] px-4 py-2.5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all active:scale-98 border shadow-sm",
              highContrast
                ? "bg-yellow-400 text-black hover:bg-yellow-300 border-yellow-300"
                : "bg-violet-600 hover:bg-violet-700 text-white border-transparent"
            )}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Clinic</span>
          </a>
        )}

        <Link
          href="/appointments"
          className={cn(
            "flex-1 min-h-[48px] px-4 py-2.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors border text-center",
            highContrast
              ? "bg-zinc-900 border-yellow-400 text-yellow-300 hover:bg-zinc-800"
              : "bg-muted hover:bg-muted/80 text-foreground border-border"
          )}
        >
          <span>{nextAppointment ? "View Details" : "Book Appointment"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
