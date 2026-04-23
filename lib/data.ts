// Comprehensive observability data for WatchTower demo
// This file contains all the data needed for traces, logs, metrics, and services

export const SERVICES = [
  { id: 'api-gateway', name: 'API Gateway', status: 'healthy', rps: 4200, errorRate: 0.2, latency: 142, instances: 8, icon: '🌐' },
  { id: 'auth-service', name: 'Auth Service', status: 'healthy', rps: 1800, errorRate: 0.1, latency: 95, instances: 4, icon: '🔐' },
  { id: 'product-service', name: 'Product Service', status: 'healthy', rps: 2100, errorRate: 0.3, latency: 156, instances: 6, icon: '📦' },
  { id: 'cart-service', name: 'Cart Service', status: 'warning', rps: 850, errorRate: 1.2, latency: 234, instances: 3, icon: '🛒' },
  { id: 'payment-service', name: 'Payment Service', status: 'healthy', rps: 420, errorRate: 0.05, latency: 789, instances: 4, icon: '💳' },
  { id: 'order-service', name: 'Order Service', status: 'healthy', rps: 650, errorRate: 0.4, latency: 412, instances: 4, icon: '📋' },
  { id: 'inventory-service', name: 'Inventory Service', status: 'healthy', rps: 1200, errorRate: 0.6, latency: 178, instances: 3, icon: '📊' },
  { id: 'shipping-service', name: 'Shipping Service', status: 'healthy', rps: 280, errorRate: 0.2, latency: 523, instances: 2, icon: '🚚' },
  { id: 'notification-service', name: 'Notification Service', status: 'healthy', rps: 900, errorRate: 0.8, latency: 245, instances: 3, icon: '📧' },
  { id: 'database', name: 'Database (PostgreSQL)', status: 'healthy', rps: 12000, errorRate: 0.05, latency: 12, instances: 2, icon: '🗄️' },
  { id: 'cache', name: 'Cache (Redis)', status: 'healthy', rps: 8500, errorRate: 0.02, latency: 3, instances: 2, icon: '⚡' },
  { id: 'search', name: 'Search (Elasticsearch)', status: 'healthy', rps: 450, errorRate: 0.3, latency: 245, instances: 3, icon: '🔍' },
]

export const TRACE_OPERATIONS = [
  'POST /api/orders',
  'GET /api/products',
  'POST /api/checkout',
  'GET /api/user/profile',
  'POST /api/auth/login',
  'GET /api/inventory',
  'POST /api/payments',
  'GET /api/shipping/rates',
]

export function generateTraces(timeRangeHours: number = 7, limit: number = 750) {
  const traces = []
  const now = Date.now()
  const operations = TRACE_OPERATIONS
  const statuses = ['success', 'error', 'slow']

  for (let i = 0; i < limit; i++) {
    const startTime = now - Math.random() * timeRangeHours * 3600000
    const duration = Math.random() < 0.05 ? Math.random() * 5000 + 1000 : Math.random() * 1000 + 50
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)]
    const status = duration > 2000 ? 'slow' : Math.random() < 0.01 ? 'error' : 'success'

    traces.push({
      traceId: `${Math.random().toString(16).slice(2, 10)}-${i}`,
      operationName: operations[Math.floor(Math.random() * operations.length)],
      serviceName: service.name,
      duration,
      status,
      startTime: new Date(startTime).toISOString(),
      spans: Math.floor(Math.random() * 8) + 2,
      tags: {
        'http.method': ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
        'http.status_code': status === 'error' ? '500' : status === 'slow' ? '200' : '200',
        'service.name': service.name,
      }
    })
  }

  return traces.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
}

