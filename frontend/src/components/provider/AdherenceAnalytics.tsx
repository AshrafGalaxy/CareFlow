// frontend/src/components/provider/AdherenceAnalytics.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function barColor(rate: number) {
  if (rate > 80) return "#22c55e";
  if (rate >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function AdherenceAnalytics({ data, days, setDays }: { data: any[]; days: number; setDays: (d: number) => void }) {
  return (
    <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-slate-800">Adherence by Patient</p>
        <div className="flex gap-1">
          {[7, 30, 90].map((d) => (
            <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>{d}d</Button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="rate">
            {data.map((entry, i) => <Cell key={i} fill={barColor(entry.rate)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
