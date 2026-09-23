# Conflict Resolution Guide

**Purpose:** Systematic process for resolving disputes between stakeholders, team members, or technical decisions.

**When to use:** When disagreement blocks progress for >1 day, or same issue surfaces 3+ times.

---

## Conflict Types

| Type | Example | Resolution Path |
|------|---------|------------------|
| **Scope conflict** | PM wants feature X, client says it's out of scope | Refer to signed PRD/FSD, escalate to sponsor |
| **Technical conflict** | Two engineers propose different architectures | ADR process, senior engineer decides |
| **Resource conflict** | Two milestones need same developer | Resource leveling matrix (see RESOURCE_LEVELING_GUIDE.md) |
| **Priority conflict** | Sales wants feature A, support wants bug fix B | Prioritization framework (RICE/WSJF), product owner decides |
| **Design conflict** | Designer vs developer on implementation feasibility | Design review meeting, compromise with constraints documented |
| **Timeline conflict** | Client wants earlier delivery, team says unrealistic | Re-estimate with evidence, propose reduced scope or more resources |

---

## Escalation Ladder (5 Levels)

### Level 1: Direct Negotiation (0-1 day)

**Who:** The two parties in conflict

**Process:**
1. Schedule 30-min meeting within 24h
2. Each party states their position + reasoning (5 min each)
3. Identify common ground
4. Propose compromise
5. Document agreement in decision log

**Success criteria:** Both parties agree, document decision

**Escalate to Level 2 if:** No agreement after 1 meeting

---

### Level 2: Mediation (1-2 days)

**Who:** Neutral third party (PM, tech lead, or senior engineer)

**Process:**
1. Mediator reads background (PRD, FSD, ADR, chat history)
2. Mediator meets each party separately (15 min each)
3. Mediator facilitates joint meeting (30 min):
   - Restate each position neutrally
   - Identify unstated concerns
   - Propose 2-3 options with trade-offs
4. Parties vote on options
5. Document decision + reasoning in ADR

**Success criteria:** Majority agreement, documented in ADR

**Escalate to Level 3 if:** Tie vote, or one party refuses decision

---

### Level 3: Authority Decision (2-3 days)

**Who:** Role with authority over the domain

| Conflict Domain | Authority |
|-----------------|----------|
| **Technical architecture** | Tech lead or CTO |
| **Product scope** | Product owner or sponsor |
| **Design/UX** | Design lead |
| **Budget/timeline** | Project sponsor |
| **Process/workflow** | Engineering manager |

**Process:**
1. Mediator escalates to authority with summary (1 page max):
   - What's the conflict?
   - What options were considered?
   - What's blocking decision?
2. Authority reviews evidence (PRD, FSD, ADR, technical spike)
3. Authority makes decision within 48h
4. Decision is final and binding
5. Document in ADR with authority's signature

**Success criteria:** Decision made, all parties commit to execute

**Escalate to Level 4 if:** Authority is conflicted party, or decision requires budget change >20%

---

### Level 4: Steering Committee (3-5 days)

**Who:** Project steering committee (sponsor + stakeholders + senior leadership)

**When:** Conflict impacts project success (timeline >2 weeks slip, budget >20% increase, scope >30% change)

**Process:**
1. PM prepares steering committee brief:
   - Conflict summary
   - Options with business impact (revenue, timeline, cost, risk)
   - Recommendation
2. Steering committee meeting (1 hour):
   - PM presents (15 min)
   - Q&A (20 min)
   - Deliberation (15 min)
   - Vote (10 min)
3. Decision recorded in meeting minutes
4. Formal change request if scope/budget/timeline changes

**Success criteria:** Majority vote, change request approved

**Escalate to Level 5 if:** Legal dispute, contract violation, or ethical concern

---

### Level 5: Legal/Executive Escalation (5+ days)

**Who:** Legal counsel + C-level executive

**When:**
- Contract dispute (client refuses to pay, vendor breach)
- IP ownership conflict
- Regulatory compliance issue
- Ethical violation (data privacy breach, discrimination)
- Irreconcilable conflict requiring contract termination

**Process:**
1. PM escalates to legal + executive with evidence
2. Legal reviews contract, risk, liability
3. Executive decides: negotiate, arbitration, or litigation
4. Project may be paused pending resolution

**Success criteria:** Legal resolution, contract amendment, or project termination with exit plan

---

## Decision Framework (When Negotiation Fails)

### RACI + Veto Power

> **Template:** `templates/pm/RACI_MATRIX_TEMPLATE.md` → output: `docs/pm/RACI.md`.
> Generated at Phase 0 (Q0d). Mandatory for Medium+ projects (Cross-phase rule 21).

