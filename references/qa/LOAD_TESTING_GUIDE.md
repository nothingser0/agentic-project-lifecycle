# Load Testing Guide — Scale Target Verification

**Purpose:** Verify system meets scale target (Q8) under realistic load before production.

**When to use:** Before production deploy (gate:production-deploy), after performance-sensitive changes.

---

## Scale Target → Load Test Requirement

Map Q8 answer to concrete load test:

| Q8 Scale Target | Concurrent Users | Requests/sec | Test Duration | Tool |
|----------------|------------------|--------------|---------------|------|
| **<1K users** | 50 | 10 rps | 5 min | Manual / Lighthouse CI |
| **1K-10K** | 500 | 100 rps | 15 min | k6, Apache Bench |
| **10K-100K** | 2,000 | 500 rps | 30 min | k6, Gatling |
| **100K-1M** | 10,000 | 2,000 rps | 1 hour | k6 Cloud, Gatling |
| **1M-10M** | 50,000 | 10,000 rps | 2 hours | k6 Cloud, JMeter |
| **10M+** | 100,000+ | 50,000+ rps | 4 hours | Custom infra, AWS Load Testing |

**Rule:** Test at 2x expected peak load to validate headroom.

---

## Tool Selection

### k6 (Recommended Default)

**Why:** Modern, scriptable (JavaScript), good balance of features vs. complexity.

**Install:**
```bash
# macOS
brew install k6

# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /path/to/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/path/to/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

**Basic Load Test Script:**

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp-up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 for 5m
    { duration: '2m', target: 200 },  // Spike to 200
    { duration: '5m', target: 200 },  // Stay at 200
    { duration: '2m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
    errors: ['rate<0.1'],
  },
};

export default function () {
  const res1 = http.get('https://staging.example.com/api/products');
  check(res1, {
    'products loaded': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  const res2 = http.post('https://staging.example.com/api/cart/add', 
    JSON.stringify({ productId: 123, quantity: 1 }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(res2, {
    'add to cart': (r) => r.status === 201,
  }) || errorRate.add(1);

  sleep(2);
}
```

**Run:**
```bash
k6 run load-test.js
```

---

## Performance Budget (Frontend)

**Integrate Lighthouse CI:**

```yaml
# .github/workflows/performance-budget.yml
name: Performance Budget
on:
  pull_request:
    branches: [main, production]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

**lighthouserc.json:**

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "total-blocking-time": ["error", {"maxNumericValue": 300}],
        "interactive": ["error", {"maxNumericValue": 3500}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Budget by Scale Target:**

| Scale | FCP | LCP | CLS | TBT | TTI |
|-------|-----|-----|-----|-----|-----|
| <1K | <2.5s | <3s | <0.1 | <300ms | <4s |
| 1K-10K | <2s | <2.5s | <0.1 | <250ms | <3.5s |
| 10K-100K | <1.8s | <2.5s | <0.05 | <200ms | <3s |
| 100K+ | <1.5s | <2s | <0.05 | <150ms | <2.5s |

---

## Success Criteria (per Scale Tier)

### Small (<1K users)

**Manual verification sufficient:**
- [ ] Homepage loads <3s (Chrome DevTools Network tab)
- [ ] No JS errors in console
- [ ] All critical flows work (login → action → result)

---

### Medium (1K-10K users)

**Automated k6 test required:**

```bash
k6 run --vus 500 --duration 15m load-test.js
```

**Pass criteria:**
- [ ] p95 response time <500ms
- [ ] Error rate <1%
- [ ] No memory leaks (RSS stable over 15min)
- [ ] Database connections <80% pool limit
- [ ] Lighthouse Performance score ≥90

---

### Large (10K-100K users)

**Soak test + spike test required:**

**Soak test (sustained load):**
```bash
k6 run --vus 2000 --duration 30m load-test.js
```

**Spike test (sudden traffic burst):**
```javascript
export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '10s', target: 5000 },  // Spike!
    { duration: '3m', target: 5000 },
    { duration: '1m', target: 100 },
  ],
};
```

**Pass criteria:**
- [ ] Soak test: p95 <500ms for 30min straight
- [ ] Spike test: system recovers <30s after spike ends
- [ ] No 5xx errors
- [ ] Auto-scaling triggered (if enabled)
- [ ] Database query time <100ms (p95)
- [ ] Cache hit rate >80%

---

### Enterprise (100K+ users)

**Multi-region distributed load test:**

```bash
# k6 Cloud (requires account)
k6 cloud load-test.js --vus 10000 --duration 1h
```

**Pass criteria:**
- [ ] p99 response time <1s
- [ ] Error rate <0.1%
- [ ] CDN cache hit rate >95%
- [ ] Database read replicas balanced
- [ ] Zero data loss during load
- [ ] Graceful degradation (non-critical features off, core works)

---

## Integration with Gates

Update `engine/GATE-REGISTRY.md`:

```markdown
### gate:production-deploy (Production Deploy)

**Trigger:** Before deploying to production

**Evidence:**
- UAT passed
- Security checklist passed
- **Performance budget not exceeded** ← EXISTING, now detailed:
  - Lighthouse CI passed (FCP/LCP/CLS/TBT/TTI within budget)
  - Load test passed (k6 script, scale-appropriate VUs/duration)
  - p95 response time <500ms (or tier-specific threshold)
  - Error rate <1%
  - Soak test passed (Medium+ only)
- Design validation passed
- Rollback plan documented

**Blocker:** Cannot deploy if load test fails.
```

---

## Recording Results

In `docs/testing/LOAD-TEST-REPORT.md`:

```markdown
# Load Test Report — Sprint 3

**Date:** 2026-09-22  
**Scale Target:** 10K-100K users (Q8)  
**Tool:** k6 v1.0  

## Test Configuration

- **VUs:** 2,000 concurrent
- **Duration:** 30 minutes (soak test)
- **Endpoint:** https://staging.example.com
- **Test script:** `tests/load-test.js`

## Results

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| p95 response time | <500ms | 385ms | ✅ PASS |
| Error rate | <1% | 0.02% | ✅ PASS |
| Throughput | 500 rps | 547 rps | ✅ PASS |
| Memory usage | Stable | 2.1GB → 2.3GB (stable) | ✅ PASS |
| DB connections | <80% pool | 45/100 (45%) | ✅ PASS |

## Bottlenecks Found

1. **Database N+1 query** on `/api/users/:id/orders`
   - Impact: p95 = 890ms (above budget)
   - Fix: Added eager loading (PR #145)
   - Re-test: p95 = 320ms ✅

2. **Image resizing on-demand** caused CPU spike
   - Impact: Spike test recovery took 45s (target: 30s)
   - Fix: Pre-generate thumbnails at upload (PR #146)
   - Re-test: Recovery <25s ✅

## Recommendations

- Enable Redis cache for `/api/products` (currently 0% cache hit)
- Add read replica for reporting queries
- Consider CDN for static assets (currently served from app server)

## Verdict

✅ **PASSED** — System meets 10K-100K scale target.

**Next test:** After Sprint 5 (payment integration), re-run with checkout flow.
```

---

**Version:** 1.0.0  
**Part of:** Phase 5 (Testing), gate:production-deploy  
**Integrated with:** Q8 (Scale Target), PERFORMANCE_BUDGET_GUIDE.md
