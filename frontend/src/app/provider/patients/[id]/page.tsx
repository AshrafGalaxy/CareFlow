"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    api.get(`/api/dashboard/patients/${id}`).then((res) => setPatient(res.data));
  }, [id]);

  if (!patient) return <p className="p-6 text-slate-500">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">{patient.name}</h1>
        <p className="text-slate-500">{patient.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="font-semibold text-slate-800 mb-3">Medications</p>
          {patient.medications?.map((m: any) => (
            <p key={m.id} className="text-sm text-slate-600 py-1">{m.name} — {m.dosage} ({m.frequency})</p>
          ))}
        </Card>

        <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="font-semibold text-slate-800 mb-3">Recent Reports</p>
          {patient.reports?.map((r: any) => (
            <div key={r.id} className="flex justify-between text-sm py-1">
              <span className="text-slate-600">{r.original_filename || r.file_type}</span>
              <span className="text-xs text-slate-400">{r.processing_status}</span>
            </div>
          ))}
        </Card>

        <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="font-semibold text-slate-800 mb-3">Upcoming Follow-ups</p>
          {patient.follow_ups?.filter((f: any) => f.status === "scheduled").map((f: any) => (
            <p key={f.id} className="text-sm text-slate-600 py-1">
              {f.doctor_name} {f.specialty ? `(${f.specialty})` : ""} — {new Date(f.appointment_date).toLocaleDateString()}
            </p>
          ))}
        </Card>
      </div>
    </div>
  );
}