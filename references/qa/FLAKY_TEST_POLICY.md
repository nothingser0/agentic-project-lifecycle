# Flaky Test Handling Policy — Quarantine, Fix, Unskip

**Purpose:** Stop flaky tests from blocking PRs while ensuring they get fixed (not ignored forever).

**When to use:** When test passes/fails randomly without code changes.

---

## What is a Flaky Test?

**Flaky test:** Test that sometimes passes, sometimes fails, without code changes.

**Common causes:**
- Race conditions (async timing)
- Non-deterministic data (random IDs, timestamps)
- Shared state between tests
- Network timeouts (external APIs)
- Browser timing (element not loaded yet in e2e)

**Why they're dangerous:**
- ❌ Developers ignore test failures ("it's just flaky")
- ❌ Real bugs slip through (masked by flakiness)
- ❌ CI/CD becomes unreliable (merge blocked by random failures)

---

## 3-Strike Quarantine Policy

**Rule:** If a test fails 3 times in 7 days without code changes → quarantine it.

### Strike 1: Flake Detected

**Action:** Retry the test immediately.

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm test
  retry-on-failure: true
  max-attempts: 2
```

**If passes on retry:** Log warning, continue.

**If fails again:** Strike 2.

---

### Strike 2: Flake Confirmed

**Action:** Create GitHub issue, tag as `flaky-test`, assign to test owner.

**Issue template:**

```markdown
## Flaky Test Detected

**Test:** `__tests__/integration/api-employees.test.ts > GET /api/employees returns list`

**Failure count:** 2 in last 7 days

**Logs:**
```
Error: Timeout waiting for element
  at page.waitForSelector (/api-employees.test.ts:42)
```

**Possible causes:**
- [ ] Race condition (async timing)
- [ ] Network timeout (external API)
- [ ] Shared state (data leak from previous test)

**Action required:** Investigate within 3 days or test will be quarantined.

**Related PRs:** #123, #456
```

**If fixed within 3 days:** Close issue, remove strike.

**If not fixed:** Strike 3.

---

### Strike 3: Quarantine

**Action:** Mark test as `skip`, move to quarantine list.

```typescript
// __tests__/integration/api-employees.test.ts

test.skip('GET /api/employees returns list', async () => { // ← Add .skip
  // Test code stays unchanged (for later fix)
})
```

**Add to quarantine log:**

```markdown
# __tests__/QUARANTINED_TESTS.md

## Quarantined Tests

