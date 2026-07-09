"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import PatientList from "@/components/doctor/PatientList";
import AdherenceAnalytics from "@/components/doctor/AdherenceAnalytics";
import { FileText, Calendar, User, Clock, CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProviderDashboardPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [unassignedPatients, setUnassignedPatients] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [followups, setFollowups] = useState<any>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [upcomingFollowups, setUpcomingFollowups] = useState<any[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [patientsRes, unassignedRes, followupsRes, reportsRes, upcomingRes] = await Promise.all([
        api.get("/api/dashboard/patients"),
        api.get("/api/dashboard/patients/unassigned"),
        api.get("/api/dashboard/analytics/followups"),
        api.get("/api/dashboard/analytics/reports?limit=5"),
        api.get("/api/dashboard/analytics/upcoming-followups?limit=5")
      ]);
      setPatients(patientsRes.data);
      setUnassignedPatients(unassignedRes.data);
      setFollowups(followupsRes.data);
      setRecentReports(reportsRes.data);
      setUpcomingFollowups(upcomingRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchAdherence = async () => {
    try {
      const res = await api.get(`/api/dashboard/analytics/adherence?days=${days}`);
      setAnalytics(res.data);
    } catch (error) {
      console.error("Error fetching adherence data:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDashboardData(), fetchAdherence()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAdherence();
  }, [days]);

  const handleAssign = async (patientId: string) => {
    try {
      await api.post("/api/dashboard/patients/assign", { patient_id: patientId });
      toast.success("Patient assigned successfully");
      await fetchDashboardData();
      await fetchAdherence();
    } catch (error) {
      toast.error("Failed to assign patient");
    }
  };

  const handleRemove = async (patientId: string) => {
    try {
      await api.post(`/api/dashboard/patients/${patientId}/remove`);
      toast.success("Patient removed successfully");
      await fetchDashboardData();
      await fetchAdherence();
    } catch (error) {
      toast.error("Failed to remove patient");
    }
  };

  const stats = [
    { label: "Total Patients", value: analytics?.total_patients ?? "—" },
    { label: "Avg Adherence", value: analytics ? `${analytics.overall_adherence}%` : "—" },
    { label: "Missed Follow-ups", value: followups?.missed ?? "—" },
    { label: "Patients w/ Reports", value: patients.filter((p) => p.recent_report_id).length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
          <p className="text-sm text-slate-500">Loading Provider Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Provider Dashboard</h1>
        <p className="text-slate-500">Monitor patient adherence, check medical reports, and manage follow-ups.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <p className="text-sm text-slate-500 font-medium">{s.label}</p>
            <p className="text-3xl font-bold text-slate-850 mt-2">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Patients, Reports, and Followups */}
        <div className="lg:col-span-2 space-y-6">
          <PatientList
            patients={patients}
            unassignedPatients={unassignedPatients}
            onAssign={handleAssign}
            onRemove={handleRemove}
          />

          {/* Recent Reports Section */}
          <Card className="p-6 rounded-2xl border border-slate-200 shadow-sm bg-white space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Recent Reports</h2>
              <p className="text-xs text-slate-500">Most recent medical records uploaded by your patients</p>
            </div>
            <div className="divide-y divide-slate-100">
              {recentReports.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center font-medium">No reports uploaded yet</p>
              ) : (
                recentReports.map((r) => (
                  <div key={r.id} className="py-3.5 flex justify-between items-center hover:bg-slate-50/50 rounded-xl px-2 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-sky-50 text-sky-500 rounded-xl">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{r.original_filename || "Medical Report"}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-0.5"><User className="h-3 w-3" /> {r.patient_name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> {new Date(r.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded font-semibold capitalize ${
                        r.processing_status === 'done' ? 'bg-emerald-50 text-emerald-700' :
                        r.processing_status === 'failed' ? 'bg-rose-50 text-rose-700' :
                        'bg-amber-50 text-amber-700 animate-pulse'
                      }`}>
                        {r.processing_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Upcoming Follow-ups Section */}
          <Card className="p-6 rounded-2xl border border-slate-200 shadow-sm bg-white space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Upcoming Follow-ups</h2>
              <p className="text-xs text-slate-500">Scheduled appointments across your patients</p>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingFollowups.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center font-medium">No upcoming follow-ups scheduled</p>
              ) : (
                upcomingFollowups.map((f) => (
                  <div key={f.id} className="py-3.5 flex justify-between items-center hover:bg-slate-50/50 rounded-xl px-2 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 text-purple-500 rounded-xl">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Dr. {f.doctor_name || "Doctor"} {f.specialty ? `(${f.specialty})` : ""}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-0.5"><User className="h-3 w-3" /> {f.patient_name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {new Date(f.appointment_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 capitalize">
                        {f.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Adherence Chart */}
        <div>
          <AdherenceAnalytics data={analytics?.by_patient ?? []} days={days} setDays={setDays} />
        </div>
      </div>
    </div>
  );
}
