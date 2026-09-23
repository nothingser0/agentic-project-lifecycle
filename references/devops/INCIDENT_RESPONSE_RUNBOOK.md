# Incident Response Runbook — Mandatory Large+

**Purpose:** Define who does what when production breaks.

**Applies to:** Large, Enterprise tiers. Medium: recommended.

---

## Incident Priority Levels

| Priority | Impact | First Response (Triage) | Mitigation Target | Final Fix Target | Examples |
|----------|--------|-------------------------|-------------------|------------------|----------|
| **P0 (Critical)** | Site down, data loss, security breach, payment failed | **≤ 15 minutes** | **≤ 1 hour** (rollback in ≤ 5m stateless / 15–30m stateful PITR) | **≤ 4 hours** | 503 errors, database unreachable, leaked credentials |
| **P1 (High)** | Core feature broken, major performance degradation | **≤ 1 hour** | **≤ 4 hours** | **≤ 24 hours** | Login broken, payroll generation fails, 50%+ error rate |
| **P2 (Medium)** | Non-core feature broken, minor performance issue | **≤ 4 hours** | **≤ 1 business day** | **≤ 1 week** | Export CSV broken, slow dashboard load, 5-10% error rate |
| **P3 (Low)** | Cosmetic issue, minor bug | **≤ 1 business day** | **Next sprint** | **≤ 2 weeks** | Typo, misaligned button, chart rendering glitch |

**SLA Terminology Distinction:**
- **First Response (Triage):** On-call paged, incident acknowledged, initial severity confirmed (P0 target: ≤15 min).
- **Mitigation Target:** Bleeding stopped, service restored via rollback, failover, or feature flag (P0 target: 15–60 min total; mechanical rollback action itself is ≤5 min for stateless containers, or 15–30 min for stateful database PITR per `references/devops/ROLLBACK_DEPLOYMENT_GUIDE.md`).
- **Final Fix Target:** Root cause permanently remediated, tested, and deployed (P0 target: ≤4 hours per `references/qa/BUG_PRIORITY_MATRIX.md`). Quote mitigation and final fix targets transparently when communicating externally.

---

## Incident Response Flow

```
Incident Detected (alert/report)
  ↓
TRIAGE (5 min): Assess priority
  ↓
P0? → Page on-call immediately
  ↓
MITIGATE (15-60 min): Stop the bleeding
  ↓
COMMUNICATE: Status page + Slack updates
  ↓
RESOLVE: Fix root cause
  ↓
POST-MORTEM (within 48h): Document + prevent recurrence
```

---

## Roles & Responsibilities

### Incident Commander (IC)

**Who:** On-call engineer (rotates weekly)

**Responsibilities:**
- Assess incident priority (P0-P3)
- Coordinate response (who does what)
- Communicate status updates (every 30 min for P0, hourly for P1)
- Decide: mitigate now or fix root cause
- Declare incident resolved
- Schedule post-mortem

**Not responsible for:** Fixing the bug (delegates to specialists)

---

### On-Call Rotation & Sustainable Operations

**Sustainable Team Size:** Minimum **4–5 engineers** in rotation (Google SRE standard: individual on-call commitment must not exceed 25% of time to prevent operational burnout and attrition).

**Schedule & Roles:**
- **Primary On-Call (1 week shift):** First responder for automated alerts and incoming critical incidents.
- **Secondary / Backup On-Call (1 week shift):** Escalation backup if Primary does not acknowledge within 15 minutes, or assists when multiple simultaneous incidents occur.
- **Rotation:**
  - Week 1: Engineer A (Primary), Engineer B (Secondary)
  - Week 2: Engineer B (Primary), Engineer C (Secondary)
  - Week 3: Engineer C (Primary), Engineer D (Secondary)
  - Week 4: Engineer D (Primary), Engineer E (Secondary)
  - Week 5: Engineer E (Primary), Engineer A (Secondary)

**On-Call Health & Burnout Guardrails:**
- **Compensatory Rest Policy:** If an on-call engineer is paged for a P0/P1 between 00:00 and 06:00, they are relieved of standard sprint work the following morning until 13:00 to recover.
- **Alert Fatigue Threshold:** If an on-call shift receives > 10 non-actionable pages in 7 days, the alert rules must be tuned or disabled during the Monday handoff.
- **Small Teams (<4 devs):** Follow `references/pm/SOLO_DEVELOPER_GUIDE.md` — configure strict alerting silence windows outside core business hours for non-critical alerts; only P0 (site completely down) pages after hours.

**Handoff:** Monday 9am WIB

