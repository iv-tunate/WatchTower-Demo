'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { getServices, getTraces, getLogs } from '@/lib/observability-data'

interface Alert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  service: string
  timestamp: number
  resolved: boolean
  metric?: string
}

export default function AlertsPage() {
  const [timeRange, setTimeRange] = useState(1)
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all')

  const services = getServices()
  const traces = getTraces(timeRange)
  const logs = getLogs(timeRange)

  // Generate alerts based on current data
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = []

    // High error rate alerts
    services.forEach((service) => {
      if (service.errorRate > 1.5) {
        alerts.push({
          id: `alert-${service.name}-error-rate`,
          severity: service.errorRate > 3 ? 'critical' : 'warning',
          title: `High Error Rate on ${service.name}`,
          description: `Error rate is at ${service.errorRate.toFixed(2)}%. Investigate recent deployments or service health.`,
          service: service.name,
          timestamp: Date.now() - Math.random() * 3600000,
          resolved: false,
          metric: 'error_rate',
        })
      }

      // High latency alerts
      if (service.latency > 150) {
        alerts.push({
          id: `alert-${service.name}-latency`,
          severity: service.latency > 250 ? 'critical' : 'warning',
          title: `High Latency on ${service.name}`,
          description: `Average latency is ${service.latency}ms. Check database queries, external API calls, and resource utilization.`,
          service: service.name,
          timestamp: Date.now() - Math.random() * 3600000,
          resolved: false,
          metric: 'latency',
        })
      }

      // Low RPS alerts
      if (service.rps < 100 && Math.random() > 0.7) {
        alerts.push({
          id: `alert-${service.name}-rps`,
          severity: 'info',
          title: `Low Traffic on ${service.name}`,
          description: `RPS dropped to ${service.rps}. Verify if this is expected based on traffic patterns.`,
          service: service.name,
          timestamp: Date.now() - Math.random() * 7200000,
          resolved: Math.random() > 0.5,
          metric: 'rps',
        })
      }
    })

    // Trace error alerts
    const errorTraces = traces.filter((t) => t.status === 'error')
    if (errorTraces.length > traces.length * 0.05) {
      alerts.push({
        id: 'alert-high-error-traces',
        severity: 'critical',
        title: 'High Error Rate Detected',
        description: `${errorTraces.length} errors detected in the last ${timeRange} hour(s). Check logs for root cause.`,
        service: 'System',
        timestamp: Date.now() - Math.random() * 1800000,
        resolved: false,
      })
    }

    // Error log spike
    const errorLogs = logs.filter((l) => l.level === 'error')
    if (errorLogs.length > logs.length * 0.1) {
      alerts.push({
        id: 'alert-error-log-spike',
        severity: 'warning',
        title: 'Error Log Spike',
        description: `${errorLogs.length} error logs detected. Review logs immediately.`,
        service: 'System',
        timestamp: Date.now() - Math.random() * 3600000,
        resolved: false,
      })
    }

    // Recent resolved alerts
    alerts.push({
      id: 'alert-resolved-1',
      severity: 'info',
      title: 'Cache Service Recovery',
      description: 'Cache layer has recovered. Response times are back to normal.',
      service: 'Cache Layer',
      timestamp: Date.now() - 3600000,
      resolved: true,
    })

    alerts.push({
      id: 'alert-resolved-2',
      severity: 'warning',
      title: 'Database Connection Pool Normalized',
      description: 'Database connection pool has returned to healthy state.',
      service: 'Database',
      timestamp: Date.now() - 7200000,
      resolved: true,
    })

    return alerts
  }

  const allAlerts = generateAlerts()
  const filteredAlerts = selectedSeverity === 'all' ? allAlerts : allAlerts.filter((a) => a.severity === selectedSeverity)
  const activeAlerts = filteredAlerts.filter((a) => !a.resolved)
  const resolvedAlerts = filteredAlerts.filter((a) => a.resolved)

  const handleRefresh = () => {
    console.log('Refreshing alerts...')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-danger/15 text-danger border-danger/30'
      case 'warning':
        return 'bg-warning/15 text-warning border-warning/30'
      case 'info':
        return 'bg-accent/15 text-accent border-accent/30'
      default:
        return 'bg-text-dim/15 text-text-dim border-text-dim/30'
    }
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <TopBar title="Alerts & Anomalies" onTimeRangeChange={setTimeRange} onRefresh={handleRefresh} />

      <main className="md:ml-[220px] mt-[52px] p-4 md:p-6 pb-24 md:pb-0">
        {/* Alert Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <div className="text-[10px] text-text-dim uppercase tracking-widest mb-2">Total Alerts</div>
            <div className="text-3xl font-bold text-text-primary">{allAlerts.length}</div>
          </div>
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <div className="text-[10px] text-text-dim uppercase tracking-widest mb-2">Active</div>
            <div className="text-3xl font-bold text-danger">{activeAlerts.length}</div>
          </div>
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <div className="text-[10px] text-text-dim uppercase tracking-widest mb-2">Critical</div>
            <div className="text-3xl font-bold text-danger">{allAlerts.filter((a) => a.severity === 'critical').length}</div>
          </div>
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <div className="text-[10px] text-text-dim uppercase tracking-widest mb-2">Resolved</div>
            <div className="text-3xl font-bold text-success">{resolvedAlerts.length}</div>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['all', 'critical', 'warning', 'info'] as const).map((severity) => (
            <button
              key={severity}
              onClick={() => setSelectedSeverity(severity)}
              className={`px-4 py-2 rounded text-[11px] font-mono transition-all ${
                selectedSeverity === severity ? 'bg-accent-dim text-accent border border-accent' : 'bg-bg-card border border-border text-text-secondary hover:border-accent'
              }`}
            >
              {severity === 'all' ? 'All Severities' : severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
        </div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="mb-6">
            <h2 className="font-display text-base font-semibold text-text-primary mb-4">Active Alerts</h2>
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className={`bg-bg-card border-l-4 rounded-lg p-4 ${alert.severity === 'critical' ? 'border-l-danger' : alert.severity === 'warning' ? 'border-l-warning' : 'border-l-accent'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary text-sm">{alert.title}</h3>
                      <p className="text-[11px] text-text-secondary mt-1">{alert.description}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-semibold border ml-4 flex-shrink-0 ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[10px] text-text-dim mt-3">
                    <span>Service: {alert.service}</span>
                    <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    {alert.metric && <span>Metric: {alert.metric}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolved Alerts */}
        {resolvedAlerts.length > 0 && (
          <div>
            <h2 className="font-display text-base font-semibold text-text-primary mb-4">Recently Resolved</h2>
            <div className="space-y-3">
              {resolvedAlerts.map((alert) => (
                <div key={alert.id} className="bg-bg-card border border-border/50 rounded-lg p-4 opacity-75">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-secondary text-sm line-through">{alert.title}</h3>
                      <p className="text-[11px] text-text-dim mt-1">{alert.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded text-[10px] font-semibold border bg-success/15 text-success border-success/30 ml-4 flex-shrink-0">RESOLVED</span>
                  </div>
                  <div className="flex gap-4 text-[10px] text-text-dim mt-3">
                    <span>Service: {alert.service}</span>
                    <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredAlerts.length === 0 && (
          <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-text-dim">No alerts found matching your filter</p>
          </div>
        )}
      </main>
    </div>
  )
}
