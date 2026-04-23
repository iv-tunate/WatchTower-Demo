'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { getServices, getMetrics, getMetricsByService } from '@/lib/observability-data'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Metric } from '@/lib/observability-data'

export default function MetricsPage() {
  const [timeRange, setTimeRange] = useState(1)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const services = getServices()
  const allMetrics = getMetrics(timeRange)

  // Get metrics for selected service or all services
  const serviceMetrics = selectedService ? getMetricsByService(selectedService, timeRange) : allMetrics

  // Organize metrics by type
  const metricsByType = serviceMetrics.reduce(
    (acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = []
      }
      acc[metric.name].push(metric)
      return acc
    },
    {} as Record<string, Metric[]>
  )

  // Generate chart data for each metric type
  const generateChartData = (metrics: Metric[]) => {
    const grouped = metrics.reduce(
      (acc, m) => {
        const key = new Date(m.timestamp).toLocaleTimeString().slice(0, 5)
        if (!acc[key]) acc[key] = []
        acc[key].push(m)
        return acc
      },
      {} as Record<string, Metric[]>
    )

    return Object.entries(grouped).map(([time, mets]) => {
      const data: any = { time }
      mets.forEach((m) => {
        const serviceKey = m.serviceName || 'Total'
        data[serviceKey] = m.value
      })
      return data
    })
  }

  const cpuData = generateChartData(serviceMetrics.filter((m) => m.name === 'cpu_usage'))
  const memoryData = generateChartData(serviceMetrics.filter((m) => m.name === 'memory_usage'))
  const requestDurationData = generateChartData(serviceMetrics.filter((m) => m.name === 'request_duration'))
  const rpsData = generateChartData(serviceMetrics.filter((m) => m.name === 'requests_per_second'))
  const errorRateData = generateChartData(serviceMetrics.filter((m) => m.name === 'error_rate'))
  const latencyP99Data = generateChartData(serviceMetrics.filter((m) => m.name === 'latency_p99'))

  const handleRefresh = () => {
    console.log('Refreshing metrics...')
  }

  const colors = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <TopBar title="Metrics" onTimeRangeChange={setTimeRange} onRefresh={handleRefresh} />

      <main className="md:ml-[220px] mt-[52px] p-4 md:p-6 pb-24 md:pb-0">
        {/* Service Selector */}
        <div className="mb-6">
          <label className="block text-[10px] text-text-dim uppercase tracking-widest mb-3">Filter by Service</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedService(null)}
              className={`px-4 py-2 rounded text-[11px] font-mono transition-all ${
                selectedService === null ? 'bg-accent-dim text-accent border border-accent' : 'bg-bg-card border border-border text-text-secondary hover:border-accent'
              }`}
            >
              All Services
            </button>
            {services.map((service) => (
              <button
                key={service.name}
                onClick={() => setSelectedService(service.name)}
                className={`px-4 py-2 rounded text-[11px] transition-all ${
                  selectedService === service.name
                    ? 'bg-accent-dim text-accent border border-accent'
                    : 'bg-bg-card border border-border text-text-secondary hover:border-accent'
                }`}
              >
                {service.name}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-6">
          {/* CPU Usage */}
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <div className="mb-4">
              <h3 className="font-display text-sm font-semibold text-text-primary">CPU Usage (%)</h3>
              <p className="text-[10px] text-text-dim mt-1">Processor utilization across services</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" />
                <XAxis dataKey="time" stroke="#3d5470" fontSize={11} />
                <YAxis stroke="#3d5470" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#111927', border: '1px solid #1e2d42', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {Object.keys(cpuData[0] || {})
                  .filter((key) => key !== 'time')
                  .map((key, idx) => (
                    <Area key={key} type="monotone" dataKey={key} fill={colors[idx % colors.length]} stroke={colors[idx % colors.length]} fillOpacity={0.2} isAnimationActive={false} />
                  ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Memory Usage */}
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <div className="mb-4">
              <h3 className="font-display text-sm font-semibold text-text-primary">Memory Usage (MB)</h3>
              <p className="text-[10px] text-text-dim mt-1">RAM consumption over time</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" />
                <XAxis dataKey="time" stroke="#3d5470" fontSize={11} />
                <YAxis stroke="#3d5470" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111927', border: '1px solid #1e2d42', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {Object.keys(memoryData[0] || {})
                  .filter((key) => key !== 'time')
                  .map((key, idx) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} isAnimationActive={false} dot={false} />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Request Duration */}
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <div className="mb-4">
              <h3 className="font-display text-sm font-semibold text-text-primary">Request Duration (ms)</h3>
              <p className="text-[10px] text-text-dim mt-1">Average request processing time</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={requestDurationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" />
                <XAxis dataKey="time" stroke="#3d5470" fontSize={11} />
                <YAxis stroke="#3d5470" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111927', border: '1px solid #1e2d42', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {Object.keys(requestDurationData[0] || {})
                  .filter((key) => key !== 'time')
                  .map((key, idx) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} isAnimationActive={false} dot={false} />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Requests Per Second */}
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <div className="mb-4">
              <h3 className="font-display text-sm font-semibold text-text-primary">Requests Per Second (RPS)</h3>
              <p className="text-[10px] text-text-dim mt-1">Request throughput over time</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={rpsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" />
                <XAxis dataKey="time" stroke="#3d5470" fontSize={11} />
                <YAxis stroke="#3d5470" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111927', border: '1px solid #1e2d42', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {Object.keys(rpsData[0] || {})
                  .filter((key) => key !== 'time')
                  .map((key, idx) => (
                    <Area key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} fill={colors[idx % colors.length]} fillOpacity={0.2} isAnimationActive={false} />
                  ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Error Rate */}
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <div className="mb-4">
              <h3 className="font-display text-sm font-semibold text-text-primary">Error Rate (%)</h3>
              <p className="text-[10px] text-text-dim mt-1">Percentage of failed requests</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={errorRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" />
                <XAxis dataKey="time" stroke="#3d5470" fontSize={11} />
                <YAxis stroke="#3d5470" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111927', border: '1px solid #1e2d42', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {Object.keys(errorRateData[0] || {})
                  .filter((key) => key !== 'time')
                  .map((key, idx) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} isAnimationActive={false} dot={false} />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* P99 Latency */}
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <div className="mb-4">
              <h3 className="font-display text-sm font-semibold text-text-primary">P99 Latency (ms)</h3>
              <p className="text-[10px] text-text-dim mt-1">99th percentile response time</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={latencyP99Data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" />
                <XAxis dataKey="time" stroke="#3d5470" fontSize={11} />
                <YAxis stroke="#3d5470" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111927', border: '1px solid #1e2d42', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {Object.keys(latencyP99Data[0] || {})
                  .filter((key) => key !== 'time')
                  .map((key, idx) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} isAnimationActive={false} dot={false} />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  )
}