**RACI refresher:**
- **R**esponsible: Does the work
- **A**ccountable: Makes final decision (only 1 person)
- **C**onsulted: Provides input before decision
- **I**nformed: Notified after decision

**Veto power:** Only Accountable role can veto, and must provide alternative within 24h.
Use **A★** notation in the RACI matrix to flag roles with formal veto rights beyond
normal sign-off (e.g. Legal can block a release, Sponsor can kill a milestone).

**Example:**

| Decision | R | A | C | I |
|----------|---|---|---|---|
| Add new feature to scope | Dev | Product Owner | Designer, QA | Sponsor |
| Change database schema | Dev | Tech Lead | DevOps | PM |
| Extend deadline by 2 weeks | PM | Sponsor | Team | Client |
| Deploy to production | DevOps | Tech Lead | QA, Security | PM |

**Rule:** If Consulted role disagrees, they can escalate to Accountable, but Accountable makes final call.

---

## Prioritization Framework (Feature Conflicts)

### RICE Scoring

**Formula:**
```
RICE Score = (Reach × Impact × Confidence) / Effort

Reach: How many users affected per quarter? (number)
Impact: How much does it move the needle? (3=Massive, 2=High, 1=Medium, 0.5=Low, 0.25=Minimal)
Confidence: How certain are estimates? (100%=High, 80%=Medium, 50%=Low)
Effort: Person-months to build (number)
```

**Example:**

| Feature | Reach | Impact | Confidence | Effort | RICE Score | Rank |
|---------|-------|--------|------------|--------|------------|------|
| User auth | 1000 | 3 | 100% | 2 | **1500** | 1 |
| Dark mode | 500 | 1 | 80% | 0.5 | **800** | 2 |
| Export CSV | 200 | 2 | 100% | 1 | **400** | 3 |
| Analytics | 1000 | 0.5 | 50% | 3 | **83** | 4 |

**Decision:** Build in RICE score order.

### WSJF (Weighted Shortest Job First)

**Formula:**
```
WSJF = Cost of Delay / Job Duration

Cost of Delay = User-Business Value + Time Criticality + Risk Reduction
(Each scored 1-10)

Job Duration = Effort in weeks
```

**Example:**

| Feature | User Value | Time Crit | Risk Red | Cost of Delay | Duration | WSJF | Rank |
|---------|------------|-----------|----------|---------------|----------|------|------|
| Security fix | 8 | 10 | 10 | 28 | 1 | **28** | 1 |
| Payment | 10 | 8 | 5 | 23 | 4 | **5.75** | 2 |
| Search | 6 | 3 | 2 | 11 | 3 | **3.67** | 3 |

**Decision:** Build in WSJF order (highest first).

---

## Conflict Resolution Meeting Template

### Agenda (30 min)

**1. Context (5 min)**
- Moderator states the conflict neutrally
- Reference docs: PRD section X, FSD requirement Y, ADR #Z

**2. Positions (10 min)**
- Party A: State position + reasoning (5 min)
- Party B: State position + reasoning (5 min)
- No interruptions

**3. Common Ground (5 min)**
- What do both parties agree on?
- What's the shared goal?
- What constraints are non-negotiable?

**4. Options (5 min)**
- Brainstorm 3+ options
- No evaluation yet, just list

**5. Decision (5 min)**
- Evaluate options against shared goal
- Vote or defer to authority
- Document decision + action items

**Meeting notes template:**

```markdown
# Conflict Resolution — [Topic]

**Date:** 2026-09-22  
**Attendees:** Alice (Dev), Bob (Designer), Carol (Mediator)  
**Conflict:** Button placement (left vs center)

## Positions

**Alice (left alignment):**
- Reason: Standard UX pattern (Linear, GitHub)
- Evidence: 80% of surveyed apps use left
- Concern: Center looks unprofessional

**Bob (center alignment):**
- Reason: Brand identity (landing page uses center)
- Evidence: A/B test shows 5% higher conversion
- Concern: Left conflicts with brand

## Common Ground

- Both want high conversion
- Both want brand consistency
- Both agree landing page ≠ dashboard pattern

## Options

1. Left alignment in dashboard, center on landing (separate contexts)
2. Center everywhere (full brand consistency)
3. Left alignment everywhere (full UX consistency)
4. User preference toggle (let user choose)

## Decision

**Chosen:** Option 1 (context-dependent alignment)

**Reasoning:**
- Landing page = marketing (brand-first)
- Dashboard = tool (UX-first)
- Precedent: Notion (center landing, left dashboard)

**Action items:**
- [ ] Alice: Implement left alignment in dashboard (Sprint 3)
- [ ] Bob: Update design system docs with rule
- [ ] Carol: Document in ADR #12

**Signed:**  
Alice Chen (Developer)  
Bob Smith (Designer)  
Carol Lee (Mediator)
```

