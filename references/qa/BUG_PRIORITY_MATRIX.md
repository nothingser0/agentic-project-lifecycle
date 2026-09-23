# Bug Priority Matrix — P0/P1/P2/P3

**Purpose:** Standardize bug triage and response time.

**Applies to:** All tiers. Mandatory Medium+.

---

## Priority Matrix

| Priority | Severity | First Response (Triage) | Fix Target | Examples |
|----------|----------|-------------------------|------------|----------|
| **P0** | **Critical** | **≤ 15 minutes** | **≤ 4 hours** | Site down, data loss, security breach, payment broken |
| **P1** | **High** | **≤ 1 hour** | **≤ 24 hours** | Core feature broken, login fails, CVSS 4.0–6.9 auth/data flaw |
| **P2** | **Medium** | **≤ 4 hours** | **≤ 1 week** | Non-core feature broken, minor perf issue, bad UX, CVSS < 4.0 |
| **P3** | **Low** | **≤ 1 business day** | **≤ 2 weeks** | Cosmetic issue, typo, nice-to-have improvement |

---

## Decision Tree

```
Bug reported
  ↓
Q1: Does it block ALL users from using the app?
  YES → P0 (site down, database unreachable)
  NO → Q2

Q2: Is it a security vulnerability or active exploit?
  CVSS ≥ 7.0, active exploit, leaked production credentials,
  SQL injection, unescaped XSS, auth bypass, privilege escalation:
  → P0 (Critical, fix in ≤ 4h)
  
  CVSS 4.0–6.9 affecting auth, session integrity, or sensitive PII:
  → P1 (High, fix in ≤ 24h)
  
  CVSS < 4.0, missing defense-in-depth header, or non-exploitable transitive dep:
  → Route to P2 (Medium) or P3 (Low) based on exposure and blast radius.
  
  Not a security issue:
  → Q3

Q3: Does it cause data loss, or a legal/compliance violation
    (GDPR breach, data leaked)?
  YES → P0
  NO → Q4

Q4: Does it affect core functionality?
  YES → Q5
  NO → Q6

Q5: How many users affected?
  > 50% → P0 (login broken, payment failed)
  10-50% → P1 (specific feature broken)
  < 10% → P1 (a core-functionality bug is still P1 even at low
    reported reach — "10% of users hit it" often means "10% have
    noticed it so far," not "only 10% are exposed." Downgrade to P2
    only after triage confirms the affected surface is genuinely
    narrow, e.g. a rarely-used admin-only screen — record that
    justification in the bug report, don't downgrade by default.)

Q6: Does it affect revenue?
  YES → P1 (export broken, report failed)
  NO → Q7

Q7: Is it cosmetic only?
  YES → P3 (typo, misaligned button)
  NO → P2 (minor UX issue)
```

**Why security/data-loss/compliance moved to the top:** in the previous
version of this tree, Q2 ("does it affect core functionality") gated
whether the security check was ever reached — a security bug *inside*
core functionality but affecting a minority of users (e.g. a
role-scoped IDOR, or SQL injection reachable only via a low-traffic
admin path) would fall into the old Q3's "<10% → P2" branch and never
reach the security question at all. That contradicted this same
file's Priority Definitions below, which state that *any one* of
"security breach," "data loss," or "legal compliance violation"
triggers P0 outright, independent of user-count. Security, data-loss,
and compliance are now checked first and unconditionally, so the tree
can no longer produce a result that contradicts the prose criteria.

---

## Priority Definitions

### P0 (Critical)

**Definition:** System unusable OR security breach OR data loss.

**Criteria (any one triggers P0):**
- Site completely down (503, 500 errors)
- Database unreachable
- Authentication completely broken (no one can login)
- Payment processing failed
- Security breach (leaked credentials, XSS exploit, SQL injection)
- Data loss (deleted records not recoverable)
- Legal compliance violation (GDPR breach, data leaked)

**Response:**
- Page on-call engineer immediately
- Drop everything else
- Fix within 4 hours OR rollback
- Status page update every 30 minutes
- Post-mortem required within 48 hours

**Examples:**
- `TypeError: Cannot read property 'id' of undefined` on every page → **P0**
- Database password leaked in git → **P0**
- All users see 503 error → **P0**
- `DROP TABLE users` executed accidentally → **P0**

---

### P1 (High)

**Definition:** Core feature broken OR major performance degradation.

