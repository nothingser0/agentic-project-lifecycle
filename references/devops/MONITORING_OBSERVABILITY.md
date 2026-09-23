# Monitoring & Observability — Phase 5 Production

**Purpose:** Production monitoring setup (errors, performance, logs, alerts).

**Version:** 1.0.0 (2026 tools)

---


## Contents

- [Three Pillars of Observability](#three-pillars-of-observability)
- [1. Error Tracking](#1-error-tracking)
- [2. Performance Monitoring](#2-performance-monitoring)
- [3. Logging](#3-logging)
- [4. Uptime Monitoring](#4-uptime-monitoring)
- [5. Database Monitoring](#5-database-monitoring)
- [6. Cost Monitoring](#6-cost-monitoring)
- [7. Alerts Configuration](#7-alerts-configuration)
- [8. Dashboards](#8-dashboards)
- [9. Incident Response Playbook](#9-incident-response-playbook)
- [10. Monitoring Checklist (Phase 5)](#10-monitoring-checklist-phase-5)
- [Cost Summary](#cost-summary)

## Three Pillars of Observability

```
1. METRICS   → What is happening? (CPU, memory, response time, error rate)
2. LOGS      → Why did it happen? (error stack traces, debug info)
3. TRACES    → How did it happen? (request flow across services)
```

---

## 1. Error Tracking

**Goal:** Catch production errors before users report them.

### Sentry (Recommended)

**Why Sentry:**
- ✅ Free tier: 5K errors/month
- ✅ Source maps (see original TypeScript, not minified JS)
- ✅ User context (which user hit error)
- ✅ Breadcrumbs (user actions before error)
- ✅ Release tracking (which deploy introduced error)

**Setup (Next.js 15):**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,  // 10% of transactions (save quota)
  
  // User context (who hit the error)
  beforeSend(event, hint) {
    // Don't send if user is admin (testing in prod)
    if (event.user?.email?.endsWith('@yourdomain.com')) {
      return null
    }
    return event
  }
})

// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
})
```

**Capture Errors:**

```typescript
// Automatic (unhandled exceptions)
// Sentry catches all uncaught errors automatically

// Manual (handled errors you want to track)
try {
  await generatePayroll(employeeId)
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'payroll', employeeId },
    level: 'error'
  })
  throw error  // Re-throw to show user error message
}
```

**Alerts:**

Configure in Sentry dashboard:
- Error rate > 1% in 5 minutes → Email/Slack
- New error type → Email immediately
- Error count > 100 in 1 hour → PagerDuty (on-call)

---

## 2. Performance Monitoring

**Goal:** Track response times, slow queries, bottlenecks.

### Vercel Analytics (Built-in)

**Metrics:**
- Real User Monitoring (RUM): actual user experience
- Core Web Vitals: LCP, FID, CLS
- Route performance: which pages slow
- Top devices/browsers/countries

**Setup (Zero config for Vercel):**

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

**Custom Events:**

```typescript
import { track } from '@vercel/analytics'

// Track business events
await createEmployee(data)
track('employee_created', { department: data.department })

await generatePayroll(employeeId)
track('payroll_generated', { employeeId, amount })
```

---

### Alternative: Self-Hosted (Grafana + Prometheus)

**For:** Non-Vercel hosting, need full control.

**Stack:**
- **Prometheus:** Metrics storage (time-series DB)
- **Grafana:** Dashboards
- **Node Exporter:** Server metrics (CPU, memory, disk)

**Setup (Docker Compose):**

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - 9090:9090

  grafana:
    image: grafana/grafana:latest
    ports:
      - 3001:3000
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - 9100:9100
```

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'app'
    static_configs:
      - targets: ['localhost:3000']  # Your app metrics endpoint
  
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

**Expose Metrics (Next.js):**

```typescript
// app/api/metrics/route.ts
import { register } from 'prom-client'

export async function GET() {
  const metrics = await register.metrics()
  return new Response(metrics, {
    headers: { 'Content-Type': register.contentType }
  })
}
```

---

## 3. Logging

**Goal:** Debug production issues (structured logs).

### Vercel Logs (Built-in)

**Retention:**
- Hobby: 1 hour
- Pro: 7 days
- Enterprise: 30 days

**Access:**
```bash
vercel logs my-app --since 1h
vercel logs my-app --follow  # Real-time
```

**Structured Logging:**

```typescript
// lib/logger.ts
export function log(level: 'info' | 'warn' | 'error', message: string, meta?: any) {
  console.log(JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta
  }))
}

// Usage
log('info', 'Employee created', { employeeId: 123, department: 'Engineering' })
log('error', 'Payroll generation failed', { employeeId: 456, error: err.message })
```

---

### Alternative: Better Stack (formerly Logtail)

**Why:**
- ✅ 30-day retention (vs Vercel 7-day)
- ✅ Search/filter (by user, error, route)
- ✅ Alerts (error keywords)
- ✅ $5/month (1GB logs)

**Setup:**

```bash
npm install @logtail/next
```

```typescript
// lib/logger.ts
import { Logtail } from '@logtail/next'

const logtail = new Logtail(process.env.LOGTAIL_TOKEN!)

export function log(level: 'info' | 'warn' | 'error', message: string, meta?: any) {
  logtail[level](message, meta)
}
```

---

## 4. Uptime Monitoring

**Goal:** Alert when site is down.

### UptimeRobot (Free)

**Free Tier:**
- 50 monitors
- 5-minute checks
- Email/SMS/Slack alerts

**Setup:**
1. Go to uptimerobot.com
2. Add monitor: https://hris.example.com
3. Alert contacts: email + Slack webhook

**Check:**
- HTTP 200 response
- Response time < 5s
- SSL certificate valid

---

### Alternative: BetterUptime (Prettier UI)

**Free Tier:**
- 10 monitors
- 1-minute checks (faster than UptimeRobot 5-min)
- Unlimited alerts

---

## 5. Database Monitoring

**Goal:** Track slow queries, connection pool, disk usage.

### PostgreSQL (Supabase / Vercel Postgres)

**Supabase Dashboard:**
- Query performance (slowest queries)
- Database size
- Connection count

**Enable pg_stat_statements:**

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slowest queries
SELECT 
  calls,
  total_exec_time / 1000 AS total_time_seconds,
  mean_exec_time / 1000 AS avg_time_seconds,
  query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

**Indexes Missing Alert:**

```sql
-- Find tables with sequential scans (missing index?)
SELECT 
  schemaname,
  tablename,
  seq_scan,
  idx_scan,
  CASE 
    WHEN seq_scan > 0 AND idx_scan = 0 THEN 'Missing index?'
    ELSE 'OK'
  END AS status
FROM pg_stat_user_tables
WHERE seq_scan > 100  -- More than 100 sequential scans
ORDER BY seq_scan DESC;
```

---

## 6. Cost Monitoring

**Goal:** Prevent surprise bills (API usage, database, bandwidth).

### OpenAI API (if using AI features)

**Usage Dashboard:**
https://platform.openai.com/usage

**Set Hard Limit:**
1. Go to Billing → Usage limits
2. Set monthly budget: $50
3. Alert at 80%: $40
4. Hard limit: Reject requests at $50

**Track in Code:**

```typescript
// lib/ai/cost-tracker.ts
import { db } from '@/lib/db'

export async function trackAIUsage(tokens: number, cost: number) {
  await db.insert(aiUsage).values({
    timestamp: new Date(),
    tokens,
    cost,
    date: new Date().toISOString().split('T')[0]  // YYYY-MM-DD
  })
}

export async function getMonthlyAICost() {
  const month = new Date().toISOString().slice(0, 7)  // YYYY-MM
  const result = await db
    .select({ totalCost: sum(aiUsage.cost) })
    .from(aiUsage)
    .where(like(aiUsage.date, `${month}%`))
  
  return result[0].totalCost || 0
}

// Before AI call, check budget
const currentCost = await getMonthlyAICost()
if (currentCost > 50) {
  throw new Error('Monthly AI budget exceeded')
}
```

---

### Vercel Bandwidth

**Monitor:**
Vercel dashboard → Usage → Bandwidth

**Free Tier:** 100GB/month  
**Pro Tier:** 1TB/month

**Optimization:**
- Cloudflare CDN (cache images, static assets)
- Compress images (WebP, AVIF)
- Lazy load (don't load offscreen images)

---

## 7. Alerts Configuration

### Alert Priority Levels

**P0 (Critical — Wake up on-call):**
- Site down (>5 min)
- Error rate >10%
- Database unreachable
- Payment processing failed

**P1 (High — Immediate action):**
- Error rate >5%
- Response time p95 >2s
- Disk usage >90%

**P2 (Medium — Next business day):**
- Error rate >1%
- Response time p95 >1s
- SSL cert expiring <7 days

**P3 (Low — Weekly review):**
- New error type (not critical)
- Slow query detected
- Cost approaching budget

---

### Alert Channels

**Email:** Always (P0-P3)  
**Slack:** P0-P2  
**PagerDuty:** P0 only (on-call rotation)  
**SMS:** P0 only (backup if Slack missed)

**Example Slack Webhook:**

```typescript
// lib/alerts.ts
export async function sendSlackAlert(message: string, level: 'P0' | 'P1' | 'P2' | 'P3') {
  const webhook = process.env.SLACK_WEBHOOK_URL!
  const color = { P0: 'danger', P1: 'warning', P2: '#FFA500', P3: 'good' }[level]
  
  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [{
        color: color,
        title: `🚨 ${level} Alert`,
        text: message,
        footer: 'HRIS System',
        ts: Math.floor(Date.now() / 1000)
      }]
    })
  })
}

// Usage
if (errorRate > 0.1) {
  await sendSlackAlert('Error rate exceeded 10%', 'P0')
}
```

---

## 8. Dashboards

### Grafana Dashboard (Self-Hosted)

**Panels:**

1. **System Health:**
   - CPU usage (%)
   - Memory usage (%)
   - Disk usage (%)
   - Network I/O

2. **Application:**
   - Requests/second
   - Error rate (%)
   - Response time (p50, p95, p99)
   - Active users

3. **Database:**
   - Query time (avg, p95)
   - Connection pool usage
   - Slow queries count
   - Database size

4. **Business Metrics:**
   - Employees created (today, week, month)
   - Attendance clock-ins (today)
   - Leaves approved (week)
   - Payroll generated (month)

---

### Vercel Dashboard (Built-in)

**Sections:**

- **Overview:** Deployments, traffic, errors
- **Analytics:** Page views, visitors, countries
- **Speed Insights:** Core Web Vitals (LCP, FID, CLS)
- **Logs:** Recent logs (7 days)
- **Usage:** Bandwidth, function invocations

---

## 9. Incident Response Playbook

### When Alert Fires

**1. Acknowledge (2 min):**
- Click "Acknowledge" in PagerDuty/Slack
- Check dashboard (Vercel/Grafana)
- Assess severity (P0/P1/P2)

**2. Investigate (5-10 min):**
- Check Sentry (recent errors)
- Check logs (Vercel/BetterStack)
- Check status page (database, external APIs)
- Identify root cause

**3. Mitigate (10-30 min):**
- **If code bug:** Rollback to previous deploy
- **If database slow:** Kill long-running queries
- **If external API down:** Enable fallback/cache
- **If traffic spike:** Scale up (auto-scale or manual)

**4. Resolve (30+ min):**
- Fix root cause (code patch, query optimization)
- Deploy fix
- Verify fix (check metrics)
- Mark incident resolved

**5. Postmortem (24h later):**
- Write incident report (what, why, how fixed)
- Action items (prevent recurrence)
- Update runbook

---

## 10. Monitoring Checklist (Phase 5)

### Week 1: Setup
- [ ] Sentry error tracking
- [ ] Vercel Analytics (or Grafana)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Slack webhook
- [ ] Cost tracking (OpenAI, Vercel)

### Week 2: Alerts
- [ ] Configure alert rules (error rate, response time)
- [ ] Test alerts (trigger manually)
- [ ] Document escalation (who gets P0/P1/P2)

### Week 3: Dashboards
- [ ] Create Grafana dashboard (if self-hosted)
- [ ] Review Vercel dashboard
- [ ] Add business metrics

### Week 4: Runbooks
- [ ] Write incident response playbook
- [ ] Document rollback procedure
- [ ] Test rollback (staging)

### Post-Launch: Weekly Review
- [ ] Review error rate trend
- [ ] Review response time trend
- [ ] Review cost trend
- [ ] Review slow queries
- [ ] Action items from incidents

---

## 11. SLO/SLI/Error Budget (Large+)

**Purpose:** Define reliability targets and manage trade-offs between velocity and stability.

### Service Level Indicators (SLI)

Measurable metric that represents user experience:

| Service | SLI | Target | Measurement |
|---------|-----|--------|-------------|
| API | Request latency p95 | < 200ms | From APM (Sentry, Datadog) |
| Web UI | Time to Interactive | < 2s | Lighthouse CI |
| Background job | Processing time p99 | < 30s | Job queue metrics |
| Availability | Successful requests | > 99.9% | Uptime monitor + error rate |

### Service Level Objectives (SLO)

Target reliability goal over time window:

```
Availability SLO: 99.9% over 30 days
= 43.2 minutes downtime budget per month

Latency SLO: 95% of requests < 200ms over 7 days
```

**How to set SLO:**
1. Measure current performance (baseline)
2. Set target slightly better than baseline (not aspirational)
3. Review quarterly and adjust based on actual user impact

### Error Budget

Allowed failure rate before feature freeze:

```
Error budget = (1 - SLO) × total requests

Example:
SLO = 99.9% uptime
Error budget = 0.1% = 1 in 1000 requests can fail

If 1M requests/month:
Error budget = 1,000 failed requests/month
```

**Error budget policy:**
- Budget > 50% remaining → normal feature velocity
- Budget 20-50% → review incidents, prioritize reliability work
- Budget < 20% → feature freeze, all hands on stability
- Budget exhausted → mandatory postmortem + action items

**Track error budget:**
```javascript
// Example calculation
const totalRequests = 1_000_000;
const slo = 0.999; // 99.9%
const errorBudget = totalRequests * (1 - slo); // 1,000
const actualErrors = 750;
const budgetRemaining = ((errorBudget - actualErrors) / errorBudget * 100).toFixed(1);

console.log(`Error budget: ${budgetRemaining}% remaining`);
// Output: Error budget: 25.0% remaining
```

### Distributed Tracing (Microservices/Multi-service)

**When needed:** 3+ services/functions calling each other.

**Tools:** 
- Jaeger (open-source, self-hosted)
- Zipkin (open-source)
- OpenTelemetry (vendor-agnostic standard)
- Sentry Performance (easiest if already using Sentry)

**Trace example:**
```
[Frontend] 120ms
  → [API Gateway] 80ms
    → [Auth Service] 20ms
    → [Database Query] 50ms ← BOTTLENECK
```

**Implementation (OpenTelemetry + Node.js):**

```bash
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

```javascript
// tracing.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

```javascript
// server.js
require('./tracing'); // Must be first import

const { trace } = require('@opentelemetry/api');
const tracer = trace.getTracer('my-service');

async function handleRequest(req, res) {
  const span = tracer.startSpan('handleRequest');
  
  try {
    const user = await getUser(req.userId);  // Auto-traced
    const data = await fetchData(user.id);   // Auto-traced
    res.json(data);
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: 2 }); // ERROR
    throw error;
  } finally {
    span.end();
  }
}
```

**Viewing traces:**
```bash
# Run Jaeger (Docker)
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 14268:14268 \
  jaegertracing/all-in-one:latest

# Open UI: http://localhost:16686
```

### Apdex Score (Application Performance Index)

Single metric for user satisfaction based on response time:

```
Apdex = (Satisfied + (Tolerating / 2)) / Total Requests

Where:
- Satisfied: response < T (target, e.g. 200ms)
- Tolerating: response < 4T (e.g. 800ms)
- Frustrated: response >= 4T

Score range: 0.0 (terrible) to 1.0 (perfect)
```

**Thresholds:**
- 0.94 - 1.00: Excellent
- 0.85 - 0.93: Good
- 0.70 - 0.84: Fair
- 0.50 - 0.69: Poor
- 0.00 - 0.49: Unacceptable

**Example:**
```
Total requests: 1000
< 200ms: 800 (Satisfied)
200-800ms: 150 (Tolerating)
> 800ms: 50 (Frustrated)

Apdex = (800 + (150 / 2)) / 1000 = 0.875 (Good)
```

**Alert on Apdex < 0.85** (degraded user experience).

---

## Cost Summary

**Free Tier Stack:**
- Sentry: $0 (5K errors/month)
- Vercel Analytics: $0 (built-in Pro)
- UptimeRobot: $0 (50 monitors)
- Slack: $0 (webhook)
- **Total:** $0/month

**Pro Stack:**
- Sentry: $26/month (50K errors)
- Better Stack: $5/month (1GB logs)
- BetterUptime: $0 (10 monitors)
- Grafana Cloud: $0 (14-day retention)
- **Total:** $31/month

---

**Agent: Setup monitoring in Phase 5 (Deployment). Configure alerts before going live.**

**Last Updated:** September 17, 2026  
**Version:** 1.0.0
