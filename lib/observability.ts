// Generic microservices for monitoring (not ecommerce specific)
export const SERVICES = [
  { id: 'api-gw', name: 'API Gateway', icon: '🌐', type: 'Gateway', uptime: 99.98, avgLatency: 12, errorRate: 0.02, rps: 15420, instances: 8 },
  // { id: 'auth', name: 'Auth Service', icon: '🔐', type: 'Service', uptime: 99.99, avgLatency: 45, errorRate: 0.01, rps: 2840, instances: 4 }, // commented out — demo traces not realistic for auth
  { id: 'db', name: 'Database', icon: '💾', type: 'Database', uptime: 99.95, avgLatency: 28, errorRate: 0.15, rps: 8420, instances: 3 },
  // { id: 'cache', name: 'Cache Layer', icon: '⚡', type: 'Cache', uptime: 99.97, avgLatency: 2, errorRate: 0.03, rps: 42000, instances: 2 }, // commented out — data not realistic enough
  { id: 'queue', name: 'Message Queue', icon: '📨', type: 'Queue', uptime: 99.92, avgLatency: 15, errorRate: 0.25, rps: 3200, instances: 5 },
  { id: 'search', name: 'Search Engine', icon: '🔍', type: 'Search', uptime: 99.88, avgLatency: 120, errorRate: 0.35, rps: 1200, instances: 2 },
  { id: 'worker', name: 'Background Workers', icon: '⚙️', type: 'Worker', uptime: 99.85, avgLatency: 2500, errorRate: 0.45, rps: 450, instances: 6 },
  { id: 'logger', name: 'Log Aggregator', icon: '📋', type: 'Logging', uptime: 99.99, avgLatency: 5, errorRate: 0.01, rps: 25000, instances: 3 },
  { id: 'metric', name: 'Metrics Store', icon: '📊', type: 'Monitoring', uptime: 99.96, avgLatency: 8, errorRate: 0.05, rps: 18000, instances: 2 },
  { id: 'tracer', name: 'Trace Collector', icon: '⇢', type: 'Tracing', uptime: 99.94, avgLatency: 3, errorRate: 0.12, rps: 50000, instances: 4 }
]

export interface Span {
  spanId: string
  traceId: string
  parentSpanId?: string
  operationName: string
  serviceName: string
  startTime: number
  duration: number
  tags: Record<string, string>
  status: 'success' | 'error'
}

export interface Trace {
  traceId: string
  operationName: string
  serviceName: string
  startTime: number
  duration: number
  spans: Span[]
  status: 'success' | 'error' | 'slow'
  spanCount: number
  errorCount: number
}

export interface Log {
  timestamp: number
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  service: string
  message: string
  traceId?: string
  attributes: Record<string, string>
}

export interface Metric {
  timestamp: number
  value: number
  labels: Record<string, string>
}

export interface SyntheticMonitor {
  id: string
  name: string
  url: string
  location: string
  status: 'up' | 'down' | 'degraded'
  uptime: number
  avgLatency: number
  lastChecked: number
}

// Generate spans for a trace with proper parent-child relationships
function generateSpans(traceId: string, serviceName: string, duration: number, spanCount: number): Span[] {
  const spans: Span[] = []
  const startTime = Date.now()
  let currentTime = startTime
  let parentSpanId: string | undefined

  for (let i = 0; i < spanCount; i++) {
    const spanDuration = Math.random() * duration * 0.8
    const spanId = `${traceId}-${i}`
    
    spans.push({
      spanId,
      traceId,
      parentSpanId: i > 0 ? `${traceId}-${i - 1}` : undefined,
      operationName: ['query', 'fetch', 'parse', 'render', 'serialize', 'authenticate', 'validate', 'cache.get', 'db.query', 'http.call'][Math.floor(Math.random() * 10)],
      serviceName: SERVICES[Math.floor(Math.random() * SERVICES.length)].name,
      startTime: currentTime,
      duration: spanDuration,
      tags: {
        'http.method': ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
        'http.status_code': Math.random() > 0.05 ? '200' : '500',
        'component': ['http', 'db', 'cache', 'grpc'][Math.floor(Math.random() * 4)]
      },
      status: Math.random() > 0.05 ? 'success' : 'error'
    })
    
    currentTime += spanDuration
  }

  return spans
}

