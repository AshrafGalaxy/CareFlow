"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Pill, FileText, CalendarDays, User, ArrowLeft, Loader2, Mail, Phone, Activity, Eye, Check, X } from "lucide-react";
import { Link } from "@/i18n/routing";
import PatientMemo from "@/components/doctor/PatientMemo";
import { ReportViewerModal } from "@/components/shared/ReportViewerModal";
import { toast } from "sonner";
import useSWR from "swr";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

function SkeletonCard() {
 return (
  <Card className="p-6 rounded-2xl border-slate-200/60 dark:border-slate-800 bg-card/50 animate-pulse">
   <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-md mb-6"></div>
   <div className="space-y-4">
    <div className="h-4 w-full bg-slate-100/50 dark:bg-slate-800/50 rounded-md"></div>
    <div className="h-4 w-5/6 bg-slate-100/50 dark:bg-slate-800/50 rounded-md"></div>
    <div className="h-4 w-4/6 bg-slate-100/50 dark:bg-slate-800/50 rounded-md"></div>
   </div>
  </Card>
 );
}

export default function PatientDetailPage() {
 const { id } = useParams();
 const [viewingReport, setViewingReport] = useState<any>(null);
 const [patient, setPatient] = useState<any>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState("");

 const fetchPatient = async () => {
  try {
   setIsLoading(true);
   const res = await api.get(`/api/dashboard/patients/${id}`);
   setPatient(res.data);
  } catch (err) {
   console.error("Failed to fetch patient:", err);
   setError("Failed to load patient details.");
  } finally {
   setIsLoading(false);
  }
 };

 useEffect(() => {
  fetchPatient();
 }, [id]);

 const handleApproveMedication = async (medId: string) => {
  try {
   await api.post(`/api/medications/${medId}/approve`);
   toast.success("Medication approved");
   fetchPatient();
  } catch {
   toast.error("Failed to approve medication");
  }
 };

 const handleRejectMedication = async (medId: string) => {
  try {
   await api.post(`/api/medications/${medId}/reject`);
   toast.success("Medication rejected");
   fetchPatient();
  } catch {
   toast.error("Failed to reject medication");
  }
 };

 if (isLoading) {
  return (
   <div className="max-w-5xl mx-auto space-y-8 pb-10">
    <div className="flex items-center gap-6 mb-8 animate-pulse">
     <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
     <div className="space-y-3 flex-1">
      <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
     </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     <SkeletonCard />
     <SkeletonCard />
     <SkeletonCard />
    </div>
   </div>
  );
 }

 if (error || !patient) {
  return (
   <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
    <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
     <Activity className="w-8 h-8" />
    </div>
    <p className="text-lg font-medium text-foreground ">{error || "Patient not found"}</p>
    <Link href="/doctor/dashboard" className="text-sky-500 hover:text-sky-600 font-medium">
     ← Back to Dashboard
    </Link>
   </div>
  );
 }

 return (
  <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-slate-50/50 dark:bg-background">
   <div className="w-full max-w-7xl mx-auto space-y-8 pb-10 animate-in fade-in duration-500">
   <div className="flex items-center gap-6 bg-card/50 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden">
    <div className="absolute right-0 top-0 w-64 h-64 bg-sky-50 dark:bg-sky-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
    
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white flex items-center justify-center font-bold text-3xl shadow-lg relative z-10">
     {patient.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}
    </div>
    
    <div className="relative z-10">
     <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{patient.name}</h1>
     <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
      <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {patient.email}</span>
      {patient.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {patient.phone}</span>}
     </div>
     <div className="flex flex-wrap items-center gap-2 mt-3">
      {patient.blood_group && (
       <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs rounded-md border border-rose-100 dark:border-rose-500/20">
        Blood: {patient.blood_group}
       </span>
      )}
      {patient.height && (
       <span className="px-2.5 py-1 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold text-xs rounded-md border border-sky-100 dark:border-sky-500/20">
        Height: {patient.height} cm
       </span>
      )}
      {patient.weight && (
       <span className="px-2.5 py-1 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold text-xs rounded-md border border-sky-100 dark:border-sky-500/20">
        Weight: {patient.weight} kg
       </span>
      )}
     </div>
    </div>
   </div>

   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Medications */}
    <Card className="p-6 rounded-2xl border-slate-200/60 dark:border-slate-800 shadow-sm bg-card/50 hover:shadow-md transition-shadow">
     <div className="flex items-center gap-3 mb-6">
      <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500">
       <Pill className="w-5 h-5" />
      </div>
      <h2 className="font-semibold text-lg text-foreground ">Medications</h2>
     </div>
     
     <div className="space-y-4">
      {(!patient.medications || patient.medications.length === 0) ? (
       <p className="text-sm text-slate-500 dark:text-slate-400">No active medications.</p>
      ) : (
       patient.medications.map((m: any) => (
        <div key={m.id} className={`p-3 rounded-xl border flex justify-between items-center ${m.status === 'pending' ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'}`}>
         <div>
          <p className="font-medium text-foreground flex items-center gap-2">
           {m.name}
           {m.status === 'pending' && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">Request</span>}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.dosage} • {m.frequency}</p>
         </div>
         {m.status === 'pending' && (
          <div className="flex items-center gap-2 shrink-0">
           <button onClick={() => handleRejectMedication(m.id)} className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-colors">
            <X className="w-4 h-4" />
           </button>
           <button onClick={() => handleApproveMedication(m.id)} className="p-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-colors">
            <Check className="w-4 h-4" />
           </button>
          </div>
         )}
        </div>
       ))
      )}
     </div>
    </Card>

    {/* Reports */}
    <Card className="p-6 rounded-2xl border-slate-200/60 dark:border-slate-800 shadow-sm bg-card/50 hover:shadow-md transition-shadow">
     <div className="flex items-center gap-3 mb-6">
      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
       <FileText className="w-5 h-5" />
      </div>
      <h2 className="font-semibold text-lg text-foreground ">Recent Reports</h2>
     </div>
     
     <div className="space-y-4">
      {(!patient.reports || patient.reports.length === 0) ? (
       <p className="text-sm text-slate-500 dark:text-slate-400">No recent reports.</p>
      ) : (
       patient.reports.map((r: any) => (
        <div key={r.id} className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
         <p className="font-medium text-sm text-foreground truncate" title={r.original_filename || r.file_type}>
          {r.original_filename || r.file_type}
         </p>
          <div className="flex items-center justify-between mt-2">
           <button
            onClick={() => setViewingReport(r)}
            className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
           >
            <Eye className="w-3.5 h-3.5" /> View
           </button>
           <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
             {new Date(r.uploaded_at).toLocaleDateString()}
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
             r.processing_status === 'completed' || r.processing_status === 'done'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
              : r.processing_status === 'failed'
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
            }`}>
             {r.processing_status}
            </span>
           </div>
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

    {/* Follow-ups */}
    <Card className="p-6 rounded-2xl border-slate-200/60 dark:border-slate-800 shadow-sm bg-card/50 hover:shadow-md transition-shadow">
     <div className="flex items-center gap-3 mb-6">
      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500">
       <CalendarDays className="w-5 h-5" />
      </div>
      <h2 className="font-semibold text-lg text-foreground ">Follow-ups</h2>
     </div>
     
     <div className="space-y-4">
      {(!patient.follow_ups || patient.follow_ups.filter((f: any) => f.status === "scheduled").length === 0) ? (
       <p className="text-sm text-slate-500 dark:text-slate-400">No scheduled follow-ups.</p>
      ) : (
       patient.follow_ups.filter((f: any) => f.status === "scheduled").map((f: any) => (
        <div key={f.id} className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
         <p className="font-medium text-sm text-foreground ">
          {f.doctor_name} {f.specialty ? `(${f.specialty})` : ""}
         </p>
         <p className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(f.appointment_date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
         </p>
        </div>
       ))
      )}
     </div>
    </Card>

    {/* Clinical Notes / Memos */}
    <div className="md:col-span-2 lg:col-span-3 xl:col-span-1">
     <PatientMemo patientId={patient.id} memos={patient.memos} />
    </div>
   </div>
  </div>
 </div>
);
}