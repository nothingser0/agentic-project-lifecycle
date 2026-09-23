# Rollback & Deployment Safety Guide — DevOps Risk Mitigation

**Purpose:** Enable fast, safe rollback when deployment breaks production.

**When to use:** Every production deployment (Medium+ projects)

---

## Deployment Strategies

### 1. Blue-Green Deployment

**Concept:** Two identical production environments (Blue = current, Green = new). Switch traffic when new version ready.

**Pros:**
- Instant rollback (switch traffic back to Blue)
- Zero downtime
- Test Green in production before switching traffic

**Cons:**
- Requires 2x infrastructure (expensive)
- Database migrations need careful coordination

**When to use:** Critical SaaS with SLA guarantee (99.9%+ uptime)

**Platforms:**
- AWS: Elastic Beanstalk (swap environment URLs)
- Vercel: Instant rollback (built-in, free)
- Railway: Deployment history with 1-click rollback
- Heroku: Pipelines with promotion

**Example (Vercel):**

```bash
# Deploy new version
vercel --prod
# (if broken, instant rollback)
vercel rollback
```

---

### 2. Canary Deployment

**Concept:** Route 5-10% of traffic to new version, monitor errors, gradually increase to 100%.

**Pros:**
- Catch issues early (only 5-10% users affected)
- Data-driven rollout (monitor metrics before full deploy)

**Cons:**
- Requires traffic splitting (load balancer or edge)
- More complex than simple deploy

**When to use:** High-traffic apps with real-time monitoring (B2C SaaS)

**Platforms:**
- Cloudflare Workers: Split by percentage (A/B testing)
- Vercel Edge Config: Gradual rollout
- AWS ALB: Weighted target groups
- Kubernetes: Flagger (automated canary with Prometheus)

**Example (Cloudflare Workers):**

```javascript
// cloudflare-worker.js
export default {
  async fetch(request) {
    const rolloutPercent = 10; // 10% canary
    const random = Math.random() * 100;
    
    if (random < rolloutPercent) {
      return fetch('https://new-version.example.com');
    } else {
      return fetch('https://current-version.example.com');
    }
  }
}
```

---

### 3. Rolling Deployment (Default for Small/Medium)

**Concept:** Deploy new version incrementally, one instance at a time.

**Pros:**
- Simple, built-in for most platforms
- No extra infrastructure cost

**Cons:**
- Slow rollback (need to redeploy old version)
- Mixed versions live during rollout (compatibility risk)

**When to use:** Internal tools, low-traffic apps, MVP stage

**Platforms:**
- Vercel: Default (auto-rollout)
- Railway: Default
- Fly.io: Default
- Render: Default

---

## Rollback SOP (Standard Operating Procedure)

### Detection (0-5 min)

**Automated alerts trigger rollback investigation:**

- Error rate spike (e.g., 5xx errors > 1% of requests)
- Response time degradation (p95 latency > 2x baseline)
- Health check failure (3 consecutive failures)
- User reports (3+ reports of same issue in 5 min)

**Monitoring tools:**
- Vercel Analytics (built-in, free)
- Sentry (error tracking)
- Cloudflare Analytics (traffic + errors)
- Uptime Robot (health check, free)

### Decision (5-10 min)

**Rollback decision matrix:**

| Severity | Impact | Action | Response Time (Rollback Execution) |
|----------|--------|--------|------------------------------------|
| **P0 Critical** | Site down, auth broken, data loss | Immediate rollback | ≤ 5 min (stateless) / 15–30 min (stateful DB PITR)* |
| **P1 High** | Feature broken, 5xx errors > 5% | Rollback after 10 min if no quick fix | ≤ 15 min |
| **P2 Medium** | UI bug, degraded UX, 5xx < 1% | Fix forward (no rollback) | Next deploy |
| **P3 Low** | Typo, minor visual glitch | Fix forward | Next sprint |

**What "Response Time" measures here — read this before quoting the numbers externally:**

This is the **execution time of the rollback action itself** (the mechanical `vercel rollback` / `kubectl rollout undo` / traffic-switch step), measured from the moment a human or on-call engineer decides to roll back. It is **not** the same number as `references/devops/INCIDENT_RESPONSE_RUNBOOK.md`'s "Mitigation Target" or "Final Fix Target", which measure the **full incident lifecycle** (detection → triage in ≤15 min → decision → rollback execution → verification → mitigation in ≤1 hour, final fix in ≤4 hours per `references/qa/BUG_PRIORITY_MATRIX.md`). Do not copy the ≤5 min figure into a client-facing SLA as if it were total incident resolution time — quote the incident runbook's mitigation-time target for that, and use this table's numbers only for the internal mechanical rollback step. The worked post-mortem example below (18 minutes, P1) is consistent with this: it includes detection, user reports, and investigation time on top of the mechanical rollback action target, not a violation of it.

