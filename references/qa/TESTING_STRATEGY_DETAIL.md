# Testing Strategy — Phase 4 Detail

**Purpose:** Comprehensive testing guide for Phase 4 (Testing & Quality Assurance).

**Version:** 1.0.0 (2026 tools)

> **Canonical Standards:** All coverage thresholds (≥80% global, 100% auth/payment critical paths) and quality metrics in this document align with `engine/NUMERIC_STANDARDS.md`. If a numerical threshold conflicts, `NUMERIC_STANDARDS.md` is the authoritative source.

---


**Using Next.js + Supabase + Prisma?** Read `references/qa/STACK_SPECIFIC_TESTING.md` for concrete examples (Server Actions, Supabase Auth mocking, Testcontainers setup).

**Test data problems?** Read `references/qa/TEST_DATA_STRATEGY.md` for factory pattern, seeding, and isolation.

**Flaky tests?** Read `references/qa/FLAKY_TEST_POLICY.md` for 3-strike quarantine workflow.

## Contents

- [Testing Pyramid](#testing-pyramid)
- [1. Unit Tests (70% of tests)](#1-unit-tests-70-of-tests)
- [2. Integration Tests (20% of tests)](#2-integration-tests-20-of-tests)
- [3. End-to-End Tests (10% of tests)](#3-end-to-end-tests-10-of-tests)
- [4. Load Testing (Production Readiness)](#4-load-testing-production-readiness)
- [5. Visual Regression Testing (Optional)](#5-visual-regression-testing-optional)
- [Test Organization](#test-organization)
- [CI/CD Integration](#cicd-integration)
- [Testing Checklist (Phase 4)](#testing-checklist-phase-4)
- [Quality Gates (Must Pass Before Deploy)](#quality-gates-must-pass-before-deploy)

## Testing Pyramid

```
        /\
       /E2E\       ← 10% (10 critical flows, slow, expensive)
      /------\
     /  API  \     ← 20% (integration tests, medium speed)
    /----------\
   /   UNIT    \   ← 70% (fast, cheap, many tests)
  /--------------\
```

**Rule:** More unit tests, fewer E2E tests.

---

## 1. Unit Tests (70% of tests)

**What:** Test individual functions/components in isolation.

**Tools (2026):**
- **Vitest** (Vite-native, 10x faster than Jest)
- **Testing Library** (React/Vue/Svelte component tests)
- **MSW** (Mock Service Worker, mock API calls)

**Coverage Target:** 80%+ overall, 100% on payment/auth paths — **enforced as a failing CI threshold, not just a reported number** (see Rule 9 in SKILL.md: a coverage report attached with no threshold enforcement does not satisfy `gate:production-deploy`).

### Setup (Vitest + React)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: ['node_modules/', 'dist/', '**/*.config.ts', '**/*.d.ts'],
      // Global floor — CI fails (non-zero exit) if any of these drop below the number.
      // This is what makes coverage a gate instead of a suggestion.
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
        // Path-scoped overrides: 100% required specifically on payment/auth logic,
        // per SKILL.md Rule 9. Adjust the glob to match this project's actual
        // payment/auth module paths — do not leave the example path unedited.
        'src/modules/payments/**': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100
        },
        'src/modules/auth/**': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100
        }
      }
    }
  }
})
```

`vitest run --coverage` exits non-zero automatically when any threshold above is not
met — this is the mechanism that turns "80%+ coverage" from a checklist line into an
actual blocker. Do not rely on reading the coverage percentage from a report after the
fact; the exit code is the gate evidence.

### Examples

**Business Logic (Pure Function):**
```typescript
// lib/payroll.ts
export function calculateNetSalary(
  baseSalary: number,
  allowances: number,
  deductions: number
): number {
  if (baseSalary < 0) throw new Error('Base salary cannot be negative')
  return baseSalary + allowances - deductions
}

// __tests__/unit/payroll.test.ts
import { describe, test, expect } from 'vitest'
import { calculateNetSalary } from '@/lib/payroll'

describe('calculateNetSalary', () => {
  test('calculates correct net salary', () => {
    expect(calculateNetSalary(5000, 1000, 500)).toBe(5500)
  })

  test('handles zero allowances and deductions', () => {
    expect(calculateNetSalary(5000, 0, 0)).toBe(5000)
  })

  test('throws error for negative base salary', () => {
    expect(() => calculateNetSalary(-1000, 0, 0)).toThrow('Base salary cannot be negative')
  })
})
```

**React Component:**
```typescript
// components/employee-card.tsx
export function EmployeeCard({ name, position }: { name: string, position: string }) {
  return (
    <div data-testid="employee-card">
      <h3>{name}</h3>
      <p>{position}</p>
    </div>
  )
}

// __tests__/unit/employee-card.test.tsx
import { render, screen } from '@testing-library/react'
import { EmployeeCard } from '@/components/employee-card'

test('renders employee name and position', () => {
  render(<EmployeeCard name="John Doe" position="Developer" />)
  
  expect(screen.getByText('John Doe')).toBeInTheDocument()
  expect(screen.getByText('Developer')).toBeInTheDocument()
})
```

**Database Query (Mocked):**
```typescript
// lib/employees.ts
import { db } from './db'

export async function getEmployeeById(id: number) {
  const employee = await db.query('SELECT * FROM employees WHERE id = $1', [id])
  if (!employee) throw new Error('Employee not found')
  return employee
}

// __tests__/unit/employees.test.ts
import { vi } from 'vitest'
import { getEmployeeById } from '@/lib/employees'
import * as dbModule from '@/lib/db'

vi.mock('@/lib/db', () => ({
  db: {
    query: vi.fn()
  }
}))

test('returns employee when found', async () => {
  const mockEmployee = { id: 1, name: 'John' }
  vi.mocked(dbModule.db.query).mockResolvedValue(mockEmployee)
  
  const employee = await getEmployeeById(1)
  expect(employee).toEqual(mockEmployee)
})

test('throws error when employee not found', async () => {
  vi.mocked(dbModule.db.query).mockResolvedValue(null)
  
  await expect(getEmployeeById(999)).rejects.toThrow('Employee not found')
})
```

---

## 2. Integration Tests (20% of tests)

**What:** Test API endpoints, database interactions, external services.

**Tools:**
- **Vitest** (same as unit tests)
- **Supertest** (HTTP assertion) or native `fetch`
- **Test database** (separate from dev/prod)

### Setup

```bash
npm install -D supertest @testcontainers/postgresql
```

**Test Database Strategy:**
- Option A: SQLite in-memory (fast, limited features)
- Option B: Docker PostgreSQL (realistic, slower)
- Option C: Testcontainers (auto-manage Docker)

### Examples

**API Endpoint Test:**
```typescript
// __tests__/integration/api-employees.test.ts
import { describe, test, expect, beforeAll, afterAll } from 'vitest'

// Setup test database before all tests
beforeAll(async () => {
  await setupTestDB()
})

afterAll(async () => {
  await cleanupTestDB()
})

test('GET /api/employees returns employee list', async () => {
  // Seed test data
  await db.insert(employees).values([
    { name: 'John Doe', position: 'Developer' },
    { name: 'Jane Smith', position: 'Manager' }
  ])
  
  const response = await fetch('http://localhost:3000/api/employees')
  const data = await response.json()
  
  expect(response.status).toBe(200)
  expect(data).toHaveLength(2)
  expect(data[0].name).toBe('John Doe')
})

test('POST /api/employees creates new employee', async () => {
  const response = await fetch('http://localhost:3000/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Bob Wilson', position: 'Designer' })
  })
  
  expect(response.status).toBe(201)
  
  const created = await response.json()
  expect(created.name).toBe('Bob Wilson')
  
  // Verify in database
  const fromDB = await db.query.employees.findFirst({
    where: eq(employees.name, 'Bob Wilson')
  })
  expect(fromDB).toBeDefined()
})
```

**Database Transaction Test:**
```typescript
test('payroll calculation saves to database', async () => {
  const employee = await createTestEmployee({ baseSalary: 5000 })
  
  await generatePayroll(employee.id, {
    month: '2026-09',
    allowances: 1000,
    deductions: 500
  })
  
  const payroll = await db.query.payrolls.findFirst({
    where: and(
      eq(payrolls.employeeId, employee.id),
      eq(payrolls.month, '2026-09')
    )
  })
  
  expect(payroll).toBeDefined()
  expect(payroll.netSalary).toBe(5500)
})
```

---

## 3. End-to-End Tests (10% of tests)

**What:** Test complete user flows (browser automation).

**Tools:**
- **Playwright** (2026 standard, fastest, best DX)
- **Cypress** (alternative, older but mature)

**Coverage:** 10 critical flows (happy paths + 2-3 error cases)

### Setup (Playwright)

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
})
```

