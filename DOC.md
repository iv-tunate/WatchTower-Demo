# WatchTower — Observability Platform

> Know exactly what's happening inside your systems, before your customers do.

WatchTower is an observability platform that gives your engineering team real-time visibility into every request, log, and metric across your stack. Whether you run a single web app or a multi-service backend, WatchTower brings all your monitoring data into one place.

---

## What It Does

WatchTower covers four pillars of observability in one dashboard:

| | What You Get |
|---|---|
| **Tracing** | Follow every request end-to-end, across every service it touches |
| **Logs** | Search and filter your application logs in real-time, with direct links to traces |
| **Metrics** | CPU, memory, latency, error rates, and throughput — charted over time |
| **Synthetics** | Automated uptime checks from 5 global locations, running every minute |

---

## Features

### Overview Dashboard
The main landing page. At a glance you'll see:
- Total requests, average latency, success rate, and error rate for the selected time window
- Request volume trend chart, error distribution, HTTP status code breakdown, and top endpoints
- A live service health map showing all your connected services with their current status

### Distributed Traces
Every request leaves a trail. WatchTower captures it:
- Search traces by operation name or trace ID
- Filter by service or status (success / error / slow)
- Click any trace to open a waterfall view showing every span, its duration, and which service handled it
- Jump from a log line directly into the related trace

### Logs & Events
- Live log stream from all connected services
- Filter by level: DEBUG, INFO, WARN, ERROR
- Full-text search across all messages
- Click any log entry to expand a structured JSON view with host, container ID, and trace correlation

### System Metrics
- CPU and memory charts with traffic-light colour coding — green means healthy, amber means watch it, red means act now
- P50 and P99 latency side-by-side, so you can see outliers immediately
- Requests per second across all services
- Switch between 1h, 7d, and 30d views with one click

### Service Topology
A dedicated view for each service in your system:
- Health card showing uptime %, error rate, latency, throughput, and a live sparkline
- Click any service for a deeper look: 24-hour throughput and error rate charts, and recent traces scoped to just that service
- Database services include a query type breakdown (SELECT / INSERT / UPDATE / DELETE)

### Alerts
- All your configured alert rules in one view, showing whether they're currently OK or triggered
- Click any alert to see a time-series chart of the metric, with the threshold breach highlighted
- Notifications can be sent to Slack or PagerDuty — configure in Settings

### Synthetics & Uptime
- 5 global probe locations check your endpoints every minute
- 30-day uptime %, response latency, and time-since-last-check per monitor
- Catch regional outages before your users do

---

## Running the Demo

### Requirements
- Node.js 18+
- pnpm (or npm / yarn)

### Start
```bash
git clone https://github.com/your-org/watchtower.git
cd watchtower
pnpm install
pnpm dev
```

Open **http://localhost:3000** and the dashboard loads with realistic mock data straight away.

### Try the Sample Datasets
Head to **Sample Data** in the sidebar to load a themed demo dataset. Four options are available:

| Dataset | What It Simulates |
|---|---|
| eCommerce Platform | Checkout flows, product catalog, payment processing |
| SaaS Application | Auth, user management, billing, and API calls |
| Fintech / Banking API | Payments, fraud detection, KYC checks, ledger entries |
| IoT / Event Stream | High-volume device telemetry and real-time alerting |

Click **Import Dataset**, wait a second, and every chart and table in the dashboard updates. No restart needed.

---

## Connecting Your Real Systems

WatchTower uses **OpenTelemetry** — a vendor-neutral, open standard for observability data. If your application can emit OpenTelemetry data, it works with WatchTower.

### Step 1 — Instrument your app

**Node.js / TypeScript**
```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```
```js
// Add this before your app starts
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  serviceName: 'my-service',
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

**Python**
```bash
pip install opentelemetry-distro
opentelemetry-bootstrap -a install
opentelemetry-instrument python app.py
```

Java, Go, .NET, PHP, Ruby — all supported. See [opentelemetry.io/docs](https://opentelemetry.io/docs/) for your language.

### Step 2 — Point it at WatchTower

Set one environment variable in your application:
```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-watchtower-host:4317
```

Your traces, logs, and metrics start flowing into the dashboard automatically.

### Step 3 — Label your environment

In **Settings → Environment Name**, give this deployment a label (e.g. `production`, `staging`). Useful when you're monitoring more than one environment.

---

## Alerts & Notifications

Go to **Settings → Integrations** to connect:

- **Slack** — alert messages are sent to a channel of your choice when a threshold is breached
- **PagerDuty** — pages your on-call engineer immediately for critical incidents

Each alert rule targets a specific service and condition. When triggered, the Alerts tab shows a chart of the metric with the breach point marked.

---

## Settings Reference

| Setting | What It Does |
|---|---|
| Environment Name | Labels this deployment — shown throughout the UI |
| Data Retention | How long to keep historical data (7, 14, 30, or 90 days) |
| Slack Notifications | Webhook URL for alert delivery to Slack |
| PagerDuty | API key for on-call incident escalation |

---
