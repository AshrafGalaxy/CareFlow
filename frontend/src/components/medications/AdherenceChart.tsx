'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AdherenceChartProps {
 taken: number
 missed: number
 skipped: number
 adherenceRate: number
}

const COLORS = ['#22c55e', '#ef4444', '#eab308']
const RADIAN = Math.PI / 180

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
 if (!midAngle) return null;
 const RADIAN = Math.PI / 180
 const radius = innerRadius + (outerRadius - innerRadius) * 0.5
 const x = cx + radius * Math.cos(-midAngle * RADIAN)
 const y = cy + radius * Math.sin(-midAngle * RADIAN)
 return (
  <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
   {`${(percent * 100).toFixed(1)}%`}
  </text>
 )
}

export function AdherenceChart({ taken, missed, skipped, adherenceRate }: AdherenceChartProps) {
 const total = taken + missed + skipped
 if (total === 0) {
  return (
   <div className="adherence-chart adherence-chart--empty">
    <div className="adherence-empty-icon">💊</div>
    <p>No doses logged yet</p>
   </div>
  )
 }

 const data = [
  { name: 'Taken', value: taken },
  { name: 'Missed', value: missed },
  { name: 'Skipped', value: skipped },
 ].filter(d => d.value > 0)

 return (
   <div className="relative w-full h-[200px] flex items-center justify-center">
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
     <span className="text-3xl font-bold font-heading text-foreground">{adherenceRate}%</span>
     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Adherence</span>
    </div>
    <ResponsiveContainer width="100%" height={200}>
     <PieChart>
      <Pie
       data={data}
       cx="50%"
       cy="50%"
       innerRadius={65}
       outerRadius={85}
       paddingAngle={3}
       dataKey="value"
       labelLine={false}
       label={renderCustomLabel}
       stroke="none"
      >
       {data.map((_, index) => (
        <Cell key={index} fill={COLORS[index % COLORS.length]} />
       ))}
      </Pie>
      <Tooltip
       formatter={(value: any, name: any) => [`${value} doses`, name]}
       contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
      />
     </PieChart>
    </ResponsiveContainer>
   </div>
 )
}
