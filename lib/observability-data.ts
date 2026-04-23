// Realistic observability data for WatchTower demo
// Contains traces, logs, metrics, and service information

export interface Trace {
  id: string;
  traceId: string;
  spanId: string;
  operationName: string;
  serviceName: string;
  startTime: number;
  duration: number;
  status: 'success' | 'error' | 'warning';
  spans: Span[];
  errors?: string[];
  tags?: Record<string, string>;
}

export interface Span {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  operationName: string;
  serviceName: string;
  startTime: number;
  duration: number;
  status: 'success' | 'error' | 'warning';
  tags?: Record<string, string>;
  logs?: Array<{ timestamp: number; message: string }>;
}

export interface Log {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
  traceId?: string;
  spanId?: string;
  context?: Record<string, string>;
}

export interface Metric {
  timestamp: number;
  serviceName: string;
  name: string;
  value: number;
  unit: string;
  labels?: Record<string, string>;
}

export interface Service {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  rps: number;
  errorRate: number;
  latency: number;
  instances: number;
  icon: string;
}

export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  icon: string;
  traces: number;
  logs: number;
  metrics: number;
}

const services: Service[] = [
  { name: 'API Gateway', status: 'healthy', rps: 1234, errorRate: 0.2, latency: 45, instances: 3, icon: '🌐' },
  { name: 'Auth Service', status: 'healthy', rps: 567, errorRate: 0.1, latency: 23, instances: 2, icon: '🔐' },
  { name: 'User Service', status: 'healthy', rps: 890, errorRate: 0.3, latency: 56, instances: 4, icon: '👤' },
  { name: 'Payment Service', status: 'warning', rps: 234, errorRate: 2.1, latency: 234, instances: 2, icon: '💳' },
  { name: 'Order Service', status: 'healthy', rps: 456, errorRate: 0.5, latency: 78, instances: 3, icon: '📦' },
  { name: 'Notification Service', status: 'healthy', rps: 345, errorRate: 0.1, latency: 12, instances: 2, icon: '🔔' },
  { name: 'Database', status: 'healthy', rps: 2100, errorRate: 0.0, latency: 34, instances: 1, icon: '🗄️' },
  { name: 'Cache Layer', status: 'healthy', rps: 5600, errorRate: 0.0, latency: 5, instances: 2, icon: '⚡' },
  { name: 'Search Engine', status: 'healthy', rps: 234, errorRate: 0.2, latency: 89, instances: 2, icon: '🔍' },
  { name: 'Message Queue', status: 'healthy', rps: 1800, errorRate: 0.0, latency: 8, instances: 3, icon: '📨' },
  { name: 'Analytics Service', status: 'healthy', rps: 567, errorRate: 0.1, latency: 67, instances: 2, icon: '📊' },
  { name: 'Shipping Service', status: 'healthy', rps: 123, errorRate: 1.5, latency: 156, instances: 2, icon: '🚚' },
];

function generateTraces(count: number, timeRange: number): Trace[] {
  const traces: Trace[] = [];
  const now = Date.now();
  const statuses: Array<'success' | 'error' | 'warning'> = ['success', 'success', 'success', 'success', 'success', 'warning', 'error'];

  for (let i = 0; i < count; i++) {
    const startTime = now - Math.random() * timeRange;
    const traceId = `trace-${Math.random().toString(36).substr(2, 9)}`;
    const duration = Math.random() * 1000 + 50;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const operationName = ['POST /api/orders', 'GET /api/products', 'POST /api/payments', 'GET /api/users/:id', 'POST /api/checkout', 'GET /api/shipments', 'POST /api/reviews'][Math.floor(Math.random() * 7)];

    const spans: Span[] = [];
    const spanCount = Math.floor(Math.random() * 8) + 3;

    for (let j = 0; j < spanCount; j++) {
      const spanStartTime = startTime + (duration / spanCount) * j;
      spans.push({
        spanId: `span-${i}-${j}`,
        traceId,
        parentSpanId: j > 0 ? `span-${i}-${j - 1}` : undefined,
        operationName: ['Query DB', 'Call Payment API', 'Cache lookup', 'Validate token', 'Process request', 'Send notification', 'Log event'][j % 7],
        serviceName: services[Math.floor(Math.random() * services.length)].name,
        startTime: spanStartTime,
        duration: (duration / spanCount) * 0.9,
        status: status === 'success' ? 'success' : Math.random() > 0.5 ? 'error' : 'warning',
      });
    }

    traces.push({
      id: `trace-${i}`,
      traceId,
      spanId: `span-${i}-0`,
      operationName,
      serviceName: 'API Gateway',
      startTime,
      duration,
      status,
      spans,
      errors: status !== 'success' ? ['Request timeout', 'Service unavailable', 'Invalid input'][Math.floor(Math.random() * 3)] : undefined,
    });
  }

  return traces;
}

