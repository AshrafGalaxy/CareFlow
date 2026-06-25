'use client'

interface AbnormalValueBadgeProps {
  status: 'normal' | 'low' | 'high' | 'borderline'
  label?: string
}

const STATUS_CONFIG = {
  normal: {
    bg: 'rgba(34,197,94,0.15)',
    border: 'rgba(34,197,94,0.4)',
    text: '#16a34a',
    label: 'Normal',
  },
  low: {
    bg: 'rgba(239,68,68,0.15)',
    border: 'rgba(239,68,68,0.4)',
    text: '#dc2626',
    label: 'Low',
  },
  high: {
    bg: 'rgba(239,68,68,0.15)',
    border: 'rgba(239,68,68,0.4)',
    text: '#dc2626',
    label: 'High',
  },
  borderline: {
    bg: 'rgba(234,179,8,0.15)',
    border: 'rgba(234,179,8,0.4)',
    text: '#ca8a04',
    label: 'Borderline',
  },
}

export function AbnormalValueBadge({ status, label }: AbnormalValueBadgeProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.normal

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.text,
      }}
    >
      {label || cfg.label}
    </span>
  )
}
