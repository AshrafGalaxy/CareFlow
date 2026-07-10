'use client'

import { useState, useEffect } from 'react'
import { MapPin, AlertCircle, ExternalLink, Navigation } from 'lucide-react'

export function HospitalLocatorWidget() {
 const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
 const [error, setError] = useState<string | null>(null)
 const [loading, setLoading] = useState(true)

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
     <div className="relative w-full h-48 sm:h-56">
      <iframe
       width="100%"
       height="100%"
       style={{ border: 0 }}
       loading="lazy"
       allowFullScreen
       referrerPolicy="no-referrer-when-downgrade"
       src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=14&output=embed`}
       className="absolute inset-0"
      ></iframe>
     </div>
    )}
   </div>

   {location && !loading && (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-2">
     <a
      href={`https://www.google.com/maps/search/hospitals+near+me/@${location.lat},${location.lng},14z`}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
     >
      <Navigation size={16} />
      Open in Maps
     </a>
    </div>
   )}
  </div>
 )
}
