'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { getServices, getMetricsByService } from '@/lib/observability-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function ServicesPage() {
  const [timeRange, setTimeRange] = useState(1)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const services = getServices()
  const selectedServiceData = services.find((s) => s.name === selectedService)
  const serviceMetrics = selectedService ? getMetricsByService(selectedService, timeRange) : []

  // Prepare data for service comparison
  const comparisonData = services.map((s) => ({
    name: s.name,
    rps: s.rps,
    errorRate: s.errorRate,
    latency: s.latency,
    instances: s.instances,
  }))

  const handleRefresh = () => {
    console.log('Refreshing services...')
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <TopBar title="Services & Topology" onTimeRangeChange={setTimeRange} onRefresh={handleRefresh} />

      <main className="md:ml-[220px] mt-[52px] p-4 md:p-6 pb-24 md:pb-0">
        {/* Service Grid */}
        <div className="mb-8">
          <h2 className="font-display text-base font-semibold text-text-primary mb-4">Service Topology</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <button
                key={service.name}
                onClick={() => setSelectedService(service.name)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedService === service.name
                    ? 'bg-accent-dim border-accent'
                    : service.status === 'healthy'
                      ? 'bg-bg-card border-success/30 hover:border-success'
                      : service.status === 'warning'
                        ? 'bg-bg-card border-warning/30 hover:border-warning'
                        : 'bg-bg-card border-danger/30 hover:border-danger'
                }`}
              >
                <div className="text-3xl mb-2">{service.icon}</div>
                <div className="font-semibold text-text-primary text-sm">{service.name}</div>
                <div className="text-[10px] text-text-dim mt-1">
                  <div>RPS: {service.rps}</div>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[9px] font-semibold ${
                        service.status === 'healthy'
                          ? 'bg-success/15 text-success'
                          : service.status === 'warning'
                            ? 'bg-warning/15 text-warning'
                            : 'bg-danger/15 text-danger'
                      }`}
                    >
                      {service.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Service Details */}
        {selectedServiceData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Service Info */}
            <div className="bg-bg-card border border-border rounded-lg p-5">
              <h3 className="font-display text-sm font-semibold text-text-primary mb-5">Service Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-text-dim uppercase tracking-widest">Service Name</label>
                  <div className="text-text-primary mt-2">{selectedServiceData.name}</div>
                </div>
                <div>
                  <label className="text-[10px] text-text-dim uppercase tracking-widest">Status</label>
                  <div className="mt-2">
                    <span
                      className={`inline-block px-3 py-1 rounded text-[11px] font-semibold ${
                        selectedServiceData.status === 'healthy'
                          ? 'bg-success/15 text-success border border-success/30'
                          : selectedServiceData.status === 'warning'
                            ? 'bg-warning/15 text-warning border border-warning/30'
                            : 'bg-danger/15 text-danger border border-danger/30'
                      }`}
                    >
                      {selectedServiceData.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-text-dim uppercase tracking-widest">Instances</label>
                  <div className="text-text-primary mt-2">{selectedServiceData.instances}</div>
                </div>
              </div>
            </div>

            {/* Metrics Summary */}
            <div className="bg-bg-card border border-border rounded-lg p-5">
              <h3 className="font-display text-sm font-semibold text-text-primary mb-5">Metrics</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-text-dim uppercase tracking-widest">Requests/Second</label>
                  <div className="text-2xl font-bold text-accent mt-2">{selectedServiceData.rps}</div>
                </div>
                <div>
                  <label className="text-[10px] text-text-dim uppercase tracking-widest">Error Rate</label>
                  <div className="text-2xl font-bold text-danger mt-2">{selectedServiceData.errorRate.toFixed(2)}%</div>
                </div>
                <div>
                  <label className="text-[10px] text-text-dim uppercase tracking-widest">Avg Latency</label>
                  <div className="text-2xl font-bold text-warning mt-2">{selectedServiceData.latency}ms</div>
                </div>
              </div>
            </div>

            {/* Dependencies */}
            <div className="bg-bg-card border border-border rounded-lg p-5">
              <h3 className="font-display text-sm font-semibold text-text-primary mb-5">Dependencies</h3>
              <div className="space-y-2">
                {services
                  .filter((s) => s.name !== selectedServiceData.name)
                  .slice(0, 5)
                  .map((dep) => (
                    <div
                      key={dep.name}
                      className={`p-2 rounded border text-[11px] cursor-pointer hover:bg-bg-hover transition-colors ${
                        dep.status === 'healthy' ? 'border-success/30 text-text-primary' : dep.status === 'warning' ? 'border-warning/30 text-text-primary' : 'border-danger/30 text-text-primary'
                      }`}
                      onClick={() => setSelectedService(dep.name)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{dep.icon}</span>
                        <span>{dep.name}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Service Comparison */}
        <div className="bg-bg-card border border-border rounded-lg p-5 mb-6">
          <div className="mb-4">
            <h3 className="font-display text-sm font-semibold text-text-primary">Service Comparison</h3>
            <p className="text-[10px] text-text-dim mt-1">All services at a glance</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" />
              <XAxis dataKey="name" stroke="#3d5470" fontSize={10} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#3d5470" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#111927', border: '1px solid #1e2d42', borderRadius: '6px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="rps" fill="#00d4ff" isAnimationActive={false} name="RPS" />
              <Bar dataKey="latency" fill="#f59e0b" isAnimationActive={false} name="Latency (ms)" />
              <Bar dataKey="instances" fill="#10b981" isAnimationActive={false} name="Instances" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Service Health Table */}
        <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-5 border-b border-border bg-bg-panel">
            <h3 className="font-display text-sm font-semibold text-text-primary">All Services Status</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-bg-panel border-b border-border">
                <tr>
                  <th className="px-5 py-3 text-left text-text-dim uppercase tracking-wider">Service</th>
                  <th className="px-5 py-3 text-left text-text-dim uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-text-dim uppercase tracking-wider">RPS</th>
                  <th className="px-5 py-3 text-left text-text-dim uppercase tracking-wider">Error Rate</th>
                  <th className="px-5 py-3 text-left text-text-dim uppercase tracking-wider">Latency</th>
                  <th className="px-5 py-3 text-left text-text-dim uppercase tracking-wider">Instances</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.name}
                    onClick={() => setSelectedService(service.name)}
                    className="border-b border-border hover:bg-bg-hover transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 font-semibold text-text-primary">{service.name}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold ${
                          service.status === 'healthy'
                            ? 'bg-success/15 text-success border border-success/30'
                            : service.status === 'warning'
                              ? 'bg-warning/15 text-warning border border-warning/30'
                              : 'bg-danger/15 text-danger border border-danger/30'
                        }`}
                      >
                        {service.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-accent">{service.rps}</td>
                    <td className="px-5 py-3 text-danger">{service.errorRate.toFixed(2)}%</td>
                    <td className="px-5 py-3 text-warning">{service.latency}ms</td>
                    <td className="px-5 py-3 text-success">{service.instances}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
