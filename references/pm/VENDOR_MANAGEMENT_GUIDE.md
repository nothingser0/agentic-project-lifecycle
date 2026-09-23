# Vendor Management Guide

**Purpose:** Manage third-party contractors, agencies, and service providers systematically.

**When to use:** When project involves external vendors (freelancers, agencies, SaaS providers with SLA).

---

## Vendor Types

| Type | Example | Management Needs |
|------|---------|------------------|
| **Contractor (individual)** | Freelance developer, designer | Deliverable-based, hourly tracking, IP ownership |
| **Agency** | Design agency, dev shop | Fixed-price or T&M, milestone-based, multi-person team |
| **SaaS provider** | AWS, Stripe, Twilio | SLA monitoring, cost tracking, vendor lock-in risk |
| **Consultant** | Security auditor, performance expert | Time-boxed engagement, knowledge transfer |
| **Offshore team** | Dedicated team in another country | Timezone coordination, communication plan |

---

## Vendor Selection (Pre-Contract)

### RFP/RFQ Process (Large+ Projects)

**Steps:**

1. **Requirements document** (1 page)
   - What needs to be built?
   - Timeline + budget
   - Technical constraints
   - Deliverables + acceptance criteria

2. **Vendor shortlist** (3-5 vendors)
   - Check portfolio (similar projects)
   - Check reviews (Clutch, Upwork, referrals)
   - Check availability (can start when?)

3. **RFP distribution** (1 week response time)
   - Send requirements doc
   - Request: proposal, timeline, cost breakdown, team composition

4. **Proposal evaluation** (scoring matrix)

| Criteria | Weight | Vendor A | Vendor B | Vendor C |
|----------|--------|----------|----------|----------|
| **Technical capability** | 30% | 8/10 | 9/10 | 7/10 |
| **Cost** | 25% | 7/10 | 6/10 | 9/10 |
| **Timeline** | 20% | 9/10 | 7/10 | 8/10 |
| **Portfolio quality** | 15% | 8/10 | 9/10 | 6/10 |
| **Communication** | 10% | 7/10 | 8/10 | 7/10 |
| **Weighted Score** | | **7.85** | **7.85** | **7.65** |

5. **Finalist interview** (top 2)
   - Technical discussion (1 hour)
   - Reference check (call 2 past clients)
   - Contract negotiation

6. **Selection + contract signing**

---

## Contract Essentials

### Must-Have Clauses

