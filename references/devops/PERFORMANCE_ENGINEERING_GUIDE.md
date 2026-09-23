# Performance Engineering Guide

**Purpose:** Turn performance requirements into measurable targets, profiling workflows, and optimization decisions. Covers load testing, capacity planning, and performance budgets from prototype through production scale.

Read this when: Q9 (Performance Requirements) is High/Extreme/Real-time, or when a flow feels slow, or before scaling from prototype to production traffic.

## Contents

- [Performance Budget by Tier](#performance-budget-by-tier)
- [Measurement Before Optimization](#measurement-before-optimization)
- [Load Testing Strategy](#load-testing-strategy)
- [Capacity Planning](#capacity-planning)
- [Common Bottlenecks by Layer](#common-bottlenecks-by-layer)
- [Profiling Workflow](#profiling-workflow)
- [Performance Regression Detection](#performance-regression-detection)

## Performance Budget by Tier

| Tier | First Contentful Paint | Time to Interactive | API p95 latency | Concurrent users (prototype → production) |
|------|----------------------|-------------------|----------------|------------------------------------------|
| Small | < 2s | < 4s | < 500ms | 1 → 10 |
| Medium | < 1.5s | < 3s | < 300ms | 10 → 1K |
| Large | < 1s | < 2s | < 200ms | 1K → 100K |
| Enterprise | < 800ms | < 1.5s | < 100ms | 100K+ |

**Real-time requirement override:** WebSocket/SSE latency < 50ms, event processing < 100ms regardless of tier.

## Measurement Before Optimization

**Never optimize without measurement.** Use the fastest available profiler for the runtime:

| Runtime | Profiler | Command |
|---------|----------|----------|
| Node.js | Node --inspect + Chrome DevTools | `node --inspect server.js` → chrome://inspect |
| Python | cProfile + snakeviz | `python -m cProfile -o output.prof script.py && snakeviz output.prof` |
| Browser | Lighthouse + Chrome DevTools Performance tab | `lighthouse http://localhost:3000 --view` |
| Database | EXPLAIN ANALYZE (Postgres) / EXPLAIN (MySQL) | Prefix query with `EXPLAIN ANALYZE` |

**Baseline first:** measure current performance under realistic load before changing anything.

## Load Testing Strategy

### When to Load Test

- Before first production deploy (Medium+)
- After any database schema change affecting queries
- Before scaling infrastructure up/down
- When adding a new high-traffic endpoint

### Tool Selection

| Tool | Use When | Example Command |
|------|----------|----------------|
| **Apache Bench (ab)** | Quick smoke test, single endpoint | `ab -n 1000 -c 10 http://localhost:3000/api/users` |
| **k6** | Scripted scenarios, ramp-up testing | `k6 run load-test.js` |
| **Artillery** | API load testing with complex scenarios | `artillery run scenario.yml` |
| **Locust** | Python-based, distributed load testing | `locust -f locustfile.py` |

### Load Test Baseline (Medium+)

```javascript
// k6 example: load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 10 },   // ramp-up
    { duration: '3m', target: 50 },   // sustained load
    { duration: '1m', target: 0 },    // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],  // 95% requests < 300ms
    http_req_failed: ['rate<0.01'],    // error rate < 1%
  },
};

export default function () {
  let res = http.get('http://localhost:3000/api/posts');
  check(res, {
    'status 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 300,
  });
  sleep(1);
}
```

**Record baseline in `docs/performance/LOAD-TEST-BASELINE.md`:**
```
Date: 2026-09-22
Endpoint: GET /api/posts
Tool: k6
Load: 50 concurrent users, 3 min sustained
Results:
  - p50: 120ms
  - p95: 280ms
  - p99: 450ms
  - Error rate: 0.2%
  - Throughput: 180 req/s
Bottleneck: None detected
```

## Capacity Planning

### Resource Estimation Formula

```
Peak concurrent users = Daily Active Users × Peak hour % × Avg session length (min) / 60

Required requests/sec = Peak concurrent users × Avg requests per session / Avg session length (min) / 60

Required DB connections = (Requests/sec × Avg query time) + buffer (20%)
```

### Capacity Triggers (when to scale up)

| Metric | Warning threshold | Critical threshold | Action |
|--------|------------------|-------------------|--------|
| CPU | > 70% sustained | > 85% | Scale horizontally (add instance) |
| Memory | > 80% | > 90% | Scale vertically (more RAM) or investigate leak |
| DB connections | > 70% of pool | > 90% | Increase pool size or add read replica |
| API latency p95 | > 2x baseline | > 5x baseline | Profile + optimize or scale |
| Error rate | > 1% | > 5% | Incident response, rollback if recent deploy |

### Vertical vs Horizontal Scaling Decision

**Scale vertically (bigger instance) when:**
- Single-threaded bottleneck (Node.js single process)
- Memory-bound workload (large in-memory cache)
- Database with hot partition

**Scale horizontally (more instances) when:**
- Stateless API
- CPU-bound workload (image processing, video encoding)
- Traffic spike exceeds single instance capacity

## Common Bottlenecks by Layer

### Database

**N+1 Query Problem:**
```javascript
// ❌ BAD: N+1 queries
const posts = await db.post.findMany();
for (const post of posts) {
  post.author = await db.user.findUnique({ where: { id: post.authorId } });
}

// ✅ GOOD: Single query with join
const posts = await db.post.findMany({
  include: { author: true }
});
```

**Missing Index:**
```sql
-- Check slow queries (Postgres)
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Add index on frequently filtered columns
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

**Large Result Set:**
- Paginate: `LIMIT` + `OFFSET` or cursor-based
- Stream: use database cursor for large exports
- Aggregate: compute summary server-side, not client-side

### API/Backend

**Synchronous External Calls:**
```javascript
// ❌ BAD: blocking wait
app.post('/webhook', async (req, res) => {
  await sendEmail(req.body.email);  // blocks response
  res.json({ ok: true });
});

// ✅ GOOD: background job
app.post('/webhook', async (req, res) => {
  await queue.add('email', req.body.email);  // non-blocking
  res.json({ ok: true });
});
```

**Lack of Caching:**
- Add HTTP cache headers (`Cache-Control`, `ETag`) for static/rarely-changed responses
- In-memory cache (Redis) for frequently read data (user session, feature flags)
- CDN for static assets

**Large Payload:**
- Paginate lists
- Compress responses (`gzip`, `brotli`)
- Return only requested fields (GraphQL field selection, REST partial response)

### Frontend

**Large Bundle Size:**
```bash
# Analyze bundle
npx vite-bundle-visualizer  # Vite
npx webpack-bundle-analyzer  # Webpack

# Common fixes:
# - Code splitting: dynamic import() at route level
# - Tree shaking: ensure "sideEffects": false in package.json
# - Remove unused dependencies
```

**Unoptimized Images:**
- Use modern formats (WebP, AVIF)
- Serve responsive sizes (`srcset`)
- Lazy load below-the-fold images

**Unnecessary Re-renders (React):**
```javascript
// ❌ BAD: re-renders on every parent render
function Parent() {
  const [count, setCount] = useState(0);
  return <ExpensiveChild data={expensiveComputation()} />;
}

// ✅ GOOD: memoize expensive computation
function Parent() {
  const [count, setCount] = useState(0);
  const data = useMemo(() => expensiveComputation(), []);
  return <ExpensiveChild data={data} />;
}
```

## Profiling Workflow

### 1. Reproduce the Slow Path

Identify the exact user action or API request that feels slow. Measure baseline with real data volume.

### 2. Profile

**Backend (Node.js example):**
```bash
node --inspect server.js
# Open chrome://inspect
# Click "inspect" on the Node process
# Go to Profiler tab → Start
# Reproduce slow request
# Stop → analyze flame graph
```

**Frontend (Chrome DevTools):**
1. Open DevTools → Performance tab
2. Click Record
3. Reproduce slow interaction
4. Stop → analyze waterfall + flame chart

**Database:**
```sql
-- Enable query logging (Postgres)
ALTER DATABASE mydb SET log_min_duration_statement = 100;  -- log queries > 100ms

-- Check slow query log
SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;
```

### 3. Identify Bottleneck

Look for:
- Function consuming >30% of total time in flame graph
- Query with >500ms execution time
- Network request waiting >1s
- Large JSON parse/serialize

### 4. Optimize

Apply fixes from "Common Bottlenecks" above. Measure again to confirm improvement.

### 5. Verify No Regression

Run load test baseline again. Record new results in `LOAD-TEST-BASELINE.md`.

## Performance Regression Detection

### CI Performance Gate (Large+)

Add performance test to CI that fails if regression detected:

```yaml
# .github/workflows/perf.yml
name: Performance Test
on: [pull_request]

jobs:
  perf:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - run: npm run start &
      - run: sleep 5
      - run: |
          k6 run --quiet load-test.js > results.txt
          p95=$(grep 'http_req_duration.*p(95)' results.txt | awk '{print $2}')
          if (( $(echo "$p95 > 300" | bc -l) )); then
            echo "Performance regression: p95 latency $p95 ms > 300ms threshold"
            exit 1
          fi
```

### Lighthouse CI (Frontend)

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Monitoring Baseline (Production)

Set alerts on:
- p95 latency > 2x baseline
- Error rate > 1%
- Apdex score < 0.9 (see `MONITORING_OBSERVABILITY.md`)

---

**Version:** 1.0.0  
**Part of:** Phase 5 (Testing & Performance)  
**Pairs with:** `MONITORING_OBSERVABILITY.md`, `TESTING_STRATEGY_DETAIL.md`, `DEVOPS_DEPLOYMENT_GUIDE.md`
