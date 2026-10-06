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
                highContrast ? "bg-yellow-400 text-black" : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
              )}
            >
              <CalendarDays className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Appointments
              </span>
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Next Visit
              </h2>
            </div>
          </div>

          <Link
            href="/appointments"
            className={cn(
              "text-xs font-semibold flex items-center gap-1 hover:underline shrink-0",
              highContrast ? "text-yellow-300" : "text-violet-600 dark:text-violet-400"
            )}
          >
            <span>All Visits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card Details */}
        {nextAppointment ? (
          <div
            className={cn(
              "p-3.5 rounded-xl border mb-3",
              highContrast
                ? "bg-zinc-900 border-violet-400/80 text-white"
                : "bg-violet-50/40 dark:bg-violet-950/20 border-violet-200/70 dark:border-violet-800/50"
            )}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-1.5 text-violet-700 dark:text-violet-300 font-bold text-[11px] uppercase tracking-wide">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{nextAppointment.specialty || "Care Provider"}</span>
                </div>
                <h3 className="text-base font-bold text-foreground tracking-tight mt-0.5">
                  Dr. {nextAppointment.doctor_name}
                </h3>
              </div>

              {isTodayOrSoon && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-700 dark:text-violet-300 animate-pulse border border-violet-500/30">
                  <CalendarCheck className="w-3 h-3" />
                  Upcoming
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2.5 pt-2 border-t border-violet-200/50 dark:border-violet-800/30 text-xs font-semibold text-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <span>{formattedDate}</span>
              </div>
              {formattedTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span>{formattedTime}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-dashed border-border text-center text-muted-foreground mb-3">
            <CalendarDays className="w-6 h-6 mx-auto text-muted-foreground/40 mb-1" />
            <p className="text-xs font-semibold">No visits currently scheduled</p>
            <p className="text-[11px] mt-0.5">
              Request or book a consultation with your care team anytime.
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-2">
        {phoneToCall && (
          <a
            href={`tel:${phoneToCall}`}
            className={cn(
              "flex-1 h-9 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 border shadow-xs",
              highContrast
                ? "bg-yellow-400 text-black hover:bg-yellow-300 border-yellow-300"
                : "bg-violet-600 hover:bg-violet-700 text-white border-transparent"
            )}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Clinic</span>
          </a>
        )}

        <Link
          href="/appointments"
          className={cn(
            "flex-1 h-9 px-3.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border text-center",
            highContrast
              ? "bg-zinc-900 border-yellow-400 text-yellow-300 hover:bg-zinc-800"
              : "bg-muted hover:bg-muted/80 text-foreground border-border"
          )}
        >
          <span>{nextAppointment ? "View Details" : "Book Visit"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
