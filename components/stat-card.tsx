interface StatCardProps {
  label: string
  value: string | number
  delta?: string
  trend?: 'up' | 'down' | 'neutral'
  variant?: 'blue' | 'green' | 'yellow' | 'red'
  subtitle?: string
}

export function StatCard({
  label,
  value,
  delta,
  trend,
  variant = 'blue',
  subtitle,
}: StatCardProps) {
  const variantColors = {
    blue: {
      border: 'border-t-2 border-t-accent',
      value: 'text-accent',
      badge: 'bg-accent-dim border border-accent text-accent',
    },
    green: {
      border: 'border-t-2 border-t-success',
      value: 'text-success',
      badge: 'bg-success/15 border border-success/30 text-success',
    },
    yellow: {
      border: 'border-t-2 border-t-warning',
      value: 'text-warning',
      badge: 'bg-warning/15 border border-warning/30 text-warning',
    },
    red: {
      border: 'border-t-2 border-t-danger',
      value: 'text-danger',
      badge: 'bg-danger/15 border border-danger/30 text-danger',
    },
  }

  const colors = variantColors[variant]

  return (
    <div className={`bg-bg-card border border-border rounded-lg p-5 hover:border-border-bright transition-colors ${colors.border}`}>
      <div className="text-[10px] text-text-dim uppercase tracking-widest mb-2">{label}</div>
      <div className="flex items-baseline gap-3 mb-2">
        <div className={`font-display text-2xl font-bold ${colors.value}`}>{value}</div>
      </div>
      {subtitle && <div className="text-[10px] text-text-dim mb-3">{subtitle}</div>}
      {delta && (
        <div className={`text-[11px] font-mono ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-secondary'}`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {delta}
        </div>
      )}
    </div>
  )
}