| Test | Quarantined | Reason | Owner | Target Fix |
|------|-------------|--------|-------|------------|
| `api-employees.test.ts > GET /api/employees` | 2026-09-22 | Timeout on page.waitForSelector | @[contributor] | 2026-10-06 |
```

---

## Quarantine vs. Coverage Gate Interaction (Non-Negotiable)

When a test is marked `test.skip()`, the code paths it previously executed are no longer exercised during test runs, which **directly reduces measured code coverage**.

To prevent flakiness management from becoming an unintentional loophole that degrades production quality:

1. **Coverage thresholds must NEVER be lowered:**
   An engineer or agent is strictly forbidden from lowering the coverage thresholds in `vitest.config.ts` (e.g. dropping 80% to 75%) or adding coverage ignore comments (`/* v8 ignore next */`) to make a quarantine PR pass.
2. **Coverage floor remains a hard blocker:**
   If skipping a flaky test causes coverage to drop below the mandatory 80% overall threshold (or drops payment/auth paths below 100%), the quarantine PR **cannot merge**.
3. **Compensating test required:**
   If a flaky integration or E2E test must be quarantined, the author must provide a deterministic, fast unit test covering the same critical business logic before the skip is approved. This keeps the coverage gate green without permitting non-deterministic CI blockers.

**Update test count badge (README):**

```markdown
![Tests](https://img.shields.io/badge/tests-142%20passing%2C%201%20quarantined-yellow)
```

**Notify team:**

```slack
⚠️ Test quarantined: `api-employees.test.ts > GET /api/employees`

Reason: Failed 3x in 7 days (timeout)
Owner: @[contributor]
Fix target: Oct 6

This test is now skipped in CI. PR merges are NOT blocked by it.
```

---

## Fixing Quarantined Tests

**Rule:** Quarantined tests MUST be fixed within 14 days or permanently deleted.
- **Mandatory Deletion Prerequisite:** Deleting a quarantined test is strictly forbidden if doing so leaves critical business logic uncovered or causes overall test coverage to drop below the mandatory 80% line/statement and 75% branch thresholds (or 100% on payment/auth paths).
- **Compensating Test Requirement:** Before any quarantined E2E or integration test may be deleted, the author must commit a fast, deterministic unit or integration test exercising the same business rules.
- **Audit Logging:** Any test deletion must be recorded in `__tests__/QUARANTINED_TESTS.md` with the reason for deletion, compensating test path, and approving lead.

### Fix Workflow

**1. Reproduce flake locally (run 10x):**

```bash
npm test -- __tests__/integration/api-employees.test.ts --run 10
```

**If passes 10x locally:** Flake is environment-specific (CI only).

**If fails 1-2x locally:** Flake is reproducible, easier to fix.

---

**2. Identify root cause:**

**Race condition:**

```typescript
// ❌ Flaky
test('user list loads', async () => {
  render(<UserList />)
  expect(screen.getByText('John Doe')).toBeInTheDocument() // ❌ Fails if API slow
})

// ✅ Fixed
test('user list loads', async () => {
  render(<UserList />)
  await screen.findByText('John Doe') // ✅ Waits for element (with timeout)
})
```

**Non-deterministic data:**

```typescript
// ❌ Flaky
test('sorts users by created date', () => {
  const users = [
    { name: 'Alice', createdAt: new Date() }, // ❌ Same timestamp
    { name: 'Bob', createdAt: new Date() },
  ]
  const sorted = sortByDate(users)
  expect(sorted[0].name).toBe('Alice') // ❌ Order undefined if timestamps equal
})

// ✅ Fixed
test('sorts users by created date', () => {
  const users = [
    { name: 'Alice', createdAt: new Date('2026-01-01') }, // ✅ Fixed timestamps
    { name: 'Bob', createdAt: new Date('2026-01-02') },
  ]
  const sorted = sortByDate(users)
  expect(sorted[0].name).toBe('Alice')
})
```

**Shared state:**

```typescript
// ❌ Flaky
let user: User // ❌ Global state shared between tests

test('create user', () => {
  user = createUser('test@example.com')
})

test('update user', () => {
  updateUser(user.id, { name: 'New Name' }) // ❌ Fails if run in isolation
})

// ✅ Fixed
test('create user', () => {
  const user = createUser('test@example.com') // ✅ Local scope
})

test('update user', () => {
  const user = createUser('test@example.com') // ✅ Each test independent
  updateUser(user.id, { name: 'New Name' })
})
```

**Network timeout:**

```typescript
// ❌ Flaky
test('fetch user from API', async () => {
  const user = await fetch('/api/users/1') // ❌ Times out if API slow
  expect(user.name).toBe('John')
})

// ✅ Fixed (mock API)
import { server } from '@/__tests__/mocks/server'
import { rest } from 'msw'

test('fetch user from API', async () => {
  server.use(
    rest.get('/api/users/1', (req, res, ctx) => {
      return res(ctx.json({ name: 'John' })) // ✅ Mocked, always fast
    })
  )
  const user = await fetch('/api/users/1')
  expect(user.name).toBe('John')
})
```

**Browser timing (e2e):**

```typescript
// ❌ Flaky
test('user can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.click('button[type="submit"]') // ❌ Clicks before email filled
})

// ✅ Fixed
test('user can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.waitForTimeout(100) // OR: await page.locator('input[name="email"]').blur()
  await page.click('button[type="submit"]')
})

