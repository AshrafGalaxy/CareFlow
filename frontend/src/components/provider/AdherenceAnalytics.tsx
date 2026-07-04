"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function barColor(rate: number) {
  if (rate > 80) return "#10b981"; // emerald-500
  if (rate >= 50) return "#f59e0b"; // amber-500
  return "#f43f5e"; // rose-500
}

export default function AdherenceAnalytics({ 
  data, 
  days, 
  setDays,
  isLoading 
}: { 
  data: any[]; 
  days: number; 
  setDays: (d: number) => void;
  isLoading?: boolean;
}) {
  return (
    <Card className="p-5 rounded-2xl border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50 flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {[7, 30, 90].map((d) => (
            <button 
              key={d} 
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                days === d 
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        )}
        
        {!isLoading && (!data || data.length === 0) ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
            No adherence data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                interval={0} 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {data?.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.rate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
