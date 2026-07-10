import { AlertCircle, MapPin, PhoneCall } from "lucide-react"
import { CareBotAvatar } from "../CareBotAvatar"

export function EmergencyWidget() {
  return (
    <div className="flex items-start max-w-3xl mr-auto mt-2">
      <CareBotAvatar size={40} className="mr-4 mt-1" />
      <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-3xl rounded-bl-sm p-5 shadow-sm w-full max-w-[400px]">
        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
          <AlertCircle size={24} />
          <h4 className="font-bold text-lg">Emergency Assistance</h4>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-5">
          If you are experiencing a medical emergency, please contact emergency services immediately.
        </p>
        <div className="flex flex-col gap-2">
          <a href="tel:112" className="flex items-center justify-center gap-2 w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-colors">
            <PhoneCall size={18} />
            Call Emergency (112)
          </a>
          <a href="https://maps.google.com/?q=hospitals+near+me" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-semibold py-3 rounded-xl transition-colors">
            <MapPin size={18} />
            Find Nearby Hospitals
          </a>
        </div>
      </div>
    </div>
  )
}
