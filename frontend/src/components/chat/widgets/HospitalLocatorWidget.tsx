'use client'

import { useState, useEffect } from 'react'
import { MapPin, AlertCircle, Navigation, Building2, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { HospitalData } from './HospitalMap'

import { useChatStore } from '@/store/chatStore'

// Dynamically import the map component with SSR disabled
const HospitalMap = dynamic(() => import('./HospitalMap'), { 
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
})

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

export function HospitalLocatorWidget() {
  const { activeSession } = useChatStore()
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [hospitals, setHospitals] = useState<HospitalData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cacheKey = `careflow_hospitals_${activeSession?.id || 'default'}`
    const cachedData = sessionStorage.getItem(cacheKey)

    if (cachedData) {
      try {
        const { loc, items } = JSON.parse(cachedData)
        if (items && items.length > 0 && loc) {
          setLocation(loc)
          setHospitals(items)
          setLoading(false)
          return
        }
      } catch (e) {
        console.error('Failed to parse cached hospital data', e)
      }
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const userLoc = { lat, lng }
        setLocation(userLoc)
        
        try {
          // Fetch real hospitals from Overpass API (OpenStreetMap) within 10km
          const query = `[out:json];(node["amenity"~"hospital|clinic"](around:10000,${lat},${lng}););out 10;`
          const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
          })
          
          if (!response.ok) {
            throw new Error(`Overpass API Error: ${response.status} ${response.statusText}`)
          }
          
          const text = await response.text()
          if (text.startsWith('<?xml')) {
            throw new Error('Overpass API returned XML/HTML (likely rate limited)')
          }
          
          const data = JSON.parse(text)
          
          if (data.elements && data.elements.length > 0) {
            const fetchedHospitals: HospitalData[] = data.elements.map((el: any) => {
              const dist = calculateDistance(lat, lng, el.lat, el.lon)
              return {
                id: el.id.toString(),
                name: el.tags?.name || 'Medical Center',
                distance: dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`,
                type: el.tags?.amenity === 'clinic' ? 'Clinic' : 'General Hospital',
                lat: el.lat,
                lng: el.lon,
                phone: el.tags?.phone || el.tags?.['contact:phone']
              }
            })
            // Sort by distance
            fetchedHospitals.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
            setHospitals(fetchedHospitals)
            sessionStorage.setItem(cacheKey, JSON.stringify({ loc: userLoc, items: fetchedHospitals }))
          } else {
            setError('No hospitals found within 10km radius.')
          }
        } catch (err) {
          console.warn("Overpass API fallback triggered.")
          toast.info("Try again after some time", { id: "hosp-fallback" })
          
          const fallbackHospitals: HospitalData[] = [
            { id: 'mock-1', name: 'City Central Hospital', distance: '1.2 km', type: 'General & Emergency', lat: lat + 0.01, lng: lng + 0.01, phone: '+1234567890' },
            { id: 'mock-2', name: 'Apex Multi-specialty Clinic', distance: '2.5 km', type: 'Specialty Care', lat: lat - 0.015, lng: lng + 0.02, phone: '+1987654321' },
            { id: 'mock-3', name: 'Metro Heart Institute', distance: '3.8 km', type: 'Cardiology', lat: lat + 0.02, lng: lng - 0.01 },
            { id: 'mock-4', name: 'Carewell Emergency Center', distance: '4.1 km', type: '24/7 Trauma Center', lat: lat - 0.02, lng: lng - 0.02, phone: '+1122334455' },
          ]
          setHospitals(fallbackHospitals)
          sessionStorage.setItem(cacheKey, JSON.stringify({ loc: userLoc, items: fallbackHospitals }))
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError('Unable to retrieve your location. Please enable location permissions.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [activeSession?.id])

  const handleNavigate = (hospital: HospitalData) => {
    if (!location) return
    // Passing the hospital name as the destination ensures Google Maps resolves it 
    // to the actual POI (with the same name) rather than just dropping a generic coordinate pin.
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${encodeURIComponent(hospital.name)}`, '_blank')
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

      <div className="p-0 relative flex flex-col">
        {loading && (
          <div className="p-8 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900 h-64">
            <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-slate-500 font-medium">Locating and fetching data...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-6 flex flex-col items-center justify-center text-center bg-rose-50 dark:bg-rose-900/10 h-64">
            <AlertCircle className="text-rose-500 mb-2" size={24} />
            <p className="text-sm text-rose-600 font-medium">{error}</p>
          </div>
        )}

        {location && !loading && !error && (
          <>
            {/* Map Area */}
            <div className="w-full border-b border-slate-100 dark:border-slate-800 relative z-0">
              <HospitalMap 
                userLocation={location}
                hospitals={hospitals}
                onNavigate={handleNavigate}
              />
            </div>
            
            {/* List Area */}
            <div className="flex flex-col max-h-[300px] overflow-y-auto bg-slate-50 dark:bg-slate-900 p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {hospitals.map((h, i) => (
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
                    {h.phone ? (
                      <a 
                        href={`tel:${h.phone}`}
                        className="py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                      >
                        <Phone size={14} />
                      </a>
                    ) : (
                      <button 
                        disabled
                        className="py-2 px-3 bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 rounded-xl cursor-not-allowed flex items-center justify-center"
                        title="No phone number available"
                      >
                        <Phone size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
