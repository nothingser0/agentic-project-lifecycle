# Tech Debt & Hotfix Workflow — Maintenance Operations

**Purpose:** Track technical debt systematically and handle hotfixes safely.

**When to use:** MAINTAIN phase, or anytime during BUILD when debt accumulates

---

## Technical Debt Register

**Store in:** `docs/dev-docs/TECH-DEBT.md`

```markdown
# Technical Debt Register — [Project Name]

**Last Updated:** 2026-09-22
**Total Debt Items:** 7
**High Priority:** 2
**Estimated Payoff Time:** 16 hours

---

## Active Debt

### TD001: Hardcoded Pagination Limit (Priority: High)

**Created:** 2026-09-10  
**Category:** Scalability  
**Location:** `app/api/users/route.ts:15`  
**Effort:** 2 hours  
**Blast radius:** 3 files (users API, pagination util, config)  
**Impact if not fixed:** Cannot paginate beyond 100 users, breaks at scale

**Current code:**
```typescript
const users = await prisma.user.findMany({ take: 100 }); // hardcoded
```

**Desired state:**
```typescript
const limit = parseInt(req.query.limit) || 20;
const offset = parseInt(req.query.offset) || 0;
const users = await prisma.user.findMany({ take: limit, skip: offset });
```

**Why deferred:** Sprint 1 deadline, pagination not critical for MVP (< 50 users)

**Deadline:** Before 100 users reached (estimated: Sprint 4)

**Owner:** @[contributor]

---

### TD002: No Error Boundary in Dashboard (Priority: High)

**Created:** 2026-09-15  
**Category:** Reliability  
**Location:** `app/dashboard/page.tsx`  
**Effort:** 1 hour  
**Impact if not fixed:** Any component error crashes entire dashboard (white screen)

**Current:** No error boundary, React default error (white screen)

**Desired:** Error boundary component with fallback UI + error logging

**Why deferred:** Sprint 2 scope cut, low error rate in beta

**Deadline:** Before public launch (Sprint 5)

**Owner:** @[contributor]

---

### TD003: Stripe Webhook Not Idempotent (Priority: Medium)

**Created:** 2026-09-18  
**Category:** Correctness  
**Location:** `app/api/webhooks/stripe/route.ts:42`  
**Effort:** 3 hours  
**Impact if not fixed:** Duplicate charges if Stripe retries webhook

**Current:** No idempotency check, processes every webhook event

**Desired:** Store processed event IDs in DB, skip if already processed

**Why deferred:** Stripe rarely retries (< 1%), low traffic in beta

**Deadline:** Before production launch (Sprint 5)

**Owner:** @[contributor]

---

## Resolved Debt

### TD005: No TypeScript Strict Mode (RESOLVED 2026-09-12)

**Original issue:** TypeScript `strict: false` allowed `any` types everywhere

**Resolution:** Enabled strict mode, fixed 47 type errors, added Zod validation

**Time spent:** 4 hours

**Resolved by:** @[contributor]  
**Resolved date:** 2026-09-12
```

---

## Tech Debt Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Scalability** | Works now, breaks at scale | Hardcoded limits, no pagination, N+1 queries |
| **Reliability** | Works most of time, fails edge cases | No error handling, missing validation, no retry logic |
| **Security** | Not immediately exploitable, but risky | Weak validation, missing rate limit, permissive CORS |
| **Performance** | Slow but functional | Unoptimized images, no caching, blocking I/O |
| **Maintainability** | Hard to understand/change | No types, duplicated code, no docs |
| **Code Quality** | Messy but works | Console.log, commented code, TODO comments |

---

## Hotfix Workflow

**Trigger:** Critical production bug (P0: site down, data loss, security breach)

**Goal:** Fix and deploy within 1 hour, bypass normal PR flow

### Step 1: Assess Severity (0-5 min)

| Severity | Description | Examples | Response Time |
|----------|-------------|----------|---------------|
| **P0 Critical** | Site down, data loss, security breach | Auth broken, payment broken, SQL injection exploit | Immediate hotfix |
| **P1 High** | Major feature broken, 5xx > 5% | Checkout fails, dashboard blank, API timeout | Hotfix within 4 hours |
| **P2 Medium** | Minor feature broken, 5xx < 1% | CSV export fails, filter broken | Normal PR (next deploy) |
| **P3 Low** | Cosmetic, typo, minor UX | Button text wrong, color off | Backlog |

**P0/P1 only:** Use hotfix workflow (bypass normal PR review)

**P2/P3:** Normal PR flow (no urgency)

---

### Step 2: Create Hotfix Branch (5-10 min)

```bash
# Branch from production (not main)
git checkout production  # or main if no separate prod branch
git pull
git checkout -b hotfix/fix-auth-broken

# Make minimal fix (no refactoring, no scope creep)
git add middleware.ts
git commit -m "hotfix: fix auth token check (= to ===)"
git push origin hotfix/fix-auth-broken
```