export function generateLogs(timeRangeHours: number = 7, limit: number = 1500) {
  const logs = []
  const now = Date.now()
  const messages = [
    'Request processed successfully',
    'Database query executed',
    'Cache hit for key: user_session',
    'High latency detected',
    'Connection timeout to external service',
    'Authentication failed for user',
    'Payment transaction completed',
    'Order created and confirmed',
    'Inventory updated',
    'Shipment dispatched',
    'Email notification sent',
    'Error: Database connection failed',
    'Warning: Memory usage above 80%',
    'API rate limit approaching',
    'Service degradation detected',
  ]
  const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG']

  for (let i = 0; i < limit; i++) {
    const timestamp = now - Math.random() * timeRangeHours * 3600000
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)]
    const level = Math.random() < 0.7 ? 'INFO' : Math.random() < 0.2 ? 'WARN' : Math.random() < 0.08 ? 'ERROR' : 'DEBUG'

    logs.push({
      id: `log-${i}`,
      timestamp: new Date(timestamp).toISOString(),
      level,
      service: service.name,
      message: messages[Math.floor(Math.random() * messages.length)],
      traceId: Math.random() > 0.3 ? `${Math.random().toString(16).slice(2, 10)}-${i}` : undefined,
      userId: Math.random() > 0.6 ? `user_${Math.floor(Math.random() * 10000)}` : undefined,
      tags: {
        environment: 'production',
        region: ['us-east-1', 'us-west-2', 'eu-west-1'][Math.floor(Math.random() * 3)],
      }
    })
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function generateMetrics(timeRangeHours: number = 24) {
  const metrics: any = {}
  const now = Date.now()
  const points = 48 // 30-min intervals for 24 hours

  // CPU metrics
  metrics.cpu = Array.from({ length: points }, (_, i) => {
    const time = new Date(now - (points - i) * 30 * 60000)
    return {
      timestamp: time.toISOString(),
      value: 45 + Math.random() * 35 + (i % 10) * 2,
    }
  })

  // Memory metrics
  metrics.memory = Array.from({ length: points }, (_, i) => {
    const time = new Date(now - (points - i) * 30 * 60000)
    return {
      timestamp: time.toISOString(),
      value: 55 + Math.random() * 25 + (i % 8) * 1.5,
    }
  })

  // Latency P50/P99
  metrics.latencyP50 = Array.from({ length: points }, (_, i) => {
    const time = new Date(now - (points - i) * 30 * 60000)
    return {
      timestamp: time.toISOString(),
      value: 100 + Math.random() * 100,
    }
  })

  metrics.latencyP99 = Array.from({ length: points }, (_, i) => {
    const time = new Date(now - (points - i) * 30 * 60000)
    return {
      timestamp: time.toISOString(),
      value: 400 + Math.random() * 400,
    }
  })

  // Error rate
  metrics.errorRate = Array.from({ length: points }, (_, i) => {
    const time = new Date(now - (points - i) * 30 * 60000)
    return {
      timestamp: time.toISOString(),
      value: Math.random() * 2,
    }
  })

  // Request rate (RPS)
  metrics.rps = Array.from({ length: points }, (_, i) => {
    const time = new Date(now - (points - i) * 30 * 60000)
    return {
      timestamp: time.toISOString(),
      value: 8000 + Math.random() * 4000 + (i % 12) * 200,
    }
  })

  // Disk I/O
  metrics.diskIO = Array.from({ length: points }, (_, i) => {
    const time = new Date(now - (points - i) * 30 * 60000)
    return {
      timestamp: time.toISOString(),
      value: 100 + Math.random() * 150,
    }
  })

  // Network throughput
  metrics.networkIn = Array.from({ length: points }, (_, i) => {
    const time = new Date(now - (points - i) * 30 * 60000)
    return {
      timestamp: time.toISOString(),
      value: 500 + Math.random() * 600,
    }
  })

  metrics.networkOut = Array.from({ length: points }, (_, i) => {
    const time = new Date(now - (points - i) * 30 * 60000)
    return {
      timestamp: time.toISOString(),
      value: 300 + Math.random() * 400,
    }
  })

  return metrics
}

export function filterByTimeRange(items: any[], timeRangeKey: string, timeField: string = 'timestamp') {
  const now = Date.now()
  let hoursBack = 7

  if (timeRangeKey === '1h') hoursBack = 1
  else if (timeRangeKey === '7d') hoursBack = 7 * 24
  else if (timeRangeKey === '30d') hoursBack = 30 * 24

  const cutoff = now - hoursBack * 3600000

  return items.filter(item => {
    const itemTime = new Date(item[timeField] || item.timestamp || item.startTime).getTime()
    return itemTime >= cutoff
  })
}

export const ALERT_RULES = [
  { id: 1, name: 'High Error Rate', service: 'cart-service', threshold: '> 1%', current: '1.2%', severity: 'warning', status: 'triggered' },
  { id: 2, name: 'P99 Latency Spike', service: 'payment-service', threshold: '< 1000ms', current: '1240ms', severity: 'critical', status: 'triggered' },
  { id: 3, name: 'CPU Utilization', service: 'api-gateway', threshold: '< 80%', current: '68%', severity: 'ok', status: 'healthy' },
  { id: 4, name: 'Memory Leak Detection', service: 'database', threshold: '< 85%', current: '78%', severity: 'ok', status: 'healthy' },
  { id: 5, name: 'Request Timeout Rate', service: 'order-service', threshold: '< 0.5%', current: '0.4%', severity: 'ok', status: 'healthy' },
  { id: 6, name: 'Database Connection Pool', service: 'database', threshold: '< 90%', current: '72%', severity: 'ok', status: 'healthy' },
  { id: 7, name: 'Disk Space Warning', service: 'database', threshold: '< 90%', current: '82%', severity: 'warning', status: 'triggered' },
  { id: 8, name: 'Service Availability', service: 'shipping-service', threshold: '> 99%', current: '99.8%', severity: 'ok', status: 'healthy' },
]

export const DASHBOARDS = [
  {
    id: 'ecommerce',
    name: 'eCommerce Orders',
    description: 'Analyze mock eCommerce orders and revenue',
    metrics: { orders: 2847, revenue: '$425,890', conversionRate: '3.2%', avgOrderValue: '$149' },
    icon: '🛍️'
  },
  {
    id: 'web-traffic',
    name: 'Web Traffic',
    description: 'Analyze mock web traffic log data',
    metrics: { pageViews: '84,230', uniqueVisitors: '12,456', bounceRate: '32%', avgSessionTime: '4m 32s' },
    icon: '📊'
  },
  {
    id: 'application',
    name: 'Application Performance',
    description: 'Monitor application health and performance',
    metrics: { uptime: '99.97%', avgLatency: '142ms', errorRate: '0.42%', throughput: '14,832 req/min' },
    icon: '⚙️'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Monitor infrastructure resources and health',
    metrics: { cpuAvg: '62%', memoryAvg: '68%', diskUsage: '74%', networkThroughput: '2.4 Gbps' },
    icon: '🖥️'
  },
]
