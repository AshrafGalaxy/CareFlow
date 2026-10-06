"use client"

import { useState } from "react"
import { AlertTriangle, PhoneCall, ShieldAlert, X, HeartPulse, User, Stethoscope, CheckCircle2 } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { cn } from "@/lib/utils"

interface HelpWidgetProps {
  highContrast?: boolean
  assignedDoctorName?: string
  assignedDoctorPhone?: string
  compact?: boolean
}

export function HelpWidget({
  highContrast = false,
  assignedDoctorName,
  assignedDoctorPhone,
  compact = false
}: HelpWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const user = useAuthStore((state) => state.user)

  const familyName = user?.emergency_contact_name || "Emergency Contact"
  const familyPhone = user?.emergency_contact_phone || ""

  return (
    <>
      {/* Help Entry Button */}
      {compact ? (
        <button
          onClick={() => setIsModalOpen(true)}
          className={cn(
            "h-8 px-3 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer",
            highContrast
              ? "bg-rose-500 text-white border border-yellow-400 hover:bg-rose-600"
              : "bg-rose-600 hover:bg-rose-700 text-white"
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
          <span>Need Help</span>
        </button>
      ) : (
        <div
          className={cn(
            "rounded-2xl border p-4 sm:p-5 shadow-sm transition-all duration-200 relative overflow-hidden",
            highContrast
              ? "bg-black border-rose-500 text-white"
              : "bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/20"
          )}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-rose-700 dark:text-rose-300 tracking-tight">
                  Emergency Assistance & Support
                </h2>
                <p className="text-xs text-rose-600/80 dark:text-rose-300/80 mt-0.5">
                  Direct lines for emergency medical help, family caregiver, and assigned physician.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className={cn(
                "h-9 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer shrink-0",
                highContrast
                  ? "bg-rose-500 text-white border border-yellow-300 hover:bg-rose-600"
                  : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              <span>Emergency Help</span>
            </button>
          </div>
        </div>
      )}

      {/* Emergency Assistance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={cn(
              "rounded-2xl border max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-xl relative max-h-[90vh] overflow-y-auto",
              highContrast ? "bg-black border-yellow-400 text-white" : "bg-card border-border text-foreground"
            )}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    Emergency Help Directory
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Immediate direct contact lines & urgent safety guidelines
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Medical Warning Box */}
            <div
              className={cn(
                "p-3 rounded-xl border flex items-start gap-2.5",
                highContrast
                  ? "bg-zinc-900 border-yellow-400 text-yellow-200"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
              )}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs font-medium leading-relaxed">
                If you are experiencing severe chest pain, extreme shortness of breath, sudden numbness, or life-threatening distress, call emergency services immediately.
              </div>
            </div>

            {/* Direct 1-Tap Action Call Buttons */}
            <div className="space-y-2.5">
              {/* Emergency Services 112 */}
              <a
                href="tel:112"
                className={cn(
                  "w-full min-h-[48px] p-3 rounded-xl flex items-center justify-between font-bold text-sm transition-all active:scale-98 shadow-sm border",
                  highContrast
                    ? "bg-rose-500 text-white border-yellow-300 hover:bg-rose-600"
                    : "bg-rose-600 hover:bg-rose-700 text-white border-transparent shadow-rose-600/20"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <HeartPulse className="w-5 h-5 animate-pulse" />
                  <div className="text-left">
                    <p className="leading-tight text-sm font-bold">Call Emergency Services</p>
                    <p className="text-[11px] font-normal opacity-90">National Emergency Hotline (112 / 108)</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-bold flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>112</span>
                </div>
              </a>

              {/* Family Contact */}
              {familyPhone ? (
                <a
                  href={`tel:${familyPhone}`}
                  className={cn(
                    "w-full min-h-[48px] p-3 rounded-xl flex items-center justify-between font-bold text-sm transition-all active:scale-98 shadow-sm border",
                    highContrast
                      ? "bg-emerald-400 text-black border-emerald-300 hover:bg-emerald-300"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-emerald-600/20"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-5 h-5" />
                    <div className="text-left">
                      <p className="leading-tight text-sm font-bold">Call Family Contact</p>
                      <p className="text-[11px] font-normal opacity-90">{familyName}</p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-bold flex items-center gap-1 font-mono">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </div>
                </a>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-border flex items-center justify-between text-muted-foreground text-xs">
                  <span>No family phone saved in profile</span>
                  <a href="/profile" className="text-xs font-semibold text-sky-500 hover:underline">
                    Add in Profile
                  </a>
                </div>
              )}

              {/* Assigned Doctor */}
              {assignedDoctorPhone ? (
                <a
                  href={`tel:${assignedDoctorPhone}`}
                  className={cn(
                    "w-full min-h-[48px] p-3 rounded-xl flex items-center justify-between font-bold text-sm transition-all active:scale-98 shadow-sm border",
                    highContrast
                      ? "bg-sky-400 text-black border-sky-300 hover:bg-sky-300"
                      : "bg-sky-600 hover:bg-sky-700 text-white border-transparent shadow-sky-600/20"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Stethoscope className="w-5 h-5" />
                    <div className="text-left">
                      <p className="leading-tight text-sm font-bold">Call Assigned Physician</p>
                      <p className="text-[11px] font-normal opacity-90">Dr. {assignedDoctorName || "Provider"}</p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-bold flex items-center gap-1 font-mono">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </div>
                </a>
              ) : null}
            </div>

            {/* Quick Reassurance Notice */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Direct Access Directory: </span>
              Your emergency contacts and health profile are synchronized for rapid telephone connection.
            </div>

            {/* Safe / Dismiss Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className={cn(
                "w-full h-9 rounded-xl font-medium text-xs transition-colors",
                highContrast
                  ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-600"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              I Am Safe — Close Directory
            </button>
          </div>
        </div>
      )}
    </>
  )
}
