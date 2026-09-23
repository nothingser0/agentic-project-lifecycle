# Observability Guide — Metrics, Logs, Traces

**Purpose:** Set up production-grade observability (monitoring + alerting) before launch, not after incidents.

**When to run:** Phase 6 (Build Setup), before first production deploy.

---

## The Three Pillars

| Pillar | Answers | Example |
|--------|---------|----------|
| **Metrics** | "Is the system healthy? How fast? How much?" | Response time, error rate, CPU usage |
| **Logs** | "What happened? Why did this request fail?" | Error stack traces, user actions |
| **Traces** | "Where did the time go? Which service is slow?" | Request flow across microservices |

**Anti-pattern:** Logging alone without metrics = drowning in noise without trends.

---

## Observability Stack by Tier

| Tier | Metrics | Logs | Traces | Alerting |
|------|---------|------|--------|----------|
| **Small** | None (optional: free tier Sentry) | Console logs | None | None |
| **Medium** | Prometheus + Grafana OR Datadog free tier | Structured logs (Pino/Winston) + Loki/Papertrail | Optional (Sentry Performance) | Email/Slack on critical errors |
| **Large** | Prometheus + Grafana OR commercial APM | ELK/Loki + correlation IDs | OpenTelemetry + Jaeger/Tempo | PagerDuty/Opsgenie |
| **Enterprise** | Full APM (Datadog/New Relic/Dynatrace) | Centralized SIEM | Distributed tracing mandatory | On-call rotation + runbooks |

---

## SLI, SLO, SLA

### Definitions

- **SLI (Service Level Indicator):** Metric you measure (e.g., "95th percentile response time")
- **SLO (Service Level Objective):** Target for that metric (e.g., "p95 < 500ms")
- **SLA (Service Level Agreement):** Contract with penalty (e.g., "99.9% uptime or refund")

**Rule:** SLO is stricter than SLA. If SLO = SLA, you have no error budget.

### Example SLIs/SLOs (Medium+ projects)

| Service Type | SLI | SLO | SLA |
|--------------|-----|-----|-----|
| **API (user-facing)** | Request success rate | ≥ 99.5% | ≥ 99% (customer-facing) |
| **API (user-facing)** | p95 response time | < 500ms | < 1s |
| **API (user-facing)** | p99 response time | < 2s | < 5s |
| **Background job** | Job success rate | ≥ 99% | N/A |
| **Database** | Query p95 latency | < 100ms | N/A |
| **Realtime (WebSocket)** | Message delivery latency p95 | < 200ms | N/A |

**Error budget:**

```
Error budget = 1 - SLO

Example:
SLO = 99.9% uptime
Error budget = 0.1% = 43 minutes downtime/month

If you burn through error budget in Week 1 → freeze deploys, fix reliability first.
```

---

## Metrics Setup

### What to Measure (Golden Signals)

**Google SRE's 4 Golden Signals:**

1. **Latency:** How long does a request take?
2. **Traffic:** How many requests per second?
3. **Errors:** How many requests fail?
4. **Saturation:** How full are your resources (CPU, memory, disk)?

**Additional for web apps:**

5. **Availability:** Is the service up? (uptime %)
6. **Database metrics:** Connection pool usage, query latency, slow queries
7. **Business metrics:** Signups, checkouts, active users (custom counters)

### Instrument Your App (Node.js + Prometheus)

**Install:**

```bash
npm install prom-client
```

**Setup (app.ts):**

```typescript
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

// Collect default Node.js metrics (event loop lag, memory, etc.)
collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5], // 100ms, 500ms, 1s, 2s, 5s
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Middleware: measure every request
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.labels(req.method, route, res.statusCode.toString()).observe(duration);
    httpRequestTotal.labels(req.method, route, res.statusCode.toString()).inc();
  });
  
  next();
});

// Expose /metrics endpoint for Prometheus scraping
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

**Verify:**

```bash
curl http://localhost:3000/metrics

# Should show:
# http_request_duration_seconds_bucket{le="0.5",method="GET",route="/api/users",status_code="200"} 42
# http_requests_total{method="GET",route="/api/users",status_code="200"} 100
```

### Prometheus + Grafana (Self-Hosted)

**Docker Compose:**

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'
  
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      # NEVER hardcode passwords in docker-compose. Pass via .env or secrets manager
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:?GRAFANA_ADMIN_PASSWORD must be set in .env}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/path/to/data/grafana
      - ./grafana-dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana-datasources.yml:/etc/grafana/provisioning/datasources/datasources.yml
    depends_on:
      - prometheus

volumes:
  prometheus-data:
  grafana-data:
```