---

## Anti-Patterns (What NOT to Do)

❌ **Avoid decision** — "Let's revisit this later" (3+ times = escalate)  
❌ **Decision by exhaustion** — Longest arguer wins  
❌ **Hidden veto** — Agree in meeting, block in PR review  
❌ **Appeal to authority without evidence** — "Senior said so" (document reasoning)  
❌ **Personal attack** — "You always do this" (focus on issue, not person)  
❌ **False compromise** — Split 50/50 when one option is clearly better  
❌ **Reopening decided issues** — Once ADR signed, need new evidence to reopen  

---

## Integration with Project Lifecycle

**Update `references/pm/PM_FUNDAMENTALS_GUIDE.md` § Q65g (Change Control):**

```markdown
### Q65g — Change Control + Conflict Resolution

> "How will scope changes be approved, and how will conflicts be resolved?"

Options:
- **None** (solo, change freely)
- **Product owner approves** (one gatekeeper)
- **Formal change request** (impact assessment required)
- **Steering committee** (Large+ projects, monthly review)

Sub-question:
- Q65g-i: Conflict resolution process? (Direct negotiation → Mediation → Authority → Steering committee → Legal)
- Q65g-ii: Who has final authority per domain? (Technical: Tech Lead, Product: PO, Budget: Sponsor)

**Output file:** `docs/pm/CONFLICT-RESOLUTION.md` (from CONFLICT_RESOLUTION_GUIDE.md template)
```

**Update `engine/GATE-REGISTRY.md`:**

```markdown
### gate:kickoff (Project Kickoff)

**Evidence:**
- Charter signed
- Team roles assigned (RACI matrix)
- **Conflict resolution process documented** ← NEW
- **Authority matrix defined (who decides what)** ← NEW
- Communication plan confirmed

**Blocker:** Cannot start without clear escalation path for conflicts.
```

---

## Case Studies

### Case 1: Technical Architecture Conflict

**Scenario:** Senior Dev A wants microservices, Senior Dev B wants monolith.

**Resolution path:**
1. **Level 1 (Direct):** Failed — both strongly opinionated
2. **Level 2 (Mediation):** PM facilitates, both present evidence
   - A: "We need independent scaling"
   - B: "We're 3 people, microservices = premature complexity"
3. **Level 3 (Authority):** Tech Lead decides:
   - Decision: Monolith now, microservices after 10K users
   - Reasoning: Team size + complexity trade-off
   - Documented in ADR #03
   - Both commit to decision

**Outcome:** ✅ Resolved in 2 days, no lingering resentment

---

### Case 2: Scope Creep Conflict

**Scenario:** Client adds 5 new features mid-sprint, claims "it's minor."

**Resolution path:**
1. **Level 1 (Direct):** PM explains impact (+2 weeks, +$10K)
2. **Client:** "But you said you'd be flexible"
3. **Level 2 (Mediation):** PM escalates to project sponsor
4. **Level 3 (Authority):** Sponsor reviews contract
   - Contract: Fixed scope, change requests require approval
   - Decision: 3 features approved (+1 week), 2 deferred to Phase 2
   - Formal change request signed

**Outcome:** ✅ Client relationship preserved, scope controlled

---

### Case 3: Design vs Engineering Feasibility

**Scenario:** Designer wants complex animation, engineer says it'll tank performance.

**Resolution path:**
1. **Level 1 (Direct):** 30-min meeting
   - Designer shows mockup (looks amazing)
   - Engineer shows performance test (drops to 20 FPS)
2. **Common ground:** Both want great UX + performance
3. **Options:**
   - A: Full animation (performance hit)
   - B: No animation (boring)
   - C: Simplified animation (60 FPS achievable)
   - D: Animation only on desktop, reduced on mobile
4. **Decision:** Option D (context-dependent)
5. **Prototype:** Engineer builds proof-of-concept (1 hour)
6. **Agreement:** Both satisfied, documented in design system

**Outcome:** ✅ Resolved in 1 meeting + 1 hour spike

---

**Agent instruction:**

When conflict blocks progress >1 day:

1. Identify conflict type (scope, technical, resource, priority, design, timeline)
2. Start at Level 1 (Direct Negotiation)
3. Escalate systematically if unresolved
4. Document decision in ADR or meeting notes
5. Use RICE/WSJF for priority conflicts
6. Never avoid decision or let conflict linger >3 days

Do not proceed to next sprint/milestone while active conflict unresolved.
