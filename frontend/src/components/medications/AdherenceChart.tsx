'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface AdherenceChartProps {
 taken: number
 missed: number
 skipped: number
 adherenceRate: number
}

// Emerald for Taken, Rose for Missed, Amber for Skipped
const COLORS = ['#10b981', '#f43f5e', '#f59e0b']

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
 if (!midAngle || percent < 0.05) return null; // Don't show label for very small slices
 const RADIAN = Math.PI / 180
 const radius = innerRadius + (outerRadius - innerRadius) * 0.5
 const x = cx + radius * Math.cos(-midAngle * RADIAN)
 const y = cy + radius * Math.sin(-midAngle * RADIAN)
 return (
  <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700} className="drop-shadow-md">
   {`${(percent * 100).toFixed(0)}%`}
  </text>
 )
}

export function AdherenceChart({ taken, missed, skipped, adherenceRate }: AdherenceChartProps) {
 const total = taken + missed + skipped
 if (total === 0) {
  return (
   <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-border">
    <div className="text-3xl mb-2 opacity-50 grayscale">💊</div>
    <p className="text-sm font-medium">No doses logged yet</p>
   </div>
  )
 }

 const data = [
  { name: 'Taken', value: taken },
  { name: 'Missed', value: missed },
  { name: 'Skipped', value: skipped },
 ].filter(d => d.value > 0)

 return (
   <div className="relative w-full h-[220px] flex items-center justify-center overflow-visible">
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
     <span className="text-4xl font-bold font-heading text-foreground drop-shadow-sm">{adherenceRate}%</span>
     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Adherence</span>
    </div>
    <div className="w-full h-full -mx-4 sm:mx-0">
     <ResponsiveContainer width="100%" height="100%" className="overflow-visible">
      <PieChart className="overflow-visible">
       <defs>
        <filter id="pie-shadow" x="-20%" y="-20%" width="140%" height="140%">
         <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.1" />
        </filter>
       </defs>
       <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={80}
        paddingAngle={4}
        dataKey="value"
        labelLine={false}
        label={renderCustomLabel}
        stroke="none"
        style={{ filter: 'url(#pie-shadow)' }}
       >
        {data.map((entry, index) => {
          let color = COLORS[0];
          if (entry.name === 'Missed') color = COLORS[1];
          if (entry.name === 'Skipped') color = COLORS[2];
          return <Cell key={index} fill={color} />
        })}
       </Pie>
       <Tooltip
        formatter={(value: any, name: any) => [`${value} doses`, name]}
        contentStyle={{ 
          borderRadius: '12px', 
          border: '1px solid rgba(255,255,255,0.1)', 
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          fontWeight: 500,
          padding: '8px 12px'
        }}
        itemStyle={{ fontWeight: 600 }}
        wrapperStyle={{ zIndex: 100, outline: 'none' }}
        isAnimationActive={false} // Prevents jitter that can cause scrollbars
       />
      </PieChart>
     </ResponsiveContainer>
    </div>
   </div>
 )
}