function generateLogs(count: number, timeRange: number): Log[] {
  const logs: Log[] = [];
  const now = Date.now();
  const levels: Array<'info' | 'warn' | 'error' | 'debug'> = ['info', 'info', 'info', 'warn', 'error', 'debug'];
  const messages = [
    'User login successful',
    'Payment processed',
    'Order shipped',
    'Database connection timeout',
    'Cache miss',
    'Invalid API key',
    'High memory usage detected',
    'Request rate limit exceeded',
    'Service health check passed',
    'File upload started',
    'Email sent to user',
    'Product inventory updated',
    'Authentication failed',
    'Transaction rolled back',
    'Background job completed',
  ];

  for (let i = 0; i < count; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    logs.push({
      id: `log-${i}`,
      timestamp: now - Math.random() * timeRange,
      level,
      service: services[Math.floor(Math.random() * services.length)].name,
      message: messages[Math.floor(Math.random() * messages.length)],
      traceId: Math.random() > 0.3 ? `trace-${Math.floor(Math.random() * 100)}` : undefined,
      context: {
        userId: `user-${Math.floor(Math.random() * 1000)}`,
        requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
        environment: 'production',
      },
    });
  }

  return logs;
}

function generateMetrics(timeRange: number): Metric[] {
  const metrics: Metric[] = [];
  const now = Date.now();
  const interval = 60000; // 1 minute
  const metricTypes = [
    { name: 'cpu_usage', unit: '%' },
    { name: 'memory_usage', unit: 'MB' },
    { name: 'request_duration', unit: 'ms' },
    { name: 'error_rate', unit: '%' },
    { name: 'requests_per_second', unit: 'req/s' },
    { name: 'latency_p99', unit: 'ms' },
    { name: 'queue_depth', unit: 'items' },
    { name: 'active_connections', unit: 'conn' },
  ];

  for (let t = 0; t < timeRange / interval; t++) {
    for (const service of services) {
      for (const metricType of metricTypes) {
        let value = 0;
        if (metricType.name === 'cpu_usage') value = 20 + Math.random() * 60;
        else if (metricType.name === 'memory_usage') value = 500 + Math.random() * 2000;
        else if (metricType.name === 'request_duration') value = 50 + Math.random() * 400;
        else if (metricType.name === 'error_rate') value = Math.random() * 5;
        else if (metricType.name === 'requests_per_second') value = service.rps * (0.8 + Math.random() * 0.4);
        else if (metricType.name === 'latency_p99') value = service.latency * (1 + Math.random() * 0.5);
        else if (metricType.name === 'queue_depth') value = Math.floor(Math.random() * 100);
        else if (metricType.name === 'active_connections') value = Math.floor(Math.random() * 500);

        metrics.push({
          timestamp: now - timeRange + t * interval,
          serviceName: service.name,
          name: metricType.name,
          value: Math.round(value * 100) / 100,
          unit: metricType.unit,
        });
      }
    }
  }

  return metrics;
}

// Public data generators
let cachedTraces: Trace[] | null = null;
let cachedLogs: Log[] | null = null;
let cachedMetrics: Metric[] | null = null;

export function getTraces(timeRangeHours: number = 24): Trace[] {
  const timeRange = timeRangeHours * 60 * 60 * 1000;
  if (!cachedTraces) {
    cachedTraces = generateTraces(750, timeRange); // 500-1000 traces
  }
  return cachedTraces.filter((t) => t.startTime > Date.now() - timeRange);
}

