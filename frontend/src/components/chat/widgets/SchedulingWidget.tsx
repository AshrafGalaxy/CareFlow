import { Calendar, Clock, ArrowRight } from "lucide-react"
import { CareBotAvatar } from "../CareBotAvatar"
import { Link } from "@/i18n/routing"
import { APP_ROUTES } from "@/lib/constants"

export function SchedulingWidget() {
  return (
    <div className="flex items-start max-w-3xl mr-auto mt-2">
      <CareBotAvatar size={40} className="mr-4 mt-1" />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl rounded-bl-sm p-5 shadow-sm w-full max-w-[400px]">
        <div className="flex items-center gap-3 text-sky-500 mb-3">
          <Calendar size={24} />
          <h4 className="font-bold text-lg">Schedule an Appointment</h4>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
          Would you like to book a new appointment or view your upcoming schedule?
        </p>
        <div className="flex flex-col gap-2">
          <Link href={APP_ROUTES.CALENDAR} className="flex items-center justify-between w-full bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-medium py-3 px-4 rounded-xl transition-colors">
            <span className="flex items-center gap-2"><Clock size={18} /> Book Appointment</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