### Examples

**Login Flow:**
```typescript
// __tests__/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/login')
  
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  // Wait for redirect to dashboard
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
})

test('shows error on invalid credentials', async ({ page }) => {
  await page.goto('/login')
  
  await page.fill('input[name="email"]', 'wrong@example.com')
  await page.fill('input[name="password"]', 'wrong')
  await page.click('button[type="submit"]')
  
  await expect(page.locator('.error')).toContainText('Invalid credentials')
})
```

**CRUD Flow:**
```typescript
// __tests__/e2e/employee-crud.spec.ts
test('employee CRUD flow', async ({ page }) => {
  await loginAs(page, 'admin@example.com')
  
  // Navigate to employees page
  await page.goto('/employees')
  await expect(page.locator('h1')).toContainText('Employees')
  
  // Create employee
  await page.click('button:has-text("Add Employee")')
  await page.fill('input[name="name"]', 'Test Employee')
  await page.fill('input[name="position"]', 'Tester')
  await page.click('button[type="submit"]')
  
  // Verify created
  await expect(page.locator('table')).toContainText('Test Employee')
  
  // Edit employee
  await page.click('tr:has-text("Test Employee") button:has-text("Edit")')
  await page.fill('input[name="position"]', 'Senior Tester')
  await page.click('button:has-text("Save")')
  
  // Verify updated
  await expect(page.locator('table')).toContainText('Senior Tester')
  
  // Delete employee
  await page.click('tr:has-text("Test Employee") button:has-text("Delete")')
  await page.click('button:has-text("Confirm")')  // Confirm modal
  
  // Verify deleted
  await expect(page.locator('table')).not.toContainText('Test Employee')
})
```