**Criteria (any one triggers P1):**
- Core feature broken (login, signup, data entry, reports)
- > 50% users affected by a bug
- Error rate > 10% (10% of requests fail)
- p95 response time > 5s (normally < 1s)
- External integration broken (API, OAuth, payment gateway)

**Response:**
- Notify team immediately (Slack)
- Fix within 24 hours
- Fast-track PR: at least one reviewer approval required, but reviewer may approve asynchronously post-deploy-to-staging (do not fully bypass review — P1 already covers a broad "core feature broken" bucket, so skipping review entirely on P1 is not safe; full bypass is P0-only, see below)
- Communicate to affected users

**Examples:**
- Login works for Google OAuth but not email/password → **P1**
- Employee list page crashes on load → **P1**
- Payroll generation fails for 500+ employees → **P1**
- Dashboard loads in 10s (normally 1s) → **P1**

---

### P2 (Medium)

**Definition:** Non-core feature broken OR minor UX issue.

**Criteria:**
- Non-core feature broken (export CSV, search filter)
- 10-50% users affected
- Error rate 1-10%
- Bad UX (confusing, slow but usable)
- Visual bug (misaligned, wrong color)

**Response:**
- Add to current sprint backlog
- Fix within 1 week
- Normal PR review process

**Examples:**
- Export CSV button returns 500 error → **P2**
- Search filter doesn't filter correctly → **P2**
- Button misaligned on mobile → **P2**
- Toast notification doesn't dismiss automatically → **P2**

---

### P3 (Low)

**Definition:** Cosmetic issue OR nice-to-have improvement.

**Criteria:**
- Typo, grammar error
- Cosmetic issue (padding, margin)
- Feature request (not a bug)
- Documentation error
- < 10% users affected by minor inconvenience

**Response:**
- Add to backlog
- Fix in next sprint or when convenient
- Can be batched with other P3 fixes

**Examples:**
- Typo: "Employe" should be "Employee" → **P3**
- Button padding 8px should be 12px → **P3**
- "Add dark mode" feature request → **P3**
- README outdated → **P3**

---

## Triage Process

### Step 1: Bug Report Template

**GitHub Issue / TASKS.md:**

```markdown
## Bug Report

**Priority:** [P0 | P1 | P2 | P3] (filled by triager)

**What happened:**
Clicked "Generate Payroll" button, got 500 error.

**Expected:**
Payroll generated successfully.

**Steps to reproduce:**
1. Login as HR
2. Go to /payroll
3. Click "Generate Payroll"
4. Select "September 2026"
5. Click "Generate"

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- URL: https://hris.example.com/payroll/generate

**Error message (if any):**
```
Error: Query timeout after 30s
```

**Screenshot:**
[Attach screenshot]

**Impact:**
Cannot generate payroll for 500 employees. Payroll due Friday.
```

---

### Step 2: Triage (5 minutes)

**Who:** On-call engineer OR tech lead

**Action:**
1. Read bug report
2. Apply decision tree
3. Assign priority (P0/P1/P2/P3)
4. Assign owner
5. Set due date
6. Add label

**Example:**
```
Bug: Payroll generation timeout
Priority: P1 (core feature, payroll due Friday)
Owner: @backend-engineer
Due: 2026-09-23 5pm WIB (24 hours)
Label: bug, backend, database
```

---

### Step 3: Fix

**P0 only:** Full hotfix workflow (bypasses normal PR review — deploy first, review after, because the system is unusable, has a security breach, or is losing data right now)

```bash
# Create hotfix branch
git checkout -b hotfix/payroll-timeout

# Fix the bug
# (e.g., add pagination, increase timeout)

# Test locally
npm test

# Deploy directly to staging
git push origin hotfix/payroll-timeout

# Test in staging
curl https://staging.example.com/api/payroll/generate

# If works: deploy to production
vercel --prod

# Create PR after deploy (for documentation)
gh pr create --title "Hotfix: Payroll generation timeout"
```

**P1:** Fast-track workflow — open the PR before deploying, but do not wait for the normal review queue. Ping a reviewer directly (Slack/DM) for an expedited async approval; deploy once that approval lands, not before. This is faster than the P2/P3 queue but is never a full skip of review, because P1 covers a wide range of "core feature broken" incidents that are not all as unambiguous as a P0.

```bash
git checkout -b hotfix/payroll-timeout
# fix + npm test, same as above
git push origin hotfix/payroll-timeout
gh pr create --title "Hotfix: Payroll generation timeout" --label "P1,expedited-review"
# Ping reviewer directly; do not deploy to production until approval lands
```

