# Risk Management Guide — Proactive Risk Tracking

**Purpose:** Identify, track, and mitigate project risks before they become blockers.

**When to use:** Phase 0 (Kickoff), weekly review during BUILD

---

## Risk Register Template

**Store in:** `docs/pm/RISK-REGISTER.md`

```markdown
# Risk Register — [Project Name]

**Last Updated:** 2026-09-22
**Owner:** Project lead

## Active Risks

### R001: External API Dependency (Stripe)

**Category:** Technical  
**Probability:** Medium (30%)  
**Impact:** High (blocks checkout flow)  
**Score:** 6/10 (Probability × Impact)  
**Status:** Monitoring

**Description:**
Stripe API downtime or breaking change could block checkout flow. Historical uptime: 99.9%, but breaking changes announced with 3-month notice.

**Mitigation:**
- Use Stripe test mode in all pre-prod environments
- Subscribe to Stripe API changelog (email notifications)
- Add fallback: "Checkout unavailable, try again later" message
- Monitor Stripe status page: https://status.stripe.com

**Trigger:** If Stripe downtime > 30 min or breaking change announced

**Contingency:** Switch to manual invoice + bank transfer (temporary)

**Owner:** @[contributor]  
**Review Date:** 2026-10-01

---

### R002: Timeline Slippage (Sprint 1)

**Category:** Schedule  
**Probability:** High (60%)  
**Impact:** Medium (delay launch by 1 week)  
**Score:** 6/10  
**Status:** Active

**Description:**
Sprint 1 has 8 tasks, estimated 40h, but only 30h available (part-time). Risk of missing Sprint 1 deadline (2026-09-30).

**Mitigation:**
- Cut scope: defer CSV export to Sprint 2 (nice-to-have)
- Add buffer: extend Sprint 1 by 3 days
- Parallelize: split auth ([contributor]) and UI (agent) work

**Trigger:** If 50% of sprint time passed but < 40% tasks done

**Contingency:** Cut Sprint 1 to MVP-only (auth + CRUD), move all other features to Sprint 2

**Owner:** @[contributor]  
**Review Date:** 2026-09-25 (mid-sprint check)

---

### R003: Database Migration Rollback Failure

**Category:** Technical  
**Probability:** Low (10%)  
**Impact:** Critical (data loss, site down)  
**Score:** 7/10  
**Status:** Monitoring

**Description:**
Production database migration (add `user_role` column) could fail mid-migration, leaving DB in inconsistent state.

**Mitigation:**
- Test migration in staging first (with production data dump)
- Use additive-only migration (no DROP, no RENAME)
- Backup database before migration (`pg_dump`)
- Write rollback script: `rollback-add-user-role.sql`

**Trigger:** If migration fails or takes > 5 min (expected: 30s)

**Contingency:** Restore from backup, investigate issue, retry in next deploy

**Owner:** @[contributor]  
**Review Date:** Before production deploy (gate:production-deploy)

---

## Resolved Risks

### R004: Unclear Auth Requirements (RESOLVED 2026-09-15)

**Original risk:** User asked for "OAuth + email login" but unclear if magic link or password.

**Resolution:** Clarified with user: OAuth (GitHub + Google) + Email+Password (no magic link). Updated PRD.

**Closed by:** @[contributor]  
**Closed date:** 2026-09-15
```

---

## Risk Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Technical** | Technology failure, dependency, performance | API downtime, library bug, scaling issue |
| **Schedule** | Timeline slippage, resource unavailability | Sprint delay, dev sick leave, underestimated task |
| **Scope** | Unclear requirements, scope creep | Feature ambiguity, stakeholder adds features mid-sprint |
| **External** | Third-party dependency, vendor, regulation | Payment gateway changes, GDPR law update |
| **Security** | Data breach, vulnerability, compliance | SQL injection risk, secret leak, audit failure |
| **Resource** | Budget, team capacity, infrastructure | Out of budget, no QA engineer, server capacity |

---

## Risk Scoring Matrix

**Score = Probability × Impact (scale 1-10)**

### Probability

| Level | % Chance | Description |
|-------|----------|-------------|
| **Low** | 0-20% | Unlikely, rare edge case |
| **Medium** | 21-50% | Possible, has happened before |
| **High** | 51-80% | Likely, current trajectory leads here |
| **Critical** | 81-100% | Imminent, already happening |

### Impact

| Level | Description | Examples |
|-------|-------------|----------|
| **Low** | Minor inconvenience, no user impact | Typo in internal doc, 1h delay |
| **Medium** | Feature delayed, partial user impact | Sprint slips 1 week, non-critical feature broken |
| **High** | Launch delayed, major feature unavailable | 1-month delay, checkout broken |
| **Critical** | Project cancelled, data loss, legal issue | Data breach, regulatory fine, project killed |

### Priority (Score → Action)

| Score | Priority | Action |
|-------|----------|--------|
| **1-3** | Low | Monitor, review quarterly |
| **4-6** | Medium | Mitigate, review monthly |
| **7-8** | High | Mitigate immediately, review weekly |
| **9-10** | Critical | Stop work, resolve first |

---

## Risk Review Cadence

| Event | Action |
|-------|--------|
| **Kickoff (Phase 0)** | Identify top 5 risks, create RISK-REGISTER.md |
| **Weekly standup** | Review active risks (status changed?) |
| **End of sprint** | Close resolved risks, add new risks |
| **Milestone gate** | Review all risks before proceeding to next phase |
| **Incident** | Add new risk if root cause systemic (not one-off) |

**Rule:** Never let risk register sit untouched > 2 weeks.

---

## Stakeholder Communication Template

