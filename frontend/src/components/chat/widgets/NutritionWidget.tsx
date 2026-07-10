'use client'

import { Utensils, Leaf, Flame, Droplet, Activity, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react"
import { motion } from 'framer-motion'

export function NutritionWidget() {
  // Mock data that would normally be passed as props from the AI response
  const foodData = {
    name: "Grilled Salmon Salad",
    calories: 320,
    protein: 28, // grams
    carbs: 12, // grams
    fats: 18, // grams
    healthScore: "Great", // "Great", "Moderate", "Warning"
    dietaryTags: ["Keto Friendly", "Heart Healthy", "Low Carb"],
    warnings: []
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm w-full max-w-sm mb-4 font-sans">
      <div className="flex items-center gap-3 text-orange-500 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
          <Utensils size={20} />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200">Nutrition Analysis</h4>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
        
        {/* Header & Calories */}
        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{foodData.name}</h5>
            <div className="flex gap-2 mt-1 flex-wrap">
              {foodData.dietaryTags.map(tag => (
                <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
            <Flame size={16} className="text-orange-500 mb-1" />
            <span className="text-lg font-black text-slate-800 dark:text-slate-200 leading-none">{foodData.calories}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">kcal</span>
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-sky-50 dark:bg-sky-950/30 p-3 rounded-2xl border border-sky-100 dark:border-sky-900/50 flex flex-col items-center justify-center text-center">
             <Droplet size={14} className="text-sky-500 mb-1" />
             <span className="text-sm font-black text-slate-800 dark:text-slate-200">{foodData.protein}g</span>
             <span className="text-[10px] font-bold text-slate-500">Protein</span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/50 flex flex-col items-center justify-center text-center">
             <Leaf size={14} className="text-amber-500 mb-1" />
             <span className="text-sm font-black text-slate-800 dark:text-slate-200">{foodData.carbs}g</span>
             <span className="text-[10px] font-bold text-slate-500">Carbs</span>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/50 flex flex-col items-center justify-center text-center">
             <Activity size={14} className="text-rose-500 mb-1" />
             <span className="text-sm font-black text-slate-800 dark:text-slate-200">{foodData.fats}g</span>
             <span className="text-[10px] font-bold text-slate-500">Fats</span>
          </div>
        </div>

        {/* Health Score Verdict */}
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 mt-2">
          <div className="mt-0.5 shrink-0">
            <ShieldCheck size={18} className="text-emerald-500" />
          </div>
          <div>
            <h5 className="font-bold text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wide mb-0.5">Safe to Eat</h5>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80 font-medium">This meal aligns perfectly with your health profile. High protein and low simple carbohydrates.</p>
          </div>
        </div>

      </motion.div>
    </div>
  )
}
