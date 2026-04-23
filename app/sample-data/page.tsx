'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { getSampleDatasets } from '@/lib/observability-data'

interface ExpandedDataset {
  [key: string]: boolean
}

export default function SampleDataPage() {
  const datasets = getSampleDatasets()
  const [expanded, setExpanded] = useState<ExpandedDataset>({})
  const [imported, setImported] = useState<string[]>([])

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleImport = (id: string) => {
    if (!imported.includes(id)) {
      setImported((prev) => [...prev, id])
    }
  }

  const handleRefresh = () => {
    console.log('Refreshing data...')
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <TopBar title="Sample Data" onTimeRangeChange={() => {}} onRefresh={handleRefresh} />

      <main className="md:ml-[220px] mt-[52px] p-4 md:p-6 pb-24 md:pb-0">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-text-primary mb-2">Import Sample Data</h1>
          <p className="text-text-secondary text-sm">Load pre-built datasets with traces, logs, and metrics to explore observability features</p>
        </div>

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {datasets.map((dataset) => (
            <div
              key={dataset.id}
              className={`bg-bg-card border-2 rounded-lg overflow-hidden transition-all ${imported.includes(dataset.id) ? 'border-success' : 'border-border hover:border-border-bright'}`}
            >
              {/* Header */}
              <div className="p-6 border-b border-border bg-bg-panel">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{dataset.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-display text-base font-semibold text-text-primary">{dataset.name}</h3>
                    <p className="text-[11px] text-text-secondary mt-1">{dataset.description}</p>
                  </div>
                  {imported.includes(dataset.id) && (
                    <div className="px-3 py-1.5 bg-success/15 text-success rounded text-[10px] font-semibold border border-success/30 flex-shrink-0">
                      ✓ Imported
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="p-6 border-b border-border">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] text-text-dim uppercase tracking-widest mb-2">Traces</div>
                    <div className="text-2xl font-bold text-accent">{dataset.traces}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-text-dim uppercase tracking-widest mb-2">Logs</div>
                    <div className="text-2xl font-bold text-accent">{dataset.logs}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-text-dim uppercase tracking-widest mb-2">Metrics</div>
                    <div className="text-2xl font-bold text-accent">{dataset.metrics}</div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expanded[dataset.id] && (
                <div className="p-6 border-b border-border bg-bg-hover/50">
                  <div className="space-y-3 text-[11px] text-text-secondary">
                    <div>
                      <div className="font-semibold text-text-primary mb-1">Data Includes:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {dataset.id === 'ecommerce' && (
                          <>
                            <li>Order creation & fulfillment traces</li>
                            <li>Payment processing spans</li>
                            <li>Inventory management logs</li>
                            <li>Customer behavior metrics</li>
                          </>
                        )}
                        {dataset.id === 'flights' && (
                          <>
                            <li>Flight booking traces</li>
                            <li>Route optimization logs</li>
                            <li>Aircraft telemetry metrics</li>
                            <li>Crew management data</li>
                          </>
                        )}
                        {dataset.id === 'observability' && (
                          <>
                            <li>Complete OpenTelemetry traces</li>
                            <li>Structured logs from multiple services</li>
                            <li>Time-series metrics (CPU, memory, RPS)</li>
                            <li>Service dependency data</li>
                          </>
                        )}
                        {dataset.id === 'weblogs' && (
                          <>
                            <li>HTTP request/response logs</li>
                            <li>User session traces</li>
                            <li>Performance metrics (Core Web Vitals)</li>
                            <li>Traffic patterns & anomalies</li>
                          </>
                        )}
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary mb-1">Time Range:</div>
                      <p>Last 24 hours with realistic distribution</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-6 flex gap-3">
                <button
                  onClick={() => toggleExpanded(dataset.id)}
                  className="flex-1 px-4 py-2.5 bg-bg-hover text-text-secondary text-[11px] font-semibold rounded hover:text-text-primary transition-colors"
                >
                  {expanded[dataset.id] ? 'Hide Details' : 'View Details'}
                </button>
                <button
                  onClick={() => handleImport(dataset.id)}
                  disabled={imported.includes(dataset.id)}
                  className={`flex-1 px-4 py-2.5 text-[11px] font-semibold rounded transition-all ${
                    imported.includes(dataset.id)
                      ? 'bg-success/15 text-success border border-success/30 cursor-default'
                      : 'bg-accent-dim text-accent border border-accent hover:bg-opacity-20'
                  }`}
                >
                  {imported.includes(dataset.id) ? 'Imported' : 'Import Dataset'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-bg-card border border-border rounded-lg p-6">
          <h2 className="font-display text-base font-semibold text-text-primary mb-4">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] text-text-secondary">
            <div>
              <div className="font-semibold text-text-primary mb-2">1. Import a Dataset</div>
              <p>Click "Import Dataset" on any sample data card to load the data into WatchTower. All traces, logs, and metrics will be immediately available.</p>
            </div>
            <div>
              <div className="font-semibold text-text-primary mb-2">2. Explore Traces</div>
              <p>Visit the Traces page to see distributed traces, waterfall diagrams, and span analysis. Click on individual traces for detailed inspection.</p>
            </div>
            <div>
              <div className="font-semibold text-text-primary mb-2">3. Analyze Logs</div>
              <p>The Logs page provides full-text search, filtering by level/service, and correlation with traces. Identify issues across your system.</p>
            </div>
            <div>
              <div className="font-semibold text-text-primary mb-2">4. Monitor Metrics</div>
              <p>Time-series visualizations show CPU, memory, latency, error rates, and more. Filter by service to drill down into specific components.</p>
            </div>
            <div>
              <div className="font-semibold text-text-primary mb-2">5. View Services</div>
              <p>See all services in your architecture, their health status, performance metrics, and dependencies at a glance.</p>
            </div>
            <div>
              <div className="font-semibold text-text-primary mb-2">6. Set Up Alerts</div>
              <p>The Alerts page shows active issues and resolved incidents. Create rules for error rates, latency thresholds, and custom anomalies.</p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 bg-bg-card border border-border rounded-lg p-6">
          <h2 className="font-display text-base font-semibold text-text-primary mb-4">WatchTower Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px]">
            <div>
              <div className="font-semibold text-accent mb-2">📍 Distributed Tracing</div>
              <p className="text-text-secondary">Track requests across microservices with waterfall visualization, span analysis, and error correlation.</p>
            </div>
            <div>
              <div className="font-semibold text-accent mb-2">📝 Log Management</div>
              <p className="text-text-secondary">Search, filter, and analyze logs in real-time. Correlate logs with traces for complete debugging context.</p>
            </div>
            <div>
              <div className="font-semibold text-accent mb-2">📈 Metrics Dashboard</div>
              <p className="text-text-secondary">Monitor performance metrics (CPU, memory, latency, RPS) with time-series graphs and service filtering.</p>
            </div>
            <div>
              <div className="font-semibold text-success mb-2">🔗 Service Topology</div>
              <p className="text-text-secondary">Visualize service dependencies and communication patterns. See health status and performance metrics at a glance.</p>
            </div>
            <div>
              <div className="font-semibold text-warning mb-2">⚠️ Alerts & Anomalies</div>
              <p className="text-text-secondary">Proactive alerting for error rates, latency spikes, and unusual patterns. Track alert history and resolution times.</p>
            </div>
            <div>
              <div className="font-semibold text-text-primary mb-2">🎯 Multi-Tenant Support</div>
              <p className="text-text-secondary">Full control over data access, query performance, and custom integrations for your observability stack.</p>
            </div>
          </div>
        </div>

        {/* Imported Datasets */}
        {imported.length > 0 && (
          <div className="mt-8 bg-success/10 border border-success/30 rounded-lg p-6">
            <h3 className="font-display text-base font-semibold text-success mb-4">Imported Datasets ({imported.length})</h3>
            <p className="text-[11px] text-success/80 mb-4">Data is ready to explore! Navigate to different sections to view traces, logs, metrics, and services.</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/" className="px-4 py-2 bg-success/20 text-success rounded text-[11px] font-semibold hover:bg-success/30 transition-colors">
                View Overview
              </Link>
              <Link href="/traces" className="px-4 py-2 bg-success/20 text-success rounded text-[11px] font-semibold hover:bg-success/30 transition-colors">
                Explore Traces
              </Link>
              <Link href="/logs" className="px-4 py-2 bg-success/20 text-success rounded text-[11px] font-semibold hover:bg-success/30 transition-colors">
                View Logs
              </Link>
              <Link href="/services" className="px-4 py-2 bg-success/20 text-success rounded text-[11px] font-semibold hover:bg-success/30 transition-colors">
                See Services
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