**Prometheus config:**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'app'
    static_configs:
      - targets: ['host.docker.internal:3000'] # Your app's /metrics endpoint
  
  - job_name: 'node-exporter' # Optional: system metrics
    static_configs:
      - targets: ['node-exporter:9100']
```

**Grafana datasource:**

```yaml
# grafana-datasources.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
```

**Start:**

```bash
docker-compose -f docker-compose.monitoring.yml up -d

# Access:
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
```

**Import dashboard:**

Grafana UI → Dashboards → Import → ID `1860` (Node Exporter Full) or `11159` (Nginx + Node.js)

---

## Structured Logging

### Why Structured Logs?

**Bad (unstructured):**

```typescript
console.log(`User ${userId} checked out with total $${total}`);
// Output: "User 123 checked out with total $45.99"
// Problem: Can't query "all checkouts > $100" easily
```

**Good (structured):**

```typescript
logger.info({ userId, action: 'checkout', total, currency: 'USD' }, 'Checkout completed');
// Output: {"level":30,"time":1695654321,"userId":123,"action":"checkout","total":45.99,"msg":"Checkout completed"}
// Benefit: Can filter/aggregate in log aggregator
```

### Setup (Node.js + Pino)

**Install:**

```bash
npm install pino pino-pretty
```

**Config (logger.ts):**

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  }),
});
```

**Usage:**

```typescript
import { logger } from './logger';

// Info log
logger.info({ userId, action: 'login' }, 'User logged in');

// Error log (includes stack trace automatically)
try {
  await chargePayment(userId, amount);
} catch (err) {
  logger.error({ err, userId, amount }, 'Payment failed');
  throw err;
}

// Child logger (adds context to all logs)
const reqLogger = logger.child({ requestId: req.id });
reqLogger.info({ route: req.path }, 'Request received');
```

### Correlation IDs (Trace Requests)

**Middleware (Express):**

```typescript
import { randomUUID } from 'crypto';

app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('x-request-id', req.id);
  req.log = logger.child({ requestId: req.id });
  next();
});

// Use req.log in all handlers:
app.get('/api/users', async (req, res) => {
  req.log.info({ userId: req.user.id }, 'Fetching users');
  const users = await db.user.findMany();
  res.json(users);
});
```

**Forward to downstream services:**

```typescript
const response = await fetch('https://payment-service.com/charge', {
  method: 'POST',
  headers: {
    'x-request-id': req.id, // Propagate correlation ID
  },
  body: JSON.stringify({ amount }),
});
```

Now you can trace one user request across multiple services by searching logs for `requestId`.

---

## Log Aggregation

### Option 1: Grafana Loki (Self-Hosted)

**Docker Compose (add to monitoring stack):**

```yaml
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml
  
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml

volumes:
  loki-data:
```

**Loki config:**

```yaml
# loki-config.yml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-05-15
      store: boltdb
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 168h

storage_config:
  boltdb:
    directory: /loki/index
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
```

**Promtail config (ship logs to Loki):**

```yaml
# promtail-config.yml
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: app
    static_configs:
      - targets:
          - localhost
        labels:
          job: app
          __path__: /path/to/logs/app/*.log
```

**Query logs in Grafana:**

Add Loki datasource → Explore → LogQL:

```logql
{job="app"} |= "error" | json | level="error"
```

### Option 2: Commercial (Free Tiers)

| Service | Free Tier | Best For |
|---------|-----------|----------|
| **Papertrail** | 50 MB/month, 2-day retention | Small apps, simple logs |
| **Loggly** | 200 MB/day, 7-day retention | Medium apps |
| **Datadog Logs** | 5 GB/month | Integrated with metrics |
| **New Relic Logs** | 100 GB/month | Full APM suite |

**Setup (Papertrail example):**

```bash
# Install syslog forwarder
npm install pino-syslog

# Run app with syslog transport
node app.js | pino-syslog --host logs.papertrailapp.com --port 12345
```

---

## Distributed Tracing

### When You Need Tracing

- **Yes:** Microservices, multiple databases, external API calls
- **No:** Monolith with one database (metrics + logs enough)

### OpenTelemetry (Vendor-Neutral)

**Install:**

```bash
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-jaeger
```

**Setup (tracing.ts):**

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'my-app',
  }),
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown().then(() => console.log('Tracing terminated'));
});
```

**Run app:**

```typescript
// index.ts
import './tracing'; // MUST be first import
import express from 'express';

const app = express();
// ... rest of app
```

**Jaeger (Docker):**

```bash
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 14268:14268 \
  jaegertracing/all-in-one:latest

