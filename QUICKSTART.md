# WatchTower Quick Start Guide

## Installation

### Prerequisites
- Node.js 18+ 
- pnpm package manager

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Access the platform at `http://localhost:3000`

---

## First Steps (5 Minutes)

### 1. Explore the Dashboard
- Open [http://localhost:3000](http://localhost:3000)
- Review the **Observability Overview**
- Check stats: Total Traces, Success Rate, Avg Latency, Error Rate
- Examine charts: Request Rate, Error Distribution, Latency Trends
- View the Service Topology grid

### 2. Import Sample Data
- Click **Sample Data** in the sidebar
- Click "Import Dataset" for eCommerce sample
- Explore the 4 different dataset options
- View dataset descriptions and statistics

### 3. Search Traces
- Navigate to **Traces**
- Search for "POST /api/orders" in the search box
- Click on a trace to view details
- Examine the span waterfall visualization

### 4. View Logs
- Go to **Logs**
- Filter by "ERROR" level
- Search for "timeout" or "failed"
- Click service filter to narrow down
- Correlation with trace IDs visible

### 5. Monitor Metrics
- Visit **Metrics**
- Select a service from the filter
- Review CPU Usage, Memory, Latency charts
- Check RPS and Error Rate trends

### 6. Check Service Health
- Open **Services**
- Click on "API Gateway" service
- View service details and metrics
- See dependencies and performance comparison
- Review status of all services in table

### 7. Review Active Alerts
- Click **Alerts**
- See critical, warning, and info alerts
- View recently resolved alerts
- Understand alert severity levels

---

## Navigation

### Sidebar (Desktop)
- **Overview**: System health dashboard
- **Traces**: Distributed tracing explorer
- **Logs**: Log viewer and search
- **Metrics**: Time-series metrics
- **Services**: Service topology
- **Alerts**: Alert management
- **Sample Data**: Pre-built datasets
- **Settings**: Configuration

### Mobile
- Floating action button in bottom right
- Tap to open quick navigation menu
- All pages accessible from menu

### TopBar Controls
- **1h / 7d / 30d**: Quick time range filters
- **Custom**: Date range picker
- **Refresh**: Manual data refresh

---

## Key Features to Try

### Search & Filter
```
Traces: Search by operation, service, or trace ID
Logs: Full-text search + level + service filters
Metrics: Filter by service selection
Services: Click to view details
```

### Time Ranges
```
- 1h: Last hour data
- 7d: Last 7 days
- 30d: Last 30 days
- Custom: Pick your own dates
```

### Interactive Elements
```
Charts: Hover for tooltips
Tables: Click for details
Service Grid: Click to select
Status Badges: Color-coded indicators
```

---

## Common Tasks

### Investigate a Performance Issue
1. Check **Metrics** dashboard
2. Identify slow service
3. Go to **Traces** for that service
4. Look for slow spans in waterfall
5. Check **Logs** for error messages
6. Review **Alerts** for context

### Find Error Causes
1. Visit **Alerts** page
2. Click on error alert
3. Go to **Traces** for that service
4. Search **Logs** for error messages
5. Correlate with metric spikes

### Monitor Service Health
1. Open **Services** page
2. Review status of all services
3. Click on warning/error services
4. Check metrics and dependencies
5. View recent issues in **Alerts**

### Understand Request Flow
1. Go to **Traces**
2. Search for specific operation
3. Click trace to view detail
4. Examine span waterfall
5. See which services handled request

---

## Understanding the Dashboard

### Stat Cards
- **Total Traces**: Number of requests tracked
- **Success Rate**: Percentage of successful requests
- **Avg Latency**: Average request duration
- **Error Rate**: Percentage of failed requests

### Charts
- **Request Rate**: Requests per second over time
- **Error Distribution**: Count by severity level
- **Latency Trends**: P50 vs P99 percentile
- **Service Performance**: RPS by service

### Service Status
- 🟢 **Healthy**: All systems operational
- 🟡 **Warning**: Minor issues detected
- 🔴 **Error**: Critical issues present

---

## Data Explanation

### Trace
A single request flow through your system
- Contains multiple spans
- Tracks latency and status
- Shows service dependencies

### Span
A single operation within a trace
- Part of a trace
- Has duration and status
- Shows parent-child relationships

### Log
A message from your application
- Has severity level (info, warn, error)
- Associated with a service
- Can be correlated with traces

### Metric
A time-series measurement
- CPU, memory, latency, RPS, etc.
- Updated regularly
- Shows trends over time

### Alert
A notification about issues
- Triggered by threshold breaches
- Has severity level
- Can be resolved

---

## Tips & Tricks

### Efficient Searching
- Use short, specific terms
- Try service names: "auth", "payment"
- Try operations: "POST /api/orders"
- Try trace IDs for exact matches

### Understanding Latency
- Check P99 (99th percentile) for performance
- Compare P50 vs P99 trends
- Identify bottlenecks from span durations
- Correlate with log errors

### Alert Investigation Workflow
1. Alert severity tells urgency
2. Service name shows location
3. Timestamp shows when it happened
4. Go to traces/logs around that time
5. Check metrics for correlation

### Performance Analysis
- High CPU = compute intensive
- High Memory = data structure issues
- High Latency = I/O problems
- High Error Rate = logic/dependency issues

---

## Customization

### Change Time Range
Any page: Use 1h/7d/30d buttons in topbar

### Filter Services
**Metrics** page: Select from service dropdown
**Services** page: Click service tile to focus

### Search Data
**Traces**: Search box at top
**Logs**: Search box with level+service filters
**Services**: Click any service card

### Adjust Settings
**Settings** page: 
- Auto-refresh interval
- Notification preferences
- Theme selection
- Integration setup

---

## Understanding Realistic Data

The platform includes hardcoded but realistic data:
- **500-1000 traces** with actual request flows
- **1000+ logs** from multiple services
- **Time-series metrics** with realistic values
- **12+ services** with health status
- **Automatic alerts** based on thresholds

This data mimics a production e-commerce system with:
- API gateway
- Authentication service
- Order processing
- Payments
- Notifications
- And more...

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `?` | Help menu (future) |
| `Ctrl+K` | Command palette (future) |
| `Escape` | Close modals |

---

## Troubleshooting

### No data showing?
- Ensure time range is set (1h, 7d, 30d)
- Try importing sample data
- Refresh the page (Refresh button in topbar)

### Charts not rendering?
- Check browser console for errors
- Try refreshing the page
- Ensure JavaScript is enabled

### Search not working?
- Verify search term exists
- Try broader search (e.g., "POST" instead of "POST /api/orders")
- Check time range filter

### Mobile navigation not appearing?
- Ensure you're on mobile (< 768px width)
- Floating button should appear in bottom right
- Tap to open menu

---

## Next Steps

1. ✅ Explore all 8 pages
2. ✅ Try different time ranges
3. ✅ Test search functionality
4. ✅ Examine different services
5. ✅ Check out different alert severities
6. ✅ Import multiple sample datasets
7. ✅ Configure settings
8. ✅ Review all charts and tables

---

## Support Resources

- **README.md**: Detailed documentation
- **FEATURES.md**: Complete feature list
- **Code comments**: Inline documentation
- **TypeScript types**: Self-documenting code

---

## Key Directories

```
/app              Pages and routes
/components       Reusable UI components
/lib              Data and utilities
  - observability-data.ts  All data generation
/public           Static assets
/styles           Global styling
```

---

## Building on WatchTower

### Add a New Page
1. Create `/app/newpage/page.tsx`
2. Import Sidebar and TopBar
3. Use data from `observability-data.ts`
4. Follow responsive design pattern

### Customize Data
Edit `/lib/observability-data.ts`:
- Service names and counts
- Trace/log generation
- Metric ranges
- Alert thresholds

### Modify Colors
Edit `/tailwind.config.ts`:
- Change color values
- Update theme palette
- Adjust spacing

---

## Demo Talking Points

1. **Real-World Scenarios**: E-commerce, microservices, payments
2. **Complete Observability**: Traces, logs, metrics, services
3. **User-Friendly Interface**: Intuitive navigation, clear data presentation
4. **Production Ready**: Professional design, responsive, performant
5. **Rich Data**: 1000s of traces/logs, realistic distributions
6. **All Features Working**: Every button navigates, every filter works
7. **Responsive Design**: Mobile, tablet, and desktop optimized
8. **Easy to Customize**: Well-documented, modular code

---

## Project Stats

- **Languages**: TypeScript, React, CSS
- **Framework**: Next.js 16
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Pages**: 8 (Overview, Traces, Logs, Metrics, Services, Alerts, Sample Data, Settings)
- **Components**: Custom built for observability
- **Data Points**: 1000s of traces, logs, metrics
- **Services**: 12 realistic microservices
- **Responsive**: Mobile, Tablet, Desktop

---

**Enjoy exploring WatchTower!**

For detailed information, see `README.md` and `FEATURES.md`.