**P2/P3:** Normal workflow (PR → review → merge → deploy)

---

### Step 4: Verify

**After fix deployed:**

1. Test in production
2. Verify with reporter ("Can you try again?")
3. Monitor error rate (Sentry)
4. Close issue

**If not fixed:**
- Re-open issue
- Add "regression" label
- Bump priority (P2 → P1)

---

## SLA (Service Level Agreement)

| Priority | First Response | Fix Target | Breach Action |
|----------|----------------|------------|---------------|
| P0 | 15 minutes | 4 hours | Escalate to CTO |
| P1 | 1 hour | 24 hours | Escalate to tech lead |
| P2 | 1 business day | 1 week | Add to sprint |
| P3 | 2 business days | 2 weeks | Backlog |

**First Response:** Acknowledge bug, assign priority, assign owner.

**Fix Target:** Bug fixed and deployed to production.

**Breach Action:** What happens if SLA missed.

---

## Bug Metrics (Track Weekly)

### Dashboard

```
Week of 2026-09-16

P0: 0 ✅
P1: 2 ⚠️ (1 overdue)
P2: 5 ✅
P3: 12 ✅

Median resolution time:
- P0: - (no incidents)
- P1: 18 hours (target: 24h) ✅
- P2: 4 days (target: 7d) ✅
- P3: 10 days (target: 14d) ✅

Top bug sources:
1. Payroll module (4 bugs)
2. Attendance (3 bugs)
3. Reports (2 bugs)
```

**Action:**
- If P1 overdue → escalate
- If module has 5+ bugs → refactor sprint

---

## Integration with TASKS.md

**Add "Bug" column:**

```markdown
# TASKS — HRIS

## Queued
- [ ] #5: Add payslip PDF export

## Building
- [ ] #4: Employee bulk import CSV

## Done
- [x] #3: Attendance clock-in GPS

## Bug
- [ ] **P1** #6: Payroll generation timeout (due: 2026-09-23)
- [ ] **P2** #7: Export CSV returns 500 error (due: 2026-09-28)
- [ ] **P3** #8: Button misaligned on mobile

## Needs Spec
(empty)
```

**Priority emoji:**
- P0: 🚨
- P1: **P1** (bold)
- P2: P2 (normal)
- P3: ~~P3~~ (strikethrough if very low priority)

---

## When to Re-Triage

**Bump priority UP if:**
- More users affected than initially thought
- Bug causes cascading failures
- Workaround doesn't work
- Customer escalated

**Lower priority DOWN if:**
- Workaround exists
- Feature is rarely used
- Fix is complex, requires refactor

**Example:**
```
Initial: P1 (payroll broken)
After investigation: P2 (only affects 1 specific role, workaround exists)
```

---

## Anti-Patterns (Avoid)

❌ **Everything is P0:**
```
P0: Typo on homepage
P0: Button color wrong
P0: Feature request
```

If everything is urgent, nothing is urgent.

✅ **Accurate triage:**
```
P3: Typo on homepage
P3: Button color wrong
P3: Feature request (not a bug)
```

---

❌ **No priority assigned:**
```
Bug: Login broken
Owner: (unassigned)
Due: (none)
```

Bug sits in backlog forever.

✅ **Clear priority + owner:**
```
P1: Login broken
Owner: @frontend-engineer
Due: 2026-09-23 5pm WIB
```

---

## Checklist

**Before production launch (Medium+):**

- [ ] Bug priority matrix documented (P0/P1/P2/P3)
- [ ] Bug report template created (GitHub issue template)
- [ ] Triage process defined (who, when, how)
- [ ] SLA defined (response time, fix target)
- [ ] Hotfix workflow documented (P0 = full bypass, P1 = fast-track with async review, never a full skip)
- [ ] Bug metrics dashboard setup (weekly review)
- [ ] TASKS.md has "Bug" column

---

**Agent Instruction:**

When bug reported:
1. Apply decision tree
2. Assign priority (P0/P1/P2/P3)
3. Add to TASKS.md "Bug" column
4. If P0: fix immediately (full hotfix workflow, bypass review). If P1: fix immediately (fast-track workflow, expedited async review — do not skip review entirely)
5. If P2/P3: add to sprint backlog
6. Verify after fix deployed
7. Close issue

Do not skip triage. Prioritization prevents chaos.

---

**Last Updated:** 2026-09-22  
**Version:** 1.0.0
