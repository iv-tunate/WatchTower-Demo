# WatchTower — Complete Observability Platform

## Overview
WatchTower is a professional, production-ready observability platform demo built with Next.js. It demonstrates enterprise-grade monitoring for distributed systems with comprehensive trace, logs, metrics, and alert management.

## Key Features Implemented

### Core Observability Pillars
- **Distributed Traces** (750+ traces with waterfall visualization)
  - Click any trace to view detailed span analysis
  - Parent-child span relationships
  - Latency breakdown per span
  - Correlated logs for each trace
  
- **Logs & Events** (1500+ logs across 24 hours)
  - Full-text search with real-time filtering
  - Filter by log level (DEBUG, INFO, WARN, ERROR)
  - Trace correlation - click logs to view related traces
  - Service-specific log viewing
  
- **System Metrics** (24 hours of continuous metrics)
  - CPU utilization trending
  - Memory usage patterns
  - Latency percentiles (P50, P99)
  - Request throughput (RPS)
  - Error rate monitoring
  
- **Service Monitoring** (12 generic microservices)
  - Click any service to drill into details
  - Per-service metrics and traces
  - Uptime/availability tracking
  - Instance count and throughput
  - Health status indicators

### Advanced Features
- **Alerts & Anomalies** - 8 pre-configured alert rules with triggered states
- **Saved Dashboards** - 6 dashboard templates (System Overview, API Performance, Infrastructure, Error Analysis, Database Health, Distributed Tracing)
- **Service Topology** - Visual health map of all services with status indicators
- **Time Range Filtering** - Click 1h, 7d, 30d, Custom to filter all data by time
- **Responsive Search** - Filter traces and logs in real-time
- **Settings Page** - Cluster configuration, data retention, integrations

### User Experience
- **Scrollable Sidebar** - All services and settings visible, fully scrollable
- **Dark/Light Mode Toggle** - Switch themes with button in sidebar
- **Clickable Everything**:
  - Services → View service details, metrics, related traces
  - Traces → View waterfall visualization, span details, correlated logs
  - Logs → Click to view related trace if available
  - Alert rules → View triggered state and thresholds
  
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Professional CSS** - Clean dark theme (with light mode support) inspired by OpenSearch Observability Plugin

## Data Structure

### Services (12 microservices)
- API Gateway, Auth Service, Database, Cache Layer
- Message Queue, Search Engine, Background Workers, Log Aggregator
- Metrics Store, Trace Collector, Load Balancer, CDN

### Data Generation
- **Traces**: 750 distributed traces with 2-14 spans each, realistic latency patterns
- **Logs**: 1500 structured logs with timestamps, levels, services, and trace correlation
- **Metrics**: 24 hours of metrics (CPU, memory, latency, RPS, error rate)
- **Alerts**: 8 configurable alert rules with current trigger states

### Time Range Filtering
- 1h: Last hour of data
- 7d: Last 7 days (default)
- 30d: Last 30 days
- Custom: Configurable time windows

## Navigation Structure

### Main Views
1. **Overview** - System health, stats, service map, recent traces
2. **Traces** - Full trace list with search and service filtering
3. **Logs** - Log stream with level filters and search
4. **Metrics** - CPU, memory, latency, and RPS charts
5. **Alerts** - Alert rules with triggered states
6. **Dashboards** - Pre-built dashboard templates
7. **Settings** - Configuration and integrations

### Detail Pages
- **Trace Details** - Click any trace to view waterfall, spans, and correlated logs
- **Service Details** - Click any service to view metrics, traces, and health

## Design System
- **Dark Theme**: Professional #070b14 base with cyan accents (#00d4ff)
- **Light Theme**: Clean #f8fafc base with blue accents (#0084ff)
- **Color Scheme**:
  - Success: #10b981 (green)
  - Warning: #f59e0b (amber)
  - Danger: #ef4444 (red)
  - Accent: #00d4ff (cyan) / #0084ff (blue in light mode)

## Responsive Breakpoints
- Mobile: Sidebar hidden, full-width content, stacked charts
- Tablet: 768px+, sidebar visible, grid adjustments
- Desktop: Full layout with all features visible

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Pure CSS with CSS variables for theming
- **Data**: Generated in-memory data structure with filtering
- **State Management**: React hooks (useState, useMemo)

## For Client Presentations
This demo includes:
✓ Realistic monitoring data (750+ traces, 1500+ logs)
✓ Generic microservices (not e-commerce specific)
✓ Working filters and search across all data
✓ Trace-to-log correlation
✓ Service drill-down views
✓ Alert management
✓ Professional UI/UX
✓ Dark and light mode
✓ Fully responsive
✓ Time range controls that actually work
✓ Comprehensive metrics with trending charts

Perfect for demonstrating observability capabilities to potential customers.
