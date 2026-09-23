# Monitoring Mandatory Gate — Medium+ Production Deploy

**Purpose:** Block production deploy until monitoring baseline is verified.

**Applies to:** Medium, Large, Enterprise tiers only. Small tier: recommended but not blocking.

---

## Gate: Monitoring Ready

**Trigger:** Before first production deploy (after staging passes SIT)

**Evidence required in `docs/deployment/MONITORING-CHECKLIST.md`:**

```markdown
# Monitoring Checklist — [Project Name]

**Date verified:** 2026-09-22  
**Verified by:** [name]

## Error Tracking
- [x] Sentry/Rollbar/Bugsnag configured
- [x] DSN in production env vars
- [x] Source maps uploaded (verify: error shows original TS, not minified JS)
- [x] Test error captured in staging:
  - URL: https://staging.example.com/api/test-error
  - Sentry issue: https://sentry.io/issues/123456
  - Verified at: 2026-09-22 10:30 WIB
- [x] Release tracking enabled (Sentry release: v1.0)

## Health Check Endpoint
- [x] `/health` or `/api/health` endpoint exists
- [x] Returns 200 when healthy
- [x] Checks database connectivity (query: `SELECT 1`)
- [x] Tested in staging:
  ```bash
  curl https://staging.example.com/health
  # Response: {"status":"ok","database":"connected","timestamp":"2026-09-22T10:30:00Z"}
  ```

## Alerts Configured
- [x] **Alert 1:** Error rate > 5% in 5 minutes
  - Channel: Slack #alerts
  - Test: Triggered manually, received in Slack at 2026-09-22 10:35 WIB
- [x] **Alert 2:** p95 response time > 2s in 5 minutes
  - Channel: Slack #alerts
  - Test: (pending production traffic)
- [x] **Alert 3:** Uptime check failed (UptimeRobot/BetterUptime)
  - URL: https://uptimerobot.com/dashboard#12345
  - Interval: 5 minutes
  - Alert channel: Email + Slack
  - Test: Paused monitor manually, received alert at 2026-09-22 10:40 WIB

## Logging
- [x] Structured logging implemented (JSON format)
- [x] Log retention confirmed: Application debug logs 7 days (Vercel Pro) or 30 days (Logtail); Regulatory Security/Audit logs minimum 1 year (PostgreSQL audit_logs table / WORM storage per COMPLIANCE_AUTOMATION_GUIDE.md)
- [x] Sample log verified in staging:
  ```json
  {"level":"info","message":"Employee created","employeeId":123,"timestamp":"2026-09-22T10:30:00Z"}
  ```

## Uptime Monitoring
- [x] UptimeRobot/BetterUptime monitor created
- [x] Monitoring: https://hris.example.com
- [x] Check interval: 5 minutes
- [x] Alert if down > 5 minutes
- [x] SSL certificate expiry check enabled

## Database Monitoring (if applicable)
- [x] Slow query log enabled (Supabase/Vercel Postgres dashboard)
- [x] Connection pool size configured: 10 (adjust based on tier)
- [x] Disk usage alert: warn at 80%, critical at 90%

## Cost Monitoring (if using paid APIs)
- [ ] OpenAI/Anthropic usage limit set: $50/month
- [ ] Alert at 80% usage: $40
- [ ] Hard limit configured (API rejects requests at $50)

---

## Verification Steps

1. **Deploy to staging**
2. **Trigger test error:**
   ```bash
   curl https://staging.example.com/api/test-error
   ```
3. **Verify in Sentry:** Error captured with source maps
4. **Test health endpoint:**
   ```bash
   curl https://staging.example.com/health
   # Expected: {"status":"ok","database":"connected"}
   ```
5. **Test alert (error rate):**
   - Trigger 10+ errors in 1 minute
   - Verify Slack alert received
6. **Test alert (uptime):**
   - Pause UptimeRobot monitor
   - Verify alert received
7. **Resume monitor**

---

## Blocking Criteria

**CANNOT deploy to production if:**
- ❌ No error tracking configured (Sentry/Rollbar)
- ❌ No health check endpoint
- ❌ < 3 alert rules configured
- ❌ Uptime monitoring not setup
- ❌ Source maps not working (errors show minified JS)

**Can deploy with warning if:**
- ⚠️ Cost monitoring not setup (low priority if no paid APIs)
- ⚠️ Database slow query alert not configured (can add post-launch)

---

## Post-Deploy Verification (15 minutes)

After production deploy, watch for:

1. **Error rate dashboard** (first 15 min)
   - Target: < 1% error rate
   - If > 5%: investigate immediately
   - If > 10%: rollback

2. **Response time** (first 15 min)
   - Target: p95 < 500ms
   - If > 2s: investigate (missing index? N+1 query?)

3. **First real error**
   - Verify Sentry captures it
   - Verify source maps work
   - Verify alert fires

---

## Cost Summary (Free Options)

| Tool | Free Tier | Sufficient For |
|------|-----------|----------------|
| **Sentry** | 5K errors/month | Medium (< 10K users) |
| **Vercel Analytics** | Included | All Vercel deploys |
| **UptimeRobot** | 50 monitors, 5-min checks | All tiers |
| **Vercel Logs** | 7 days (Pro: $20/month) | Medium (short retention) |
| **Better Stack** | $5/month, 1GB logs | Medium (need 30-day retention) |

**Total cost Medium tier:** $0-5/month

---

## Templates

**Health Check Endpoint (Next.js):**

```typescript
// app/api/health/route.ts
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check database connectivity
    await db.execute('SELECT 1')
    
    return Response.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}