export function generateTraces(hourCount: number, traceCount: number): Trace[] {
  const traces: Trace[] = []
  const now = Date.now()
  const hourMs = 3600000

  for (let i = 0; i < traceCount; i++) {
    const randomHour = Math.floor(Math.random() * hourCount)
    const randomMinute = Math.floor(Math.random() * 60)
    const traceId = `trace-${String(i).padStart(6, '0')}`
    const duration = Math.random() * 5000 + 10 // 10ms to 5s
    const spanCount = Math.floor(Math.random() * 12) + 2 // 2-14 spans
    const isError = Math.random() < 0.08
    const isSlow = !isError && duration > 1000 && Math.random() < 0.15

    const spans = generateSpans(traceId, SERVICES[Math.floor(Math.random() * SERVICES.length)].name, duration, spanCount)
    const errorSpans = spans.filter(s => s.status === 'error').length

    traces.push({
      traceId,
      operationName: ['GET /api/users', 'POST /api/orders', 'PUT /api/profile', 'DELETE /api/session', 'GET /api/search'][Math.floor(Math.random() * 5)],
      serviceName: SERVICES[Math.floor(Math.random() * SERVICES.length)].name,
      startTime: now - (randomHour * hourMs) - (randomMinute * 60000),
      duration,
      spans,
      status: isError ? 'error' : isSlow ? 'slow' : 'success',
      spanCount,
      errorCount: errorSpans
    })
  }

  return traces.sort((a, b) => b.startTime - a.startTime)
}

export function generateLogs(hourCount: number, logCount: number): Log[] {
  const logs: Log[] = []
  const now = Date.now()
  const hourMs = 3600000

  const messages = [
    'Request processed successfully',
    'User authentication completed',
    'Database query executed',
    'Cache hit for key: {key}',
    'Connection timeout to external service',
    'High latency detected on database',
    'Memory usage exceeded threshold',
    'Rate limit exceeded for client',
    'Service recovered from failure',
    'Replication lag detected',
    'Disk space running low',
    'Certificate expiring in 30 days',
    'Slow query detected',
    'Connection pool exhausted',
    'Graceful shutdown initiated'
  ]

  for (let i = 0; i < logCount; i++) {
    const randomHour = Math.floor(Math.random() * hourCount)
    const randomMinute = Math.floor(Math.random() * 60)
    const randomSecond = Math.floor(Math.random() * 60)
    const levelRand = Math.random()
    
    let level: Log['level'] = 'INFO'
    if (levelRand < 0.05) level = 'ERROR'
    else if (levelRand < 0.15) level = 'WARN'
    else if (levelRand < 0.4) level = 'DEBUG'

    logs.push({
      timestamp: now - (randomHour * hourMs) - (randomMinute * 60000) - (randomSecond * 1000),
      level,
      service: SERVICES[Math.floor(Math.random() * SERVICES.length)].name,
      message: messages[Math.floor(Math.random() * messages.length)],
      traceId: Math.random() > 0.3 ? `trace-${String(Math.floor(Math.random() * 750)).padStart(6, '0')}` : undefined,
      attributes: {
        'component': ['http', 'db', 'cache'][Math.floor(Math.random() * 3)],
        'duration_ms': String(Math.floor(Math.random() * 2000)),
        'user_id': `user-${Math.floor(Math.random() * 10000)}`
      }
    })
  }

  return logs.sort((a, b) => b.timestamp - a.timestamp)
}

export function generateMetrics(hourCount: number) {
  const now = Date.now()
  const hourMs = 3600000
  const metrics = {
    cpu: [] as Metric[],
    memory: [] as Metric[],
    latencyP50: [] as Metric[],
    latencyP99: [] as Metric[],
    errorRate: [] as Metric[],
    rps: [] as Metric[]
  }

  for (let h = 0; h < hourCount; h++) {
    const timestamp = now - (h * hourMs)
    const baseValues = {
      cpu: 35 + Math.random() * 40 + Math.sin(h / 12) * 10,
      memory: 45 + Math.random() * 30 + Math.cos(h / 10) * 8,
      latencyP50: 50 + Math.random() * 100 + Math.sin(h / 8) * 20,
      latencyP99: 200 + Math.random() * 400 + Math.cos(h / 6) * 100,
      errorRate: 0.2 + Math.random() * 1.5 + Math.abs(Math.sin(h / 15)) * 0.8,
      rps: 10000 + Math.random() * 8000 + Math.sin(h / 4) * 3000
    }

    metrics.cpu.push({ timestamp, value: Math.max(0, baseValues.cpu), labels: { service: 'all' } })
    metrics.memory.push({ timestamp, value: Math.max(0, baseValues.memory), labels: { service: 'all' } })
    metrics.latencyP50.push({ timestamp, value: Math.max(0, baseValues.latencyP50), labels: { percentile: 'p50' } })
    metrics.latencyP99.push({ timestamp, value: Math.max(0, baseValues.latencyP99), labels: { percentile: 'p99' } })
    metrics.errorRate.push({ timestamp, value: Math.max(0, baseValues.errorRate), labels: { service: 'all' } })
    metrics.rps.push({ timestamp, value: Math.max(0, baseValues.rps), labels: { service: 'all' } })
  }

  return metrics
}

