'use client'

import { useEffect, useState } from 'react'
import { Plus, Pill } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { MedicationCard } from '@/components/medications/MedicationCard'
import { AdherenceChart } from '@/components/medications/AdherenceChart'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  times_of_day: string[]
  is_active: boolean
  start_date: string
}

interface Adherence {
  total_doses: number
  taken: number
  missed: number
  skipped: number
  adherence_rate: number
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [adherence, setAdherence] = useState<Adherence | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [medsRes, adherenceRes] = await Promise.all([
        api.get('/api/medications/'),
        api.get('/api/medications/adherence?days=30'),
      ])
      setMedications(medsRes.data)
      setAdherence(adherenceRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const activeMeds = medications.filter(m => m.is_active)
  const inactiveMeds = medications.filter(m => !m.is_active)

  return (
    <div className="medications-page">
      <div className="medications-header">
        <div>
          <h1>My Medications</h1>
          <p>Track your daily medication schedule and adherence</p>
        </div>
        <Link href="/medications/add" className="add-medication-btn">
          <Plus size={18} />
          Add Medication
        </Link>
      </div>

      {loading ? (
        <div className="medications-loading">
          <div className="loading-spinner" />
          <p>Loading your medications...</p>
        </div>
      ) : (
        <div className="medications-content">
          {/* Adherence Summary */}
          <div className="adherence-section">
            <div className="adherence-card">
              <h2>30-Day Adherence</h2>
              {adherence && (
                <AdherenceChart
                  taken={adherence.taken}
                  missed={adherence.missed}
                  skipped={adherence.skipped}
                  adherenceRate={adherence.adherence_rate}
                />
              )}
              {adherence && (
                <div className="adherence-stats">
                  <div className="adherence-stat adherence-stat--taken">
                    <span className="stat-value">{adherence.taken}</span>
                    <span className="stat-label">Taken</span>
                  </div>
                  <div className="adherence-stat adherence-stat--missed">
                    <span className="stat-value">{adherence.missed}</span>
                    <span className="stat-label">Missed</span>
                  </div>
                  <div className="adherence-stat adherence-stat--skipped">
                    <span className="stat-value">{adherence.skipped}</span>
                    <span className="stat-label">Skipped</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Medications */}
          <div className="medications-list-section">
            {activeMeds.length === 0 ? (
              <div className="medications-empty">
                <Pill size={48} />
                <h3>No active medications</h3>
                <p>Add your first medication to start tracking your schedule.</p>
                <Link href="/medications/add" className="add-medication-btn">
                  <Plus size={16} /> Add Medication
                </Link>
              </div>
            ) : (
              <>
                <h2>Active Medications ({activeMeds.length})</h2>
                <div className="medications-grid">
                  {activeMeds.map(med => (
                    <MedicationCard key={med.id} medication={med} onLogSuccess={loadData} />
                  ))}
                </div>
              </>
            )}

            {inactiveMeds.length > 0 && (
              <>
                <h2 style={{ marginTop: '2rem', opacity: 0.6 }}>Inactive ({inactiveMeds.length})</h2>
                <div className="medications-grid">
                  {inactiveMeds.map(med => (
                    <MedicationCard key={med.id} medication={med} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