**Attendance GPS Flow:**
```typescript
test('employee can clock in with GPS', async ({ page, context }) => {
  // Mock geolocation
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: -7.2575, longitude: 112.7521 })  // Surabaya
  
  await loginAs(page, 'employee@example.com')
  await page.goto('/attendance')
  
  // Click clock in
  await page.click('button:has-text("Clock In")')
  
  // Wait for GPS capture
  await expect(page.locator('.map')).toBeVisible()
  
  // Take photo (mock camera)
  await page.setInputFiles('input[type="file"]', './test-fixtures/selfie.jpg')
  
  // Submit
  await page.click('button:has-text("Submit")')
  
  // Verify success
  await expect(page.locator('.success')).toContainText('Clocked in successfully')
  await expect(page.locator('.status')).toContainText('Clocked In')
})
```

---

## 4. Load Testing (Production Readiness)

**What:** Test performance under load (concurrent users).

**Tools:**
- **k6** (Go-based, fastest)
- **Artillery** (Node-based, JavaScript DSL)

**Target:** Handle expected peak load + 2x buffer.

### Chaos Testing (Failure Injection)

**What:** Test system resilience by intentionally breaking components.

**When to use:**
- **Small:** Not required
- **Medium:** Recommended (manual chaos scenarios)
- **Large+:** Mandatory (automated chaos experiments)

**Chaos Scenarios (Medium Tier):**

1. **Database connection loss**
   ```bash
   # Disconnect database mid-request
   docker pause postgres-container
   # Trigger API call
   curl http://localhost:3000/api/employees
   # Expected: Graceful error (not crash), retry logic works
   docker unpause postgres-container
   ```

2. **Network latency**
   ```bash
   # Linux (tc / Traffic Control - Recommended for CI / Docker):
   sudo tc qdisc add dev eth0 root netem delay 2000ms
   # To clean up: sudo tc qdisc del dev eth0 root

   # macOS (pfctl / dummynet):
   sudo pfctl -e
   echo "dummynet in proto tcp from any to any port 3000 pipe 1" | sudo pfctl -f -
   sudo dnctl pipe 1 config delay 2000
   # To clean up: sudo pfctl -d

   # Cross-platform / Docker (Pumba or Toxiproxy):
   docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
     gaiaadm/pumba netem --duration 1m --interface eth0 delay --time 2000 myapp-container
   ```

3. **High CPU load**
   ```bash
   # Linux / macOS (stress-ng):
   stress-ng --cpu 4 --timeout 60s

   # Windows (PowerShell):
   # 1..4 | ForEach-Object { Start-Job -ScriptBlock { $result = 1; while($true){ $result *= 2 } } }
   # Stop-Job *; Get-Job | Remove-Job
   ```

4. **External API failure**
   ```bash
   # Linux / macOS:
   echo "127.0.0.1 api.stripe.com" | sudo tee -a /etc/hosts
   # Test: Circuit breaker opens, user sees friendly error
   sudo sed -i.bak '/api.stripe.com/d' /etc/hosts

   # Windows (PowerShell Run as Admin):
   # Add-Content -Path "$env:windir\System32\drivers\etc\hosts" -Value "127.0.0.1 api.stripe.com"
   # To clean up: remove the added line
   ```

