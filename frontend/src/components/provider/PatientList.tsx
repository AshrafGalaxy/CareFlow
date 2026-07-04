// frontend/src/components/provider/PatientList.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function adherenceBadgeClass(rate: number) {
  if (rate > 80) return "adherence-badge--good";
  if (rate >= 50) return "adherence-badge--ok";
  return "adherence-badge--low";
}

export default function PatientList({ patients }: { patients: any[] }) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const filtered = patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <Input placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="space-y-2">
        {filtered.map((p) => (
          <div key={p.patient_id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
            <div>
              <p className="font-semibold text-slate-800">{p.name}</p>
              <p className="text-xs text-slate-500">{p.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={adherenceBadgeClass(p.medication_adherence_rate)}>
                {p.medication_adherence_rate}%
              </Badge>
              <span className="text-xs text-slate-500">{p.pending_follow_ups} follow-ups</span>
              <Button size="sm" onClick={() => router.push(`/provider/patients/${p.patient_id}`)}>View</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
