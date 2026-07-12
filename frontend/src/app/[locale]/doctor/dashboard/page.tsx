"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import PatientList from "@/components/doctor/PatientList";
import AdherenceAnalytics from "@/components/doctor/AdherenceAnalytics";
import {
 Users, Activity, AlertCircle, FileText, Loader2, ArrowRight,
 Calendar, User, Clock, CalendarDays, Eye
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";
import { ReportViewerModal } from "@/components/shared/ReportViewerModal";

export default function DoctorDashboardPage() {
 const [patients, setPatients] = useState<any[]>([]);
 const [unassignedPatients, setUnassignedPatients] = useState<any[]>([]);
 const [analytics, setAnalytics] = useState<any>(null);
 const [followups, setFollowups] = useState<any>(null);
 const [recentReports, setRecentReports] = useState<any[]>([]);
 const [upcomingFollowups, setUpcomingFollowups] = useState<any[]>([]);
 const [days, setDays] = useState(30);
 const [isLoading, setIsLoading] = useState(true);
 const [viewingReport, setViewingReport] = useState<any>(null);

 // Fetch everything except adherence (which depends on `days`)
 const fetchDashboardData = useCallback(async () => {
  try {
   const [patientsRes, unassignedRes, followupsRes, reportsRes, upcomingRes] = await Promise.all([
    api.get("/api/dashboard/patients"),
    api.get("/api/dashboard/patients/unassigned"),
    api.get("/api/dashboard/analytics/followups"),
    api.get("/api/dashboard/analytics/reports?limit=5"),
    api.get("/api/dashboard/analytics/upcoming-followups?limit=5"),
   ]);
   setPatients(patientsRes.data);
   setUnassignedPatients(unassignedRes.data);
   setFollowups(followupsRes.data);
   setRecentReports(reportsRes.data);
   setUpcomingFollowups(upcomingRes.data);
  } catch (err) {
   console.error("Failed to fetch dashboard core data:", err);
  }
 }, []);

 // Fetch adherence analytics (depends on selected `days`)
 const fetchAdherence = useCallback(async () => {
  try {
   setIsLoading(true);
   const res = await api.get(`/api/dashboard/analytics/adherence?days=${days}`);
   setAnalytics(res.data);
  } catch (err) {
   console.error("Failed to fetch adherence analytics:", err);
  } finally {
   setIsLoading(false);
  }
 }, [days]);

 // Initial load
 useEffect(() => {
  fetchDashboardData();
 }, [fetchDashboardData]);

 // Re-fetch adherence when `days` changes
 useEffect(() => {
  fetchAdherence();
 }, [fetchAdherence]);

 // ── Assign / Remove handlers ──────────────────────────────────
 const handleAssign = async (patientId: string) => {
  try {
   await api.post("/api/dashboard/patients/assign", { patient_id: patientId });
   toast.success("Patient assigned successfully");
   await Promise.all([fetchDashboardData(), fetchAdherence()]);
  } catch {
   toast.error("Failed to assign patient");
  }
 };

 const handleRemove = async (patientId: string) => {
  try {
   await api.post(`/api/dashboard/patients/${patientId}/remove`);
   toast.success("Patient removed from your dashboard");
   await Promise.all([fetchDashboardData(), fetchAdherence()]);
  } catch {
   toast.error("Failed to remove patient");
  }
 };

 // ── Stats ─────────────────────────────────────────────────────
 const stats = [
  {
   label: "Total Patients",
   value: analytics?.total_patients ?? "—",
   icon: Users,
   color: "text-sky-500",
   bg: "bg-sky-50 dark:bg-sky-500/10",
  },
  {
   label: "Avg Adherence",
   value: analytics ? `${analytics.overall_adherence}%` : "—",
   icon: Activity,
   color: "text-emerald-500",
   bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
   label: "Missed Follow-ups",
   value: followups?.missed ?? "—",
   icon: AlertCircle,
   color: "text-rose-500",
   bg: "bg-rose-50 dark:bg-rose-500/10",
  },
  {
   label: "Patients w/ Reports",
   value: patients.filter((p) => p.recent_report_id).length,
   icon: FileText,
   color: "text-indigo-500",
   bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
 ];

 return (
  <div className="space-y-8 animate-in fade-in duration-500">
   {/* Page header */}
   <div className="flex flex-col gap-2">
    <h1 className="text-3xl font-heading font-bold text-foreground">
     Provider Dashboard
    </h1>
    <p className="text-slate-500 dark:text-slate-400">
     Overview of your patients' health, adherence metrics, reports, and scheduled follow-ups.
    </p>
   </div>

   {/* Stats Grid */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {stats.map((s) => {
     const Icon = s.icon;
     return (
      <Card
       key={s.label}
       className="p-6 rounded-2xl border-slate-200/60 dark:border-slate-800 shadow-sm bg-card/50 hover:shadow-md transition-shadow relative overflow-hidden group"
      >
       <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg}`}>
         <Icon className={`w-6 h-6 ${s.color}`} />
        </div>
        <div>
         <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
         <p className="text-2xl font-bold text-foreground">
          {isLoading && s.label.includes("Adherence")
           ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
           : s.value}
         </p>
        </div>
       </div>
       <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-slate-50/50 rounded-full group-hover:scale-110 transition-transform duration-500" />
      </Card>
     );
    })}
   </div>

   {/* Main content: left col (patients + panels) + right col (adherence chart) */}
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* ── Left column ── */}
    <div className="lg:col-span-2 space-y-6">
     {/* Patient list header */}
     <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold font-heading text-foreground">Your Patients</h2>
      <Link
       href="/doctor/patients"
       className="text-sm font-medium text-sky-500 hover:text-sky-600 flex items-center gap-1 group"
      >
       View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
     </div>

     <PatientList
      patients={patients}
      unassignedPatients={unassignedPatients}
      onAssign={handleAssign}
      onRemove={handleRemove}
     />

     {/* Recent Reports */}
     <Card className="p-6 rounded-2xl border-slate-200/60 dark:border-slate-800 shadow-sm bg-card/50 space-y-4">
      <div>
       <h2 className="text-lg font-bold font-heading text-foreground">Recent Reports</h2>
       <p className="text-xs text-slate-500 dark:text-slate-400">
        Most recent medical records uploaded by your patients
       </p>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
       {recentReports.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center font-medium">No reports uploaded yet</p>
       ) : (
        recentReports.map((r) => (
         <div
          key={r.id}
          className="py-3.5 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl px-2 transition-colors"
         >
          <div className="flex items-center gap-3">
           <div className="p-2 bg-sky-50 dark:bg-sky-500/10 text-sky-500 rounded-xl">
            <FileText className="h-5 w-5" />
           </div>
           <div>
            <p className="text-sm font-semibold text-foreground">
             {r.original_filename || "Medical Report"}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
             <span className="flex items-center gap-0.5">
              <User className="h-3 w-3" /> {r.patient_name}
             </span>
             <span>•</span>
             <span className="flex items-center gap-0.5">
              <Calendar className="h-3 w-3" />{" "}
              {new Date(r.uploaded_at).toLocaleDateString()}
             </span>
            </div>
           </div>
          </div>
          <div className="flex items-center gap-2">
           <button
            onClick={() => setViewingReport(r)}
            className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/20 dark:hover:bg-sky-900/40 px-2 py-1 rounded-md transition-colors"
           >
            <Eye className="w-3.5 h-3.5" /> View
           </button>
           <span
            className={`text-xs px-2.5 py-0.5 rounded font-semibold capitalize ${
             r.processing_status === "done" || r.processing_status === "completed"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
              : r.processing_status === "failed"
              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 animate-pulse"
            }`}
           >
            {r.processing_status}
           </span>
          </div>
         </div>
        ))
       )}
      </div>
      
      {viewingReport && (
       <ReportViewerModal
        isOpen={!!viewingReport}
        onClose={() => setViewingReport(null)}
        fileUrl={viewingReport.file_url}
        fileType={viewingReport.file_type}
        fileName={viewingReport.original_filename}
       />
      )}
     </Card>

     {/* Upcoming Follow-ups */}
     <Card className="p-6 rounded-2xl border-slate-200/60 dark:border-slate-800 shadow-sm bg-card/50 space-y-4">
      <div>
       <h2 className="text-lg font-bold font-heading text-foreground">Upcoming Follow-ups</h2>
       <p className="text-xs text-slate-500 dark:text-slate-400">
        Scheduled appointments across your patients
       </p>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
       {upcomingFollowups.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center font-medium">
         No upcoming follow-ups scheduled
        </p>
       ) : (
        upcomingFollowups.map((f) => (
         <div
          key={f.id}
          className="py-3.5 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl px-2 transition-colors"
         >
          <div className="flex items-center gap-3">
           <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-xl">
            <CalendarDays className="h-5 w-5" />
           </div>
           <div>
            <p className="text-sm font-semibold text-foreground">
             Dr. {f.doctor_name || "Doctor"}{f.specialty ? ` (${f.specialty})` : ""}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
             <span className="flex items-center gap-0.5">
              <User className="h-3 w-3" /> {f.patient_name}
             </span>
             <span>•</span>
             <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />{" "}
              {new Date(f.appointment_date).toLocaleDateString(undefined, {
               weekday: "short",
               month: "short",
               day: "numeric",
              })}
             </span>
            </div>
           </div>
          </div>
          <span className="text-xs text-slate-500 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 capitalize">
           {f.status}
          </span>
         </div>
        ))
       )}
      </div>
     </Card>
    </div>

    {/* ── Right column: Adherence chart ── */}
    <div className="space-y-4">
     <h2 className="text-xl font-bold font-heading text-foreground">Adherence Overview</h2>
     <AdherenceAnalytics
      data={analytics?.by_patient ?? []}
      days={days}
      setDays={setDays}
      isLoading={isLoading}
     />
    </div>
   </div>
  </div>
 );
}