5. **Disk full**
   ```bash
   # Linux / macOS:
   dd if=/dev/zero of=/tmp/fillfile bs=1M count=1000
   # Test: App logs error, monitoring alerts fire
   rm /tmp/fillfile

   # Windows (Command Prompt / PowerShell):
   # fsutil file createnew C:\Temp\fillfile 1048576000
   # Remove-Item C:\Temp\fillfile
   ```

**Chaos Testing Checklist (Medium):**
- [ ] Database unavailable (app shows error, doesn't crash)
- [ ] External API timeout (circuit breaker opens after 3 failures)
- [ ] High latency (loading states shown, no user confusion)
- [ ] Memory leak simulation (app restarts gracefully)
- [ ] Concurrent writes (optimistic locking prevents data corruption)

**Tool: Chaos Mesh (Large+ / K8s):**

```bash
# Install Chaos Mesh on Kubernetes
helm install chaos-mesh chaos-mesh/chaos-mesh -n=chaos-mesh

# Create chaos experiment (kill random pod)
kubectl apply -f - <<EOF
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: pod-kill-example
spec:
  action: pod-kill
  mode: one
  selector:
    namespaces:
      - production
    labelSelectors:
      app: my-app
  scheduler:
    cron: '@every 1h'  # Kill 1 pod every hour
EOF

# Monitor: Does service stay healthy?
kubectl get pods -w
```

**Expected outcomes:**
- ✅ Service remains available (other pods handle traffic)
- ✅ Killed pod restarts automatically (Kubernetes liveness probe)
- ✅ No user-visible errors (load balancer routes to healthy pods)
- ✅ Alerts fire if pod restart loop detected

**Chaos experiments to run (Large+):**
- Pod kill (random pod every hour)
- Network partition (split brain scenario)
- CPU stress (80% utilization for 10 min)
- Memory stress (90% utilization for 5 min)
- DNS failure (external service resolution fails)
- Time skew (system clock off by 10 min)

**Tool: Gremlin (Managed Chaos Engineering):**

- **Price:** $1,500/month (Large+)
- **Features:** Pre-built attacks, blast radius limits, rollback
- **Integration:** K8s, AWS, GCP, Azure
- **Use case:** Enterprise chaos engineering without DIY scripts

---

## 4. Load Testing (Production Readiness) — Continued

### Setup (k6)

```bash
brew install k6  # macOS
# or
curl https://github.com/grafana/k6/releases/download/v0.48.0/k6-v0.48.0-linux-amd64.tar.gz | tar xz
```

### Example

```javascript
// load-tests/api-stress.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 }     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% requests < 500ms
    http_req_failed: ['rate<0.01']     // <1% errors
  }
}

export default function () {
  // Test employee list endpoint
  const res = http.get('https://hris.example.com/api/employees')
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500
  })
  
  sleep(1)
}
```

**Run:**
```bash
k6 run load-tests/api-stress.js

# Output:
# ✓ http_req_duration..............: avg=250ms p(95)=420ms p(99)=580ms
# ✓ http_req_failed................: 0.1% (5 of 5000)
# ✓ checks.........................: 99.9%
```

---

## 5. Visual Regression Testing (Optional)

**What:** Detect unintended UI changes (screenshot comparison).

**Tools:**
- **Playwright Visual Comparisons** (built-in)
- **Percy** (managed service, $29/month)
- **Chromatic** (Storybook integration, $35/month)

### Example (Playwright)

```typescript
// __tests__/e2e/visual.spec.ts
test('dashboard looks correct', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveScreenshot('dashboard.png')
})

test('employee list looks correct', async ({ page }) => {
  await page.goto('/employees')
  await expect(page).toHaveScreenshot('employees.png')
})
```

**First run:** Saves baseline screenshots.  
**Subsequent runs:** Compares against baseline, fails if different.

---

## Test Organization

```
my-app/
├── __tests__/
│   ├── unit/                   # 70% of tests
│   │   ├── lib/
│   │   │   ├── payroll.test.ts
│   │   │   └── employees.test.ts
│   │   └── components/
│   │       ├── employee-card.test.tsx
│   │       └── leave-form.test.tsx
│   ├── integration/            # 20% of tests
│   │   ├── api-employees.test.ts
│   │   ├── api-attendance.test.ts
│   │   └── api-payroll.test.ts
│   ├── e2e/                    # 10% of tests
│   │   ├── auth.spec.ts
│   │   ├── employee-crud.spec.ts
│   │   ├── attendance-flow.spec.ts
│   │   └── leave-approval.spec.ts
│   └── fixtures/
│       ├── employees.json      # Test data
│       └── selfie.jpg          # Mock photo
├── load-tests/
│   ├── api-stress.js
│   └── dashboard-load.js
├── vitest.config.ts
└── playwright.config.ts
```

---

## CI/CD Integration

**GitHub Actions:**

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      # Unit + Integration tests WITH coverage enforcement.
      # This step's exit code is the actual gate: vitest fails the job (non-zero
      # exit) if any threshold configured in vitest.config.ts is not met — a
      # passing test suite with coverage below threshold does NOT pass this step.
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration

      # E2E tests
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

      # Upload coverage for trend visibility and PR annotations — this is
      # reporting, not the gate. The gate already happened in the step above;
      # do not treat a successful upload here as evidence of adequate coverage.
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: false

      # Mandatory at gate:production-deploy per SKILL.md Rule 9: attach the raw
      # coverage summary as a build artifact so a human reviewer can see the
      # actual number, not just a green checkmark.
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-summary
          path: coverage/coverage-summary.json
```

**Why both the threshold in `vitest.config.ts` and this artifact upload matter:** the
threshold is what blocks a bad merge automatically; the uploaded summary is what a
human (or a later agent) reads to confirm the gate's evidence actually exists and
actually shows a number, rather than trusting that "tests passed" implies "coverage was
checked." A gate satisfied by an uploaded report with no enforced threshold is not
sufficient — see SKILL.md Rule 9.

---

## Testing Checklist (Phase 4)

### Week 1-2: Unit Tests
- [ ] Setup Vitest + Testing Library
- [ ] Test critical business logic (80%+ coverage)
  - [ ] Payroll calculation
  - [ ] Leave approval rules
  - [ ] Attendance validation
- [ ] Test React components (10 core components)
- [ ] Mock external APIs (MSW)

### Week 3: Integration Tests
- [ ] Setup test database (Docker PostgreSQL)
- [ ] Test API endpoints (CRUD operations)
  - [ ] Employees API
  - [ ] Attendance API
  - [ ] Leave API
  - [ ] Payroll API
- [ ] Test database transactions
- [ ] Test auth middleware

### Week 4: E2E Tests
- [ ] Setup Playwright
- [ ] Test 10 critical flows:
  - [ ] Login / Logout
  - [ ] Employee CRUD
  - [ ] Attendance clock in (GPS + photo)
  - [ ] Leave request
  - [ ] Leave approval (manager)
  - [ ] Payroll generation (HR)
  - [ ] Dashboard stats
  - [ ] Mobile responsive (375px)
  - [ ] Error handling (404, 500)
  - [ ] Security (unauthorized access blocked)

### Week 5: Performance Testing
- [ ] Setup k6
- [ ] Load test API endpoints (100 concurrent users)
- [ ] Verify p95 < 500ms
- [ ] Verify error rate < 1%
- [ ] Optimize slow queries (add indexes)

**See `references/devops/PERFORMANCE_ENGINEERING_GUIDE.md` for k6 scripts, profiling workflow, and performance budget by tier.**

### Week 6: Manual QA
- [ ] Cross-browser (Chrome, Firefox, Safari)
- [ ] Mobile devices (iOS Safari, Android Chrome)
- [ ] Accessibility audit (Lighthouse, axe DevTools)
- [ ] Security scan (OWASP ZAP, Snyk)

**For full WCAG 2.1 AA compliance, see `references/frontend/ACCESSIBILITY_WCAG_GUIDE.md` for screen reader testing and complete checklist.**

---

## Quality Gates (Must Pass Before Deploy)

**Automated:**
- ✅ Unit tests: 80%+ coverage, all passing
- ✅ Integration tests: All API endpoints passing
- ✅ E2E tests: 10 critical flows passing
- ✅ Load test: p95 < 500ms, error rate < 1%
- ✅ Lint: No errors (ESLint, Prettier)
- ✅ Type check: No TypeScript errors
- ✅ Build: Production build succeeds

**Manual:**
- ✅ Lighthouse score: >85 (performance, accessibility, SEO)
- ✅ Security scan: No critical/high vulnerabilities
- ✅ Cross-browser: Tested on Chrome, Firefox, Safari
- ✅ Mobile: Tested on iOS + Android
- ✅ Accessibility: Keyboard nav works, screen reader friendly

---

**Agent: Execute this testing strategy in Phase 4. Report results before Phase 5 (Deployment).**

**Last Updated:** September 17, 2026  
**Version:** 1.0.0
