"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useInsurance } from "@/hooks/useInsurance";

const STATES = ["Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "Rajasthan", "West Bengal", "Telangana"];

export default function InsuranceNavigatorPage() {
 const [query, setQuery] = useState("");
 const [state, setState] = useState("Maharashtra");
 const { loading, result, submitQuery } = useInsurance();

 async function handleSubmit() {
  if (!query.trim()) {
   toast.error("Please describe your medical situation first.");
   return;
  }
  try {
   await submitQuery(query, state);
  } catch (err: any) {
   toast.error(err?.response?.data?.detail || "Insurance Navigator failed. Please try again.");
  }
 }

 return (
  <div className="insurance-page">
   <div className="insurance-header">
    <h1>Insurance Navigator</h1>
    <p>Describe your situation — we'll find government schemes, costs, and documents.</p>
   </div>

   <Card className="insurance-query-card">
    <CardContent className="space-y-4 p-0">
     <Textarea
      placeholder='e.g. "My doctor recommended knee replacement"'
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="min-h-[120px]"
     />
     <div className="flex items-center gap-3">
      <select
       className="insurance-state-select"
       value={state}
       onChange={(e) => setState(e.target.value)}
      >
       {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <Button onClick={handleSubmit} disabled={loading} className="ml-auto">
       {loading ? "Searching for schemes..." : "Find Coverage Options"}
      </Button>
     </div>
    </CardContent>
   </Card>

   {result && (
    <div className="space-y-6">
     <h2 className="text-xl font-bold text-foreground">
      Coverage for: <span className="text-sky-600">{result.procedure_extracted}</span>
     </h2>

     {result.schemes_suggested?.map((scheme: any, i: number) => (
      <Card key={i} className="scheme-card">
       <p className="font-semibold text-foreground">{scheme.name}</p>
       <p className="scheme-coverage-amount">
        {typeof scheme.coverage_amount === "number"
         ? `₹${scheme.coverage_amount.toLocaleString("en-IN")}`
         : scheme.coverage_amount}
       </p>
       <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Eligibility:</strong> {scheme.eligibility}</p>
       <p className="text-sm text-slate-600 dark:text-slate-400"><strong>How to apply:</strong> {scheme.how_to_apply}</p>
      </Card>
     ))}

     <Card className="scheme-card">
      <p className="font-semibold text-foreground mb-3">Estimated Cost Breakdown</p>
      {Object.entries(result.cost_estimate || {}).map(([key, val]: any) =>
       key !== "total_estimate" ? (
        <div key={key} className="cost-row">
         <span className="capitalize">{key.replace("_", " ")}</span>
         <span>₹{val.min?.toLocaleString("en-IN")} – ₹{val.max?.toLocaleString("en-IN")}</span>
        </div>
       ) : null
      )}
      <div className="cost-row--total">
       <span>Total Estimate</span>
       <span>
        ₹{result.cost_estimate?.total_estimate?.min?.toLocaleString("en-IN")} – ₹
        {result.cost_estimate?.total_estimate?.max?.toLocaleString("en-IN")}
       </span>
      </div>
     </Card>

     <Card className="scheme-card">
      <p className="font-semibold text-foreground mb-3">Documents Checklist</p>
      {result.documents_checklist?.map((doc: any, i: number) => (
       <div key={i} className="doc-checklist-item">
        <input type="checkbox" className="mt-1" />
        <div>
         <span className="font-medium">{doc.document}</span>{" "}
         <span className="text-xs text-slate-400">{doc.required ? "(Required)" : "(Optional)"}</span>
         {doc.notes && <p className="text-xs text-slate-500 dark:text-slate-400">{doc.notes}</p>}
        </div>
       </div>
      ))}
     </Card>

     <details className="border rounded-lg p-4">
      <summary className="cursor-pointer font-medium text-foreground">Cashless Treatment Guidance</summary>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{result.cashless_guidance}</p>
     </details>

     <p className="text-xs text-slate-400">{result.disclaimer}</p>
    </div>
   )}
  </div>
 );
}