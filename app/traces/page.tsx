'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { getTraces, searchTraces } from '@/lib/observability-data'
import type { Trace } from '@/lib/observability-data'

export default function TracesPage() {
  const [timeRange, setTimeRange] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [traces, setTraces] = useState<Trace[]>([])
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null)

  useEffect(() => {
    if (searchQuery.trim()) {
      setTraces(searchTraces(searchQuery, timeRange))
    } else {
      setTraces(getTraces(timeRange).slice(0, 100))
    }
  }, [timeRange, searchQuery])

  const handleRefresh = () => {
    // In a real app, this would fetch new data
    console.log('Refreshing traces...')
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <TopBar title="Traces" onTimeRangeChange={setTimeRange} onRefresh={handleRefresh} />

      <main className="md:ml-[220px] mt-[52px] p-4 md:p-6 pb-24 md:pb-0">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search traces by operation, service, or trace ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-text-primary placeholder-text-dim focus:outline-none focus:border-accent transition-colors text-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim text-lg">🔍</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Traces List */}
          <div className="lg:col-span-2 bg-bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-5 border-b border-border bg-bg-panel sticky top-0 z-10">
              <h3 className="font-display text-sm font-semibold text-text-primary">Distributed Traces ({traces.length})</h3>
            </div>

            {traces.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-text-dim text-sm">No traces found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {traces.map((trace) => (
                  <button
                    key={trace.id}
                    onClick={() => setSelectedTrace(trace)}
                    className={`w-full text-left p-5 hover:bg-bg-hover transition-colors ${selectedTrace?.id === trace.id ? 'bg-bg-hover border-l-2 border-l-accent' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-text-primary text-sm">{trace.operationName}</div>
                        <div className="text-[10px] text-text-dim mt-1 font-mono">{trace.traceId}</div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-semibold ml-2 flex-shrink-0 ${
                          trace.status === 'success' ? 'bg-success/15 text-success border border-success/30' : trace.status === 'error' ? 'bg-danger/15 text-danger border border-danger/30' : 'bg-warning/15 text-warning border border-warning/30'
                        }`}
                      >
                        {trace.status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-[11px] text-text-secondary mt-2">
                      <span>Service: {trace.serviceName}</span>
                      <span>Duration: {Math.round(trace.duration)}ms</span>
                      <span>Spans: {trace.spans.length}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trace Details */}
          <div className="bg-bg-card border border-border rounded-lg overflow-hidden flex flex-col h-fit sticky top-[52px]">
            {selectedTrace ? (
              <>
                <div className="p-5 border-b border-border bg-bg-panel">
                  <h3 className="font-display text-sm font-semibold text-text-primary">Trace Details</h3>
                </div>
                <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {/* Trace Info */}
                  <div>
                    <label className="text-[10px] text-text-dim uppercase tracking-widest">Trace ID</label>
                    <div className="text-[11px] text-text-secondary font-mono mt-1 break-all">{selectedTrace.traceId}</div>
                  </div>

                  <div>
                    <label className="text-[10px] text-text-dim uppercase tracking-widest">Operation</label>
                    <div className="text-[11px] text-text-primary mt-1">{selectedTrace.operationName}</div>
                  </div>

                  <div>
                    <label className="text-[10px] text-text-dim uppercase tracking-widest">Service</label>
                    <div className="text-[11px] text-text-primary mt-1">{selectedTrace.serviceName}</div>
                  </div>

                  <div>
                    <label className="text-[10px] text-text-dim uppercase tracking-widest">Duration</label>
                    <div className="text-[11px] text-text-primary mt-1">{Math.round(selectedTrace.duration)}ms</div>
                  </div>

                  <div>
                    <label className="text-[10px] text-text-dim uppercase tracking-widest">Status</label>
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold mt-1 ${
                        selectedTrace.status === 'success' ? 'bg-success/15 text-success border border-success/30' : selectedTrace.status === 'error' ? 'bg-danger/15 text-danger border border-danger/30' : 'bg-warning/15 text-warning border border-warning/30'
                      }`}
                    >
                      {selectedTrace.status}
                    </span>
                  </div>

                  {/* Spans Waterfall */}
                  <div className="pt-4 border-t border-border">
                    <label className="text-[10px] text-text-dim uppercase tracking-widest mb-3 block">Spans Waterfall</label>
                    <div className="space-y-2">
                      {selectedTrace.spans.map((span) => {
                        const startOffset = ((span.startTime - selectedTrace.startTime) / selectedTrace.duration) * 100
                        const width = (span.duration / selectedTrace.duration) * 100
                        return (
                          <div key={span.spanId} className="relative">
                            <div className="text-[10px] text-text-secondary mb-1 truncate">{span.operationName}</div>
                            <div className="w-full h-6 bg-bg-panel rounded relative overflow-hidden">
                              <div
                                className={`h-full rounded transition-all ${
                                  span.status === 'success' ? 'bg-success/30' : span.status === 'error' ? 'bg-danger/30' : 'bg-warning/30'
                                }`}
                                style={{
                                  marginLeft: `${startOffset}%`,
                                  width: `${Math.max(width, 2)}%`,
                                }}
                              >
                                <div className="px-2 py-1 text-[9px] text-text-primary font-semibold line-clamp-1">{Math.round(span.duration)}ms</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Errors */}
                  {selectedTrace.errors && selectedTrace.errors.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <label className="text-[10px] text-text-dim uppercase tracking-widest mb-2 block">Errors</label>
                      <div className="space-y-2">
                        {selectedTrace.errors.map((error, idx) => (
                          <div key={idx} className="bg-danger/10 border border-danger/30 rounded p-2">
                            <div className="text-[10px] text-danger">{error}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-5 text-center text-text-dim text-sm">
                <p>Select a trace to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