**Crucial Caveat for Deployments with Database Migrations:**
The ≤5 minute rollback SLA applies strictly to **stateless application services**. If the failing deployment executed a database migration:
1. **Additive / Expand-Contract migrations:** Instant code rollback is safe. The previous code version simply ignores newly added nullable columns or tables.
2. **Stateful / Destructive migrations:** Rolling back stateless containers alone will result in immediate runtime crashes (ORM schema mismatch). In this scenario, execution must follow `references/backend/DATABASE_STRATEGY_GUIDE.md` §3a:
   - If a tested down-migration exists, apply the down-migration first before or concurrently with code rollback.
   - If the migration is irreversible and data corruption occurred, fallback to Point-In-Time-Recovery (PITR). The realistic RTO for DB restore is **15–30 minutes**, not 5 minutes. Never quote a 5-minute RTO for stateful database recoveries.

**"Fix forward" vs "Rollback":**

- **Rollback:** User-facing breakage, no quick fix, or unknown root cause
- **Fix forward:** Known small fix (≤ 5 min to patch), no data risk

### Execution (≤ 5 min stateless, 15–30 min stateful PITR)

**Rollback command per platform:**

```bash
# Vercel
vercel rollback

# Railway
railway rollback

# Fly.io
fly releases list
fly releases rollback <version>

# Render
# (via dashboard: Deployments → previous deploy → Redeploy)

# Heroku
heroku releases
heroku rollback v123

# AWS Elastic Beanstalk
aws elasticbeanstalk update-environment \
  --environment-name prod \
  --version-label previous-version

# Kubernetes
kubectl rollout undo deployment/myapp
```

**Database rollback (if schema changed):**

```bash
# Prisma
npx prisma migrate resolve --rolled-back <migration-name>

# Drizzle
npm run db:rollback

# Raw SQL (manual)
psql -d mydb -f rollback-migration-001.sql
```

⚠️ **NEVER rollback destructive migrations** (DROP TABLE, DROP COLUMN) — those are irreversible. Always add columns (additive changes only), deprecate old columns instead of dropping.

### Verification (15-20 min)

**Post-rollback checks:**

- [ ] Site loads (check 3 critical pages)
- [ ] Auth works (sign in test)
- [ ] Critical flow works (1 happy path test)
- [ ] Error rate back to baseline (< 0.1%)
- [ ] Monitoring alerts cleared

### Communication (0-30 min)

**Internal:**
- Slack/Discord: "Rolled back deploy due to [issue]. Investigating."

**External (if user-facing outage > 5 min):**
- Status page update: "We experienced an issue and rolled back. Service restored."
- Post-mortem within 48h (see below)

---

## Pre-Deploy Checklist (Prevent Rollback)

**Run before every production deploy:**

```markdown
## Pre-Deploy Checklist

### Code Quality
- [ ] All tests passed (unit, integration, e2e)
- [ ] Linter passed (no errors)
- [ ] Type check passed (TypeScript strict mode)
- [ ] Security scan passed (no critical vulnerabilities)
- [ ] Performance budget not exceeded

### Environment
- [ ] Environment variables set in production (check .env.production)
- [ ] Secrets rotated if needed (API keys, DB password)
- [ ] Database migration tested in staging
- [ ] Feature flags configured (if using feature flags)

### Monitoring
- [ ] Error tracking enabled (Sentry, LogRocket)
- [ ] Health check endpoint working (`/api/health`)
- [ ] Monitoring alerts configured (error rate, latency)

### Rollback Plan
- [ ] Rollback command documented (see above)
- [ ] Database rollback script ready (if schema changed)
- [ ] On-call engineer assigned (knows rollback SOP)
```

---

## Database Migration Safety

**Additive-only migrations (safe for rollback):**

✅ **SAFE:**
- Add new table
- Add new column (with default value)
- Add new index
- Create new foreign key

❌ **UNSAFE (cannot rollback):**
- Drop table
- Drop column
- Rename column (breaks old app version)
- Change column type (data loss risk)

**Safe deprecation pattern:**

```sql
-- Deploy 1: Add new column
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;

-- Deploy 2 (1 week later, after new code uses new column):
-- Backfill old data
UPDATE users SET email_verified = true WHERE old_email_status = 'verified';

-- Deploy 3 (1 month later, after confirming old column unused):
-- Mark old column deprecated (comment, don't drop yet)
COMMENT ON COLUMN users.old_email_status IS 'DEPRECATED - use email_verified';

-- Deploy 4 (3 months later, if truly unused):
-- Drop old column (optional, low priority)
ALTER TABLE users DROP COLUMN old_email_status;
```

**Migration testing:**

```bash
# Test in local/staging FIRST
npm run db:migrate # or prisma migrate deploy

# Verify:
# 1. New code works with new schema
# 2. Old code still works (if rollback needed)

# Then production:
npm run db:migrate:prod
```

---

## Feature Flags (Advanced Rollback Alternative)

**Concept:** Deploy code to production but keep feature hidden behind flag. Enable gradually.

**Pros:**
- Instant disable (flip flag, no redeploy)
- Gradual rollout (enable for 10% users, then 50%, then 100%)
- A/B testing built-in

**Cons:**
- Code complexity (if/else branches)
- Flag cleanup debt (remove old flags after launch)

**Tools:**

