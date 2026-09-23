# Frontend Performance Budget — Mandatory Gate

**Purpose:** Prevent shipping slow frontend without measurement.

**Applies to:** Medium+ with UI. Small: recommended but not blocking.

---

## Performance Budget by Tier

| Metric | Small | Medium | Large | Tool |
|--------|-------|--------|-------|------|
| **Initial JS (Gzipped Transfer)** | < 500KB | < 300KB | < 200KB | `@next/bundle-analyzer` / `bundlesize` |
| **Initial JS (Uncompressed)** | < 1.5MB | < 1.0MB | < 600KB | Build artifact audit |
| **Lighthouse Performance** | ≥ 70 | ≥ 85 | ≥ 90 | Lighthouse CI |
| **LCP (Largest Contentful Paint)** | < 4.0s | < 2.5s | < 2.0s | Web Vitals |
| **INP (Interaction to Next Paint)** | < 300ms | < 200ms | < 150ms | Web Vitals (replaces legacy FID) |
| **CLS (Cumulative Layout Shift)** | < 0.25 | < 0.1 | < 0.1 | Web Vitals |
| **TBT (Total Blocking Time)** | < 600ms | < 300ms | < 200ms | Lighthouse / Web Vitals |

*Note on Initial JS Budget:* Measurements refer to compressed transfer size over the wire (gzip/brotli). A modern framework baseline (React 19 + Next.js App Router runtime) accounts for ~85–110KB gzipped, leaving approximately 190KB for application code, components, and third-party libraries in the Medium tier. Uncompressed parsed JavaScript in browser memory is typically 3–4× higher.

---

## Measurement Tools

### 1. Lighthouse CI (Automated)

**Setup (GitHub Actions):**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/dashboard
            http://localhost:3000/employees
          uploadArtifacts: true
          temporaryPublicStorage: true
          
      - name: Check Budget
        run: |
          SCORE=$(cat .lighthouseci/manifest.json | jq '.[] | select(.url | contains("/")) | .summary.performance' | head -1)
          if (( $(echo "$SCORE < 0.85" | bc -l) )); then
            echo "Performance score $SCORE < 85%"
            exit 1
          fi
```

**lighthouserc.js:**

```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm start',
      url: ['http://localhost:3000', 'http://localhost:3000/dashboard'],
      numberOfRuns: 3
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
```

---

### 2. Bundle Size Analysis

**Next.js:**

```bash
npm install -D @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
  // your config
})
```

**Analyze:**

```bash
ANALYZE=true npm run build
# Opens http://127.0.0.1:8888 with bundle visualization
```

**Check bundle size:**

```bash
# After build
ls -lh .next/static/chunks/

