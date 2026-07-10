'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Navigation, Phone } from 'lucide-react'

// Fix for default marker icons in Leaflet with Next.js/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom red icon for hospitals
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export interface HospitalData {
  id: string
  name: string
  distance: string
  type: string
  lat: number
  lng: number
  phone?: string
}

interface HospitalMapProps {
  userLocation: { lat: number; lng: number }
  hospitals: HospitalData[]
  onNavigate: (hospital: HospitalData) => void
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export default function HospitalMap({ userLocation, hospitals, onNavigate }: HospitalMapProps) {
  return (
    <div className="h-[250px] w-full relative z-0">
      <MapContainer 
        center={[userLocation.lat, userLocation.lng]} 
        zoom={13} 
        scrollWheelZoom={false}
        className="h-full w-full rounded-t-none rounded-b-none"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={[userLocation.lat, userLocation.lng]} />
        
        {/* User Location */}
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Hospitals */}
        {hospitals.map(hospital => (
          <Marker 
            key={hospital.id} 
            position={[hospital.lat, hospital.lng]}
            icon={hospitalIcon}
          >
            <Popup>
              <div className="flex flex-col gap-1 min-w-[150px]">
                <strong className="text-sm">{hospital.name}</strong>
                <span className="text-xs text-slate-500">{hospital.type}</span>
                <span className="text-xs font-semibold text-sky-600">{hospital.distance}</span>
                
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => onNavigate(hospital)}
                    className="flex-1 py-1.5 bg-sky-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-sky-600 transition-colors"
                  >
                    <Navigation size={10} />
                    Nav
                  </button>
                  {hospital.phone && (
                    <a 
                      href={`tel:${hospital.phone}`}
                      className="py-1.5 px-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center"
                    >
                      <Phone size={10} />
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