**When risk score ≥ 7, notify stakeholders:**

```markdown
**Subject:** Risk Alert: [Risk Title]

Hi [Stakeholder],

Flagging a high-priority risk:

**Risk:** [R002: Timeline Slippage (Sprint 1)]
**Impact:** Sprint 1 may slip by 1 week (launch delay from Sept 30 to Oct 7)
**Probability:** 60% (high)

**Why:**
Sprint 1 has 8 tasks (40h estimated), but only 30h available (part-time). Currently 50% through sprint but only 30% tasks done.

**Mitigation:**
1. Cut CSV export feature to Sprint 2 (nice-to-have, not blocker)
2. Extend Sprint 1 by 3 days (buffer)
3. Parallelize auth + UI work

**Decision needed:**
Do you prefer:
- Option A: Cut CSV export, keep Sept 30 deadline (MVP-only)
- Option B: Extend to Oct 7, keep all Sprint 1 features

Please confirm by EOD Sept 23.

Thanks,
[contributor]
```

---

## Common Project Risks (Checklist)

### Technical Risks

- [ ] External API dependency (uptime, breaking changes)
- [ ] Database migration failure (data loss, rollback)
- [ ] Performance degradation (traffic spike, memory leak)
- [ ] Library/framework breaking change (upgrade path unclear)
- [ ] Browser compatibility issue (Safari, mobile)

### Schedule Risks

- [ ] Underestimated task complexity (3d task takes 2 weeks)
- [ ] Resource unavailability (dev sick, vacation, quit)
- [ ] Dependency blocker (waiting for API access, design approval)
- [ ] Scope creep ("just one more feature")
- [ ] Testing time underestimated (bugs found in UAT)

### Scope Risks

- [ ] Unclear requirements (stakeholder says "make it better")
- [ ] Changing requirements mid-sprint (stakeholder pivots)
- [ ] Undocumented edge cases ("what if user has 10K items?")
- [ ] Integration contract unclear (third-party API spec incomplete)

### External Risks

- [ ] Payment gateway changes pricing/terms
- [ ] Compliance law change (GDPR update, new regulation)
- [ ] Vendor acquisition/shutdown (library maintainer quits)
- [ ] Infrastructure provider downtime (Vercel, AWS outage)

### Security Risks

- [ ] Dependency vulnerability (npm audit critical)
- [ ] Exposed secret (API key leaked in commit)
- [ ] SQL injection (raw query without sanitization)
- [ ] CORS misconfiguration (allows unauthorized origin)
- [ ] Session fixation (no token rotation)

### Resource Risks

- [ ] Budget exhausted (cloud bill spike, out of funds)
- [ ] Infra capacity (server RAM/CPU maxed)
- [ ] Team skill gap (no one knows Rust, need to hire)
- [ ] Single point of failure (only 1 person knows deploy)

---

## Risk Mitigation Strategies

### Accept

**When:** Risk score ≤ 3 (low probability, low impact)

**Example:** "Typo in internal doc" — not worth time to fix

### Mitigate

**When:** Risk score 4-8 (reduce probability or impact)

**Example:**
- Risk: Stripe API downtime (P=30%, I=High)
- Mitigation: Add fallback message + monitor status page
- New score: P=30%, I=Medium (reduced impact)

### Transfer

**When:** Risk can be outsourced (insurance, vendor SLA)

**Example:**
- Risk: Payment fraud (P=20%, I=Critical)
- Transfer: Use Stripe Radar (fraud detection included)
- New score: P=5%, I=Medium (Stripe handles fraud)

### Avoid

**When:** Risk unacceptable, change plan to eliminate risk

**Example:**
- Risk: Database migration data loss (P=10%, I=Critical)
- Avoid: Use additive-only migrations (never DROP column)
- New score: 0 (risk eliminated)

---

## Integration with CONTEXT.md

**Add to CONTEXT.md:**

```markdown
## Risk Summary

**Top 3 Active Risks:**
1. R001: Stripe API dependency (score 6/10, monitoring)
2. R002: Sprint 1 timeline slippage (score 6/10, mitigating)
3. R003: DB migration rollback (score 7/10, mitigation ready)

**Full register:** `docs/pm/RISK-REGISTER.md`
**Last reviewed:** 2026-09-22
**Next review:** 2026-09-29 (weekly)
```

---

## Integration with Gates

Update `engine/GATE-REGISTRY.md`:

```markdown
### gate:sprint-start (Sprint Start)

**Trigger:** Before starting a new sprint

**Evidence:**
- Sprint backlog defined (TASKS.md updated)
- Capacity confirmed (team availability)
- **Risk register reviewed** ← NEW
- No critical blockers (score ≥ 9)

**Blocker:** Cannot start sprint if critical risk (score 9-10) unresolved.

---

### gate:production-deploy (Production Deploy)

**Evidence:**
- UAT passed
- Security checklist passed
- Performance budget not exceeded
- Design validation passed
- Pre-deploy checklist completed
- Rollback plan documented
- **No critical risks active** ← NEW

**Blocker:** Cannot deploy if critical risk (score 9-10) active and unmitigated.
```

---

**Agent Instruction:**

At project kickoff:
1. Create `docs/pm/RISK-REGISTER.md`
2. Identify top 5 risks (use common risks checklist)
3. Score each risk (probability × impact)
4. Assign mitigation owner + review date

Weekly:
1. Review active risks (status changed?)
2. Close resolved risks
3. Add new risks from incidents/issues

Before major milestone:
1. Confirm no critical risks (score 9-10) blocking
2. Update stakeholders if high-priority risk (score 7-8)
