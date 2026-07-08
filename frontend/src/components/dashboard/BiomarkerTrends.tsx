"use client"

import { useEffect, useMemo, useState } from "react"
import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Area,
 AreaChart,
} from "recharts"
import { format, parseISO } from "date-fns"
import { Activity, TrendingUp, AlertCircle } from "lucide-react"

interface Highlight {
 label: string
 value: string
 reference_range?: string
 status?: "normal" | "low" | "high" | "borderline"
 note?: string
}

interface Report {
 id: string
 uploaded_at: string
 ai_highlights?: Highlight[]
}

interface BiomarkerTrendsProps {
 reports: Report[]
}

export function BiomarkerTrends({ reports }: BiomarkerTrendsProps) {
 const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(null)

 // Parse and aggregate data
 const chartData = useMemo(() => {
  if (!reports || reports.length === 0) return []

  // 1. Sort reports chronologically
  const sortedReports = [...reports].sort(
   (a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
  )

  // 2. Aggregate all biomarkers
  const biomarkerMap = new Map<string, { date: string; value: number; originalValue: string }[]>()

  sortedReports.forEach((report) => {
   if (!report.ai_highlights) return
   
   report.ai_highlights.forEach((highlight) => {
    // Extract numerical value
    const match = highlight.value.match(/[\d.]+/)
    if (match) {
     const numValue = parseFloat(match[0])
     const label = highlight.label.trim()
     const dateStr = format(new Date(report.uploaded_at), "MMM d, yyyy")

     if (!biomarkerMap.has(label)) {
      biomarkerMap.set(label, [])
     }
     biomarkerMap.get(label)!.push({
      date: dateStr,
      value: numValue,
      originalValue: highlight.value,
     })
    }
   })
  })

  // 3. Filter for biomarkers with at least 2 data points (to show a trend)
  const plotableBiomarkers = Array.from(biomarkerMap.entries())
   .filter(([_, dataPoints]) => dataPoints.length >= 1) // Even 1 point is fine to show current state, but 2+ is a trend
   .sort((a, b) => b[1].length - a[1].length) // Sort by most data points

  return plotableBiomarkers
 }, [reports])

 // Set default selected biomarker
 useEffect(() => {
  if (chartData.length > 0 && !selectedBiomarker) {
   setSelectedBiomarker(chartData[0][0])
  }
 }, [chartData, selectedBiomarker])

 if (chartData.length === 0) {
  return null // Don't show the section if no plotable data exists yet
 }

 const activeData = chartData.find((d) => d[0] === selectedBiomarker)?.[1] || []
 
 // Calculate trend direction for UI
 const trend = activeData.length >= 2 
    ? activeData[activeData.length - 1].value - activeData[activeData.length - 2].value 
    : 0

 return (
  <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-8">
   <div className="p-6 border-b border-border bg-muted/20">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
     <div className="flex items-center gap-3">
      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
       <Activity size={20} />
      </div>
      <div>
       <h2 className="text-xl font-heading font-semibold text-foreground">Health Trends</h2>
       <p className="text-sm text-muted-foreground">Auto-plotted from your medical reports</p>
      </div>
     </div>

     {/* Biomarker Selector */}
     <div className="flex overflow-x-auto pb-1 sm:pb-0 hide-scrollbar gap-2">
      {chartData.map(([label]) => (
       <button
        key={label}
        onClick={() => setSelectedBiomarker(label)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
         selectedBiomarker === label
          ? "bg-sky-500 text-white shadow-sm"
          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
       >
        {label}
       </button>
      ))}
     </div>
    </div>
   </div>

   <div className="p-6">
    {activeData.length > 0 && (
     <div className="flex flex-col lg:flex-row gap-8 items-center">
      
      {/* Chart Area */}
      <div className="w-full lg:w-3/4 h-[300px]">
       <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
         <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
           <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
           <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
          </linearGradient>
         </defs>
         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
         <XAxis 
          dataKey="date" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          dy={10}
         />
         <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
         />
         <Tooltip 
          contentStyle={{ 
           backgroundColor: 'hsl(var(--card))', 
           borderColor: 'hsl(var(--border))',
           borderRadius: '0.75rem',
           boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
          }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
          labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
         />
         <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#0ea5e9" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorValue)" 
          activeDot={{ r: 6, fill: "#0ea5e9", stroke: "var(--card)", strokeWidth: 2 }}
         />
        </AreaChart>
       </ResponsiveContainer>
      </div>

      {/* Stats Summary Panel */}
      <div className="w-full lg:w-1/4 space-y-6 bg-muted/20 p-6 rounded-2xl border border-border/50 self-stretch flex flex-col justify-center">
       <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">Latest {selectedBiomarker}</p>
        <div className="flex items-baseline gap-2">
         <span className="text-4xl font-bold text-foreground">
          {activeData[activeData.length - 1].value}
         </span>
         <span className="text-sm font-medium text-muted-foreground">
          {activeData[activeData.length - 1].originalValue.replace(/[\d.]+/, "").trim()}
         </span>
        </div>
       </div>

       {activeData.length >= 2 && (
        <div className="pt-4 border-t border-border/50">
         <div className="flex items-center gap-2">
          {trend < 0 ? (
           <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md text-sm font-medium">
            <TrendingUp className="w-4 h-4 rotate-180" />
            <span>{Math.abs(trend).toFixed(1)} down</span>
           </div>
          ) : trend > 0 ? (
           <div className="flex items-center gap-1 text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>{Math.abs(trend).toFixed(1)} up</span>
           </div>
          ) : (
           <div className="flex items-center gap-1 text-muted-foreground bg-muted px-2 py-1 rounded-md text-sm font-medium">
            <span>Stable</span>
           </div>
          )}
          <span className="text-xs text-muted-foreground">vs last report</span>
         </div>
        </div>
       )}

       {activeData.length === 1 && (
        <div className="pt-4 border-t border-border/50 flex gap-2 text-amber-600 dark:text-amber-400">
         <AlertCircle className="w-5 h-5 shrink-0" />
         <p className="text-xs">Upload another report containing {selectedBiomarker} to see your trend over time.</p>
        </div>
       )}
      </div>
     </div>
    )}
   </div>
  </div>
 )
}
