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
            "min-h-[44px] px-4 py-2 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer",
            highContrast
              ? "bg-rose-500 text-white border-2 border-yellow-400 hover:bg-rose-600"
              : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30"
          )}
        >
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          <span>🆘 I NEED HELP</span>
        </button>
      ) : (
        <div
          className={cn(
            "rounded-3xl border-2 p-5 sm:p-6 shadow-md transition-all duration-300 relative overflow-hidden",
            highContrast
              ? "bg-black border-rose-500 text-white"
              : "bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/30"
          )}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-rose-700 dark:text-rose-400 tracking-tight">
                  Emergency Assistance & Support
                </h2>
                <p className="text-xs sm:text-sm font-medium text-rose-600/90 dark:text-rose-300/90">
                  Tap for direct emergency lines, family contacts, and doctor assistance.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className={cn(
                "min-h-[52px] px-6 sm:px-8 py-3 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 transition-all active:scale-98 shadow-lg cursor-pointer shrink-0",
                highContrast
                  ? "bg-rose-500 text-white border-2 border-yellow-300 hover:bg-rose-600"
                  : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30"
              )}
            >
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <span>🆘 I NEED HELP</span>
            </button>
          </div>
        </div>
      )}

      {/* Emergency Assistance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={cn(
              "rounded-3xl border-2 max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto",
              highContrast ? "bg-black border-yellow-400 text-white" : "bg-card border-border text-foreground"
            )}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    Emergency Help Entry Point
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                    Immediate contact buttons & critical safety protocols
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted font-bold text-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Medical Warning Box */}
            <div
              className={cn(
                "p-4 rounded-2xl border flex items-start gap-3",
                highContrast
                  ? "bg-zinc-900 border-yellow-400 text-yellow-200"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
              )}
            >
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-semibold leading-relaxed">
                If you are experiencing severe chest pain, extreme shortness of breath, sudden weakness, or any life-threatening situation, please call emergency services immediately.
              </div>
            </div>

            {/* Direct 1-Tap Action Call Buttons */}
            <div className="space-y-3">
              {/* Emergency Services 112 */}
              <a
                href="tel:112"
                className={cn(
                  "w-full min-h-[56px] p-4 rounded-2xl flex items-center justify-between font-extrabold text-base sm:text-lg transition-all active:scale-98 shadow-md border",
                  highContrast
                    ? "bg-rose-500 text-white border-yellow-300 hover:bg-rose-600"
                    : "bg-rose-600 hover:bg-rose-700 text-white border-transparent shadow-rose-600/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <HeartPulse className="w-6 h-6 animate-pulse" />
                  <div className="text-left">
                    <p className="leading-tight">Call Emergency Services</p>
                    <p className="text-xs font-normal opacity-90">National Emergency Hotline (India 112 / 108)</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-xl text-sm font-black flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4" />
                  <span>112</span>
                </div>
              </a>

              {/* Family Contact */}
              {familyPhone ? (
                <a
                  href={`tel:${familyPhone}`}
                  className={cn(
                    "w-full min-h-[56px] p-4 rounded-2xl flex items-center justify-between font-extrabold text-base sm:text-lg transition-all active:scale-98 shadow-md border",
                    highContrast
                      ? "bg-emerald-400 text-black border-emerald-300 hover:bg-emerald-300"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-emerald-600/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6" />
                    <div className="text-left">
                      <p className="leading-tight">Call Family Contact</p>
                      <p className="text-xs font-normal opacity-90">{familyName}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-white/20 rounded-xl text-sm font-black flex items-center gap-1.5 font-mono">
                    <PhoneCall className="w-4 h-4" />
                    <span>Call</span>
                  </div>
                </a>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-border flex items-center justify-between text-muted-foreground text-sm">
                  <span>No family phone saved in profile</span>
                  <a href="/profile" className="text-xs font-bold text-sky-500 hover:underline">
                    Add in Profile
                  </a>
                </div>
              )}

              {/* Assigned Doctor */}
              {assignedDoctorPhone ? (
                <a
                  href={`tel:${assignedDoctorPhone}`}
                  className={cn(
                    "w-full min-h-[56px] p-4 rounded-2xl flex items-center justify-between font-extrabold text-base sm:text-lg transition-all active:scale-98 shadow-md border",
                    highContrast
                      ? "bg-sky-400 text-black border-sky-300 hover:bg-sky-300"
                      : "bg-sky-600 hover:bg-sky-700 text-white border-transparent shadow-sky-600/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-6 h-6" />
                    <div className="text-left">
                      <p className="leading-tight">Call Assigned Physician</p>
                      <p className="text-xs font-normal opacity-90">Dr. {assignedDoctorName || "Provider"}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-white/20 rounded-xl text-sm font-black flex items-center gap-1.5 font-mono">
                    <PhoneCall className="w-4 h-4" />
                    <span>Call</span>
                  </div>
                </a>
              ) : null}
            </div>

            {/* Reassurance Notice & Phase Handoff */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground">Phase 1 Safety Entry Point: </span>
              Your emergency contacts and health records are prepared for rapid telephone connection. Automated SOS escalation with care circle dispatch is scheduled for Phase 3.
            </div>

            {/* Safe / Dismiss Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className={cn(
                "w-full min-h-[48px] py-3 rounded-2xl font-bold text-base transition-colors",
                highContrast
                  ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-600"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              I Am Safe — Close Window
            </button>
          </div>
        </div>
      )}
    </>
  )
}
