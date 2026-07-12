"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import PatientList from "@/components/doctor/PatientList";
import { Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DoctorPatientsPage() {
 const [patients, setPatients] = useState<any[]>([]);
 const [unassignedPatients, setUnassignedPatients] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 const fetchPatients = useCallback(async () => {
  try {
   setIsLoading(true);
   const [patientsRes, unassignedRes] = await Promise.all([
    api.get("/api/dashboard/patients"),
    api.get("/api/dashboard/patients/unassigned"),
   ]);
   setPatients(patientsRes.data);
   setUnassignedPatients(unassignedRes.data);
  } catch (err) {
   console.error("Failed to fetch patients:", err);
   toast.error("Failed to load patients");
  } finally {
   setIsLoading(false);
  }
 }, []);

 useEffect(() => {
  fetchPatients();
 }, [fetchPatients]);

 const handleAssign = async (patientId: string) => {
  try {
   await api.post("/api/dashboard/patients/assign", { patient_id: patientId });
   toast.success("Patient assigned successfully");
   await fetchPatients();
  } catch {
   toast.error("Failed to assign patient");
  }
 };

 const handleRemove = async (patientId: string) => {
  try {
   await api.post(`/api/dashboard/patients/${patientId}/remove`);
   toast.success("Patient removed from your dashboard");
   await fetchPatients();
  } catch {
   toast.error("Failed to remove patient");
  }
 };

 if (isLoading) {
  return (
   <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-background h-[60vh]">
    <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-muted-foreground font-medium">Loading patients...</p>
   </div>
  );
 }

 return (
  <div className="space-y-8 animate-in fade-in duration-500">
   <div className="flex flex-col gap-2">
    <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
     <Users className="text-sky-500 w-8 h-8" />
     Patient Directory
    </h1>
    <p className="text-slate-500 dark:text-slate-400">
     Manage and view all patients currently assigned to your care.
    </p>
   </div>

   <PatientList
    patients={patients}
    unassignedPatients={unassignedPatients}
    onAssign={handleAssign}
    onRemove={handleRemove}
   />
  </div>
 );
}
