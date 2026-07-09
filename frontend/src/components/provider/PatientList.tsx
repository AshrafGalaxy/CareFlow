// frontend/src/components/provider/PatientList.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

function adherenceBadgeClass(rate: number) {
  if (rate > 80) return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50";
  if (rate >= 50) return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50";
  return "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50";
}

interface PatientListProps {
  patients: any[];
  unassignedPatients: any[];
  onAssign: (patientId: string) => Promise<void>;
  onRemove: (patientId: string) => Promise<void>;
}

export default function PatientList({ patients, unassignedPatients, onAssign, onRemove }: PatientListProps) {
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
    if (confirm("Are you sure you want to remove this patient from your dashboard? This will not delete their account.")) {
      setRemovingId(patientId);
      try {
        await onRemove(patientId);
      } catch (e) {
        console.error(e);
      } finally {
        setRemovingId(null);
      }
    }
  };

  return (
    <Card className="p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">My Patients</h2>
          <p className="text-xs text-slate-500">Manage patients assigned to your care</p>
        </div>
        
        {unassignedPatients.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedUnassigned}
              onChange={(e) => setSelectedUnassigned(e.target.value)}
              className="w-full sm:w-56 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-all shadow-sm"
              disabled={assigning}
            >
              <option value="">-- Select Patient to Assign --</option>
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
              <Plus className="h-4 w-4" />
              <span>Assign</span>
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search patients by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl border border-slate-200 focus:ring-sky-500 text-sm bg-slate-50/50"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
            <p className="text-sm text-slate-500 font-medium">No assigned patients found</p>
            <p className="text-xs text-slate-400 mt-1">Assign unassigned patients or adjust search query</p>
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.patient_id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50/60 transition-all gap-4"
            >
              <div className="space-y-1">
                <p className="font-semibold text-slate-800 leading-tight">{p.name}</p>
                <p className="text-xs text-slate-500 leading-none">{p.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                <Badge variant="outline" className={adherenceBadgeClass(p.medication_adherence_rate)}>
                  Adherence: {p.medication_adherence_rate}%
                </Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-medium text-xs">
                  {p.pending_follow_ups} follow-ups
                </Badge>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/provider/patients/${p.patient_id}`)}
                    className="border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-xl"
                  >
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(p.patient_id)}
                    disabled={removingId === p.patient_id}
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}