export function getLogs(timeRangeHours: number = 24): Log[] {
  const timeRange = timeRangeHours * 60 * 60 * 1000;
  if (!cachedLogs) {
    cachedLogs = generateLogs(1500, timeRange); // 1000+ logs
  }
  return cachedLogs.filter((l) => l.timestamp > Date.now() - timeRange);
}

export function getMetrics(timeRangeHours: number = 24): Metric[] {
  const timeRange = timeRangeHours * 60 * 60 * 1000;
  if (!cachedMetrics) {
    cachedMetrics = generateMetrics(timeRange);
  }
  return cachedMetrics.filter((m) => m.timestamp > Date.now() - timeRange);
}

export function getServices(): Service[] {
  return services;
}

export function getSampleDatasets(): SampleDataset[] {
  return [
    {
      id: 'ecommerce',
      name: 'Sample eCommerce Orders',
      description: 'Sample data, visualizations, and dashboards for tracking eCommerce orders with complete observability signals.',
      icon: '🛒',
      traces: 892,
      logs: 5234,
      metrics: 1200,
    },
    {
      id: 'flights',
      name: 'Sample Flight Data',
      description: 'Sample data, visualizations, and dashboards for monitoring flight routes and travel operations.',
      icon: '✈️',
      traces: 456,
      logs: 2100,
      metrics: 680,
    },
    {
      id: 'observability',
      name: 'Sample Observability Logs, Traces, Metrics',
      description: 'Correlated observability signals for an e-commerce application in OpenTelemetry standard (Compatible with 2.13+ OpenSearch domains).',
      icon: '📊',
      traces: 1234,
      logs: 8900,
      metrics: 2500,
    },
    {
      id: 'weblogs',
      name: 'Sample Web Logs',
      description: 'Sample data, visualizations, and dashboards for monitoring web logs and traffic patterns.',
      icon: '🌐',
      traces: 567,
      logs: 4560,
      metrics: 950,
    },
  ];
}

export function searchTraces(query: string, timeRangeHours: number = 24): Trace[] {
  const traces = getTraces(timeRangeHours);
  const lowerQuery = query.toLowerCase();
  return traces.filter(
    (t) =>
      t.operationName.toLowerCase().includes(lowerQuery) ||
      t.serviceName.toLowerCase().includes(lowerQuery) ||
      t.traceId.includes(query) ||
      t.errors?.some((e) => e.toLowerCase().includes(lowerQuery))
  );
}

export function searchLogs(query: string, timeRangeHours: number = 24): Log[] {
  const logs = getLogs(timeRangeHours);
  const lowerQuery = query.toLowerCase();
  return logs.filter(
    (l) =>
      l.message.toLowerCase().includes(lowerQuery) ||
      l.service.toLowerCase().includes(lowerQuery) ||
      l.level.includes(lowerQuery) ||
      l.traceId?.includes(query)
  );
}

export function getTraceById(traceId: string): Trace | undefined {
  return getTraces(24).find((t) => t.traceId === traceId);
}

export function getLogsByTraceId(traceId: string): Log[] {
  return getLogs(24).filter((l) => l.traceId === traceId);
}

export function getMetricsByService(serviceName: string, timeRangeHours: number = 24): Metric[] {
  return getMetrics(timeRangeHours).filter((m) => m.serviceName === serviceName);
}

export function getDashboardStats(timeRangeHours: number = 24) {
  const traces = getTraces(timeRangeHours);
  const logs = getLogs(timeRangeHours);

  const totalTraces = traces.length;
  const successTraces = traces.filter((t) => t.status === 'success').length;
  const errorTraces = traces.filter((t) => t.status === 'error').length;
  const avgDuration = Math.round(traces.reduce((sum, t) => sum + t.duration, 0) / traces.length);
  const p99Duration = traces
    .map((t) => t.duration)
    .sort((a, b) => a - b)[Math.ceil(traces.length * 0.99)];

  const errorRate = ((errorTraces / totalTraces) * 100).toFixed(2);
  const errorLogs = logs.filter((l) => l.level === 'error').length;

  return {
    totalTraces,
    successTraces,
    errorTraces,
    avgDuration,
    p99Duration,
    errorRate,
    errorLogCount: errorLogs,
    totalLogs: logs.length,
  };
}
