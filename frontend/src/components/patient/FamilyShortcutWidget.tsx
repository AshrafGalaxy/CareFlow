"use client"

import { Users, PhoneCall, Shield, ArrowRight, HeartHandshake, UserPlus } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useAuthStore } from "@/store/authStore"
import { cn } from "@/lib/utils"

interface FamilyShortcutWidgetProps {
  highContrast?: boolean
  assignedDoctorName?: string
  assignedDoctorPhone?: string
}

export function FamilyShortcutWidget({
  highContrast = false,
  assignedDoctorName,
  assignedDoctorPhone
}: FamilyShortcutWidgetProps) {
  const user = useAuthStore((state) => state.user)

  const familyName = user?.emergency_contact_name || "Primary Family Contact"
  const familyPhone = user?.emergency_contact_phone || ""

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
                highContrast ? "bg-yellow-400 text-black" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              )}
            >
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Support Network
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Family & Care Circle
              </h2>
            </div>
          </div>

          <Link
            href="/care-team"
            className={cn(
              "text-xs sm:text-sm font-bold flex items-center gap-1 hover:underline shrink-0",
              highContrast ? "text-yellow-300" : "text-emerald-600 dark:text-emerald-400"
            )}
          >
            <span>Care Team</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Family Member Card */}
        <div
          className={cn(
            "p-4 sm:p-5 rounded-2xl border-2 mb-3.5",
            highContrast
              ? "bg-zinc-900 border-emerald-400/80 text-white"
              : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wide">
                <Shield className="w-3.5 h-3.5" />
                <span>Designated Family Caregiver</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mt-1">
                {familyName}
              </h3>
              <p className="text-sm font-mono font-bold text-muted-foreground mt-0.5">
                {familyPhone || "No direct phone saved"}
              </p>
            </div>

            {familyPhone && (
              <a
                href={`tel:${familyPhone}`}
                className={cn(
                  "min-h-[48px] px-4 py-2.5 rounded-xl font-extrabold text-sm sm:text-base flex items-center gap-2 transition-all active:scale-95 shadow-sm shrink-0",
                  highContrast
                    ? "bg-emerald-400 text-black hover:bg-emerald-300 border-2 border-emerald-300"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                )}
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Family</span>
              </a>
            )}
          </div>

          {!familyPhone && (
            <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Add phone in medical profile</span>
              <Link
                href="/profile"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Set Contact</span>
              </Link>
            </div>
          )}
        </div>

        {/* Assigned Doctor Mini Row */}
        {assignedDoctorName && (
          <div
            className={cn(
              "p-3.5 rounded-2xl border flex items-center justify-between gap-3 mb-4",
              highContrast
                ? "bg-zinc-900 border-zinc-700"
                : "bg-muted/40 border-border"
            )}
          >
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Assigned Physician</p>
              <p className="text-sm font-bold text-foreground">Dr. {assignedDoctorName}</p>
            </div>

            {assignedDoctorPhone ? (
              <a
                href={`tel:${assignedDoctorPhone}`}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Doctor</span>
              </a>
            ) : (
              <Link
                href="/care-team"
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
              >
                Details
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex gap-2.5">
        <Link
          href="/care-team"
          className={cn(
            "w-full min-h-[48px] px-4 py-2.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors border text-center",
            highContrast
              ? "bg-zinc-900 border-yellow-400 text-yellow-300 hover:bg-zinc-800"
              : "bg-muted hover:bg-muted/80 text-foreground border-border"
          )}
        >
          <Users className="w-4 h-4" />
          <span>View Full Care Team</span>
        </Link>
      </div>
    </div>
  )
}
