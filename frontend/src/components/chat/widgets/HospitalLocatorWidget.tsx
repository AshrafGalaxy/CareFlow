'use client'

import { useState, useEffect } from 'react'
import { MapPin, AlertCircle, ExternalLink, Navigation, Building2, Phone } from 'lucide-react'
import { motion } from 'framer-motion'

interface Hospital {
  id: string
  name: string
  distance: string
  type: string
  latOffset: number
  lngOffset: number
}

const MOCK_HOSPITALS: Hospital[] = [
  { id: '1', name: 'City Central Hospital', distance: '1.2 km', type: 'General & Emergency', latOffset: 0.01, lngOffset: 0.01 },
  { id: '2', name: 'Apex Multi-specialty Clinic', distance: '2.5 km', type: 'Specialty Care', latOffset: -0.015, lngOffset: 0.02 },
  { id: '3', name: 'Metro Heart Institute', distance: '3.8 km', type: 'Cardiology', latOffset: 0.02, lngOffset: -0.01 },
  { id: '4', name: 'Carewell Emergency Center', distance: '4.1 km', type: '24/7 Trauma Center', latOffset: -0.02, lngOffset: -0.02 },
]

export function HospitalLocatorWidget() {
 const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
 const [error, setError] = useState<string | null>(null)
 const [loading, setLoading] = useState(true)
 const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)

 useEffect(() => {
  if (!navigator.geolocation) {
   setError('Geolocation is not supported by your browser.')
   setLoading(false)
   return
  }

  navigator.geolocation.getCurrentPosition(
   (position) => {
    setLocation({
     lat: position.coords.latitude,
     lng: position.coords.longitude,
    })
    setLoading(false)
   },
   (err) => {
    setError('Unable to retrieve your location. Please enable location permissions.')
    setLoading(false)
   },
   { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
 }, [])

 const handleNavigate = (hospital: Hospital) => {
   if (!location) return
   const destLat = location.lat + hospital.latOffset
   const destLng = location.lng + hospital.lngOffset
   window.open(`https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${destLat},${destLng}`, '_blank')
 }

 return (
  <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm font-sans mb-4">
   <div className="bg-sky-50 dark:bg-sky-900/20 px-5 py-4 flex items-center border-b border-sky-100 dark:border-sky-900/30">
    <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-500 mr-4">
     <MapPin size={20} />
    </div>
    <div>
     <h4 className="font-bold text-slate-800 dark:text-slate-200">Nearby Hospitals</h4>
     <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">Finding closest medical centers</p>
    </div>
   </div>

   <div className="p-0 relative">
    {loading && (
     <div className="p-8 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900 h-48">
      <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mb-3"></div>
      <p className="text-sm text-slate-500 font-medium">Locating you...</p>
     </div>
    )}

    {error && !loading && (
     <div className="p-6 flex flex-col items-center justify-center text-center bg-rose-50 dark:bg-rose-900/10 h-48">
      <AlertCircle className="text-rose-500 mb-2" size={24} />
      <p className="text-sm text-rose-600 font-medium">{error}</p>
     </div>
    )}

    {location && !loading && (
     <div className="flex flex-col max-h-[300px] overflow-y-auto bg-slate-50 dark:bg-slate-900 p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
       {MOCK_HOSPITALS.map((h, i) => (
         <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: i * 0.1 }}
           key={h.id} 
           className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-2 border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col gap-3"
         >
           <div className="flex justify-between items-start">
             <div className="flex items-start gap-3">
               <div className="mt-1 p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg">
                 <Building2 size={16} />
               </div>
               <div>
                 <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-tight">{h.name}</h5>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{h.type}</p>
                 <span className="inline-block mt-1.5 px-2 py-0.5 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-[10px] font-bold rounded-full">
                   {h.distance} away
                 </span>
               </div>
             </div>
           </div>
           
           <div className="flex gap-2 mt-1">
             <button 
               onClick={() => handleNavigate(h)}
               className="flex-1 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-800 dark:hover:bg-white transition-colors"
             >
               <Navigation size={12} />
               Navigate
             </button>
             <button className="py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
               <Phone size={14} />
             </button>
           </div>
         </motion.div>
       ))}
     </div>
    )}
   </div>
  </div>
 )
}