**Handoff checklist:**
- [ ] PagerDuty app installed, notifications enabled
- [ ] VPN access working
- [ ] Database access verified
- [ ] Rollback access verified
- [ ] Read last week's incidents (Slack #incidents)
- [ ] Check open alert status and review noisy monitors

---

### Escalation Ladder

**L1 (On-call engineer):**
- Triage
- Mitigate (rollback, disable feature flag)
- Fix if root cause clear

**L2 (Team lead):**
- If L1 stuck after 30 min (P0) or 1 hour (P1)
- Complex root cause requiring architecture knowledge

**L3 (CTO/VP Eng):**
- If L2 stuck after 1 hour
- Security breach, data loss, legal issue
- External communication needed (press, customers)

**When to escalate:** Don't wait too long. P0 stuck 30 min → escalate.

---

## Mitigation Playbooks

### P0-1: Site Down (503 errors)

**Diagnosis:**
```bash
# Check health endpoint
curl https://hris.example.com/health

# Check error logs
vercel logs --since 10m | grep "error"

# Check database
psql $DATABASE_URL -c "SELECT 1"
```

**Mitigation:**

1. **If deploy caused it:**
   ```bash
   # Rollback to previous version
   vercel rollback
   # Or via dashboard: Deployments → Previous → Promote to Production
   ```

2. **If database unreachable:**
   - Check Supabase/Vercel Postgres dashboard (down?)
   - Check connection pool exhausted (restart app)
   - Check network (VPC/firewall)

3. **If OOM (out of memory):**
   - Scale up instances (Vercel: bump plan, Railway: scale)
   - Restart app

**Resolution time target:** 15 minutes

---

### P0-2: Security Breach (leaked credentials)

**Diagnosis:**
- Alert from secret scanner (Gitleaks, GitHub)
- User report
- Unauthorized access detected

**Mitigation:**

1. **ROTATE IMMEDIATELY** (do not investigate first):
   ```bash
   # Rotate database password
   # Rotate API keys
   # Rotate session secret
   # Revoke OAuth tokens
   ```

2. **Revoke access:**
   - Invalidate all active sessions: `DELETE FROM sessions`
   - Force re-login for all users

3. **Assess damage:**
   - Check audit logs: who accessed what?
   - Check database: data exfiltrated?

4. **Notify:**
   - Internal: Slack #security
   - Legal: If PII/payment data accessed
   - Users: If required by GDPR/law

**Resolution time target:** 15 minutes (rotation), 4 hours (assessment)

---

### P1-1: Login Broken

**Diagnosis:**
```bash
# Test login manually
curl -X POST https://hris.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Check error logs
vercel logs --since 30m | grep "login"

# Check Sentry
# Go to sentry.io → Issues → Filter by "login"
```

**Common causes:**
- Session secret rotated (invalidated all sessions)
- Database migration broke `users` table
- OAuth provider down (GitHub, Google)
- Rate limit misconfigured (blocking all logins)

**Mitigation:**

1. **If OAuth down:**
   - Check status page (e.g., githubstatus.com)
   - Temporarily disable OAuth, use email/password only

2. **If rate limit issue:**
   - Increase rate limit temporarily
   - Whitelist IP ranges

3. **If database migration:**
   - Rollback migration
   - Or: hotfix migration, deploy immediately

**Resolution time target:** 1 hour

---

### P1-2: Payroll Generation Fails

**Diagnosis:**
```bash
# Check logs
vercel logs --since 1h | grep "payroll"

# Check Sentry
# Filter: tag:feature=payroll

# Test manually
# Open /payroll/generate → Generate → Check error message
```

**Common causes:**
- N+1 query timeout (too many employees)
- Database lock (migration running)
- External API failure (bank integration)

**Mitigation:**

1. **If timeout:**
   - Increase timeout temporarily
   - Process in batches (10 employees at a time)

2. **If external API down:**
   - Retry with exponential backoff
   - Or: manual fallback (generate CSV, process later)

3. **If database lock:**
   - Wait for migration to finish
   - Or: kill long-running query

**Resolution time target:** 1 hour

---

## Communication Templates

### Status Page Update (P0)

**Initial (5 min after detection):**
```
Title: Service Disruption
Status: Investigating

We are currently experiencing issues with our service. 
Our team is investigating and will provide updates shortly.

Posted at: 10:30 WIB
```

**Update (every 30 min):**
```
Status: Identified

We have identified the issue as a database connectivity problem. 
Our team is working on a fix. ETA: 15 minutes.

Posted at: 11:00 WIB
```

**Resolved:**
```
Status: Resolved

The issue has been resolved. All services are now operational.
We apologize for the inconvenience.

Posted at: 11:15 WIB
```

---

### Internal Slack Update (P0)

