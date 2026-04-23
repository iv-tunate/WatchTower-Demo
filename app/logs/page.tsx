'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { getLogs, searchLogs, getServices } from '@/lib/observability-data'
import type { Log } from '@/lib/observability-data'

export default function LogsPage() {
  const [timeRange, setTimeRange] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string | 'all'>('all')
  const [selectedService, setSelectedService] = useState<string | 'all'>('all')
  const [logs, setLogs] = useState<Log[]>([])

  const services = getServices()

  useEffect(() => {
    let filteredLogs = searchQuery.trim() ? searchLogs(searchQuery, timeRange) : getLogs(timeRange)

    if (selectedLevel !== 'all') {
      filteredLogs = filteredLogs.filter((log) => log.level === selectedLevel)
    }

    if (selectedService !== 'all') {
      filteredLogs = filteredLogs.filter((log) => log.service === selectedService)
    }

    setLogs(filteredLogs.slice(0, 500))
  }, [timeRange, searchQuery, selectedLevel, selectedService])

  const handleRefresh = () => {
    console.log('Refreshing logs...')
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-danger/15 text-danger border border-danger/30'
      case 'warn':
        return 'bg-warning/15 text-warning border border-warning/30'
      case 'info':
        return 'bg-accent/15 text-accent border border-accent/30'
      case 'debug':
        return 'bg-accent2/15 text-accent2 border border-accent2/30'
      default:
        return 'bg-text-dim/15 text-text-dim border border-text-dim/30'
    }
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <TopBar title="Logs" onTimeRangeChange={setTimeRange} onRefresh={handleRefresh} />

      <main className="md:ml-[220px] mt-[52px] p-4 md:p-6 pb-24 md:pb-0">
        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search logs by message, service, or trace ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-text-primary placeholder-text-dim focus:outline-none focus:border-accent transition-colors text-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim text-lg">🔍</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Level Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLevel('all')}
                className={`px-3 py-1.5 text-[11px] rounded transition-all ${
                  selectedLevel === 'all' ? 'bg-accent-dim text-accent border border-accent' : 'bg-bg-card text-text-secondary border border-border hover:border-accent'
                }`}
              >
                All Levels
              </button>
              {['error', 'warn', 'info', 'debug'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-3 py-1.5 text-[11px] rounded transition-all ${
                    selectedLevel === level ? 'bg-accent-dim text-accent border border-accent' : 'bg-bg-card text-text-secondary border border-border hover:border-accent'
                  }`}
                >
                  {level.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Service Filter */}
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-1.5 text-[11px] bg-bg-card border border-border rounded text-text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Services</option>
              {services.map((service) => (
                <option key={service.name} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-5 border-b border-border bg-bg-panel sticky top-0 z-10">
            <h3 className="font-display text-sm font-semibold text-text-primary">Log Entries ({logs.length})</h3>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-text-dim text-sm">No logs found matching your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-bg-panel border-b border-border">
                  <tr>
                    <th className="px-5 py-3 text-left text-text-dim uppercase tracking-wider w-16">Level</th>
                    <th className="px-5 py-3 text-left text-text-dim uppercase tracking-wider w-24">Timestamp</th>
                    <th className="px-5 py-3 text-left text-text-dim uppercase tracking-wider w-32">Service</th>
                    <th className="px-5 py-3 text-left text-text-dim uppercase tracking-wider flex-1">Message</th>
                    <th className="px-5 py-3 text-left text-text-dim uppercase tracking-wider w-24">Trace ID</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-bg-hover transition-colors">
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded text-[9px] font-semibold ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-text-secondary font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-5 py-3 text-text-primary">{log.service}</td>
                      <td className="px-5 py-3 text-text-secondary">{log.message}</td>
                      <td className="px-5 py-3 text-text-dim font-mono text-[10px]">
                        {log.traceId ? log.traceId.slice(0, 8) + '...' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Log Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {['error', 'warn', 'info', 'debug'].map((level) => {
            const count = logs.filter((l) => l.level === level).length
            return (
              <div key={level} className="bg-bg-card border border-border rounded-lg p-4">
                <div className="text-[10px] text-text-dim uppercase tracking-widest mb-2">{level} Logs</div>
                <div className="text-2xl font-bold text-text-primary">{count}</div>
                <div className="text-[10px] text-text-dim mt-2">{((count / logs.length) * 100).toFixed(1)}% of total</div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
