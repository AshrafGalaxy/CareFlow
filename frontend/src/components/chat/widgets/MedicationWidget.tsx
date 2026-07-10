import { Pill, Plus, ArrowRight } from "lucide-react"
import { CareBotAvatar } from "../CareBotAvatar"
import { Link } from "@/i18n/routing"
import { APP_ROUTES } from "@/lib/constants"

export function MedicationWidget() {
  return (
    <div className="flex items-start max-w-3xl mr-auto mt-2">
      <CareBotAvatar size={40} className="mr-4 mt-1" />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl rounded-bl-sm p-5 shadow-sm w-full max-w-[400px]">
        <div className="flex items-center gap-3 text-emerald-500 mb-3">
          <Pill size={24} />
          <h4 className="font-bold text-lg">Medication Management</h4>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
          I can help you log a new prescription or view your current active medications.
        </p>
        <div className="flex flex-col gap-2">
          <Link href={APP_ROUTES.MEDICATIONS} className="flex items-center justify-between w-full bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-medium py-3 px-4 rounded-xl transition-colors">
            <span className="flex items-center gap-2"><Plus size={18} /> Add Medication</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
