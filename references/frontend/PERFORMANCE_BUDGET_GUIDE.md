# Performance Budget Guide — Enforced Metrics

**Purpose:** Prevent performance regression by setting hard limits on web vitals.

**When to set:** Phase 2 (Architecture), before Sprint 1 starts

**When to enforce:** Every PR that touches frontend code

---

## Web Vitals Budget (Default)

| Metric | Target (Good) | Acceptable (Warn) | Fail (Block) | Description |
|--------|---------------|-------------------|--------------|-------------|
| **LCP** | ≤ 2.5s | ≤ 4.0s | > 4.0s | Largest Contentful Paint (main content visible) |
| **FID** | ≤ 100ms | ≤ 300ms | > 300ms | First Input Delay (interaction responsiveness) |
| **CLS** | ≤ 0.1 | ≤ 0.25 | > 0.25 | Cumulative Layout Shift (visual stability) |
| **FCP** | ≤ 1.8s | ≤ 3.0s | > 3.0s | First Contentful Paint (first pixel painted) |
| **TTFB** | ≤ 600ms | ≤ 1.0s | > 1.0s | Time to First Byte (server response) |
| **TBT** | ≤ 200ms | ≤ 600ms | > 600ms | Total Blocking Time (main thread blocking) |

**Source:** Google Web Vitals (https://web.dev/vitals/)

---

## Asset Size Budget

| Asset Type | Target | Max (Warn) | Fail (Block) |
|------------|--------|------------|-------------|
| **Initial JS** | ≤ 200 KB | ≤ 350 KB | > 500 KB |
| **Initial CSS** | ≤ 50 KB | ≤ 100 KB | > 150 KB |
| **Images (per page)** | ≤ 500 KB | ≤ 1 MB | > 2 MB |
| **Fonts** | ≤ 100 KB | ≤ 200 KB | > 300 KB |
| **Total page weight** | ≤ 1 MB | ≤ 2 MB | > 3 MB |

**Measurement:** Lighthouse report (Chrome DevTools → Lighthouse → Performance)

**Exception path for internal/admin tools (documented, not silent):** the defaults
above are calibrated for public-facing pages where a first-time visitor's initial load
matters most. An internal dashboard behind auth, used repeatedly by the same
small set of employees (a data-grid-heavy admin panel, an internal analytics tool),
reasonably prioritizes feature density and interaction speed over first-load size —
those users pay the JS cost once per session, not once per page view from a cold
cache. Rather than let engineers either silently violate the gate or over-invest in
splitting a tool nobody outside the company ever loads cold, record an explicit
exception:

```
perf_budget_exception:
  scope: [route or app section, e.g. "/admin/**"]
  reason: internal-tool, authenticated-only, repeat-usage
  approved_js_budget_kb: [number — still a real number, not "unlimited"]
  approved_by: [name]
  still_enforced: [LCP/CLS/interaction responsiveness for warm-cache use — the
    exception applies to first-load JS size specifically, not to the page
    becoming unresponsive once loaded]
```

This is recorded in the project's `docs/pm/DECISIONS.md`, not silently coded around —
the gate still runs and still reports the number, it's the pass/fail threshold for
that specific route that's been explicitly raised, with a reason and an approver on
record. Code-splitting the admin route from the public bundle so the public pages
never pay the internal tool's JS cost is still required regardless of this exception —
the exception is about the internal route's own budget, not permission to bloat the
shared bundle everyone downloads.

---

## Enforcement (CI/CD)

### Lighthouse CI (GitHub Actions)

```yaml
# .github/workflows/performance-budget.yml
name: Performance Budget
on:
  pull_request:
    branches: [main]
    paths:
      - 'src/**'
      - 'app/**'
      - 'public/**'

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build app
        run: |
          npm ci
          npm run build
          npm run start &
          npx wait-on http://localhost:3000
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/dashboard
          configPath: './lighthouserc.json'
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Budget Config (`lighthouserc.json`)

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "npm run start",
      "url": ["http://localhost:3000"]
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1800}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "total-blocking-time": ["error", {"maxNumericValue": 200}],
        "max-potential-fid": ["error", {"maxNumericValue": 100}],
        "speed-index": ["error", {"maxNumericValue": 3400}],
        "interactive": ["error", {"maxNumericValue": 3800}],
        "total-byte-weight": ["warn", {"maxNumericValue": 1000000}],
        "uses-optimized-images": "error",
        "modern-image-formats": "warn",
        "uses-text-compression": "error",
        "uses-responsive-images": "warn"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

---

## Quick Wins (Performance Optimization Checklist)

### Images
- [ ] Use WebP/AVIF format (fallback to JPEG/PNG)
- [ ] Lazy load images below fold (`loading="lazy"`)
- [ ] Serve responsive images (`srcset`, `sizes`)
- [ ] Compress images (TinyPNG, Squoosh, sharp)
- [ ] Use CDN with image optimization (Cloudinary, Vercel Image Optimization)

### JavaScript
- [ ] Code-split routes (Next.js dynamic import, Vite lazy)
- [ ] Tree-shake unused code (check bundle analyzer)
- [ ] Defer non-critical JS (`defer`, `async` attributes)
- [ ] Remove console.log in production
- [ ] Use Web Workers for heavy computation

### CSS
- [ ] Remove unused CSS (PurgeCSS, Tailwind JIT)
- [ ] Inline critical CSS (above-the-fold styles)
- [ ] Minify CSS (cssnano, Lightning CSS)
- [ ] Avoid @import in CSS (use bundler imports)

### Fonts
- [ ] Use font-display: swap (prevent invisible text)
- [ ] Subset fonts (only Latin if no multilingual)
- [ ] Preload critical fonts (`<link rel="preload" as="font">`)
- [ ] Use variable fonts (1 file for multiple weights)

### Network
- [ ] Enable HTTP/2 or HTTP/3
- [ ] Enable gzip/brotli compression
- [ ] Set cache headers (immutable for static assets)
- [ ] Use CDN for static assets
- [ ] Prefetch critical resources (`<link rel="prefetch">`)

---

## Real User Monitoring (RUM)

**After launch, measure real user performance (not just lab tests).**

### Web Vitals Library (Google)

```javascript
// app/layout.tsx (Next.js) or main.tsx (Vite)
import {onCLS, onFID, onLCP} from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric),
    headers: {'Content-Type': 'application/json'},
  });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