// ✅ Better: Wait for button to be enabled
test('user can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.locator('button[type="submit"]:not([disabled])').click() // ✅ Waits until enabled
})
```

---

**3. Verify fix (run 50x):**

```bash
npm test -- __tests__/integration/api-employees.test.ts --run 50
```

**If passes 50x:** Fix confirmed.

**If fails 1+ times:** Root cause not fully fixed, investigate more.

---

**4. Unskip and close issue:**

```typescript
// Remove .skip
test('GET /api/employees returns list', async () => { // ✅ Unskipped
  // Fixed test code
})
```

**Update quarantine log:**

```markdown
## Recently Fixed (Archive)

| Test | Quarantined | Fixed | Days Quarantined | Root Cause |
|------|-------------|-------|------------------|------------|
| `api-employees.test.ts > GET /api/employees` | 2026-09-22 | 2026-09-25 | 3 | Race condition (missing await) |
```

**Close GitHub issue:**

```markdown
Fixed in #789

**Root cause:** Race condition — `expect(screen.getByText(...))` ran before API response.

**Fix:** Changed to `await screen.findByText(...)` (waits with timeout).

**Verified:** Passed 50x locally, 10x in CI.
```

---

## Quarantine Expiration (14 Days) & Automated CI Gate

**Rule:** If a test is not fixed within 14 days of being quarantined, it MUST be remediated or deleted.

**Why strictly enforce expiration?**
- A quarantined test (`test.skip`) provides zero test value while adding code noise.
- Without automated enforcement, teams accumulate dozens of skipped tests that rot over time.
- Forces an active decision: fix the underlying flakiness, replace with a fast unit test, or explicitly delete.

### Automated CI Quarantine Audit (GitHub Actions)

Add this workflow to fail CI if any quarantined test remains unaddressed past its 14-day SLA:

```yaml
# .github/workflows/quarantine-audit.yml
name: Quarantined Tests Audit

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1' # Every Monday at midnight

