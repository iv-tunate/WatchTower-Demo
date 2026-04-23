'use client'

import { useState, useMemo, useEffect } from 'react'
import { SERVICES, generateTraces, generateLogs, generateMetrics, filterByTimeRange, ALERT_RULES, DASHBOARDS, generateSynthetics } from '@/lib/observability'

const InfoTooltip = ({ text }: { text: string }) => (
  <span className="info-tooltip-container">
    ⓘ
    <span className="info-tooltip-text">{text}</span>
  </span>
)

export default function Page() {
  const [currentTab, setCurrentTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('7d')
  const [searchQuery, setSearchQuery] = useState('')
  const [logLevelFilter, setLogLevelFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('')
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [importingDataset, setImportingDataset] = useState<string | null>(null)
  const [importedDataset, setImportedDataset] = useState<string | null>(null)

  // Generate data once
  const [mounted, setMounted] = useState(false)
  const [allTraces, setAllTraces] = useState<any[]>([])
  const [allLogs, setAllLogs] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>({ cpu: [], memory: [], latencyP50: [], latencyP99: [], errorRate: [], rps: [] })
  const [synthetics, setSynthetics] = useState<any[]>([])
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null)
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null)

  useEffect(() => {
    setAllTraces(generateTraces(24, 750))
    setAllLogs(generateLogs(24, 1500))
    setMetrics(generateMetrics(24))
    setSynthetics(generateSynthetics())
    setMounted(true)
  }, [])

  // Filter data
  const traces = useMemo(() => {
    let filtered = filterByTimeRange(allTraces, timeRange)
    if (searchQuery) filtered = filtered.filter(t => t.traceId.includes(searchQuery) || t.operationName.includes(searchQuery))
    if (serviceFilter) filtered = filtered.filter(t => t.serviceName === serviceFilter)
    return filtered
  }, [allTraces, timeRange, searchQuery, serviceFilter])

  const logs = useMemo(() => {
    let filtered = filterByTimeRange(allLogs, timeRange)
    if (logLevelFilter !== 'all') filtered = filtered.filter(l => l.level === logLevelFilter)
    if (searchQuery) filtered = filtered.filter(l => l.message.toLowerCase().includes(searchQuery.toLowerCase()))
    return filtered
  }, [allLogs, timeRange, logLevelFilter, searchQuery])

  const selectedTrace = useMemo(() => allTraces.find(t => t.traceId === selectedTraceId), [selectedTraceId, allTraces])
  const selectedService = useMemo(() => SERVICES.find(s => s.id === selectedServiceId), [selectedServiceId])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-mode')
    } else {
      document.documentElement.classList.remove('light-mode')
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  if (!mounted) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '1px' }}>Initializing Observability Engine...</div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
      </div>
    )
  }

  // Calculate stats
  const errorTraces = traces.filter(t => t.status === 'error').length
  const slowTraces = traces.filter(t => t.status === 'slow').length
  const avgDuration = traces.length > 0 ? Math.round(traces.reduce((sum, t) => sum + t.duration, 0) / traces.length) : 0

  const stats = [
    { label: 'Total Requests', value: traces.length.toLocaleString(), delta: `↑ 12% vs 7d`, class: 'blue' },
    { label: 'Avg Latency', value: `${avgDuration}ms`, delta: errorTraces > 0 ? `↑ ${errorTraces} errors` : '↓ 8ms improvement', class: errorTraces > 0 ? 'red' : 'green' },
    { label: 'Success Rate', value: `${(((traces.length - errorTraces) / (traces.length || 1)) * 100).toFixed(1)}%`, delta: `${slowTraces} slow traces`, class: errorTraces > 0 ? 'yellow' : 'green' },
    { label: 'Error Rate', value: `${((errorTraces / (traces.length || 1)) * 100).toFixed(2)}%`, delta: errorTraces > 0 ? `↑ Active errors` : '✓ Healthy', class: errorTraces > 0 ? 'red' : 'green' }
  ]

  // Render trace detail view
  if (selectedTrace && currentTab === 'trace-detail') {
    return (
      <>
        <div className="sidebar">
          <div className="logo" style={{ paddingBottom: '12px' }}>
            <div className="logo-text">
              <div className="logo-icon">⟨/⟩</div>
              WatchTower
            </div>
            <div className="logo-sub">Trace Details</div>
          </div>
          <nav className="nav">
            <div className="nav-section">Navigation</div>
            <div className="nav-item active" onClick={() => { setSelectedTraceId(null); setCurrentTab('overview'); }} style={{ cursor: 'pointer' }}>
              <span className="icon">←</span> Back to Overview
            </div>
            <div className="nav-section">Trace Info</div>
            <div style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <div><strong>ID:</strong> {selectedTrace.traceId}</div>
              <div style={{ marginTop: '6px' }}><strong>Operation:</strong> {selectedTrace.operationName}</div>
              <div style={{ marginTop: '6px' }}><strong>Service:</strong> {selectedTrace.serviceName}</div>
              <div style={{ marginTop: '6px' }}><strong>Duration:</strong> {Math.round(selectedTrace.duration)}ms</div>
              <div style={{ marginTop: '6px' }}><strong>Spans:</strong> {selectedTrace.spanCount}</div>
            </div>
          </nav>
          <div className="sidebar-bottom">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '20px', cursor: 'pointer' }}>☰</button>
              <div className="topbar-title">Trace: {selectedTrace.traceId}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="refresh-btn" onClick={handleRefresh}>↻ Refresh</button>
            </div>
          </div>

          <div className="content">
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
              <div className="stat-card blue">
                <div className="stat-label">Total Duration</div>
                <div className="stat-value">{Math.round(selectedTrace.duration)}ms</div>
                <div className="stat-delta">{selectedTrace.spanCount} spans</div>
              </div>
              <div className="stat-card green">
                <div className="stat-label">Successful Spans</div>
                <div className="stat-value">{selectedTrace.spanCount - selectedTrace.errorCount}</div>
                <div className="stat-delta">{Math.round(((selectedTrace.spanCount - selectedTrace.errorCount) / (selectedTrace.spanCount || 1)) * 100)}% success</div>
              </div>
              <div className="stat-card red">
                <div className="stat-label">Failed Spans</div>
                <div className="stat-value">{selectedTrace.errorCount}</div>
                <div className="stat-delta">{Math.round((selectedTrace.errorCount / (selectedTrace.spanCount || 1)) * 100)}% errors</div>
              </div>
              <div className="stat-card yellow">
                <div className="stat-label">Critical Path</div>
                <div className="stat-value">{Math.round(selectedTrace.duration * 0.7)}ms</div>
                <div className="stat-delta">Slowest path in trace</div>
              </div>
            </div>

            {/* Trace Charts Row */}
            <div className="charts-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
              <div className="chart-card">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Span Status</div>
                    <div className="chart-subtitle">Success vs Error distribution</div>
                  </div>
                </div>
                <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                    {(() => {
                      const total = selectedTrace.spanCount || 1;
                      const errs = selectedTrace.errorCount;
                      const pSuccess = ((total - errs) / total) * 100;
                      return (
                        <>
                          <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: `conic-gradient(var(--success) 0% ${pSuccess}%, var(--danger) ${pSuccess}% 100%)` }}></div>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 'bold', background: 'var(--bg-card)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {Math.round(pSuccess)}%
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Service Distribution</div>
                    <div className="chart-subtitle">Spans per microservice</div>
                  </div>
                </div>
                <div style={{ height: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px', padding: '0 12px' }}>
                  {(() => {
                    const svcCounts: Record<string, number> = {};
                    selectedTrace.spans.forEach(s => svcCounts[s.serviceName] = (svcCounts[s.serviceName] || 0) + 1);
                    const sorted = Object.entries(svcCounts).sort((a,b) => b[1] - a[1]).slice(0, 4);
                    const colors = ['var(--accent)', 'var(--accent2)', 'var(--accent3)', 'var(--warning)'];
                    return sorted.map(([svc, count], idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{svc}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{count} spans</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--bg-panel)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(count / selectedTrace.spanCount) * 100}%`, background: colors[idx % colors.length] }}></div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="chart-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="chart-header" style={{ marginBottom: '8px' }}>
                  <div>
                    <div className="chart-title">Top Operations</div>
                    <div className="chart-subtitle">By duration</div>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                  {(() => {
                    const sorted = [...selectedTrace.spans].sort((a, b) => b.duration - a.duration).slice(0, 4);
                    return sorted.map((span, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(30,45,66,0.5)', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px' }}>{span.operationName}</span>
                        <span className="badge badge-blue" style={{ flexShrink: 0 }}>{Math.round(span.duration)}ms</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div className="section-divider">
              <div className="section-divider-title">Waterfall Visualization</div>
              <div className="section-divider-line"></div>
              <span className={`badge ${selectedTrace.status === 'success' ? 'badge-green' : selectedTrace.status === 'error' ? 'badge-red' : 'badge-yellow'}`}>
                {selectedTrace.status.toUpperCase()}
              </span>
            </div>

            <div className="table-card">
              <table style={{ fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th>Span ID</th>
                    <th>Operation</th>
                    <th>Service</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTrace.spans.map((span, idx) => (
                    <tr key={span.spanId}>
                      <td><span className="trace-id">{span.spanId.slice(0, 20)}...</span></td>
                      <td>{span.operationName}</td>
                      <td>{span.serviceName}</td>
                      <td>
                        <div className="latency-bar">
                          <div className="latency-fill" style={{ width: Math.min(span.duration / 50, 100) + '%' }}></div>
                          <span>{Math.round(span.duration)}ms</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${span.status === 'success' ? 'badge-green' : 'badge-red'}`}>
                          {span.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="section-divider">
              <div className="section-divider-title">Correlated Logs</div>
              <div className="section-divider-line"></div>
            </div>

            <div className="log-stream">
              <div className="log-entries">
                {logs.filter(l => l.traceId === selectedTrace.traceId).length > 0 ? (
                  logs.filter(l => l.traceId === selectedTrace.traceId).slice(0, 10).map((log, idx) => (
                    <div key={idx} className={`log-entry ${log.level.toLowerCase()}`}>
                      <div className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      <div className={`log-level ${log.level.toLowerCase()}`}>{log.level}</div>
                      <div className="log-service">{log.service}</div>
                      <div className="log-msg">{log.message}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '16px', color: 'var(--text-dim)', textAlign: 'center' }}>No logs correlated with this trace</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Main view

  return (
    <>
      {/* MOBILE SIDEBAR BACKDROP */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <div className="logo-text">
            <div className="logo-icon">⟨/⟩</div>
            WatchTower
          </div>
          <div className="logo-sub">Observability Platform</div>
        </div>

        <nav className="nav">
          <div className="nav-section">Observe</div>
          <div className={`nav-item ${currentTab === 'overview' ? 'active' : ''}`} onClick={() => { setCurrentTab('overview'); setSelectedMetricId(null); setSelectedAlertId(null); setSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
            <span className="icon">◈</span> Overview
            <span className="nav-tip"><div className="nav-tip-title">Overview</div>Your command centre — request volumes, error rates, latency, and a live map of all services at a glance.</span>
          </div>
          <div className={`nav-item ${currentTab === 'traces' ? 'active' : ''}`} onClick={() => { setCurrentTab('traces'); setSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
            <span className="icon">⇢</span> Traces
            <span className="nav-tip"><div className="nav-tip-title">Distributed Traces</div>Follow any request end-to-end across every service it touched. Pinpoint exactly where slowdowns and errors occur.</span>
          </div>
          <div className={`nav-item ${currentTab === 'logs' ? 'active' : ''}`} onClick={() => { setCurrentTab('logs'); setSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
            <span className="icon">≡</span> Logs
            <span className="nav-tip"><div className="nav-tip-title">Logs & Events</div>A live stream of structured log events from all services. Filter by severity, search by keyword, and jump to related traces.</span>
          </div>
          <div className={`nav-item ${currentTab === 'metrics' ? 'active' : ''}`} onClick={() => { setCurrentTab('metrics'); setSelectedMetricId(null); setSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
            <span className="icon">▲</span> Metrics
            <span className="nav-tip"><div className="nav-tip-title">System Metrics</div>Time-series charts for CPU, memory, latency percentiles, and throughput. Spot performance trends before they become incidents.</span>
          </div>
          {/* SYNTHETICS NAV — commented out for now
          <div className={`nav-item ${currentTab === 'synthetics' ? 'active' : ''}`} onClick={() => { setCurrentTab('synthetics'); setSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
            <span className="icon">🌐</span> Synthetics
          </div>
          */}
          <div className={`nav-item ${currentTab === 'alerts' ? 'active' : ''}`} onClick={() => { setCurrentTab('alerts'); setSelectedAlertId(null); setSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
            <span className="icon">⚠</span> Alerts
            <span className="nav-tip"><div className="nav-tip-title">Alerts</div>Automated threshold rules that fire when something needs attention. Click any alert to see the exact moment it breached.</span>
          </div>
          <div className={`nav-item ${currentTab === 'dashboards' ? 'active' : ''}`} onClick={() => { setCurrentTab('dashboards'); setSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
            <span className="icon">⊞</span> Dashboards
            <span className="nav-tip"><div className="nav-tip-title">Dashboards</div>Pre-built operational views for common monitoring scenarios. One click to load a focused layout for your team.</span>
          </div>

          <div className="nav-section">Services</div>
          <div className={`nav-item ${currentTab === 'services' ? 'active' : ''}`} onClick={() => { setCurrentTab('services'); setSelectedServiceId(null); setSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
            <span className="icon">⊞</span> Topology
            <span className="nav-tip"><div className="nav-tip-title">Service Topology</div>A live map of every service — health status, error rate, latency, and throughput at a glance. Click any service to drill in.</span>
          </div>
          {SERVICES.map(service => (
            <div key={service.id} className={`nav-item ${currentTab === `service-detail` && selectedServiceId === service.id ? 'active' : ''}`} onClick={() => { setSelectedServiceId(service.id); setCurrentTab('service-detail'); setSidebarOpen(false); }} style={{ cursor: 'pointer', fontSize: '11px', paddingTop: '6px', paddingBottom: '6px' }}>
              <span className="icon">{service.icon}</span> <span title={service.name}>{service.name.length > 16 ? service.name.slice(0, 14) + '...' : service.name}</span>
            </div>
          ))}

          {/* DATA MANAGEMENT — commented out for now
          <div className="nav-section">Data Management</div>
          <div className={`nav-item ${currentTab === 'sample-data' ? 'active' : ''}`} onClick={() => { setCurrentTab('sample-data'); setSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
            <span className="icon">⬇</span> Sample Data
            <span className="nav-tip"><div className="nav-tip-title">Sample Data</div>Load a realistic demo dataset instantly — no live system needed. Four themed datasets covering eCommerce, SaaS, Fintech, and IoT.</span>
          </div>
          */}
          <div className="nav-section">Configure</div>
          <div className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`} onClick={() => { setCurrentTab('settings'); setSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
            <span className="icon">⚙</span> Settings
            <span className="nav-tip"><div className="nav-tip-title">Settings</div>Configure your environment name, data retention period, and integrations — Slack for notifications, PagerDuty for on-call escalation.</span>
          </div>
        </nav>


        <div className="sidebar-bottom">
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span className="status-dot"></span>All systems nominal
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>v2.4.1 · env: prod-us-east</div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '20px', cursor: 'pointer', display: 'none' }}>☰</button>
            <div className="topbar-title">
              {currentTab === 'overview' && 'Overview'}
              {currentTab === 'traces' && 'Distributed Traces'}
              {currentTab === 'logs' && 'Logs & Events'}
              {currentTab === 'metrics' && 'System Metrics'}
              {currentTab === 'services' && 'Service Topology'}
              {currentTab === 'alerts' && 'Active Alerts'}
              {currentTab === 'synthetics' && 'Synthetics & Uptime'}
              {currentTab === 'dashboards' && 'Custom Dashboards'}
              {currentTab === 'sample-data' && 'Import Sample Data'}
              {currentTab === 'settings' && 'Platform Settings'}
              {currentTab === 'service-detail' && selectedService && `Service: ${selectedService.name}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="time-range">
              <button className={`time-btn ${timeRange === '1h' ? 'active' : ''}`} onClick={() => setTimeRange('1h')}>1h</button>
              <button className={`time-btn ${timeRange === '7d' ? 'active' : ''}`} onClick={() => setTimeRange('7d')}>7d</button>
              <button className={`time-btn ${timeRange === '30d' ? 'active' : ''}`} onClick={() => setTimeRange('30d')}>30d</button>
            </div>
            <button className="refresh-btn" onClick={handleRefresh}>↻ Refresh</button>
          </div>
        </div>

        <div className="content">
          {/* OVERVIEW TAB */}
          {currentTab === 'overview' && (
            <>
              <div className="page-intro">
                <div className="page-intro-icon">◈</div>
                <div className="page-intro-text">
                  <h2>Overview</h2>
                  <p>Your command centre. See total requests, error rates, and service health — all in one place. Use the time range buttons to zoom in or out.</p>
                </div>
              </div>
              <div className="alert-strip">
                <span className="alert-icon">⚠</span>
                <strong style={{ color: 'var(--warning)' }}>Active Alerts:</strong>&nbsp;
                {ALERT_RULES.filter(a => a.triggered).length} alert(s) require attention
              </div>

              <div className="stats-grid">
                {stats.map((stat, idx) => (
                  <div key={idx} className={`stat-card ${stat.class}`}>
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-delta">{stat.delta}</div>
                  </div>
                ))}
              </div>

              <div className="charts-row">
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Request Volume Trend</div>
                      <div className="chart-subtitle">Last {timeRange}</div>
                    </div>
                    <span className="badge badge-blue">Live</span>
                  </div>
                  <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '12px', gap: '2px' }}>
                    {Array.from({ length: 24 }, (_, i) => Math.floor(traces.length / 24 * (Math.sin(i / 5) + 1.5))).map((h, i) => (
                      <div key={i} style={{ height: `${Math.max(5, (h / Math.max(...Array.from({ length: 24 }, (_, i) => Math.floor(traces.length / 24 * (Math.sin(i / 5) + 1.5))))) * 100)}%`, width: '10px', background: 'var(--accent)', borderRadius: '2px', opacity: 0.85 }}></div>
                    ))}
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Error Distribution</div>
                      <div className="chart-subtitle">By severity</div>
                    </div>
                  </div>
                  <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                      <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: `conic-gradient(var(--accent) 0% ${traces.length > 0 ? (traces.length - errorTraces) / traces.length * 100 : 100}%, var(--danger) ${traces.length > 0 ? (traces.length - errorTraces) / traces.length * 100 : 100}% 100%)` }}></div>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                        {traces.length > 0 ? (((traces.length - errorTraces) / traces.length) * 100).toFixed(0) : 100}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Replica Features: Extra Charts row */}
              <div className="charts-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Status Code Distribution</div>
                      <div className="chart-subtitle">HTTP response codes</div>
                    </div>
                  </div>
                  <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                      {(() => {
                        let total = 0, p2xx = 0, p4xx = 0, p5xx = 0;
                        traces.forEach(t => t.spans.forEach(s => {
                          const code = s.tags?.['http.status_code'];
                          if (code) {
                            total++;
                            if (code.startsWith('2')) p2xx++;
                            else if (code.startsWith('4')) p4xx++;
                            else if (code.startsWith('5')) p5xx++;
                          }
                        }));
                        const c2xx = total > 0 ? p2xx / total * 100 : 100;
                        const c4xx = total > 0 ? p4xx / total * 100 : 0;
                        return (
                          <>
                            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: `conic-gradient(var(--success) 0% ${c2xx}%, var(--warning) ${c2xx}% ${c2xx+c4xx}%, var(--danger) ${c2xx+c4xx}% 100%)` }}></div>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 'bold', background: 'var(--bg-card)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {total}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">HTTP Methods Breakdown</div>
                      <div className="chart-subtitle">By request method</div>
                    </div>
                  </div>
                  <div style={{ height: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px', padding: '0 12px' }}>
                    {(() => {
                      let methods = { GET: 0, POST: 0, PUT: 0, DELETE: 0 };
                      let total = 0;
                      traces.forEach(t => t.spans.forEach(s => {
                        const method = s.tags?.['http.method'] as keyof typeof methods;
                        if (method && methods[method] !== undefined) {
                          methods[method]++;
                          total++;
                        }
                      }));
                      return Object.entries(methods).map(([method, count], idx) => {
                        const pct = total > 0 ? (count / total) * 100 : 0;
                        const color = method === 'GET' ? 'var(--accent)' : method === 'POST' ? 'var(--success)' : method === 'PUT' ? 'var(--warning)' : 'var(--danger)';
                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                              <span>{method}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>{count} ({pct.toFixed(1)}%)</span>
                            </div>
                            <div style={{ height: '4px', background: 'var(--bg-panel)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: color }}></div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="chart-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div className="chart-header" style={{ marginBottom: '8px' }}>
                    <div>
                      <div className="chart-title">Top Operations</div>
                      <div className="chart-subtitle">Most frequent endpoints</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {(() => {
                      const counts: Record<string, number> = {};
                      traces.forEach(t => {
                        counts[t.operationName] = (counts[t.operationName] || 0) + 1;
                      });
                      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
                      return sorted.map(([op, count], idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(30,45,66,0.5)', fontSize: '11px' }}>
                          <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px' }}>{op}</span>
                          <span className="badge badge-blue" style={{ flexShrink: 0 }}>{count}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              <div className="section-divider">
                <div className="section-divider-title">Service Health Map</div>
                <div className="section-divider-line"></div>
                <span className="badge badge-green">{SERVICES.filter(s => s.uptime > 99.9).length} healthy</span>
              </div>

              <div className="service-map">
                <div className="services-grid">
                  {SERVICES.slice(0, 8).map((service) => (
                    <div key={service.id} className="service-node" onClick={() => { setSelectedServiceId(service.id); setCurrentTab('service-detail'); }} style={{ cursor: 'pointer' }}>
                      <div className={`node-circle ${service.uptime > 99.9 ? 'healthy' : service.uptime > 99.5 ? 'warning' : 'error'}`}>
                        {service.icon}
                        <div className={`node-status ${service.uptime > 99.9 ? 'healthy' : service.uptime > 99.5 ? 'warning' : 'error'}`}></div>
                      </div>
                      <div className="node-name">{service.name}</div>
                      <div className="node-rps">{(service.rps / 1000).toFixed(1)}k RPS</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section-divider">
                <div className="section-divider-title">Recent Traces</div>
                <div className="section-divider-line"></div>
                <span className="badge badge-blue">{traces.length} total</span>
              </div>

              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Trace ID</th>
                      <th>Operation</th>
                      <th>Service</th>
                      <th>Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traces.slice(0, 10).map((trace, idx) => (
                      <tr key={idx} onClick={() => { setSelectedTraceId(trace.traceId); setCurrentTab('trace-detail'); }} style={{ cursor: 'pointer' }}>
                        <td><span className="trace-id">{trace.traceId}</span></td>
                        <td>{trace.operationName}</td>
                        <td>{trace.serviceName}</td>
                        <td>
                          <div className="latency-bar">
                            <div className="latency-fill" style={{ width: Math.min(trace.duration / 50, 100) + '%' }}></div>
                            <span>{Math.round(trace.duration)}ms</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${trace.status === 'success' ? 'badge-green' : trace.status === 'error' ? 'badge-red' : 'badge-yellow'}`}>
                            {trace.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TRACES TAB */}
          {currentTab === 'traces' && (
            <>
              <div className="page-intro">
                <div className="page-intro-icon">⇢</div>
                <div className="page-intro-text">
                  <h2>Distributed Traces</h2>
                  <p>See the full journey of any request — which services handled it, how long each step took, and where things went wrong. Click any row to open the full breakdown.</p>
                </div>
              </div>
              <div className="table-card">
                <div className="table-header">
                  <input type="text" className="search-input" placeholder="Search traces by ID or operation..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <div className="log-filter">
                    <button className={`log-filter-btn ${serviceFilter === '' ? 'active' : ''}`} onClick={() => setServiceFilter('')}>All Services</button>
                    {SERVICES.slice(0, 5).map(s => (
                      <button key={s.id} className={`log-filter-btn ${serviceFilter === s.name ? 'active' : ''}`} onClick={() => setServiceFilter(s.name)}>{s.name}</button>
                    ))}
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Trace ID</th>
                      <th>Operation</th>
                      <th>Service</th>
                      <th>Duration</th>
                      <th>Spans</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traces.slice(0, 50).map((trace, idx) => (
                      <tr key={idx} onClick={() => { setSelectedTraceId(trace.traceId); setCurrentTab('trace-detail'); }} style={{ cursor: 'pointer' }}>
                        <td><span className="trace-id">{trace.traceId}</span></td>
                        <td>{trace.operationName}</td>
                        <td>{trace.serviceName}</td>
                        <td>
                          <div className="latency-bar">
                            <div className="latency-fill" style={{ width: Math.min(trace.duration / 50, 100) + '%' }}></div>
                            <span>{Math.round(trace.duration)}ms</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{trace.spanCount}</td>
                        <td>
                          <span className={`badge ${trace.status === 'success' ? 'badge-green' : trace.status === 'error' ? 'badge-red' : 'badge-yellow'}`}>
                            {trace.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* LOGS TAB */}
          {currentTab === 'logs' && (
            <>
              <div className="page-intro">
                <div className="page-intro-icon">≡</div>
                <div className="page-intro-text">
                  <h2>Logs &amp; Events</h2>
                  <p>A live feed of messages from every service. Filter by level — INFO, WARN, ERROR — or search by keyword. Click any log line to see the full details and jump to its trace.</p>
                </div>
              </div>
              <div className="log-stream">
                <div className="log-toolbar">
                  <input type="text" className="search-input" placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <div className="log-filter">
                    <button className={`log-filter-btn ${logLevelFilter === 'all' ? 'active' : ''}`} onClick={() => setLogLevelFilter('all')}>All</button>
                    <button className={`log-filter-btn info ${logLevelFilter === 'DEBUG' ? 'active' : ''}`} onClick={() => setLogLevelFilter('DEBUG')}>DEBUG</button>
                    <button className={`log-filter-btn info ${logLevelFilter === 'INFO' ? 'active' : ''}`} onClick={() => setLogLevelFilter('INFO')}>INFO</button>
                    <button className={`log-filter-btn warn ${logLevelFilter === 'WARN' ? 'active' : ''}`} onClick={() => setLogLevelFilter('WARN')}>WARN</button>
                    <button className={`log-filter-btn error ${logLevelFilter === 'ERROR' ? 'active' : ''}`} onClick={() => setLogLevelFilter('ERROR')}>ERROR</button>
                  </div>
                </div>
                <div className="log-entries">
                  {logs.slice(0, 100).map((log, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div className={`log-entry ${log.level.toLowerCase()}`} onClick={() => setExpandedLogId(expandedLogId === idx ? null : idx)} style={{ cursor: 'pointer', borderBottom: expandedLogId === idx ? 'none' : undefined }}>
                        <div className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</div>
                        <div className={`log-level ${log.level.toLowerCase()}`}>{log.level}</div>
                        <div className="log-service">{log.service}</div>
                        <div className="log-msg">{log.message}{log.traceId && ` [${log.traceId}]`}</div>
                      </div>
                      {expandedLogId === idx && (
                        <div style={{ background: '#0d131f', padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '11px', fontFamily: 'var(--font-mono)', overflowX: 'auto' }}>
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            {log.traceId && <button onClick={() => { setSelectedTraceId(log.traceId!); setCurrentTab('trace-detail'); }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>View Trace in Waterfall</button>}
                            <span style={{ color: 'var(--text-secondary)', alignSelf: 'center' }}>Click log row to close</span>
                          </div>
                          <pre style={{ margin: 0, color: 'var(--text-primary)' }}>
{JSON.stringify({
  timestamp: new Date(log.timestamp).toISOString(),
  level: log.level,
  service: log.service,
  message: log.message,
  trace_id: log.traceId || null,
  attributes: log.attributes,
  host: `worker-node-${Math.floor(Math.random() * 10)}`,
  container_id: Math.random().toString(36).substring(2, 12)
}, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* METRICS TAB */}
          {currentTab === 'metrics' && (
            <>
              <div className="page-intro">
                <div className="page-intro-icon">▲</div>
                <div className="page-intro-text">
                  <h2>System Metrics</h2>
                  <p>Charts showing how the system is performing over time — CPU, memory, response times, and request volume. Bars turn amber or red when a value is approaching its limit.</p>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-card blue">
                  <div className="stat-label">CPU Usage</div>
                  <div className="stat-value">{Math.round(metrics.cpu[metrics.cpu.length - 1]?.value || 45)}%</div>
                  <div className="stat-delta">↑ 5% from baseline</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-label">Memory</div>
                  <div className="stat-value">{Math.round(metrics.memory[metrics.memory.length - 1]?.value || 62)}%</div>
                  <div className="stat-delta">Stable usage</div>
                </div>
                <div className="stat-card yellow">
                  <div className="stat-label">P99 Latency</div>
                  <div className="stat-value">{Math.round(metrics.latencyP99[metrics.latencyP99.length - 1]?.value || 350)}ms</div>
                  <div className="stat-delta">↑ 50ms spike</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-label">Error Rate</div>
                  <div className="stat-value">{(metrics.errorRate[metrics.errorRate.length - 1]?.value || 0.3).toFixed(2)}%</div>
                  <div className="stat-delta">Within SLA</div>
                </div>
              </div>

              <div className="charts-row">
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">CPU Utilization</div>
                      <div className="chart-subtitle">Past 24h</div>
                    </div>
                  </div>
                  <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '12px', gap: '2px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {metrics.cpu.slice(-24).map((m, i) => {
                      const color = m.value > 80 ? 'var(--danger)' : m.value > 60 ? 'var(--warning)' : 'var(--accent)';
                      return (
                        <div key={i} style={{ height: `${(m.value / 100) * 100}%`, width: '10px', background: `linear-gradient(to top, var(--bg-card), ${color})`, borderRadius: '2px 2px 0 0', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'} title={`${Math.round(m.value)}%`}></div>
                      )
                    })}
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Memory Usage</div>
                      <div className="chart-subtitle">Past 24h</div>
                    </div>
                  </div>
                  <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '12px', gap: '2px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {metrics.memory.slice(-24).map((m, i) => {
                      const color = m.value > 85 ? 'var(--danger)' : m.value > 70 ? 'var(--warning)' : 'var(--success)';
                      return (
                        <div key={i} style={{ height: `${m.value}%`, width: '10px', background: `linear-gradient(to top, var(--bg-card), ${color})`, borderRadius: '2px 2px 0 0', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'} title={`${Math.round(m.value)}%`}></div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="charts-row">
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Latency Percentiles</div>
                      <div className="chart-subtitle">P50 vs P99</div>
                    </div>
                  </div>
                  <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '12px', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {Array.from({ length: 12 }).map((_, i) => {
                      const p50 = ((metrics.latencyP50[i] || {}).value || 100);
                      const p99 = ((metrics.latencyP99[i] || {}).value || 300);
                      return (
                        <div key={i} style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '100%' }}>
                          <div style={{ height: `${p50 / 5}%`, width: '6px', background: 'var(--accent-dim)', borderRadius: '2px 2px 0 0' }} title={`P50: ${Math.round(p50)}ms`}></div>
                          <div style={{ height: `${p99 / 5}%`, width: '6px', background: p99 > 400 ? 'var(--warning)' : 'var(--accent)', borderRadius: '2px 2px 0 0' }} title={`P99: ${Math.round(p99)}ms`}></div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Requests Per Second</div>
                      <div className="chart-subtitle">All services</div>
                    </div>
                  </div>
                  <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '12px', gap: '2px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {metrics.rps.slice(-24).map((m, i) => (
                      <div key={i} style={{ height: `${(m.value / 50000) * 100}%`, width: '10px', background: 'linear-gradient(to top, var(--bg-card), var(--accent3))', borderRadius: '2px 2px 0 0', opacity: 0.8 }} title={`${Math.round(m.value)} req/s`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ALERTS TAB */}
          {currentTab === 'alerts' && !selectedAlertId && (
            <>
              <div className="page-intro">
                <div className="page-intro-icon">⚠</div>
                <div className="page-intro-text">
                  <h2>Alerts</h2>
                  <p>Rules that watch the system and flag problems automatically. Red means it's been triggered right now. Click any card to see exactly when and how it happened.</p>
                </div>
              </div>
              <div className="section-divider">
                <div className="section-divider-title">Alert Rules</div>
                <div className="section-divider-line"></div>
                <span className="badge badge-red">{ALERT_RULES.filter(a => a.triggered).length} triggered</span>
              </div>

              <div className="alert-cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {ALERT_RULES.map((alert, idx) => (
                  <div key={idx} className={`chart-card`} onClick={() => setSelectedAlertId(alert.id)} style={{ cursor: 'pointer', borderLeft: `3px solid ${alert.triggered ? 'var(--danger)' : 'var(--success)'}`, transition: 'border-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-bright)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div className="chart-header">
                      <div>
                        <div className="chart-title">{alert.name}</div>
                        <div className="chart-subtitle">{alert.service}</div>
                      </div>
                      <span className={`badge ${alert.triggered ? 'badge-red' : 'badge-green'}`}>
                        {alert.triggered ? 'TRIGGERED' : 'OK'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>Threshold:</strong> {alert.threshold}</span>
                      <span style={{ color: 'var(--accent)' }}>View Details →</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {currentTab === 'alerts' && selectedAlertId && (() => {
            const alert = ALERT_RULES.find(a => a.id === selectedAlertId);
            if (!alert) return null;
            return (
              <div className="tab-pane active">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <button onClick={() => setSelectedAlertId(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>← Back to Alerts</button>
                  <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {alert.name}
                    <span className={`badge ${alert.triggered ? 'badge-red' : 'badge-green'}`}>
                      {alert.triggered ? 'TRIGGERED' : 'OK'}
                    </span>
                  </h2>
                </div>

                <div className="stats-grid" style={{ marginBottom: '24px' }}>
                  <div className="stat-card">
                    <div className="stat-label">Affected Service</div>
                    <div className="stat-value" style={{ fontSize: '16px' }}>{alert.service}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Threshold condition</div>
                    <div className="stat-value" style={{ fontSize: '16px' }}>{alert.threshold}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Last Evaluated</div>
                    <div className="stat-value" style={{ fontSize: '16px' }}>Just now</div>
                  </div>
                </div>

                <div className="chart-card" style={{ marginBottom: '24px' }}>
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Metric Trend (Past Hour)</div>
                      <div className="chart-subtitle">Shows when the threshold was breached</div>
                    </div>
                  </div>
                  <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '12px', gap: '4px', borderBottom: '1px dashed var(--danger)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, borderTop: '2px dashed var(--danger)', zIndex: 0 }}>
                      <span style={{ position: 'absolute', right: '10px', top: '-18px', fontSize: '10px', color: 'var(--danger)' }}>Threshold Limit</span>
                    </div>
                    {Array.from({ length: 60 }).map((_, i) => {
                      const isBreach = alert.triggered && i > 45;
                      const height = isBreach ? 75 + Math.random() * 20 : 30 + Math.random() * 30;
                      return (
                        <div key={i} style={{ height: `${height}%`, width: '10px', background: isBreach ? 'var(--danger)' : 'var(--accent)', borderRadius: '2px', zIndex: 1, opacity: 0.8 }}></div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* DASHBOARDS TAB */}
          {currentTab === 'dashboards' && (
            <>
              <div className="page-intro">
                <div className="page-intro-icon">⊞</div>
                <div className="page-intro-text">
                  <h2>Dashboards</h2>
                  <p>Ready-made views for common monitoring needs — web traffic, application performance, eCommerce orders, and more. Click any card to load it.</p>
                </div>
              </div>
              <div className="section-divider">
                <div className="section-divider-title">Saved Dashboards</div>
                <div className="section-divider-line"></div>
              </div>

              <div className="dashboard-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {DASHBOARDS.map((dash, idx) => (
                  <div key={idx} className="chart-card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-bright)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{dash.icon}</div>
                    <div className="chart-title">{dash.name}</div>
                    <div className="chart-subtitle" style={{ marginTop: '8px' }}>{dash.description}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* SETTINGS TAB */}
          {currentTab === 'settings' && (
            <>
              <div className="page-intro">
                <div className="page-intro-icon">⚙</div>
                <div className="page-intro-text">
                  <h2>Settings</h2>
                  <p>Set your environment name, choose how long to keep data, and connect notification tools like Slack or PagerDuty so the right people get alerted automatically.</p>
                </div>
              </div>
              <div className="section-divider">
                <div className="section-divider-title">General Settings</div>
                <div className="section-divider-line"></div>
              </div>

              <div className="table-card">
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                    <div>
                      <div className="stat-label">
                        Environment Name
                        <InfoTooltip text="Filter logs and metrics by deployment environment (e.g. Production, Staging)" />
                      </div>
                      <input type="text" className="search-input" placeholder="prod-us-east" defaultValue="prod-us-east" style={{ marginTop: '8px', width: '100%' }} />
                    </div>
                    <div>
                      <div className="stat-label">
                        Data Retention
                        <InfoTooltip text="How long to keep historical metric and log data before purging." />
                      </div>
                      <select style={{ marginTop: '8px', width: '100%', padding: '6px 12px', background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        <option>7 days</option>
                        <option>14 days</option>
                        <option>30 days</option>
                        <option>90 days</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-divider" style={{ marginTop: '24px' }}>
                <div className="section-divider-title">Integrations</div>
                <div className="section-divider-line"></div>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                <div className="chart-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="chart-title">
                        Slack Notifications
                        <InfoTooltip text="Automatically send critical alerts and daily reports to a specific Slack channel." />
                      </div>
                      <div className="chart-subtitle">Send alerts to Slack</div>
                    </div>
                    <button style={{ padding: '6px 12px', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Configure</button>
                  </div>
                </div>
                <div className="chart-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="chart-title">
                        PagerDuty
                        <InfoTooltip text="Page on-call engineers immediately when an application crashes or latency spikes." />
                      </div>
                      <div className="chart-subtitle">Incident management</div>
                    </div>
                    <button style={{ padding: '6px 12px', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Configure</button>
                  </div>
                </div>
              </div>

              <div className="section-divider" style={{ marginTop: '24px' }}>
                <div className="section-divider-title">About</div>
                <div className="section-divider-line"></div>
              </div>

              <div className="chart-card">
                <div style={{ fontSize: '11px', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  <div><strong>WatchTower</strong> v2.4.1</div>
                  <div style={{ marginTop: '8px' }}>Observability Platform</div>
                  <div style={{ marginTop: '12px', color: 'var(--text-dim)', fontSize: '10px' }}>Built with Next.js · Powered by OpenTelemetry</div>
                </div>
              </div>
            </>
          )}
          {/* SYNTHETICS TAB — commented out for now */}
          {false && currentTab === 'synthetics' && (
            <div className="tab-pane active">
              <div className="stats-grid">
                <div className="stat-card green">
                  <div className="stat-label">Global Uptime</div>
                  <div className="stat-value">99.96%</div>
                  <div className="stat-delta">Target: 99.99%</div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-label">Active Monitors</div>
                  <div className="stat-value">{synthetics.length}</div>
                  <div className="stat-delta">Across 5 regions</div>
                </div>
                <div className="stat-card red">
                  <div className="stat-label">Failing Locations</div>
                  <div className="stat-value">{synthetics.filter(s => s.status === 'down').length}</div>
                  <div className="stat-delta">EU-Central (Frankfurt)</div>
                </div>
                <div className="stat-card yellow">
                  <div className="stat-label">Avg P90 Latency</div>
                  <div className="stat-value">124ms</div>
                  <div className="stat-delta">↑ 12ms vs last week</div>
                </div>
              </div>

              <div className="section-divider">
                <div className="section-divider-title">Global Monitor Status</div>
                <div className="section-divider-line"></div>
              </div>

              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Monitor Name</th>
                      <th>
                        Ping Origin
                        <InfoTooltip text="The global geographic location the ping request was made from." />
                      </th>
                      <th>Uptime (30d)</th>
                      <th>Latency</th>
                      <th>Last Checked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {synthetics.map(monitor => (
                      <tr key={monitor.id}>
                        <td>
                          <span className={`badge ${monitor.status === 'up' ? 'badge-green' : monitor.status === 'degraded' ? 'badge-yellow' : 'badge-red'}`}>
                            {monitor.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{monitor.name}</td>
                        <td>{monitor.location}</td>
                        <td>{monitor.uptime.toFixed(2)}%</td>
                        <td>{monitor.avgLatency > 0 ? `${monitor.avgLatency}ms` : '—'}</td>
                        <td>{Math.floor((Date.now() - monitor.lastChecked) / 1000)}s ago</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SERVICES TAB */}
          {currentTab === 'services' && (
            <>
              <div className="page-intro">
                <div className="page-intro-icon">⊞</div>
                <div className="page-intro-text">
                  <h2>Service Topology</h2>
                  <p>A live snapshot of every service — whether it's healthy, how fast it's responding, and how many requests it's handling. Click any service card to drill in for more detail.</p>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-card green">
                  <div className="stat-label">Healthy Services</div>
                  <div className="stat-value">{SERVICES.filter(s => s.uptime >= 99.9).length}</div>
                  <div className="stat-delta">of {SERVICES.length} total</div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-label">Total RPS</div>
                  <div className="stat-value">{(SERVICES.reduce((a, s) => a + s.rps, 0) / 1000).toFixed(0)}k</div>
                  <div className="stat-delta">across all services</div>
                </div>
                <div className="stat-card yellow">
                  <div className="stat-label">Avg Error Rate</div>
                  <div className="stat-value">{(SERVICES.reduce((a, s) => a + s.errorRate, 0) / SERVICES.length).toFixed(2)}%</div>
                  <div className="stat-delta">SLA target: &lt;1%</div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-label">Total Instances</div>
                  <div className="stat-value">{SERVICES.reduce((a, s) => a + s.instances, 0)}</div>
                  <div className="stat-delta">running replicas</div>
                </div>
              </div>

              <div className="section-divider">
                <div className="section-divider-title">Service Topology</div>
                <div className="section-divider-line"></div>
                <span className="badge badge-blue">{SERVICES.length} services</span>
              </div>

              {/* Service health grid */}
              <div className="service-topology-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {SERVICES.map(svc => {
                  const healthColor = svc.uptime >= 99.9 ? 'var(--success)' : svc.uptime >= 99 ? 'var(--warning)' : 'var(--danger)';
                  const errColor = svc.errorRate < 0.3 ? 'var(--success)' : svc.errorRate < 1 ? 'var(--warning)' : 'var(--danger)';
                  return (
                    <div key={svc.id} className="chart-card" onClick={() => { setSelectedServiceId(svc.id); setCurrentTab('service-detail'); }} style={{ cursor: 'pointer', borderTop: `3px solid ${healthColor}` }}>
                      <div className="chart-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{svc.icon}</span>
                          <div>
                            <div className="chart-title">{svc.name}</div>
                            <div className="chart-subtitle">{svc.type} · {svc.instances} instances</div>
                          </div>
                        </div>
                        <span className="badge" style={{ background: healthColor + '22', color: healthColor, border: `1px solid ${healthColor}` }}>{svc.uptime.toFixed(2)}%</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '12px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Latency</div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{svc.avgLatency}ms</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Error Rate</div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: errColor }}>{svc.errorRate}%</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>RPS</div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{(svc.rps / 1000).toFixed(1)}k</div>
                        </div>
                      </div>
                      {/* Mini sparkline */}
                      <div style={{ height: '32px', display: 'flex', alignItems: 'flex-end', gap: '2px', marginTop: '12px' }}>
                        {Array.from({ length: 20 }).map((_, i) => {
                          const h = 30 + Math.random() * 70;
                          const spike = svc.errorRate > 0.5 && i > 15;
                          return <div key={i} style={{ flex: 1, height: `${spike ? 90 + Math.random() * 10 : h}%`, background: spike ? 'var(--danger)' : healthColor, borderRadius: '1px', opacity: 0.7 }}></div>
                        })}
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--accent)' }}>View Details →</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* SERVICE DETAIL TAB */}
          {currentTab === 'service-detail' && selectedServiceId && (() => {
            const svc = SERVICES.find(s => s.id === selectedServiceId);
            if (!svc) return null;
            const isDb = svc.type === 'Database';
            const healthColor = svc.uptime >= 99.9 ? 'var(--success)' : svc.uptime >= 99 ? 'var(--warning)' : 'var(--danger)';
            const svcTraces = allTraces.filter(t => t.serviceName === svc.name).slice(0, 10);
            return (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <button onClick={() => { setCurrentTab('services'); }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>← Services</button>
                  <span style={{ fontSize: '22px' }}>{svc.icon}</span>
                  <h2 style={{ margin: 0, fontSize: '18px' }}>{svc.name}</h2>
                  <span className="badge badge-blue">{svc.type}</span>
                  <span className="badge" style={{ background: healthColor + '22', color: healthColor, border: `1px solid ${healthColor}` }}>{svc.uptime.toFixed(2)}% uptime</span>
                </div>

                <div className="stats-grid" style={{ marginBottom: '24px' }}>
                  <div className="stat-card blue">
                    <div className="stat-label">{isDb ? 'Query Rate' : 'Req/s'}</div>
                    <div className="stat-value">{(svc.rps / 1000).toFixed(1)}k</div>
                    <div className="stat-delta">↑ 4% vs avg</div>
                  </div>
                  <div className="stat-card green">
                    <div className="stat-label">{isDb ? 'Query Latency' : 'Avg Latency'}</div>
                    <div className="stat-value">{svc.avgLatency}ms</div>
                    <div className="stat-delta">P50 baseline</div>
                  </div>
                  <div className={`stat-card ${svc.errorRate < 0.5 ? 'green' : 'red'}`}>
                    <div className="stat-label">Error Rate</div>
                    <div className="stat-value">{svc.errorRate}%</div>
                    <div className="stat-delta">{svc.errorRate < 0.5 ? '✓ Within SLA' : '⚠ Above threshold'}</div>
                  </div>
                  <div className="stat-card blue">
                    <div className="stat-label">Instances</div>
                    <div className="stat-value">{svc.instances}</div>
                    <div className="stat-delta">Active replicas</div>
                  </div>
                </div>

                <div className="charts-row" style={{ gridTemplateColumns: isDb ? '1fr 1fr 1fr' : '1fr 1fr', marginBottom: '24px' }}>
                  {/* Chart 1: Throughput over time */}
                  <div className="chart-card">
                    <div className="chart-header"><div><div className="chart-title">{isDb ? 'Queries/s' : 'Throughput'}</div><div className="chart-subtitle">Last 24 hours</div></div></div>
                    <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '3px', padding: '8px' }}>
                      {Array.from({ length: 24 }).map((_, i) => {
                        const base = svc.rps / 50000;
                        const h = (base + Math.random() * 0.4) * 100;
                        return <div key={i} style={{ flex: 1, height: `${Math.min(h, 100)}%`, background: `linear-gradient(to top, var(--bg-card), var(--accent))`, borderRadius: '2px 2px 0 0', opacity: 0.8 }}></div>
                      })}
                    </div>
                  </div>

                  {/* Chart 2: Error rate */}
                  <div className="chart-card">
                    <div className="chart-header"><div><div className="chart-title">Error Rate</div><div className="chart-subtitle">Last 24 hours</div></div></div>
                    <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '3px', padding: '8px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '20%', left: '8px', right: '8px', borderTop: '1px dashed var(--danger)', opacity: 0.4 }}></div>
                      {Array.from({ length: 24 }).map((_, i) => {
                        const isSpike = svc.errorRate > 0.3 && (i === 18 || i === 19);
                        const h = isSpike ? 60 + Math.random() * 30 : Math.random() * 15;
                        const col = h > 30 ? 'var(--danger)' : h > 10 ? 'var(--warning)' : 'var(--success)';
                        return <div key={i} style={{ flex: 1, height: `${Math.max(h, 2)}%`, background: `linear-gradient(to top, var(--bg-card), ${col})`, borderRadius: '2px 2px 0 0', opacity: 0.85 }}></div>
                      })}
                    </div>
                  </div>

                  {/* Chart 3: DB-specific or latency heatmap */}
                  {isDb ? (
                    <div className="chart-card">
                      <div className="chart-header"><div><div className="chart-title">Query Types</div><div className="chart-subtitle">By operation</div></div></div>
                      <div style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px', padding: '0 12px' }}>
                        {[['SELECT', 62, 'var(--accent)'], ['INSERT', 20, 'var(--success)'], ['UPDATE', 12, 'var(--warning)'], ['DELETE', 6, 'var(--danger)']].map(([op, pct, col]) => (
                          <div key={op as string}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>{op}</span>
                              <span style={{ color: col as string, fontWeight: 'bold' }}>{pct}%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--bg-panel)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: col as string, borderRadius: '3px' }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Recent traces */}
                <div className="section-divider" style={{ marginBottom: '16px' }}>
                  <div className="section-divider-title">Recent Traces</div>
                  <div className="section-divider-line"></div>
                  <span className="badge badge-blue">{svcTraces.length} shown</span>
                </div>
                {svcTraces.length > 0 ? (
                  <div className="table-card">
                    <table style={{ fontSize: '11px' }}>
                      <thead><tr><th>Trace ID</th><th>Operation</th><th>Duration</th><th>Status</th></tr></thead>
                      <tbody>
                        {svcTraces.map((t, idx) => (
                          <tr key={idx} onClick={() => { setSelectedTraceId(t.traceId); setCurrentTab('trace-detail'); }} style={{ cursor: 'pointer' }}>
                            <td><span className="trace-id">{t.traceId}</span></td>
                            <td>{t.operationName}</td>
                            <td>{Math.round(t.duration)}ms</td>
                            <td><span className={`badge ${t.status === 'success' ? 'badge-green' : t.status === 'error' ? 'badge-red' : 'badge-yellow'}`}>{t.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="chart-card" style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', padding: '32px' }}>No traces found for this service in the selected time range.</div>
                )}
              </div>
            );
          })()}

          {/* SAMPLE DATA TAB */}
          {currentTab === 'sample-data' && (() => {
            const datasets = [
              { id: 'ecommerce', name: 'eCommerce Platform', icon: '🛒', desc: 'Simulates an online retail system with checkout flows, product catalog, and payment processing.', ops: ['/checkout', '/cart/add', '/product/{id}', '/orders', '/payment/verify'], services: 6, traces: 850, errorRate: '1.2%' },
              { id: 'saas', name: 'SaaS Application', icon: '☁️', desc: 'Multi-tenant SaaS with auth, user management, billing, and a REST API backend.', ops: ['/login', '/api/users', '/billing/invoice', '/api/dashboard', '/webhooks'], services: 5, traces: 620, errorRate: '0.4%' },
              { id: 'fintech', name: 'Fintech / Banking API', icon: '🏦', desc: 'Financial services platform tracking payments, fraud detection, ledger entries, and KYC checks.', ops: ['/transfer', '/fraud/check', '/ledger/entry', '/kyc/verify', '/balance'], services: 7, traces: 980, errorRate: '0.8%' },
              { id: 'iot', name: 'IoT / Event Stream', icon: '📡', desc: 'High-volume IoT data pipeline with device telemetry, event processing, and real-time alerting.', ops: ['/ingest/telemetry', '/stream/process', '/alert/trigger', '/device/heartbeat'], services: 4, traces: 2400, errorRate: '2.1%' },
            ];
            return (
              <>
                <div className="page-intro">
                  <div className="page-intro-icon">⬇</div>
                  <div className="page-intro-text">
                    <h2>Sample Data</h2>
                    <p>No live system? No problem. Pick any dataset below and click Import — the whole dashboard updates instantly with realistic data so you can explore every feature.</p>
                  </div>
                </div>
                <div className="section-divider">
                  <div className="section-divider-title">Import Sample Datasets</div>
                  <div className="section-divider-line"></div>
                  <InfoTooltip text="Import a dataset to populate the dashboard with realistic demo data for a specific industry." />
                </div>

                {importedDataset && (
                  <div style={{ background: 'var(--success)', color: '#fff', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>✓</span> <strong>{datasets.find(d => d.id === importedDataset)?.name}</strong> dataset loaded successfully! Navigate to any tab to explore the data.
                  </div>
                )}

                <div className="sample-data-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {datasets.map(ds => (
                    <div key={ds.id} className="chart-card" style={{ borderTop: importedDataset === ds.id ? '3px solid var(--success)' : '3px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '28px' }}>{ds.icon}</span>
                          <div>
                            <div className="chart-title" style={{ fontSize: '14px' }}>{ds.name}</div>
                            <div className="chart-subtitle" style={{ marginTop: '4px', lineHeight: '1.4' }}>{ds.desc}</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', margin: '16px 0', padding: '12px', background: 'var(--bg-panel)', borderRadius: '6px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Services</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent)' }}>{ds.services}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Traces</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent)' }}>{ds.traces}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Error Rate</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--warning)' }}>{ds.errorRate}</div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Sample Operations:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {ds.ops.map(op => <span key={op} style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>{op}</span>)}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (importingDataset) return;
                          setImportingDataset(ds.id);
                          setTimeout(() => {
                            setAllTraces(generateTraces(24, ds.traces));
                            setAllLogs(generateLogs(24, ds.traces * 2));
                            setMetrics(generateMetrics(24));
                            setImportingDataset(null);
                            setImportedDataset(ds.id);
                          }, 1800);
                        }}
                        disabled={!!importingDataset}
                        style={{ width: '100%', padding: '10px', background: importedDataset === ds.id ? 'var(--success)' : importingDataset === ds.id ? 'var(--bg-panel)' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: importingDataset ? 'wait' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {importedDataset === ds.id ? '✓ Loaded' : importingDataset === ds.id ? (
                          <><span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span> Importing...</>
                        ) : '⬇ Import Dataset'}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </>
  )
}
