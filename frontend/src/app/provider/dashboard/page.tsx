"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api"; // adjust to your real client filename
import { Card } from "@/components/ui/card";
import PatientList from "@/components/provider/PatientList";
import AdherenceAnalytics from "@/components/provider/AdherenceAnalytics";

export default function ProviderDashboardPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [followups, setFollowups] = useState<any>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    api.get("/api/dashboard/patients").then((res) => setPatients(res.data));
    api.get("/api/dashboard/analytics/followups").then((res) => setFollowups(res.data));
  }, []);

  useEffect(() => {
    api.get(`/api/dashboard/analytics/adherence?days=${days}`).then((res) => setAnalytics(res.data));
  }, [days]);

  const stats = [
    { label: "Total Patients", value: analytics?.total_patients ?? "—" },
    { label: "Avg Adherence", value: analytics ? `${analytics.overall_adherence}%` : "—" },
    { label: "Missed Follow-ups", value: followups?.missed ?? "—" },
    { label: "Patients w/ Reports", value: patients.filter((p) => p.recent_report_id).length },
  ];

  return (
    <div className="dashboard-page">
      <h1 className="text-3xl font-bold text-slate-800">Provider Dashboard</h1>

      <div className="dashboard-stats-grid">
        {stats.map((s) => (
          <Card key={s.label} className="dashboard-stat-card">
            <p className="dashboard-stat-label">{s.label}</p>
            <p className="dashboard-stat-value">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PatientList patients={patients} />
        </div>
        <div>
          <AdherenceAnalytics data={analytics?.by_patient ?? []} days={days} setDays={setDays} />
        </div>
      </div>
    </div>
  );
}