jobs:
  audit-quarantine:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Verify Quarantined Test SLA
        run: |
          if [ ! -f "__tests__/QUARANTINED_TESTS.md" ]; then
            echo "No quarantined tests log found."
            exit 0
          fi

          EXPIRED_FOUND=0
          CURRENT_DATE=$(date +%s)

          # Parse dates in QUARANTINED_TESTS.md table (Format: YYYY-MM-DD)
          grep -E '^\| `.*` \| [0-9]{4}-[0-9]{2}-[0-9]{2} \|' __tests__/QUARANTINED_TESTS.md | while read -r line; do
            TEST_NAME=$(echo "$line" | awk -F'|' '{print $2}' | xargs)
            QUARANTINE_DATE=$(echo "$line" | awk -F'|' '{print $3}' | xargs)
            Q_SEC=$(date -d "$QUARANTINE_DATE" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$QUARANTINE_DATE" +%s)
            AGE_DAYS=$(( (CURRENT_DATE - Q_SEC) / 86400 ))

            if [ $AGE_DAYS -gt 14 ]; then
              echo "❌ ERROR: Quarantined test '$TEST_NAME' has been skipped for $AGE_DAYS days (SLA: 14 days max)." >&2
              EXPIRED_FOUND=1
            fi
          done

          if [ $EXPIRED_FOUND -eq 1 ]; then
            echo "❌ CI FAILED: Found expired quarantined tests. Fix or delete them before merging." >&2
            exit 1
          fi
          echo "✅ All quarantined tests are within the 14-day SLA window."
```

**Deletion process (when expired):**

```bash
# Delete test file (if entire file quarantined)
git rm __tests__/integration/api-employees.test.ts

# OR delete the test block (if single test in file)
# test.skip('...') → Remove the entire test block from the file
```

**Notify team:**

```slack
🗑️ Quarantined test DELETED (expired after 14 days)

Test: `api-employees.test.ts > GET /api/employees`
Reason: Not fixed within deadline

If this test is still needed, rewrite it from scratch (non-flaky).
```

**Exception:** Critical path test (login, payment, signup) gets 30 day extension, but requires weekly progress update.

---

## Preventing Flaky Tests

### 1. Use Deterministic Data

```typescript
// ❌ Flaky
const id = Math.random().toString() // Different every run

// ✅ Fixed
const id = 'test-user-123' // Same every run
```

---

### 2. Isolate Tests (No Shared State)

```typescript
// ❌ Flaky
let db: Database // ❌ Shared across tests

beforeAll(() => {
  db = new Database()
})

// ✅ Fixed
beforeEach(() => {
  db = new Database() // ✅ Fresh DB per test
})
```

---

### 3. Mock External Dependencies

```typescript
// ❌ Flaky (real API call)
const weather = await fetch('https://api.weather.com/current')

// ✅ Fixed (mocked)
server.use(
  rest.get('https://api.weather.com/current', (req, res, ctx) => {
    return res(ctx.json({ temp: 25 }))
  })
)
```

---

### 4. Use Explicit Waits (Not Arbitrary Delays)

```typescript
// ❌ Flaky
await page.waitForTimeout(1000) // ❌ Too short on slow CI, too long on fast local

// ✅ Fixed
await page.waitForSelector('.user-list') // ✅ Waits up to 30s (Playwright default)
```

---

### 5. Set Generous Timeouts (CI is Slower)

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 30000, // 30s (default: 5s) — gives CI more time
  },
})
```

---

## Monitoring Flaky Tests

**Track flakiness rate:**

```bash
# Run all tests 10x, count failures
npm test -- --run 10 > test-results.txt
grep "FAIL" test-results.txt | wc -l
# If > 0 failures → investigate
```

**CI integration (GitHub Actions):**

```yaml
# .github/workflows/flaky-test-detector.yml
name: Flaky Test Detector

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2am

jobs:
  detect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test -- --run 10 --reporter=json > results.json
      - name: Analyze flakiness
        run: |
          FAILURES=$(jq '.numFailedTests' results.json)
          if [ "$FAILURES" -gt 0 ]; then
            echo "⚠️ Flaky tests detected: $FAILURES failures"
            # Post to Slack
            curl -X POST ${{ secrets.SLACK_WEBHOOK }} -d "{\"text\":\"Flaky tests: $FAILURES failures\"}"
          fi
```

---

## Checklist: Flaky Test Policy

### Setup (One-time)
- [ ] Create `__tests__/QUARANTINED_TESTS.md` (quarantine log)
- [ ] Add retry-on-failure to CI (max 2 attempts)
- [ ] Setup flaky test detector (run tests 10x nightly)
- [ ] Document policy in README

### When Test Flakes
- [ ] **Strike 1:** Retry immediately (CI auto-retries)
- [ ] **Strike 2:** Create GitHub issue, assign owner, tag `flaky-test`
- [ ] **Strike 3:** Quarantine (add `.skip`, update log, notify team)

### Fixing Quarantined Test
- [ ] Reproduce flake (run 10x locally)
- [ ] Identify root cause (race condition / timing / shared state)
- [ ] Apply fix
- [ ] Verify fix (run 50x, all pass)
- [ ] Unskip test, update log, close issue

### Quarantine Expiration (14 Days)
- [ ] Delete test (if not fixed)
- [ ] Notify team (Slack message)
- [ ] Update coverage badge

---

## Tools

**Flaky test detection:**
- [Flaky Test Tracker](https://github.com/facebook/jest/tree/main/packages/jest-circus#flaky-test-tracking) (Jest built-in)
- [Playwright Test Retry](https://playwright.dev/docs/test-retries) (auto-retry flaky tests)
- [BuildPulse](https://buildpulse.io/) (flaky test analytics SaaS)

**Mocking:**
- [MSW (Mock Service Worker)](https://mswjs.io/) (mock HTTP requests)
- [Vitest vi.mock](https://vitest.dev/api/vi.html#vi-mock) (mock modules)

---

**Last updated:** 2026-09-22  
**Version:** 1.0.0
