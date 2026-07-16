"use client";

import { useState } from "react";
import useSWR from "swr";
import { CalendarDays, Clock, Check, X, Calendar as CalendarIcon, User } from "lucide-react";
import { RequestFollowUpModal } from "@/components/appointments/RequestFollowUpModal";
import api from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function PatientAppointmentsPage() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [declineId, setDeclineId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: followUps, isLoading, mutate } = useSWR<any[]>(
    "/api/follow-ups/",
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const handleConfirmFollowUp = async (id: string) => {
    try {
      await api.post(`/api/follow-ups/${id}/confirm`);
      toast.success("Appointment confirmed!");
      mutate();
    } catch (e) {
      toast.error("Failed to confirm appointment");
    }
  };

  const handleDeclineFollowUp = async (id: string) => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/api/follow-ups/${id}/decline`, { decline_reason: declineReason });
      toast.success("Appointment declined. Your doctor has been notified.");
      setDeclineId(null);
      setDeclineReason("");
      mutate();
    } catch (e) {
      toast.error("Failed to decline appointment");
    } finally {
      setSubmitting(false);
    }
  };

  // 'scheduled' = doctor scheduled, needs patient to Confirm or Decline
  const pendingFollowUps = followUps?.filter(f => f.status === 'scheduled') || [];
  // 'requested' = patient requested, awaiting doctor to schedule a slot
  const requestedFollowUps = followUps?.filter(f => f.status === 'requested') || [];
  // 'confirmed' = patient confirmed the scheduled slot
  const confirmedFollowUps = followUps?.filter(f => f.status === 'confirmed') || [];
  const pastFollowUps = followUps?.filter(f => f.status === 'completed' || f.status === 'declined') || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments & Follow-ups</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming doctor visits and requests.</p>
        </div>
        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <CalendarDays className="w-5 h-5" />
          Request Follow-up
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Action Required */}
          {pendingFollowUps.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Action Required
              </h2>
              <div className="grid gap-4">
                {pendingFollowUps.map(fu => (
                  <div key={fu.id} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-800/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Follow-up Request</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Dr. {fu.doctor_name} scheduled a visit for <span className="font-semibold text-foreground">{format(new Date(fu.appointment_date), 'PPp')}</span>.
                        </p>
                        {fu.notes && <p className="text-sm italic text-muted-foreground mt-1 text-amber-700/80 dark:text-amber-300/80">"{fu.notes}"</p>}
                      </div>
                    </div>
                    
                    {declineId === fu.id ? (
                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <input 
                          type="text" 
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          placeholder="Reason for declining..."
                          className="px-3 py-2 rounded-xl border border-border bg-background text-sm flex-1 min-w-[200px]"
                        />
                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={() => setDeclineId(null)}
                            className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleDeclineFollowUp(fu.id)}
                            disabled={submitting}
                            className="px-4 py-2 text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors"
                          >
                            Confirm Decline
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                        <button 
                          onClick={() => setDeclineId(fu.id)}
                          className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-slate-800 border border-border hover:bg-muted text-sm font-semibold rounded-xl transition-colors"
                        >
                          Decline
                        </button>
                        <button 
                          onClick={() => handleConfirmFollowUp(fu.id)}
                          className="flex-1 md:flex-none px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                          Confirm
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awaiting Doctor Response — patient's own requests */}
          {requestedFollowUps.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                Awaiting Doctor Response
              </h2>
              <div className="grid gap-4">
                {requestedFollowUps.map(fu => (
                  <div key={fu.id} className="bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-900/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-800/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Follow-up Request Sent</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Preferred: <span className="font-semibold text-foreground">{fu.appointment_date ? format(new Date(fu.appointment_date), 'PPp') : 'Flexible'}</span>
                        </p>
                        {fu.notes && <p className="text-xs italic text-sky-700/70 dark:text-sky-400/70 mt-1">"{fu.notes.substring(0, 80)}{fu.notes.length > 80 ? '…' : ''}"</p>}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 shrink-0">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed Appointments */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Confirmed Appointments</h2>
            {confirmedFollowUps.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No confirmed appointments.</p>
            ) : (
              <div className="grid gap-4">
                {confirmedFollowUps.map(fu => (
                  <div key={fu.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-sky-200 dark:hover:border-sky-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center shrink-0">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Dr. {fu.doctor_name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {fu.appointment_date ? format(new Date(fu.appointment_date), 'PPp') : 'Date pending'}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past */}
          {pastFollowUps.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground opacity-70">Past Appointments</h2>
              <div className="grid gap-4 opacity-70 hover:opacity-100 transition-opacity">
                {pastFollowUps.map(fu => (
                  <div key={fu.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                        {fu.status === 'completed' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Dr. {fu.doctor_name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {fu.appointment_date ? format(new Date(fu.appointment_date), 'PP') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase">{fu.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <RequestFollowUpModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