# Total JS size
du -sh .next/static/chunks/*.js | awk '{sum+=$1} END {print sum "K total"}'
```

**Blocking criteria:**
- Medium: Total initial JS > 300KB gzipped → FAIL
- Large: Total initial JS > 200KB gzipped → FAIL

---

### 3. Web Vitals Monitoring (Production)

**Setup (Vercel Analytics):**

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

**Custom reporting:**

```typescript
// lib/web-vitals.ts
import { onCLS, onFID, onLCP } from 'web-vitals'

function sendToAnalytics(metric) {
  // Send to your analytics
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric)
  })
}

onCLS(sendToAnalytics)
onFID(sendToAnalytics)
onLCP(sendToAnalytics)
```

---

## Common Performance Issues

### Issue 1: Large Bundle (> 300KB)

**Diagnosis:**
```bash
ANALYZE=true npm run build
# Look for large chunks in bundle analyzer
```

**Fixes:**

1. **Code splitting:**
   ```typescript
   // ❌ Bad: imports everything upfront
   import { HeavyChart } from './heavy-chart'
   
   // ✅ Good: lazy load
   const HeavyChart = dynamic(() => import('./heavy-chart'), {
     loading: () => <Skeleton />,
     ssr: false
   })
   ```

2. **Remove unused dependencies:**
   ```bash
   npx depcheck
   # Remove unused packages
   ```

3. **Tree-shake lodash:**
   ```typescript
   // ❌ Bad: imports entire lodash (70KB)
   import _ from 'lodash'
   
   // ✅ Good: import specific function (5KB)
   import debounce from 'lodash/debounce'
   ```

---

### Issue 2: Slow LCP (> 2.5s)

**Diagnosis:**
```bash
npm run build
npm start
# Open Chrome DevTools → Lighthouse → Run
# Check "Largest Contentful Paint" section
```

**Fixes:**

1. **Optimize images:**
   ```typescript
   // ❌ Bad: unoptimized
   <img src="/hero.jpg" />
   
   // ✅ Good: Next.js Image
   <Image
     src="/hero.jpg"
     width={800}
     height={600}
     priority  // Load immediately (above fold)
     alt="Hero"
   />
   ```

2. **Preload critical assets:**
   ```typescript
   // app/layout.tsx
   export default function RootLayout({ children }) {
     return (
       <html>
         <head>
           <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
         </head>
         <body>{children}</body>
       </html>
     )
   }
   ```

3. **Avoid render-blocking CSS:**
   ```typescript
   // ❌ Bad: blocks render
   <link rel="stylesheet" href="/large-library.css" />
   
   // ✅ Good: load async
   <link rel="preload" href="/large-library.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
   ```

---

### Issue 3: High CLS (> 0.1)

**Diagnosis:**
Chrome DevTools → Performance → Record page load → Look for "Layout Shift" events

**Fixes:**

1. **Reserve space for images:**
   ```typescript
   // ❌ Bad: no dimensions (causes layout shift)
   <img src="/avatar.jpg" />
   
   // ✅ Good: explicit dimensions
   <img src="/avatar.jpg" width="40" height="40" />
   ```

2. **Reserve space for dynamic content:**
   ```typescript
   // ❌ Bad: content pops in
   {data && <UserProfile data={data} />}
   
   // ✅ Good: skeleton with same height
   {data ? <UserProfile data={data} /> : <Skeleton height={200} />}
   ```

3. **Avoid inserting content above existing content:**
   ```typescript
   // ❌ Bad: banner pushes content down
   <div>
     {showBanner && <Banner />}
     <MainContent />
   </div>
   
   // ✅ Good: fixed/absolute position banner
   <div>
     {showBanner && <Banner className="fixed top-0" />}
     <MainContent className="mt-12" />  {/* Reserve space */}
   </div>
   ```

---

## Performance Budget Enforcement

### CI/CD Gate (Medium+)

**GitHub Actions:**

```yaml
# .github/workflows/perf-budget.yml
name: Performance Budget

on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      
      - name: Check bundle size
        run: |
          SIZE=$(du -sb .next/static/chunks/*.js | awk '{sum+=$1} END {print sum}')
          MAX_SIZE=307200  # 300KB
          if [ $SIZE -gt $MAX_SIZE ]; then
            echo "Bundle size $SIZE bytes exceeds budget $MAX_SIZE bytes"
            exit 1
          fi
          echo "Bundle size: $SIZE bytes (budget: $MAX_SIZE bytes)"
      
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: 'http://localhost:3000'
          budgetPath: ./.lighthouserc.js
```

**PR blocks merge if:**
- Bundle size > budget
- Lighthouse score < 85
- LCP > 2.5s
- CLS > 0.1

---

## Performance Checklist

**Before production deploy Medium+:**

- [ ] Lighthouse CI configured in GitHub Actions
- [ ] Bundle analyzer run, no unexpected large chunks
- [ ] Total JS bundle < 300KB gzipped (Medium) or < 200KB (Large)
- [ ] Lighthouse Performance score ≥ 85 (Medium) or ≥ 90 (Large)
- [ ] Images optimized (WebP/AVIF, lazy load below fold)
- [ ] Fonts preloaded (no FOIT/FOUT)
- [ ] No layout shifts (CLS < 0.1)
- [ ] Tested on slow 3G (Chrome DevTools → Network → Slow 3G)

---

**Agent Instruction:**

Before marking UI feature Done:
1. Run `ANALYZE=true npm run build`
2. Check bundle size < budget
3. Run Lighthouse locally: Chrome DevTools → Lighthouse → Desktop
4. Score ≥ 85? Pass. < 85? Fix largest issues first (bundle size, images, render-blocking resources)
5. Only then: commit

Do not skip performance check. Slow UI = bad UX.

---

**Last Updated:** 2026-09-22  
**Version:** 1.0.0
