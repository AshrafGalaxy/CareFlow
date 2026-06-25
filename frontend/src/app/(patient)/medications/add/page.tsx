'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

export default function AddMedicationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timesOfDay, setTimesOfDay] = useState<string[]>(['08:00'])

  const [form, setForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await api.post('/api/medications/', {
        ...form,
        times_of_day: timesOfDay,
        end_date: form.end_date || null,
      })
      router.push('/medications')
    } catch {
      setError('Failed to add medication. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addTime = () => setTimesOfDay([...timesOfDay, '12:00'])
  const removeTime = (index: number) => setTimesOfDay(timesOfDay.filter((_, i) => i !== index))
  const updateTime = (index: number, value: string) => {
    const updated = [...timesOfDay]
    updated[index] = value
    setTimesOfDay(updated)
  }

  return (
    <div className="add-medication-page">
      <div className="add-medication-header">
        <Link href="/medications" className="back-link">
          <ArrowLeft size={18} /> Back to Medications
        </Link>
        <h1>Add New Medication</h1>
      </div>

      <form className="add-medication-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="med-name">Medication Name *</label>
          <input
            id="med-name"
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Metformin"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="med-dosage">Dosage</label>
            <input
              id="med-dosage"
              type="text"
              value={form.dosage}
              onChange={e => setForm({ ...form, dosage: e.target.value })}
              placeholder="e.g., 500mg"
            />
          </div>
          <div className="form-group">
            <label htmlFor="med-frequency">Frequency</label>
            <input
              id="med-frequency"
              type="text"
              value={form.frequency}
              onChange={e => setForm({ ...form, frequency: e.target.value })}
              placeholder="e.g., Twice daily"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Times of Day</label>
          <div className="times-list">
            {timesOfDay.map((time, i) => (
              <div key={i} className="time-input-row">
                <input
                  type="time"
                  value={time}
                  onChange={e => updateTime(i, e.target.value)}
                />
                {timesOfDay.length > 1 && (
                  <button type="button" onClick={() => removeTime(i)} className="remove-time-btn">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addTime} className="add-time-btn">
              <Plus size={14} /> Add Time
            </button>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="med-start">Start Date *</label>
            <input
              id="med-start"
              type="date"
              value={form.start_date}
              onChange={e => setForm({ ...form, start_date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="med-end">End Date (optional)</label>
            <input
              id="med-end"
              type="date"
              value={form.end_date}
              onChange={e => setForm({ ...form, end_date: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="med-notes">Notes</label>
          <textarea
            id="med-notes"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Any special instructions..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <Link href="/medications" className="cancel-btn">Cancel</Link>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Medication'}
          </button>
        </div>
      </form>
    </div>
  )
}