| Tool | Free Tier | Best For |
|------|-----------|----------|
| **PostHog** | 1M events/month | Feature flags + analytics |
| **LaunchDarkly** | 1K MAU | Enterprise-grade flags |
| **Unleash** | Self-hosted | Open-source, no vendor lock-in |
| **Vercel Edge Config** | Free | Next.js edge flags |
| **Simple env var** | Free | DIY (FEATURE_X_ENABLED=true) |

**Example (simple env var approach):**

```typescript
// .env.production
FEATURE_NEW_CHECKOUT=false

// app/checkout/page.tsx
export default function CheckoutPage() {
  const newCheckoutEnabled = process.env.FEATURE_NEW_CHECKOUT === 'true';
  
  if (newCheckoutEnabled) {
    return <NewCheckout />;
  }
  
  return <OldCheckout />;
}
```

**Rollback:**

```bash
# Disable feature (no redeploy needed if using edge config/LaunchDarkly)
vercel env add FEATURE_NEW_CHECKOUT false --prod
```

---

## Health Check Endpoint

**Every app needs `/api/health` for automated monitoring.**

```typescript
// app/api/health/route.ts (Next.js App Router)
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check external service (optional)
    // await fetch('https://api.stripe.com/v1/health');
    
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
    });
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

**Monitor with uptime service:**

- Uptime Robot (free, 5 min interval)
- Pingdom (free tier, 1 site)
- Checkly (API monitoring)

**Alert on 3 consecutive failures** (not 1 failure, to avoid false positive).

---

## Post-Incident Post-Mortem

**Required after P0/P1 incident (site down, rollback, data loss).**

**Template:**

```markdown
# Post-Mortem — Production Rollback (2026-09-22)

**Incident ID:** INC-001
**Date:** 2026-09-22 14:30 UTC
**Severity:** P1 (High)
**Duration:** 18 minutes (deploy to rollback)
**Impact:** Checkout flow broken, 47 users affected (no revenue during outage)

## Timeline

- **14:30** — Deploy v1.2.3 to production
- **14:32** — Sentry alert: TypeError in checkout API
- **14:35** — User reports (3 tickets: "Cannot complete purchase")
- **14:38** — Engineer investigates, confirms checkout broken
- **14:42** — Decision: Rollback (no quick fix)
- **14:45** — `vercel rollback` executed
- **14:48** — Verification: Checkout flow working
- **14:50** — Monitoring alerts cleared

## Root Cause

Stripe API integration refactor (v1.2.3) introduced breaking change:

```diff
- const session = await stripe.checkout.sessions.create({...});
+ const session = await stripe.checkout.sessions.create({amount: ...}); // ❌ amount param renamed
```

Stripe SDK v12 changed `amount` to `line_items`. Code updated but not tested in staging (staging used mock Stripe, not real API).

## Contributing Factors

1. Staging environment used mock Stripe (not test mode API)
2. No integration test for Stripe checkout flow
3. Deploy happened during business hours (high traffic)

## Resolution

- Immediate: Rolled back to v1.2.2
- Follow-up: Fixed Stripe integration in v1.2.4, tested in staging with real Stripe test mode
- Deployed v1.2.4 next day (2026-09-23 09:00, low-traffic window)

## Lessons Learned

1. **Test external APIs in staging** — Use Stripe test mode, not mocks
2. **Add integration test** — E2E test for checkout flow with real API
3. **Deploy during low-traffic window** — Midnight-6am UTC (not business hours)

## Action Items

- [ ] #ACT-001: Configure Stripe test mode in staging (@[contributor], by 2026-09-23)
- [ ] #ACT-002: Write E2E test for checkout flow (@[contributor], by 2026-09-24)
- [ ] #ACT-003: Add "Deploy window" policy to RUNBOOK.md (@[contributor], by 2026-09-23)
- [ ] #ACT-004: Enable Stripe webhook monitoring in Sentry (@[contributor], by 2026-09-25)
```

**No blame, only process improvement.**

---

## Integration with Gates

Update `engine/GATE-REGISTRY.md`:

```markdown
### gate:production-deploy (Production Deploy)

**Trigger:** Before deploying to production

**Evidence:**
- UAT passed
- Security checklist passed
- Performance budget not exceeded
- Design validation passed
- **Pre-deploy checklist completed** ← NEW
- **Rollback plan documented** ← NEW
- On-call engineer assigned (knows rollback SOP)

**Rollback readiness:**
- Rollback command tested in staging
- Database migration reversible (additive-only) or rollback script ready
- Health check endpoint working
- Monitoring alerts configured

**Blocker:** Cannot deploy if rollback plan missing or database migration unsafe.
```

---

**Agent Instruction:**

Before every production deploy:

1. Run pre-deploy checklist
2. Document rollback command (platform-specific)
3. Test database migration in staging first
4. Verify health check endpoint working
5. If deploy breaks production, execute rollback SOP within 15 min
6. Write post-mortem for P0/P1 incidents (no blame, focus on process)

Do not deploy database schema changes (DROP, RENAME) without additive migration pattern.
