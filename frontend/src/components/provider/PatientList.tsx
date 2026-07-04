"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, User, Phone, Mail } from "lucide-react";

function adherenceBadgeClass(rate: number) {
  if (rate > 80) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
  if (rate >= 50) return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
  return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30";
}

export default function PatientList({ patients }: { patients: any[] }) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  
  const filtered = patients.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="rounded-2xl border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50 overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search patients by name or email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-shadow"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium">No patients found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((p) => (
              <div 
                key={p.patient_id} 
                onClick={() => router.push(`/provider/patients/${p.patient_id}`)}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                    {p.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {p.email}</span>
                      {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {p.phone}</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
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
                  
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-sky-100 dark:group-hover:bg-sky-900/50 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