---

### Step 3: Test Locally (10-15 min)

```bash
# Run relevant tests
npm test -- auth.test.ts

# Manual smoke test
npm run dev

# Build check
npm run build
```

**If tests fail:** Fix before deploy (no "deploy and hope")

---

### Step 4: Deploy (15-20 min)

**Option A: Direct deploy (emergency, < 5 min to fix)**

```bash
# Merge hotfix to production
git checkout production
git merge hotfix/fix-auth-broken --no-ff
git push origin production

# Deploy
vercel --prod
```

**Option B: Fast-track PR (< 1 hour, needs approval)**

```bash
gh pr create --base production --title "Hotfix: Fix auth token check"
gh pr merge --merge
vercel --prod
```

---

### Step 5: Verify (20-25 min)

```bash
# Check production
curl https://myapp.com/api/health

# Check auth flow
curl https://myapp.com/api/auth/me -H "Cookie: session=..."
```

**If verification fails:** Rollback immediately

---

### Step 6: Backport to Main (25-30 min)

```bash
git checkout main
git merge hotfix/fix-auth-broken --no-ff
git push origin main

# Delete hotfix branch
git branch -d hotfix/fix-auth-broken
git push origin --delete hotfix/fix-auth-broken
```

---

### Step 7: Post-Mortem (within 48h)

**Required for P0/P1 hotfixes**

```markdown
# Hotfix Post-Mortem — Auth Broken (2026-09-22)

**Incident:** INC-002  
**Severity:** P0 (Critical)  
**Duration:** 12 minutes  
**Impact:** 23 users unable to log in

## Root Cause

Typo in auth middleware: `if (token = undefined)` instead of `if (token === undefined)`

## Prevention

- [ ] Enable TypeScript strict mode
- [ ] Add test for auth without token
- [ ] Add ESLint rule `no-cond-assign: error`
```

---

## Integration with Gates

Update `engine/GATE-REGISTRY.md`:

```markdown
### gate:hotfix-deploy (Hotfix Deploy)

**Trigger:** Emergency production fix (P0/P1)

**Evidence:**
- Severity confirmed (P0 or P1)
- Fix tested locally
- Rollback plan ready

**Post-deploy:**
- Verification completed
- Backport to main completed
- Post-mortem scheduled (within 48h)

**Bypass allowed — severity-dependent, see `references/qa/BUG_PRIORITY_MATRIX.md` for the canonical policy:**
- **P0 only:** Normal PR review may be fully bypassed (deploy first, PR opened for documentation after). Self-approval is permitted only at P0, and only because the alternative is an unusable system, active data loss, or an active security breach.
- **P1:** Review is fast-tracked, never fully skipped — open the PR before deploy, ping a reviewer directly for expedited async approval, deploy once that approval lands. Self-approval is **not** permitted at P1: P1 covers a broad "core feature broken" bucket that is not always as unambiguous as a P0, so a second set of eyes stays in the loop.
- Full test suite may run critical tests only, at either severity — but review approval (async is fine) is still required before a P1 deploy.

**NOT bypassed, at any severity:**
- Local testing
- Rollback plan
- Post-mortem
- At least one reviewer's approval (asynchronous for P1; waived only for P0)
```

---

**Agent Instruction:**

Tech Debt:
1. Create `docs/dev-docs/TECH-DEBT.md` at project start
2. Log debt when deferring proper solution
3. Review debt weekly
4. Dedicate 1 sprint to payoff if ≥ 5 high-priority items
5. **Check age, not just count, at every weekly review.** A count-based cap (rule 4)
   catches an overflowing register but says nothing about a single item that has sat
   at "High" priority for months without ever being scheduled — the 5-item cap can
   stay satisfied indefinitely while one specific item quietly never gets fixed. At
   each weekly review, for every item tagged High: if `created` date is **90+ days
   ago** and it has not been scheduled into a sprint, do one of two things — schedule
   it into the next sprint, or explicitly re-justify and re-date it (`re_justified:
   [date], reason: [still High because... / downgraded to Medium because...]`). An
   item cannot silently remain "High priority, unscheduled" past 90 days with no
   record of either action — record the outcome directly in `docs/dev-docs/TECH-DEBT.md`
   next to the item, e.g. `TD001 — reviewed 2026-09-22: re-justified High (blast
   radius grew from 3 to 6 files since creation), scheduled for Sprint 14`.

Hotfix:
1. Assess severity (P0/P1 = hotfix, P2/P3 = normal PR)
2. Branch from production, make minimal fix
3. Test locally before deploy
4. Deploy, verify, backport to main
5. Write post-mortem within 48h