# Access UI: http://localhost:16686
```

Now every HTTP request, DB query, Redis call is auto-traced.

**Manual span (custom instrumentation):**

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('my-app');

async function processOrder(orderId: string) {
  const span = tracer.startSpan('processOrder');
  span.setAttribute('order.id', orderId);
  
  try {
    await chargePayment(orderId);
    await sendEmail(orderId);
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (err) {
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw err;
  } finally {
    span.end();
  }
}
```

---

## Alerting

### Alert Rules (Prometheus)

**Create alert rules:**

```yaml
# prometheus-alerts.yml
groups:
  - name: app
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m])) /
          sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} over the last 5 minutes."
      
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "p95 latency is {{ $value }}s."
      
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ $labels.job }} has been down for more than 1 minute."

      # Dead Man's Snitch / Heartbeat for Meta-Monitoring (Always Firing)
      - alert: Watchdog
        expr: vector(1)
        labels:
          severity: none
        annotations:
          description: "This is an alert used to ensure the entire alerting pipeline is functional."

      # Multi-Burn-Rate Alert (Google SRE Standard for 99.9% SLO)
      # 14.4x burn rate = 2% of monthly error budget burned in 1 hour -> Page immediately
      - alert: ErrorBudgetBurnRateFast
        expr: |
          (
            sum(rate(http_requests_total{status_code=~"5.."}[1h])) /
            sum(rate(http_requests_total[1h]))
          ) > (14.4 * (1 - 0.999))
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Critical Error Budget Burn Rate (14.4x)"
          description: "Consuming >2% of 30-day error budget in 1 hour. Immediate incident response required."
```

### Meta-Monitoring: Monitoring the Monitors

The greatest operational blindspot is Alertmanager or Prometheus silently crashing. If the monitor is down, it cannot send an alert telling you it is down.

