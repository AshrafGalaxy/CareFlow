'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface PharmacyMapProps {
  userLoc: { lat: number, lon: number }
  pharmacies: Array<{ id: string, name: string, lat: number, lon: number }>
}

export default function PharmacyMap({ userLoc, pharmacies }: PharmacyMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([userLoc.lat, userLoc.lon], 14)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Add user location marker
      const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #0ea5e9; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      })
      L.marker([userLoc.lat, userLoc.lon], { icon: userIcon }).addTo(mapRef.current)
    } else {
      mapRef.current.setView([userLoc.lat, userLoc.lon], 14)
    }

    // Add pharmacy markers
    const pharmacyIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #14b8a6; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14"/><path d="M5 16h14"/><path d="M12 3v18"/></svg></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    })

    pharmacies.forEach(p => {
      if (mapRef.current) {
        L.marker([p.lat, p.lon], { icon: pharmacyIcon })
          .bindPopup(`<b style="font-family: sans-serif; font-size: 12px; color: #0f172a;">${p.name}</b>`)
          .addTo(mapRef.current)
      }
    })

    return () => {
      // Don't destroy the map on unmount in React 18 strict mode unless necessary, 
      // but if we do, we should reset mapRef.
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [userLoc, pharmacies])

  return <div ref={containerRef} className="w-full h-full z-0" />
}
