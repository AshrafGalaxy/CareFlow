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
        "rounded-2xl border p-5 shadow-sm transition-all duration-200 flex flex-col justify-between",
        highContrast
          ? "bg-black border-yellow-400 text-white"
          : "bg-card border-border hover:border-border/80"
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                highContrast ? "bg-yellow-400 text-black" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              )}
            >
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Support Network
              </span>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Family & Care Circle
              </h2>
            </div>
          </div>

          <Link
            href="/care-team"
            className={cn(
              "text-xs font-semibold flex items-center gap-1 hover:underline shrink-0",
              highContrast ? "text-yellow-300" : "text-emerald-600 dark:text-emerald-400"
            )}
          >
            <span>Care Team</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Family Member Card */}
        <div
          className={cn(
            "p-3.5 rounded-xl border mb-3",
            highContrast
              ? "bg-zinc-900 border-emerald-400/80 text-white"
              : "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/60"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] uppercase tracking-wide">
                <Shield className="w-3.5 h-3.5" />
                <span>Designated Caregiver</span>
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight mt-1">
                {familyName}
              </h3>
              <p className="text-xs font-mono font-medium text-muted-foreground mt-0.5">
                {familyPhone || "No direct phone saved"}
              </p>
            </div>

            {familyPhone && (
              <a
                href={`tel:${familyPhone}`}
                className={cn(
                  "h-8 px-3 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm shrink-0",
                  highContrast
                    ? "bg-emerald-400 text-black hover:bg-emerald-300 border border-emerald-300"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                )}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Family</span>
              </a>
            )}
          </div>

          {!familyPhone && (
            <div className="mt-2.5 pt-2.5 border-t border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Add phone in medical profile</span>
              <Link
                href="/profile"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
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
              "p-2.5 rounded-xl border flex items-center justify-between gap-3 mb-3",
              highContrast
                ? "bg-zinc-900 border-zinc-700"
                : "bg-muted/40 border-border"
            )}
          >
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Assigned Physician</p>
              <p className="text-xs font-semibold text-foreground">Dr. {assignedDoctorName}</p>
            </div>

            {assignedDoctorPhone ? (
              <a
                href={`tel:${assignedDoctorPhone}`}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Call Doctor</span>
              </a>
            ) : (
              <Link
                href="/care-team"
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
              >
                Details
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-1">
        <Link
          href="/care-team"
          className={cn(
            "w-full h-9 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-colors border text-center",
            highContrast
              ? "bg-zinc-900 border-yellow-400 text-yellow-300 hover:bg-zinc-800"
              : "bg-muted/60 hover:bg-muted text-foreground border-border"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>View Full Care Team</span>
        </Link>
      </div>
    </div>
  )
}
