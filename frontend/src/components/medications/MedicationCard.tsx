'use client'

import { useState } from 'react'
import { Pill, CheckCircle, XCircle, Clock } from 'lucide-react'
import api from '@/lib/api'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  times_of_day: string[]
  is_active: boolean
}

interface MedicationCardProps {
  medication: Medication
  onLogSuccess?: () => void
}

export function MedicationCard({ medication, onLogSuccess }: MedicationCardProps) {
  const [logging, setLogging] = useState(false)
  const [lastStatus, setLastStatus] = useState<string | null>(null)

  const logDose = async (status: 'taken' | 'missed' | 'skipped') => {
    setLogging(true)
    try {
      await api.post(`/api/medications/${medication.id}/log`, { status })
      setLastStatus(status)
      onLogSuccess?.()
    } catch (e) {
      console.error(e)
    } finally {
      setLogging(false)
    }
  }

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`
  }

  return (
    <div className={`medication-card ${!medication.is_active ? 'medication-card--inactive' : ''}`}>
      <div className="medication-card-header">
        <div className="medication-icon">
          <Pill size={20} />
        </div>
        <div className="medication-info">
          <h3 className="medication-name">{medication.name}</h3>
          <p className="medication-dosage">{medication.dosage} · {medication.frequency}</p>
        </div>
        {!medication.is_active && (
          <span className="medication-inactive-badge">Inactive</span>
        )}
      </div>

      {medication.times_of_day?.length > 0 && (
        <div className="medication-times">
          <Clock size={14} />
          <span>{medication.times_of_day.map(formatTime).join(', ')}</span>
        </div>
      )}

      {medication.is_active && (
        <div className="medication-actions">
          <p className="medication-today-label">Today&apos;s dose:</p>
          <div className="medication-action-btns">
            {lastStatus ? (
              <div className={`dose-logged dose-logged--${lastStatus}`}>
                {lastStatus === 'taken' && <><CheckCircle size={16} /> Marked as Taken</>}
                {lastStatus === 'missed' && <><XCircle size={16} /> Marked as Missed</>}
                {lastStatus === 'skipped' && <><XCircle size={16} /> Skipped</>}
              </div>
            ) : (
              <>
                <button
                  className="dose-btn dose-btn--taken"
                  onClick={() => logDose('taken')}
                  disabled={logging}
                >
                  <CheckCircle size={14} />
                  Mark as Taken
                </button>
                <button
                  className="dose-btn dose-btn--missed"
                  onClick={() => logDose('missed')}
                  disabled={logging}
                >
                  <XCircle size={14} />
                  Missed
                </button>
                <button
                  className="dose-btn dose-btn--skipped"
                  onClick={() => logDose('skipped')}
                  disabled={logging}
                >
                  Skip
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