```

### Third-party RUM Tools

| Tool | Free Tier | Best For |
|------|-----------|----------|
| Vercel Analytics | 100K events/month | Next.js projects |
| Cloudflare Web Analytics | Unlimited | Privacy-focused (no cookies) |
| Google Analytics 4 | Unlimited | Full user journey tracking |
| Sentry Performance | 5K transactions/month | Error + performance correlation |
| SpeedCurve | Trial only | Detailed competitive analysis |

---

## Performance Dashboard (Minimal)

**Track these 4 metrics weekly:**

1. **LCP p75** (75th percentile, real users)
2. **CLS p75**
3. **FID p75** (or INP when Chrome fully migrates)
4. **Bundle size** (main.js total KB)

**Alert threshold:**
- If LCP p75 > 2.5s for 3 consecutive days → investigate
- If bundle size increases > 20% in one PR → block merge, investigate cause

---

## Performance Regression Example (What to Block)

**Scenario:** PR adds Moment.js for date formatting

**Before PR:**
- main.js: 180 KB
- LCP: 2.1s

**After PR:**
- main.js: 340 KB (+ 160 KB from Moment.js)
- LCP: 3.8s

**Action:** Block PR

**Alternative:** Replace Moment.js with date-fns (tree-shakable, 5-10 KB for typical usage) or native Intl.DateTimeFormat

```diff
- import moment from 'moment';
- const formatted = moment(date).format('YYYY-MM-DD');

+ import {format} from 'date-fns';
+ const formatted = format(date, 'yyyy-MM-dd');
```

**Result:**
- main.js: 185 KB (+ 5 KB)
- LCP: 2.2s
- ✅ Merge approved

---

## Bundle Analysis

### Next.js

```bash
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // your config
});
```

```bash
ANALYZE=true npm run build
```

### Vite

```bash
npm run build -- --mode analyze
```

(Vite includes rollup-plugin-visualizer by default in most templates)

---

## Integration with Gates

Update `engine/GATE-REGISTRY.md`:

```markdown
### gate:pr (Pull Request)

**Evidence:**
- All tests passed
- Code review approved
- Security checklist completed
- **Performance budget not exceeded** ← NEW
- OWNERSHIP.md check passed (if multi_agent: true)

**Performance check:**
- Lighthouse score ≥ 90 (performance category)
- LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 200ms
- Bundle size increase ≤ 20% (unless justified)

**Blocker:** PR cannot merge if performance regression detected without justification.
```

---

**Agent Instruction:**

Before merging any PR that adds:
- New npm package
- Large image/video
- External font
- Heavy JavaScript library

Run `npm run build`, check bundle size diff. If increase > 20%, require justification or find lighter alternative.
