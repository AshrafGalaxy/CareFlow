"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import PatientList from "@/components/provider/PatientList";
import AdherenceAnalytics from "@/components/provider/AdherenceAnalytics";
import { Users, Activity, AlertCircle, FileText, Loader2, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function ProviderDashboardPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [followups, setFollowups] = useState<any>(null);
  const [days, setDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, followupsRes] = await Promise.all([
          api.get("/api/dashboard/patients"),
          api.get("/api/dashboard/analytics/followups")
        ]);
        setPatients(patientsRes.data);
        setFollowups(followupsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard core data:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/api/dashboard/analytics/adherence?days=${days}`);
        setAnalytics(res.data);
      } catch (err) {
        console.error("Failed to fetch adherence analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [days]);

  const stats = [
    { 
      label: "Total Patients", 
      value: analytics?.total_patients ?? "—",
      icon: Users,
      color: "text-sky-500",
      bg: "bg-sky-50 dark:bg-sky-500/10"
    },
    { 
      label: "Avg Adherence", 
      value: analytics ? `${analytics.overall_adherence}%` : "—",
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10"
    },
    { 
      label: "Missed Follow-ups", 
      value: followups?.missed ?? "—",
      icon: AlertCircle,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-500/10"
    },
    { 
      label: "Patients w/ Reports", 
      value: patients.filter((p) => p.recent_report_id).length,
      icon: FileText,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-500/10"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">
          Provider Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Overview of your patients' health and adherence metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-6 rounded-2xl border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {isLoading && s.label.includes("Adherence") ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : s.value}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full group-hover:scale-110 transition-transform duration-500" />
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Patients</h2>
            <Link href="/provider/patients" className="text-sm font-medium text-sky-500 hover:text-sky-600 flex items-center gap-1 group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <PatientList patients={patients} />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Adherence Overview</h2>
          <AdherenceAnalytics data={analytics?.by_patient ?? []} days={days} setDays={setDays} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}