**1. Scope of Work (SOW)**
- Deliverables (specific, measurable)
- Exclusions (what's NOT included)
- Acceptance criteria per deliverable
- Change request process

**2. Timeline + Milestones**
- Start date + end date
- Milestone schedule with payment tied to milestones
- Delay penalties (if critical path)

**3. Payment Terms**
- Fixed-price: Milestone-based (e.g., 30% upfront, 40% mid, 30% completion)
- Time & Materials: Hourly rate + cap (e.g., $150/hr, max $50K)
- Payment schedule (Net 15, Net 30)
- Invoicing requirements

**4. IP Ownership**
- **Work-for-hire:** Client owns all code/design (default recommendation)
- **License:** Vendor retains ownership, client gets usage rights
- **Open source:** Code will be open-sourced (specify license)

**5. Confidentiality (NDA)**
- Vendor cannot disclose project details
- Vendor cannot use client data for other purposes
- Survival clause (NDA survives contract termination)

**6. Quality Standards**
- Code review required before merge
- Test coverage ≥ 80%
- Security scan passes (SAST, dependency audit)
- Performance budget not exceeded

**7. Warranty Period**
- Bug fixes free for 30-90 days post-delivery
- Critical bugs fixed within 24h
- Non-critical bugs fixed within 7 days

**8. Termination Clause**
- Either party can terminate with 30 days notice
- Client owns all work completed to date
- Final payment pro-rated for work done

**9. Liability + Indemnification**
- Vendor liable for IP infringement (if they copy code)
- Liability cap (e.g., total contract value)
- Insurance requirement (E&O insurance for agencies)

**10. Dispute Resolution**
- Escalation path: PM → Sponsor → Mediation → Arbitration
- Jurisdiction (which country's law applies)

---

## Vendor Onboarding (Week 1)

**Checklist:**

- [ ] Contract signed by both parties
- [ ] NDA signed
- [ ] Access granted:
  - [ ] GitHub/GitLab (read or write access, depending on role)
  - [ ] Project management tool (Jira, Linear, Notion)
  - [ ] Communication (Slack, Discord, email)
  - [ ] Design files (Figma, read-only or edit access)
  - [ ] Staging environment (not production)
- [ ] Kickoff meeting (1 hour):
  - [ ] Introductions (team roles)
  - [ ] Project overview (PRD, FSD walkthrough)
  - [ ] Deliverables + timeline confirmed
  - [ ] Communication plan (daily standup? weekly sync?)
  - [ ] First milestone assigned
- [ ] RACI matrix updated (vendor role added)
- [ ] Vendor contact info logged (primary + backup contact)

---

## Vendor Performance Monitoring

### Weekly Check-In (15 min)

**Agenda:**
1. Progress update (what's done, what's blocked)
2. Deliverable status (on track? delayed?)
3. Any questions or clarifications needed
4. Next week's plan

**Red flags:**
- ❌ Missed 2+ weekly check-ins
- ❌ Milestone delayed >3 days without notice
- ❌ Code quality below standard (failing tests, no tests)
- ❌ Unresponsive for 48h+ on critical issue

**Action:** Escalate to vendor manager, document in vendor scorecard

---

### Vendor Scorecard (Monthly)

**Template:**

```markdown
# Vendor Scorecard — [Vendor Name]

**Month:** September 2026  
**Project:** Realtime Collab App  
**Vendor PM:** Alice Chen  
**Internal PM:** Bob Smith  

## Performance Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **On-time delivery** | 100% | 80% | ⚠️ (1 milestone delayed) |
| **Code quality** | ≥ 80% test coverage | 85% | ✅ |
| **Communication** | <24h response | 12h avg | ✅ |
| **Budget** | Within ±10% | +5% | ✅ |
| **Bug rate** | <5 bugs/milestone | 3 | ✅ |

## Issues This Month

1. **Milestone M3 delayed by 5 days**
   - Root cause: Underestimated complexity (WebSocket reconnection logic)
   - Resolution: Extended timeline, no cost impact
   - Prevention: More detailed estimation for M4+

## Highlights

- Delivered M2 early (2 days ahead)
- Proactive communication on blockers
- High code quality (no critical bugs)

## Overall Rating: 8/10

**Action Items:**
- [ ] Review estimation process with vendor (before M4)
- [ ] Continue monthly check-ins

---

**Next review:** 2026-10-22
```

**Rating thresholds:**
- **9-10:** Exceeds expectations (consider bonus, extend contract)
- **7-8:** Meets expectations (continue as planned)
- **5-6:** Below expectations (performance improvement plan)
- **<5:** Unsatisfactory (consider termination)

---

## SLA Monitoring (SaaS Vendors)

### Example SLAs

| Vendor | Service | SLA | Actual (Last 30d) | Status |
|--------|---------|-----|-------------------|--------|
| **AWS** | EC2 uptime | 99.99% | 99.98% | ✅ |
| **Stripe** | API uptime | 99.99% | 100% | ✅ |
| **Twilio** | SMS delivery | 99% | 98.5% | ⚠️ |
| **Supabase** | Database uptime | 99.9% | 99.95% | ✅ |

**When SLA breached:**
1. Check vendor status page (is outage acknowledged?)
2. File support ticket (reference SLA)
3. Request credit (most SLAs include automatic credit for breaches)
4. Document incident in vendor scorecard
5. If repeated (3+ breaches in 6 months): consider alternative vendor

**Monitoring tools:**
- **UptimeRobot** (free, monitor HTTP endpoints)
- **Pingdom** (paid, detailed performance)
- **StatusCake** (free tier, SSL monitoring)

---

## Vendor Lock-In Risk

### Risk Assessment

| Vendor | Lock-in Risk | Mitigation |
|--------|--------------|------------|
| **AWS proprietary services** (Lambda, DynamoDB) | High | Use open standards (Docker, Postgres) where possible |
| **Stripe** | Medium | Abstract payment logic behind interface, test migration to Paddle |
| **Vercel** | Low | Deploy-time vendor, easy to switch to Netlify/Fly.io |
| **Supabase** | Low | Standard Postgres, can self-host |
| **Proprietary CMS** | High | Use headless CMS with standard API |

**Mitigation strategies:**
1. **Abstraction layer:** Wrap vendor API behind internal interface
2. **Data portability:** Ensure easy export (CSV, JSON, SQL dump)
3. **Standard protocols:** Prefer vendors using open standards (REST, GraphQL, Postgres, S3-compatible)
4. **Exit plan:** Document migration steps (test annually)

---

## Vendor Offboarding

### End-of-Contract Checklist

- [ ] Final deliverables accepted (UAT passed)
- [ ] Final invoice paid
- [ ] IP ownership transferred (signed document)
- [ ] Access revoked:
  - [ ] GitHub/GitLab
  - [ ] Slack/Discord
  - [ ] Cloud accounts (AWS, Vercel)
  - [ ] Design files (Figma)
- [ ] Knowledge transfer completed:
  - [ ] Documentation reviewed (README, runbook)
  - [ ] Handover meeting (1 hour)
  - [ ] Q&A session recorded
- [ ] Warranty period documented (bug fix SLA for next 30-90 days)
- [ ] Final vendor scorecard
- [ ] Reference provided (if performance good)
- [ ] NDA remains in effect

---

## Vendor Relationship Best Practices

### Do's ✅

- **Treat as partner, not commodity** — Good vendors are hard to find, retain them
- **Pay on time** — Delayed payment = delayed work
- **Clear requirements** — Ambiguity = rework = cost overrun
- **Regular feedback** — Weekly check-ins prevent surprises
- **Document everything** — Email confirmations, meeting notes, change requests
- **Respect timezone** — Don't expect instant response at 2am their time
- **Celebrate wins** — Thank them publicly when milestone delivered well

### Don'ts ❌

- **Micromanage** — You hired experts, let them work
- **Scope creep** — "Just one more thing" → formal change request
- **Blame without evidence** — If bug found, provide reproduction steps
- **Ignore red flags** — Address issues early, don't wait until crisis
- **Skip contract** — Handshake deals = disputes later
- **Ghost vendor** — If unhappy, give feedback or terminate formally

---

## Integration with Project Lifecycle

**Update `modules/02a-planning-core-phases.md` Phase 0:**

```markdown
### Q0d — Stakeholder Register

**Sub-question (if external vendor involved):**
- Q0d-ii: Vendor details?
  - Name, contact, role (dev/design/consultant)
  - Contract type (fixed-price / T&M / retainer)
  - SLA requirements (if applicable)
  - Performance monitoring cadence (weekly / monthly)

**Output file:** `docs/pm/VENDOR-REGISTER.md` (from VENDOR_MANAGEMENT_GUIDE.md template)
```

**Update `engine/GATE-REGISTRY.md`:**

```markdown
### gate:vendor-onboard (Vendor Onboarding)

**Trigger:** Before vendor starts work

**Evidence:**
- Contract signed
- NDA signed
- Access granted (documented in RACI matrix)
- Kickoff meeting completed
- First milestone assigned
- Vendor added to communication channels

**Blocker:** Cannot start without signed contract + NDA.

---

### gate:vendor-offboard (Vendor Offboarding)

**Trigger:** After final deliverable accepted

**Evidence:**
- Final UAT passed
- Final invoice paid
- IP ownership transferred
- Access revoked (all systems)
- Knowledge transfer completed
- Final vendor scorecard

**Blocker:** Cannot close vendor relationship without IP transfer + access revocation.
```

---

**Agent instruction:**

For projects involving external vendors:

1. Add vendor to stakeholder register (Phase 0, Q0d)
2. Create vendor scorecard template (monthly review)
3. Document SLA requirements (if SaaS vendor)
4. Run vendor onboarding checklist before work starts
5. Monitor performance weekly (check-ins + scorecard)
6. Escalate issues early (don't wait until crisis)
7. Run vendor offboarding checklist at contract end
8. Assess vendor lock-in risk for critical dependencies

Do not proceed to production deploy with critical vendor dependency unmonitored.