export function filterByTimeRange(items: any[], timeRange: string, timestampKey = 'startTime'): any[] {
  const now = Date.now()
  const hourMs = 3600000
  const dayMs = 24 * hourMs

  let startTime = now
  if (timeRange === '1h') startTime = now - hourMs
  else if (timeRange === '7d') startTime = now - (7 * dayMs)
  else if (timeRange === '30d') startTime = now - (30 * dayMs)

  return items.filter(item => (item[timestampKey] || item.timestamp) >= startTime)
}

export const ALERT_RULES = [
  { id: 'alert-1', name: 'High Error Rate', service: 'API Gateway', threshold: '> 1%', status: 'healthy', triggered: false },
  { id: 'alert-2', name: 'P99 Latency Spike', service: 'Database', threshold: '> 1000ms', status: 'healthy', triggered: false },
  { id: 'alert-3', name: 'Low Disk Space', service: 'Log Aggregator', threshold: '< 10%', status: 'healthy', triggered: false },
  { id: 'alert-4', name: 'High CPU Usage', service: 'Search Engine', threshold: '> 80%', status: 'warning', triggered: true },
  { id: 'alert-5', name: 'Memory Pressure', service: 'Cache Layer', threshold: '> 85%', status: 'healthy', triggered: false },
  { id: 'alert-6', name: 'Request Queue Depth', service: 'Message Queue', threshold: '> 10000', status: 'warning', triggered: true },
  { id: 'alert-7', name: 'Connection Pool Exhaustion', service: 'Database', threshold: '> 95%', status: 'healthy', triggered: false },
  { id: 'alert-8', name: 'Replication Lag', service: 'Database', threshold: '> 5s', status: 'error', triggered: true }
]

export const DASHBOARDS = [
  { id: 'dash-1', name: 'System Overview', icon: '◈', description: 'Overall system health and performance' },
  { id: 'dash-2', name: 'API Performance', icon: '📊', description: 'Request latency, throughput, errors' },
  { id: 'dash-3', name: 'Infrastructure', icon: '🏗️', description: 'CPU, memory, disk, network metrics' },
  { id: 'dash-4', name: 'Error Analysis', icon: '❌', description: 'Error rates, types, and trends' },
  { id: 'dash-5', name: 'Database Health', icon: '💾', description: 'Query performance and connections' },
  { id: 'dash-6', name: 'Distributed Tracing', icon: '⇢', description: 'End-to-end request flow analysis' }
]

export function generateSynthetics(): SyntheticMonitor[] {
  const now = Date.now()
  return [
    { id: 'synth-1', name: 'Frontend Homepage', url: 'https://example.com', location: 'US-East (N. Virginia)', status: 'up', uptime: 99.99, avgLatency: 45, lastChecked: now - 30000 },
    { id: 'synth-2', name: 'Auth API Gateway', url: 'https://api.example.com/auth', location: 'EU-West (Ireland)', status: 'up', uptime: 99.95, avgLatency: 120, lastChecked: now - 45000 },
    { id: 'synth-3', name: 'Checkout Service API', url: 'https://api.example.com/checkout', location: 'AP-South (Mumbai)', status: 'degraded', uptime: 98.50, avgLatency: 850, lastChecked: now - 15000 },
    { id: 'synth-4', name: 'Search Service', url: 'https://search.example.com', location: 'US-West (Oregon)', status: 'up', uptime: 99.90, avgLatency: 65, lastChecked: now - 60000 },
    { id: 'synth-5', name: 'Payment Webhook', url: 'https://api.example.com/webhooks', location: 'EU-Central (Frankfurt)', status: 'down', uptime: 95.20, avgLatency: 0, lastChecked: now - 120000 }
  ]
}