**The Fix: External Dead Man's Snitch**
1. Configure the `Watchdog` alert above, which evaluates to `true` continuously.
2. Alertmanager sends a webhook ping for `Watchdog` every 5 minutes to an external uptime service ([Healthchecks.io](https://healthchecks.io), [Better Uptime](https://betteruptime.com), or PagerDuty Dead Man's Snitch).
3. If Prometheus, Alertmanager, or the host network dies, the external service fails to receive the 5-minute heartbeat and pages the on-call engineer externally via SMS/voice call.

**Update prometheus.yml:**

```yaml
rule_files:
  - /etc/prometheus/prometheus-alerts.yml

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

### Alertmanager (Notification Routing)

**Docker Compose (add to monitoring stack):**

```yaml
services:
  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager-data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'

volumes:
  alertmanager-data:
```

**Config:**

```yaml
# alertmanager.yml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

route:
  receiver: 'slack-critical'
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 5m
  repeat_interval: 4h
  routes:
    - match:
        severity: warning
      receiver: 'slack-warning'
    - match:
        severity: critical
      receiver: 'pagerduty'

receivers:
  - name: 'slack-critical'
    slack_configs:
      - channel: '#alerts-critical'
        title: '🚨 {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
  
  - name: 'slack-warning'
    slack_configs:
      - channel: '#alerts-warning'
        title: '⚠️ {{ .GroupLabels.alertname }}'
  
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'
```

### Notification Channels

| Channel | Use Case | Setup |
|---------|----------|-------|
| **Slack** | Team visibility | Webhook URL in Alertmanager |
| **Email** | Non-urgent | SMTP config in Alertmanager |
| **PagerDuty** | On-call rotation | Integration key |
| **Opsgenie** | Enterprise on-call | API key |
| **Discord** | Small teams | Webhook URL (via slack_configs) |

---

## Runbook Template

**Create runbook per alert:**

```markdown
# Runbook: HighErrorRate

**Alert:** Error rate > 5% for 5 minutes

## Triage (5 min)

1. Check Grafana dashboard: http://grafana.example.com/d/app
2. Identify which endpoint has errors:
   ```promql
   topk(5, sum by (route) (rate(http_requests_total{status_code=~"5.."}[5m])))
   ```
3. Check logs for that route:
   ```bash
   kubectl logs -l app=my-app --tail=100 | grep "route=/api/users"
   ```

## Common Causes

- **Database connection pool exhausted** → Check `pg_pool_usage` metric
- **External API timeout** → Check `http_request_duration_seconds` for external calls
- **Unhandled exception** → Check Sentry for new error group

## Mitigation (15 min)

### If DB connection issue:
```bash
# Restart app (triggers reconnect)
kubectl rollout restart deployment/my-app
```

### If external API down:
```bash
# Enable circuit breaker (if implemented)
kubectl set env deployment/my-app CIRCUIT_BREAKER_ENABLED=true
```

### If unknown:
```bash
# Rollback to previous version
kubectl rollout undo deployment/my-app
```

## Escalation

If not resolved in 30 min → Page senior engineer (use PagerDuty escalation policy)

## Post-Incident

- Create post-mortem: `docs/incidents/YYYY-MM-DD-high-error-rate.md`
- Update this runbook with new learnings
```

---

## Capacity Planning & Forecasting

**What:** Predict resource needs (CPU, memory, database, storage) before hitting limits.

**When to use:** Medium+ projects, before major traffic spikes (launches, campaigns).

### Capacity Planning Models

#### 1. Historical Trend Analysis

**Method:** Extrapolate from past growth.

**Formula:**
```
Next month capacity = Current usage × (1 + monthly_growth_rate)

Example:
Current CPU: 40%
Monthly growth: 15%
Next month forecast: 40% × 1.15 = 46%
3 months forecast: 40% × (1.15)³ = 60.8%
```

**Tool: Prometheus + PromQL**

```promql
# CPU usage trend (30-day growth rate)
rate(container_cpu_usage_seconds_total[30d])

# Predict when CPU hits 80%
predict_linear(container_cpu_usage_seconds_total[7d], 3600 * 24 * 30)
```

#### 2. Load-Based Forecasting

**Method:** Measure resource per user, multiply by expected users.

**Formula:**
```
Required capacity = (Users × Requests_per_user × Resource_per_request) / Instance_capacity

Example:
Users: 10,000
Requests per user per day: 50
CPU per request: 50ms
Daily CPU: 10,000 × 50 × 50ms = 25,000 seconds = 6.94 hours
Instances needed: 6.94 / 24 = 0.29 (round up to 1 instance)

With 2x buffer: 1 × 2 = 2 instances
```

#### 3. Capacity Planning Spreadsheet

```csv
Resource,Current,Per User,Expected Users,Buffer,Required
CPU,40%,0.5%,1000,2x,1000%
Memory,2GB,2MB,1000,2x,4GB
Database,5GB,5MB,1000,2x,10GB
Bandwidth,100GB/mo,100MB/mo,1000,2x,200GB/mo
API calls,10k/day,10/day,1000,2x,20k/day
```

**Google Sheets template:**

https://docs.google.com/spreadsheets/d/example (copy and customize)

#### 4. Threshold Alerting

**Set alerts before hitting limits:**

```yaml
# prometheus-alerts.yml
groups:
  - name: capacity
    rules:
      - alert: HighCPUCapacity
        expr: |
          avg(rate(container_cpu_usage_seconds_total[5m])) > 0.7
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "CPU usage >70%"
          description: "Scale up if trend continues (predict 80% in 7 days)."
      
      - alert: DatabaseNearCapacity
        expr: |
          (pg_database_size_bytes / pg_settings_max_wal_size_bytes) > 0.8
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Database >80% capacity"
          description: "Add storage or archive old data."
      
      - alert: RateLimitNearExhaustion
        expr: |
          sum(rate(api_requests_total[1h])) / api_rate_limit > 0.9
        for: 15m
        labels:
          severity: critical
        annotations:
          summary: "API rate limit >90% used"
          description: "Upgrade plan or optimize request volume."
```

#### 5. Graceful Degradation — the Complement to Forecasting, Not a Replacement

**Why this section exists:** every model above (1-4) is forecasting-based — it assumes
growth is smooth enough to extrapolate or plan for in advance. None of them help
against a genuinely sudden, non-linear spike (content goes viral, a launch massively
outperforms projections, a competitor's outage sends their traffic to you). Auto-scaling
reacts to load, but it isn't instant: a new instance still needs to boot, warm its
cache, and open database connections, and a database connection pool or a cold CDN
cache can take longer to catch up than the spike takes to arrive. Capacity planning
that only forecasts, with no plan for the gap while scaling catches up, will still go
down during exactly the traffic event that matters most.

**Required for Medium+ projects with public-facing traffic:** define at least one
graceful-degradation mechanism *before* it's needed, not improvised during the
incident:

- **Feature flags to shed non-critical load.** Identify, in advance, which features
  are non-essential under load (recommendation engines, non-critical analytics
  events, image processing pipelines, "related items" widgets) and wire them behind a
  flag that can be flipped off in seconds — not redeployed — to free capacity for
  core flows (checkout, login, the primary read path).
- **Queue-based backpressure for write-heavy spikes.** Instead of every write hitting
  the database synchronously, accept the write into a queue (SQS, Redis Streams, a
  simple DB-backed job table) and process it at a rate the database can sustain. The
  user sees "your submission is being processed" instead of a 500 error, and the
  database never receives more concurrent writes than it can handle.
- **A pre-approved "read-only mode" runbook** for database-saturation scenarios: a
  documented, tested procedure to serve cached/read-replica data and disable writes
  temporarily, rather than the whole site going down when the primary database
  saturates. This must be rehearsed (a tabletop walkthrough counts) before it's
  needed — the first time anyone reads this runbook should not be during the incident.

None of this replaces auto-scaling or the forecasting models above — it's what buys
time while scaling catches up, and what keeps the site partially functional instead of
fully down for the minutes-to-tens-of-minutes a cold scale-up takes.

### Resource Scaling Triggers (Auto-Scale)

**Horizontal Pod Autoscaler (K8s):**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70  # Scale up if CPU >70%
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80  # Scale up if memory >80%
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60  # Wait 60s before scaling up
      policies:
      - type: Percent
        value: 50  # Add 50% more pods
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300  # Wait 5min before scaling down
      policies:
      - type: Pods
        value: 1  # Remove 1 pod at a time
        periodSeconds: 60
```

**Vercel/Railway auto-scale:**

- Vercel: Automatic (serverless, scales to zero)
- Railway: Manual trigger (scale up/down in dashboard)
- Fly.io: `fly scale count 5` (manual) or `fly autoscale set min=2 max=10`

### Capacity Planning Runbook

```markdown
# Capacity Planning Runbook

**Review frequency:** Monthly (Small/Medium), Weekly (Large+)

## Current Capacity (as of 2026-09-22)

| Resource | Current | Limit | Usage % | Forecast (3mo) | Action Needed |
|----------|---------|-------|---------|----------------|---------------|
| CPU | 40% | 100% | 40% | 60% | None (OK) |
| Memory | 2GB | 4GB | 50% | 3GB | Monitor |
| Database | 5GB | 10GB | 50% | 8GB | Add 10GB in 2 months |
| API calls | 10k/day | 50k/day | 20% | 15k/day | None (OK) |

## Growth Metrics (Last 30 Days)

- Users: 500 → 650 (+30%)
- API requests: 8k/day → 10k/day (+25%)
- Database: 4GB → 5GB (+25%)

## Action Items

- [ ] **2026-11-01:** Add 10GB database storage (forecast: 8GB/10GB = 80%)
- [ ] **2026-10-15:** Review auto-scaling config (CPU spike to 70% last week)
- [ ] Monitor: API rate limit (forecast: 15k/50k = 30%, safe)

## Next Review

**Date:** 2026-10-22 (1 month)
**Owner:** DevOps team
```

---

## Checklist: Observability Setup

**Before first production deploy:**

- [ ] Metrics endpoint `/metrics` exposed
- [ ] Prometheus scraping app metrics
- [ ] Grafana dashboard imported (1860 or custom)
- [ ] Structured logging implemented (Pino/Winston + JSON format)
- [ ] Correlation IDs added to all requests
- [ ] Log aggregation configured (Loki/Papertrail/Datadog)
- [ ] At least 3 alert rules defined (error rate, latency, uptime)
- [ ] Alertmanager routes to Slack/email
- [ ] Runbook created for each critical alert
- [ ] Error tracking setup (Sentry/Rollbar)
- [ ] Traces enabled (if microservices/multiple DBs)

**Optional (Large+):**

- [ ] On-call rotation configured (PagerDuty)
- [ ] SLO dashboard created
- [ ] Error budget tracking automated
- [ ] Chaos experiments run (component failure, network partition)

---

**Integration with gates:**

Update `engine/GATE-REGISTRY.md`:

```markdown
### gate:production-deploy

**Evidence:**
- UAT passed
- Security checklist passed
- Performance budget not exceeded
- Design validation passed
- **Observability checklist completed** ← NEW
- Rollback plan documented
- Runbooks created for critical alerts

**Blocker:** Cannot deploy to production if no alerting configured (Medium+ projects).
```

---

**Agent instruction:**

Before marking Phase 6 (Build Setup) complete for Medium+ projects:

1. Set up metrics endpoint with Golden Signals instrumented
2. Configure structured logging with correlation IDs
3. Set up at least 3 alert rules (error rate, latency, uptime)
4. Create Slack/email notification channel
5. Write runbook for each critical alert
6. Verify alerts fire correctly (trigger test alert)

Do not skip observability setup even if timeline is tight — you can't fix what you can't see.