```

**Test Error Endpoint (staging only):**

```typescript
// app/api/test-error/route.ts
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Not available in production' }, { status: 403 })
  }
  
  throw new Error('Test error for Sentry verification')
}
```

---

## Emergency Bypass (P0 Only — Not a General Escape Hatch)

**This gate can only be bypassed under one specific condition:** a P0 incident
(per `references/qa/BUG_PRIORITY_MATRIX.md`) is actively in progress, and deploying
a fix immediately — even without full monitoring in place yet, e.g. this is the
project's very first production deploy and monitoring wasn't finished before an
urgent launch was forced — is judged to reduce harm more than waiting to finish
the monitoring checklist.

**This is deliberately narrow because in practice, "monitoring gate" is exactly
the kind of gate that gets waved through under time pressure regardless of what
the policy says — documenting the real bypass path, with a forced follow-up, is
safer than leaving the pressure-tested exception undocumented and ad hoc.**

**If bypassed, all of the following are required, not optional:**

1. Record the bypass in `docs/deployment/MONITORING-CHECKLIST.md` immediately:
   ```markdown
   ## Gate Bypassed — Emergency Deploy
   **Date:** [timestamp]
   **Reason:** P0 incident — [one line, e.g. "site down, fix ready, monitoring
     setup incomplete"]
   **Approved by:** [name — a human, not the deploying agent alone]
   **Minimum safety net in place at deploy time:** [at least: health check
     endpoint OR basic uptime check — never deploy with literally zero
     visibility, even in an emergency]
   ```
2. Open a follow-up ticket, due within **24 hours**, to complete the full
   monitoring checklist. This is not a "someday" backlog item — treat it with
   the same urgency the tech-debt register (`SKILL.md` Rule 10) gives a
   just-shipped hotfix.
3. Re-run this gate in full once the follow-up ticket is done, and update
   `CONTEXT.md` to remove any `monitoring_gate_bypassed: true` flag only after
   the full checklist is verified — not when the follow-up ticket is merely
   opened.

**What this bypass is not for:** "we're behind schedule and want to launch
today" is not a P0 incident and does not qualify. If there is no active P0,
the gate is not bypassable — finish the checklist first.



Before production deploy Medium+:
1. Create `docs/deployment/MONITORING-CHECKLIST.md` from template above
2. Configure Sentry (or Rollbar)
3. Add `/health` endpoint
4. Setup 3+ alert rules
5. Setup UptimeRobot monitor
6. Test all alerts in staging
7. Fill checklist with actual test results
8. Only then: deploy to production

Do not skip monitoring gate. Production without monitoring = flying blind.

---

**Last Updated:** 2026-09-22  
**Version:** 1.0.0