**Template:**
```
🚨 **P0 INCIDENT** 🚨

**Status:** Investigating
**Impact:** Site down, all users affected
**Started:** 10:30 WIB
**IC:** @engineer-on-call

**What we know:**
- 503 errors on all pages
- Health check failing
- Database unreachable

**Actions:**
- [ ] Check database status (@engineer-on-call)
- [ ] Rollback last deploy (@engineer-on-call)
- [ ] Status page updated (@ic)

**Next update:** 11:00 WIB (30 min)
```

---

## Post-Mortem Template

**Create:** `docs/incidents/POST-MORTEM-YYYY-MM-DD.md`

### 🛑 Mandatory Blameless Post-Mortem Principles
1. **Focus on Systems, Not Individuals:** Never write "developer X was careless" or "engineer Y made a typo." Humans make mistakes when systems fail to protect them. The root cause must answer why CI, static analysis, review gates, or guardrails failed to prevent or catch the error.
2. **No Named Individuals in Root Cause:** Never attribute fault to specific people in the Summary or Root Cause sections. Names appear only as role owners in the Timeline (factual observation) or Action Items (future accountability).
3. **The 3-Whys Root Cause Method:** Dig past surface symptoms. Symptom: "N+1 query deployed" → Why? "Missing automated query count assertion in test" → Why? "Load test gate was not enforced for PRs altering ORM queries." That systemic failure is the real root cause (see `templates/closure/POST_MORTEM_TEMPLATE.md:65-69`).

```markdown
# Post-Mortem: [Incident Title]

**Date:** 2026-09-22  
**Duration:** 45 minutes (10:30 - 11:15 WIB)  
**Severity:** P0 (Critical)  
**Impact:** 1,000 users affected, $500 revenue lost  
**IC:** @engineer-name

---

## Summary

On 2026-09-22 at 10:30 WIB, our site went down due to database connection pool exhaustion. All users were unable to access the site for 45 minutes.

---

## Timeline

**10:25 WIB:** Deploy v1.2.3 to production  
**10:30 WIB:** UptimeRobot alert: site down  
**10:32 WIB:** IC paged, incident declared  
**10:35 WIB:** Status page updated  
**10:40 WIB:** Root cause identified: connection pool size = 5 (should be 20)  
**10:45 WIB:** Fix deployed: increased pool size to 20  
**11:00 WIB:** Site recovering, 503s decreasing  
**11:15 WIB:** Site fully operational, incident resolved  
**11:20 WIB:** Status page updated: resolved

---

## Root Cause

Deploy v1.2.3 included a new feature that made 10 database queries per page load (N+1 query). With only 5 connections in the pool, the pool exhausted quickly under normal traffic (50 concurrent users).

---

## What Went Well

- UptimeRobot alerted within 5 minutes
- IC responded within 2 minutes
- Rollback plan existed and worked
- Status page updated promptly

---

## What Went Wrong

- N+1 query not caught in code review
- No load testing before deploy
- Connection pool size not monitored

---

## Action Items

- [ ] **@engineer-name (by 2026-09-25):** Add connection pool monitoring (alert if > 80% used)
- [ ] **@tech-lead (by 2026-09-30):** Enforce load testing for all database-heavy features
- [ ] **@engineer-name (by 2026-09-23):** Fix N+1 query in user profile page (use eager loading)
- [ ] **@team (by 2026-09-30):** Add "connection pool size" to pre-deploy checklist

---

## Lessons Learned

1. Always load test database-heavy features before production
2. Monitor connection pool usage, not just query time
3. Code review should flag N+1 queries

---

**Post-mortem meeting:** 2026-09-23 10am WIB  
**Attendees:** Engineering team, CTO
```

---

## Runbook Checklist

**Before production launch (Large+):**

- [ ] Incident priority levels defined (P0-P3)
- [ ] On-call rotation schedule created
- [ ] PagerDuty/OpsGenie account setup
- [ ] Escalation ladder documented
- [ ] Mitigation playbooks written (top 5 incidents)
- [ ] Status page configured (Atlassian Statuspage, status.io)
- [ ] Communication templates ready (Slack, status page)
- [ ] Post-mortem template created
- [ ] Team trained on incident response flow
- [ ] Quarterly incident drill scheduled

---

**Agent Instruction:**

Before production launch Large+:
1. Create `docs/operations/INCIDENT-RESPONSE-RUNBOOK.md`
2. Fill incident priority levels
3. Define on-call rotation
4. Write mitigation playbooks (top 5 failure modes)
5. Create communication templates
6. Setup PagerDuty/OpsGenie
7. Train team

Do not launch production without runbook. Incidents will happen.

---

**Last Updated:** 2026-09-22  
**Version:** 1.0.0
