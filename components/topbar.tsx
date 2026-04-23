'use client'

import { useState } from 'react'

interface TopBarProps {
  title: string
  onTimeRangeChange?: (hours: number) => void
  onRefresh?: () => void
}

export function TopBar({ title, onTimeRangeChange, onRefresh }: TopBarProps) {
  const [activeTimeRange, setActiveTimeRange] = useState('1h')

  const timeRanges = [
    { label: '1h', hours: 1 },
    { label: '7d', hours: 168 },
    { label: '30d', hours: 720 },
  ]

  const handleTimeRange = (range: string, hours: number) => {
    setActiveTimeRange(range)
    onTimeRangeChange?.(hours)
  }

  return (
    <div className="fixed top-0 left-[220px] right-0 h-[52px] bg-bg-panel border-b border-border flex items-center px-6 gap-4 z-40">
      <h1 className="font-display text-sm font-bold text-text-primary flex-1">{title}</h1>

      <div className="flex gap-3 items-center">
        {/* Time Range Buttons */}
        <div className="flex gap-0.5 bg-bg-card border border-border rounded p-0.5">
          {timeRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => handleTimeRange(range.label, range.hours)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                activeTimeRange === range.label
                  ? 'bg-accent-dim text-accent'
                  : 'text-text-secondary hover:text-accent hover:bg-accent-dim'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Custom Time Range Button */}
        <button className="px-3 py-1.5 text-[11px] font-mono text-text-secondary hover:text-accent hover:bg-bg-hover rounded transition-all">
          Custom
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 bg-accent-dim border border-accent text-accent text-[11px] font-mono rounded transition-all hover:bg-opacity-20"
        >
          ↻ Refresh
        </button>
      </div>
    </div>
  )
}
