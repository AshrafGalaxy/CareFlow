'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, MapPin, PhoneCall, Navigation } from "lucide-react"

export function EmergencyWidget() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
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
      () => {
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }, [])

  return (
    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-5 shadow-sm w-full max-w-[400px] mb-4">
      <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
        <AlertCircle size={24} className="animate-pulse" />
        <h4 className="font-bold text-lg">Emergency Assistance</h4>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 mb-5">
        If you are experiencing a medical emergency, please contact emergency services immediately.
      </p>
      <div className="flex flex-col gap-2">
        <a href="tel:112" className="flex items-center justify-center gap-2 w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm">
          <PhoneCall size={18} className="animate-bounce" />
          Call Emergency (112)
        </a>
        
        {loading ? (
          <button disabled className="flex items-center justify-center gap-2 w-full bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-rose-400 font-semibold py-3 rounded-xl opacity-70">
             <div className="w-4 h-4 rounded-full border-2 border-rose-200 border-t-rose-500 animate-spin"></div>
             Locating...
          </button>
        ) : (
          <a 
            href={location 
              ? `https://www.google.com/maps/search/emergency+room+near+me/@${location.lat},${location.lng},14z`
              : "https://maps.google.com/?q=emergency+room+near+me"
            } 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center justify-center gap-2 w-full bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-semibold py-3 rounded-xl transition-colors shadow-sm"
          >
            {location ? <Navigation size={18} /> : <MapPin size={18} />}
            {location ? "Route to Nearest ER" : "Find Nearby ER"}
          </a>
        )}
      </div>
    </div>
  )
}
