"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ChevronRight, User, Phone, Mail, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

function adherenceBadgeClass(rate: number) {
 if (rate > 80) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
 if (rate >= 50) return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
 return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30";
}

interface PatientListProps {
 patients: any[];
 unassignedPatients?: any[];
 onAssign?: (patientId: string) => Promise<void>;
 onRemove?: (patientId: string) => Promise<void>;
}

export default function PatientList({ patients, unassignedPatients = [], onAssign, onRemove }: PatientListProps) {
 const [search, setSearch] = useState("");
 const [selectedUnassigned, setSelectedUnassigned] = useState("");
 const [assigning, setAssigning] = useState(false);
 const [removingId, setRemovingId] = useState<string | null>(null);
 const router = useRouter();

 const filtered = patients.filter((p) =>
  p.name.toLowerCase().includes(search.toLowerCase()) ||
  p.email.toLowerCase().includes(search.toLowerCase())
 );

 const handleAssign = async () => {
  if (!selectedUnassigned) {
   toast.error("Please select a patient to assign");
   return;
  }
  if (!onAssign) return;
  setAssigning(true);
  try {
   await onAssign(selectedUnassigned);
   setSelectedUnassigned("");
  } catch (e) {
   console.error(e);
  } finally {
   setAssigning(false);
  }
 };

 const handleRemove = async (patientId: string) => {
  if (!onRemove) return;
  if (!confirm("Remove this patient from your dashboard? This will not delete their account.")) return;
  setRemovingId(patientId);
  try {
   await onRemove(patientId);
  } catch (e) {
   console.error(e);
  } finally {
   setRemovingId(null);
  }
 };

 return (
  <Card className="rounded-2xl border-slate-200/60 dark:border-slate-800 shadow-sm bg-card/50 overflow-hidden flex flex-col">
   {/* Header with assign controls */}
   <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row justify-between gap-3">
    <div>
     <h2 className="font-bold text-foreground">My Patients</h2>
     <p className="text-xs text-slate-500 dark:text-slate-400">Manage patients assigned to your care</p>
    </div>

    {unassignedPatients.length > 0 && onAssign && (
     <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
      <select
       value={selectedUnassigned}
       onChange={(e) => setSelectedUnassigned(e.target.value)}
       className="w-full sm:w-52 px-3 py-1.5 bg-card dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-sm transition-all shadow-sm"
       disabled={assigning}
      >
       <option value="">— Assign a patient —</option>
       {unassignedPatients.map((p) => (
        <option key={p.patient_id} value={p.patient_id}>
         {p.name} ({p.email})
        </option>
       ))}
      </select>
      <Button
       size="sm"
       onClick={handleAssign}
       disabled={assigning || !selectedUnassigned}
       className="flex items-center gap-1.5 shrink-0 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-sm"
      >
       {assigning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
       Assign
      </Button>
     </div>
    )}
   </div>

   {/* Search bar */}
   <div className="p-3 border-b border-slate-100 dark:border-slate-800">
    <div className="relative">
     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
     <input
      type="text"
      placeholder="Search patients by name or email..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full bg-card dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-shadow"
     />
    </div>
   </div>

   {/* Patient rows */}
   <div className="flex-1 overflow-y-auto p-2 min-h-[200px] max-h-[420px]">
    {filtered.length === 0 ? (
     <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 py-10">
      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
       <User className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium">
       {patients.length === 0 ? "No patients assigned yet" : "No patients match your search"}
      </p>
     </div>
    ) : (
     <div className="space-y-1">
      {filtered.map((p) => (
       <div
        key={p.patient_id}
        className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
       >
        {/* Left: avatar + info — clicking navigates to patient detail */}
        <div
         className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
         onClick={() => router.push(`/doctor/patients/${p.patient_id}`)}
        >
         <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm shrink-0">
          {p.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
         </div>
         <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
           {p.name}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
           <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3 shrink-0" /> {p.email}</span>
           {p.phone && <span className="flex items-center gap-1 shrink-0"><Phone className="w-3 h-3" /> {p.phone}</span>}
          </div>
         </div>
        </div>

        {/* Right: badges + actions */}
        <div className="flex items-center gap-3 shrink-0 ml-2">
         <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Adherence</p>
          <Badge variant="outline" className={`px-2 py-0.5 rounded-md text-xs font-semibold ${adherenceBadgeClass(p.medication_adherence_rate)}`}>
           {p.medication_adherence_rate}%
          </Badge>
         </div>

         <div className="text-right hidden md:block w-24">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Follow-ups</p>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
           {p.pending_follow_ups} pending
          </span>
         </div>

         <div
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-sky-100 dark:group-hover:bg-sky-900/50 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors cursor-pointer"
          onClick={() => router.push(`/doctor/patients/${p.patient_id}`)}
         >
          <ChevronRight className="w-4 h-4" />
         </div>

         {onRemove && (
          <button
           onClick={() => handleRemove(p.patient_id)}
           disabled={removingId === p.patient_id}
           title="Remove patient"
           className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50"
          >
           {removingId === p.patient_id
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Trash2 className="w-4 h-4" />}
          </button>
         )}
        </div>
       </div>
      ))}
     </div>
    )}
   </div>
  </Card>
 );
}
