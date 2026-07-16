"use client";

import { useState } from "react";
import useSWR from "swr";
import { CalendarDays, Clock, Check, X, Calendar as CalendarIcon, User, Plus } from "lucide-react";
import { ScheduleFollowUpModal } from "@/components/appointments/ScheduleFollowUpModal";
import api from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function DoctorAppointmentsPage() {
  const [scheduleModalData, setScheduleModalData] = useState<{ isOpen: boolean; patientId: string; patientName: string; requestId?: string } | null>(null);

  const { data: upcomingFollowUps, isLoading, mutate } = useSWR<any[]>(
    "/api/dashboard/analytics/upcoming-followups?limit=100",
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const { data: requestsData, mutate: mutateRequests } = useSWR(
    "/api/dashboard/requests",
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const pendingRequests = requestsData?.follow_ups || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments & Requests</h1>
          <p className="text-muted-foreground mt-1">Manage patient follow-up requests and your upcoming schedule.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col: Pending Requests */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Action Required
          </h2>
          
          {!requestsData ? (
            <div className="space-y-3">
              {[1,2].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-2xl p-8 text-center text-muted-foreground flex flex-col items-center">
              <Check className="w-8 h-8 text-emerald-500 mb-2 opacity-50" />
              <p className="font-medium text-sm">Inbox Zero</p>
              <p className="text-xs">No pending follow-up requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req: any) => (
                <div key={req.id} className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex flex-col gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-500" />
                      {req.patient_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 italic">
                      "{req.notes || "Requested a follow-up appointment."}"
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                      Preferred Date: {req.appointment_date ? format(new Date(req.appointment_date), 'MMM d, yyyy') : "Anytime"}
                    </p>
                  </div>
                  <button
                    onClick={() => setScheduleModalData({ isOpen: true, patientId: req.patient_id, patientName: req.patient_name, requestId: req.id })}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 rounded-xl text-sm transition-colors"
                  >
                    Schedule Slot
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Upcoming Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Upcoming Schedule</h2>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
            </div>
          ) : upcomingFollowUps?.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
              <CalendarDays className="w-10 h-10 mb-3 opacity-20" />
              <p className="font-medium">Your schedule is clear</p>
              <p className="text-sm">No upcoming appointments scheduled.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingFollowUps?.map((fu: any) => {
                const isToday = new Date(fu.appointment_date).toDateString() === new Date().toDateString();
                return (
                  <div key={fu.id} className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-sky-200 dark:hover:border-sky-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        isToday ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-sky-50 text-sky-500 dark:bg-sky-900/20"
                      )}>
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{fu.patient_name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {format(new Date(fu.appointment_date), 'EEEE, MMMM d')} at <span className="font-medium text-foreground">{format(new Date(fu.appointment_date), 'h:mm a')}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {isToday && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                          Today
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {scheduleModalData && (
        <ScheduleFollowUpModal
          isOpen={scheduleModalData.isOpen}
          onClose={() => setScheduleModalData(null)}
          onSuccess={() => {
            mutate();
            mutateRequests();
          }}
          patientId={scheduleModalData.patientId}
          patientName={scheduleModalData.patientName}
          requestId={scheduleModalData.requestId}
        />
      )}
    </div>
  );
}
