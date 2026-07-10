'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Phone, ExternalLink, Pill, Store, Search, AlertTriangle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

import { useChatStore } from '@/store/chatStore'

// Dynamically import map to prevent SSR issues with Leaflet
const PharmacyMap = dynamic(() => import('./PharmacyMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
})

interface Pharmacy {
  id: string
  name: string
  distance: string
  address: string
  lat: number
  lon: number
  phone?: string
}

const ECOMMERCE_LINKS = [
  { name: '1mg', url: 'https://www.1mg.com/search/all?name=', color: 'bg-[#ff6f61] hover:bg-[#e05d50]' },
  { name: 'Apollo', url: 'https://www.apollopharmacy.in/search-medicines/', color: 'bg-[#008f75] hover:bg-[#00735e]' },
  { name: 'PharmEasy', url: 'https://pharmeasy.in/search/all?name=', color: 'bg-[#10847e] hover:bg-[#0c6b66]' },
  { name: 'Netmeds', url: 'https://www.netmeds.com/catalogsearch/result?q=', color: 'bg-[#24aeb1] hover:bg-[#1c9295]' },
  { name: 'Blinkit', url: 'https://blinkit.com/s/?q=', color: 'bg-[#f8cb46] hover:bg-[#e0b430] text-slate-900' },
  { name: 'Flipkart Health', url: 'https://healthplus.flipkart.com/search?keyword=', color: 'bg-[#2874f0] hover:bg-[#1c5dcf]' },
]

export function PharmacyLocatorWidget() {
  const { activeSession } = useChatStore()
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLoc, setUserLoc] = useState<{lat: number, lon: number} | null>(null)

  // A generic search term for the e-commerce links (could be parsed from AI response if passed as props, defaulting to general for now)
  const [searchQuery, setSearchQuery] = useState('Paracetamol') 

  useEffect(() => {
    const cacheKey = `careflow_pharmacy_cache_${activeSession?.id || 'default'}`
    const cachedData = sessionStorage.getItem(cacheKey)

    if (cachedData) {
      try {
        const { loc, items } = JSON.parse(cachedData)
        if (items && items.length > 0 && loc) {
          setUserLoc(loc)
          setPharmacies(items)
          setLoading(false)
          return
        }
      } catch (e) {
        console.error('Failed to parse cached pharmacy data', e)
      }
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const loc = { lat: latitude, lon: longitude }
        setUserLoc(loc)
        
        try {
          // Overpass API for pharmacies within 7km
          const query = `
            [out:json][timeout:25];
            (
              node["amenity"="pharmacy"](around:7000,${latitude},${longitude});
            );
            out body;
            >;
            out skel qt;
          `
          const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
          })
          
          if (!response.ok) throw new Error("API rate limited")
            
          const data = await response.json()
          
          const formattedPharmacies = data.elements
            .filter((el: any) => el.type === 'node' && el.tags && el.tags.name)
            .map((el: any) => {
              const dist = getDistanceFromLatLonInKm(latitude, longitude, el.lat, el.lon)
              return {
                id: el.id.toString(),
                name: el.tags.name,
                distance: dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`,
                rawDist: dist,
                address: el.tags['addr:street'] || el.tags['addr:full'] || 'Local Pharmacy',
                lat: el.lat,
                lon: el.lon,
                phone: el.tags.phone || el.tags['contact:phone']
              }
            })
            .sort((a: any, b: any) => a.rawDist - b.rawDist)
            .slice(0, 6)

          if (formattedPharmacies.length > 0) {
            setPharmacies(formattedPharmacies)
            sessionStorage.setItem(cacheKey, JSON.stringify({ loc, items: formattedPharmacies }))
          } else {
             // Mock fallback if empty
             const mocks = [
               { id: '1', name: 'Apollo Pharmacy', distance: '300m', address: 'Main Street', lat: latitude + 0.002, lon: longitude + 0.002 },
               { id: '2', name: 'Wellness Medical', distance: '800m', address: 'Market Road', lat: latitude - 0.005, lon: longitude + 0.001 }
             ]
             setPharmacies(mocks)
             sessionStorage.setItem(cacheKey, JSON.stringify({ loc, items: mocks }))
          }
          setLoading(false)
        } catch (err) {
          console.error("Overpass error:", err)
          // Fallback to local mock data
          const fallbackMocks = [
            { id: '1', name: 'Apollo Pharmacy (Mock)', distance: '300m', address: 'Main Street', lat: latitude + 0.002, lon: longitude + 0.002 },
            { id: '2', name: 'Wellness Medical (Mock)', distance: '800m', address: 'Market Road', lat: latitude - 0.005, lon: longitude + 0.001 }
          ]
          setPharmacies(fallbackMocks)
          sessionStorage.setItem(cacheKey, JSON.stringify({ loc, items: fallbackMocks }))
          setLoading(false)
        }
      },
      (err) => {
        setError("Location permission denied. Unable to find nearby pharmacies.")
        setLoading(false)
      }
    )
  }, [activeSession?.id])

  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371
    const dLat = deg2rad(lat2-lat1)
    const dLon = deg2rad(lon2-lon1) 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) 
    return R * c
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI/180)
  }

  const navigateTo = (name: string, lat: number, lon: number) => {
    if (!userLoc) return
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lon}&destination=${encodeURIComponent(name)}&destination_place_id=&travelmode=driving`
    window.open(url, '_blank')
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm w-full max-w-sm mb-4 font-sans">
      <div className="flex items-center gap-3 text-teal-500 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
          <Store size={20} />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200">Pharmacy & Prices</h4>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin mb-4"></div>
            <p className="text-sm font-medium text-slate-500">Locating pharmacies...</p>
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-6 text-center">
             <AlertTriangle size={32} className="text-rose-500 mb-3" />
             <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{error}</p>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            
            {/* E-Commerce Aggregator */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-2">
                <Search size={14} className="text-teal-500" /> Compare Online Prices
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {ECOMMERCE_LINKS.map(link => (
                  <a
                    key={link.name}
                    href={`${link.url}${encodeURIComponent(searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[11px] font-bold py-2 px-2 rounded-xl text-center shadow-sm text-white transition-transform hover:scale-105 active:scale-95 ${link.color}`}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Local Pharmacy Map */}
            {userLoc && pharmacies.length > 0 && (
              <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative z-0">
                 <PharmacyMap userLoc={userLoc} pharmacies={pharmacies} />
              </div>
            )}

            {/* Nearby Pharmacy List */}
            <div className="flex flex-col gap-2">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">Nearby Local Stores</h5>
              {pharmacies.map((pharmacy) => (
                <div key={pharmacy.id} className="flex flex-col p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-1">{pharmacy.name}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {pharmacy.distance} • {pharmacy.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigateTo(pharmacy.name, pharmacy.lat, pharmacy.lon)}
                      className="flex-1 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Navigation size={12} /> Navigate
                    </button>
                    {pharmacy.phone && (
                      <a 
                        href={`tel:${pharmacy.phone}`}
                        className="py-1.5 px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        <Phone size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
