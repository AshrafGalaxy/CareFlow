'use client'

import { useState } from 'react'
import { Pill, ShoppingCart, CheckCircle2, AlertCircle, Package } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'

export function MedicationWidget() {
  const [orderState, setOrderState] = useState<'idle' | 'processing' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleOrder = async () => {
    setOrderState('processing')
    setError(null)
    
    try {
      await api.post('/api/orders/', {
        medication_name: "Paracetamol 500mg",
        quantity: "10 Tablets",
        price: 45.00,
        address: "User Default Address"
      })
      setOrderState('success')
    } catch (err) {
      console.error("Order failed", err)
      setError("Failed to place order. Please try again.")
      setOrderState('idle')
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm w-full max-w-sm mb-4 font-sans">
      <div className="flex items-center gap-3 text-emerald-500 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
          <Pill size={20} />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200">E-Pharmacy</h4>
      </div>

      <AnimatePresence mode="wait">
        {orderState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
                 {/* Pill Placeholder styling */}
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                 <Pill className="text-emerald-500 w-8 h-8 relative z-10 drop-shadow-sm" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Paracetamol 500mg</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-1.5">For fever and mild pain relief.</p>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-md flex items-center gap-1">
                    <AlertCircle size={10} /> Low Stock
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                    10 Tablets
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Estimated Total</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">₹45.00</span>
            </div>

            <button
              onClick={handleOrder}
              disabled={orderState === 'processing'}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingCart size={16} />
              Order Refill
            </button>
            {error && <p className="text-xs text-rose-500 text-center font-medium mt-1">{error}</p>}
          </motion.div>
        )}

        {orderState === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin mb-4"></div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Processing Order...</h5>
            <p className="text-xs text-slate-500 mt-1">Contacting nearby pharmacy</p>
          </motion.div>
        )}

        {orderState === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 mb-4 shadow-sm border border-emerald-200 dark:border-emerald-900/50">
              <CheckCircle2 size={32} />
            </div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200">Order Confirmed!</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-4 leading-relaxed">
              Your refill for Paracetamol 500mg has been processed. It will be ready for pickup in 2 hours.
            </p>
            <div className="mt-5 w-full pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
               <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full">
                 <Package size={12} /> Order ID: #CF-88492
               </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
