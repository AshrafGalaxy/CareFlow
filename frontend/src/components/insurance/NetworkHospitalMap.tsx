'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo } from 'react'
import { STATE_HOSPITALS } from '@/data/hospitals'
import { Hospital, MapPin, Navigation } from 'lucide-react'
import { HospitalData } from '@/components/chat/widgets/HospitalMap'

// Dynamically import the map component so it doesn't break SSR
const HospitalMap = dynamic(
  () => import('@/components/chat/widgets/HospitalMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[250px] w-full bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-700 border-t-sky-500 rounded-full animate-spin mb-2" />
        <span className="text-sm font-medium">Loading Map...</span>
      </div>
    )
  }
)

interface NetworkHospitalMapProps {
  stateName: string
}

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function NetworkHospitalMap({ stateName }: NetworkHospitalMapProps) {
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null)
  const [geoError, setGeoError] = useState(false)
  const [locating, setLocating] = useState(true)

  const stateData = STATE_HOSPITALS[stateName] || STATE_HOSPITALS["Maharashtra"] // Default

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError(true)
      setLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLoc({ lat: position.coords.latitude, lng: position.coords.longitude })
        setLocating(false)
      },
      (error) => {
        console.warn("Geolocation error:", error)
        setGeoError(true)
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }, [])

  // Calculate distances and sort hospitals
  const processedHospitals = useMemo(() => {
    let hospitals = [...stateData.hospitals]
    
    if (userLoc) {
      // Calculate real distance
      hospitals = hospitals.map(h => {
        const distKm = calculateDistance(userLoc.lat, userLoc.lng, h.lat, h.lng)
        return {
          ...h,
          rawDist: distKm,
          distance: distKm < 1 ? `${(distKm * 1000).toFixed(0)} m` : `${distKm.toFixed(1)} km`
        }
      })
      // Sort by closest
      hospitals.sort((a, b) => (a as any).rawDist - (b as any).rawDist)
    } else {
      // Fallback if no location: just clear out dynamic distances
      hospitals = hospitals.map(h => ({ ...h, distance: undefined }))
    }

    return hospitals
  }, [stateData, userLoc])

  const mapCenter = userLoc ? [userLoc.lat, userLoc.lng] : stateData.center

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Hospital size={16} />
          </div>
          <div>
            <h3 className="font-bold text-foreground leading-tight">Network Hospitals</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              {locating ? (
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" /> Locating you...</span>
              ) : userLoc ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <MapPin size={12} /> Using live location
                </span>
              ) : (
                <span>Showing top hospitals in {stateName}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-md border border-indigo-100 dark:border-indigo-900/50 self-start sm:self-auto shrink-0">
          {processedHospitals.length} Found
        </div>
      </div>
      
      <div className="h-[350px] w-full relative">
        <HospitalMap 
          userLocation={{ lat: mapCenter[0], lng: mapCenter[1] }} 
          hospitals={processedHospitals}
          onNavigate={(hospital) => {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`, '_blank')
          }}
        />
      </div>
    </div>
  )
}
