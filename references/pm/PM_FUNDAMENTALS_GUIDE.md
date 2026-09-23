# PM Fundamentals Guide — Phase 5

**Purpose:** Turn the six PM Fundamentals answers (Q65c-Q65h) into real content for `docs/pm/STAKEHOLDERS.md`, `RISKS.md`, `MILESTONES.md`, `COMMUNICATION-PLAN.md`, `CHANGE-LOG.md`, and `docs/dev-docs/DECISIONS.md` — instead of the generic boilerplate an agent writes when nothing in the interview actually asked about them.

Read this when: Q65c-Q65h come up, or when generating any file under `docs/pm/`.

## Contents

- [Why this exists](#why-this-exists)
- [How this maps to the standard 5-phase PM life cycle](#how-this-maps-to-the-standard-5-phase-pm-life-cycle)
- [Q65c — Stakeholders](#q65c-stakeholders)
- [Q65d — Top 3 Risks](#q65d-top-3-risks)
- [Q65e — Success Criteria](#q65e-success-criteria)
- [Q65f — Communication Cadence](#q65f-communication-cadence)
- [Q65g — Change Control](#q65g-change-control)
- [Q65h — Decision Log](#q65h-decision-log)
- [Don't over-formalize a solo project](#dont-over-formalize-a-solo-project)

## Why this exists

Before this guide existed, the skill generated seven files under `docs/pm/` — including a stakeholder register and a risk log — but the 142-question interview never actually asked about stakeholders, risks, communication, or change control. The files got written anyway, which meant an agent filled them with generic filler ("Key stakeholders will be identified as the project progresses") instead of real content. That's worse than not generating the file at all — a document that looks complete but isn't invites false confidence. These six questions exist so the files have something real to say.

## How this maps to the standard 5-phase PM life cycle

The classic project management life cycle (PMI/PMBOK, and the version most PM courses and blogs teach) has five phases: **Initiation → Planning → Execution → Monitoring & Controlling → Closure**. Phase 5 (this guide, Q65c-Q65h) covers Initiation/Planning-phase documents specifically — the full lifecycle, including Execution, is run by the skill as a whole via `03-build-router.md` and closed out via `04-closure.md`; see `references/pm/LIFECYCLE_MAPPING.md` for the complete phase-by-phase picture across all modules:

| Standard phase | What it normally produces | Where this skill produces it |
|---|---|---|
| Initiation | Stakeholder register, business case, project charter | `docs/pm/STAKEHOLDERS.md` (Q65c), `docs/planning/PRD.md` (Phase 1's problem/users/features questions already cover most of a business case) |
| Planning | Risk register, communication plan, schedule/milestones | `docs/planning/RISKS.md` (Q65d), `docs/pm/COMMUNICATION-PLAN.md` (Q65f), `docs/pm/MILESTONES.md` (Q65e + Phase 2's timeline answers) |
| Execution | Task tracking, status updates, running code | `TASKS.md` Kanban (Backlog→Todo→In Progress→Testing→Code Review→Ready to Deliver→SIT→UAT→Release) via `03-build-router.md`, using the tool decided at Q65a |
| Monitoring & Controlling | Status reports, change control log | `docs/pm/STATUS-REPORTS.md` (template only — filled in during the build, not at planning time), `docs/pm/CHANGE-LOG.md` (Q65g sets the *process*; entries accumulate later) |
| Closure | Retrospective, lessons learned, handover | `docs/pm/RETROSPECTIVE.md`, `docs/dev-docs/HANDOVER.md`, produced by `04-closure.md` when release evidence exists |

This is why Q65c-Q65h focus on the Initiation/Planning-phase documents (the ones that need real content *before* building starts) and leave Monitoring/Closure documents as templates to fill in during Execution and Closure respectively — asking someone to write a retrospective for a project that hasn't started yet would just produce more boilerplate.

## Q65c — Stakeholders

Don't stop at "the user" — Phase 1 Q5 already captured end-user personas. This question is about who has *authority or a stake in decisions*, which is a different list:

- **Sponsor/budget owner** — whoever approves spending or could kill the project; matters even for a side project if it's "my manager said I could use work hours for this."
- **Other affected teams** — support will get tickets about it, sales will need to know what to promise, legal may need to review data handling. Name them even if the answer is "just me, no other teams."
- **External partner/client** — if this is being built for someone else, they're the real approver of "done," not the interview answers alone.
- **None beyond the build team** — a legitimate answer for a personal project; write `STAKEHOLDERS.md` honestly as "solo project, no external stakeholders" rather than inventing a fake RACI matrix.

For each real stakeholder, capture: name/role, what decisions they can make, and how often they need an update (feeds Q65f).

## Q65d — Top 3 Risks

Push for specificity — "things might go wrong" is not a risk register entry. A real risk statement names a cause and an effect: "If [X happens], then [Y consequence]." Use the four prompt categories to make sure the user isn't only thinking about technical risk (the easiest one to think of):

- **Technical** — an unproven integration, a library with an uncertain API, a performance assumption that hasn't been tested.
- **Resource** — bus factor (only one person knows X), a contractor's availability, a dependency on someone else's unfinished work.
- **Market/business** — a competitor, a regulatory change, a customer who might change their mind about requirements.
- **Scope** — the single most common real-world project killer: stakeholders adding requirements mid-build without adjusting timeline or budget.

For each of the top 3, capture a one-line mitigation — even "accept the risk, no mitigation, budget is too tight" is a valid, honest answer and better than silence.

## Q65e — Success Criteria

Phase 1 already captures the feature list (what gets built). This question captures what "it worked" means, which the feature list alone doesn't answer. Push past "it's done when all the features are built" — that's a scope statement, not a success statement. Good answers look like:

- A number: "500 signups in the first month," "reduces manual entry time from 10 min to under 1 min."
- A binary outcome: "closes at least one paying customer," "I personally stop using the spreadsheet."
- An honest non-metric for exploratory projects: "I learn whether this idea is worth pursuing further" — valid for a prototype, and worth writing down so the retrospective later can actually check it.

This becomes the first thing `MILESTONES.md` and the eventual `RETROSPECTIVE.md` measure against.

### Earned Value Management (EVM) for Large+ Projects

**When to use:** Large/Enterprise projects with fixed budget, or when client requires cost performance tracking.

**Core metrics:**

- **Planned Value (PV):** Budgeted cost for scheduled work
- **Earned Value (EV):** Budgeted cost for completed work
- **Actual Cost (AC):** Real cost spent

**Derived metrics:**

- **Cost Performance Index (CPI) = EV / AC**
  - CPI > 1.0: Under budget
  - CPI < 1.0: Over budget
  - CPI = 0.85: Spending $1.18 for every $1 of work

- **Schedule Performance Index (SPI) = EV / PV**
  - SPI > 1.0: Ahead of schedule
  - SPI < 1.0: Behind schedule
  - SPI = 0.90: Only 90% productive vs. plan

**Example EVM tracking (Sprint 3):**

```markdown
## EVM Report — Sprint 3

**Date:** 2026-09-22

| Metric | Value | Status |
|--------|-------|--------|
| Planned Value (PV) | $45,000 | Baseline |
| Earned Value (EV) | $42,000 | Work completed |
| Actual Cost (AC) | $48,000 | Cost spent |
| **CPI** | **0.875** | ⚠️ Over budget (12.5%) |
| **SPI** | **0.933** | ⚠️ Behind schedule (6.7%) |

**Analysis:**
- Overrun cause: Unplanned security audit (2 days)
- Schedule slip: M3 delayed by 1 week

**Forecast:**
- Estimate at Completion (EAC) = Budget / CPI = $160K / 0.875 = **$183K** (original: $160K)
- Variance at Completion (VAC) = Budget - EAC = **-$23K** (need additional $23K)

**Action:**
- Request change order for security audit ($10K)
- Reduce scope: Defer M7 (reporting dashboard) to Phase 2
```

**Integration:** Record CPI/SPI in `docs/pm/STATUS-REPORTS.md` (monthly for Large+, quarterly for Enterprise).

## Q65f — Communication Cadence

Filtered by Q12 (team size) — don't impose a daily standup on a solo project, and don't leave a 20-person team with "as-needed":

- **None** — solo project, no one else to update.
- **Async, as-needed** — small team, low ceremony; good default for 2-5 people who already talk regularly.
- **Weekly status update** — once there's a stakeholder (Q65c) who isn't in the daily work but needs visibility.
- **Daily standup** — teams of 6+ or anything time-pressured; note this is a *process* choice, not something this skill schedules — it just documents the expectation.

### Status Report Integration

Map cadence to concrete deliverable:

| Cadence | Deliverable | Tool | Recipient |
|---------|-------------|------|----------|
| None | - | - | - |
| Async | Slack thread (weekly) | Slack | Team |
| Weekly | Status report email | Email / Notion | Stakeholders |
| Daily standup | Standup notes | Linear / Jira | Team |
| Biweekly | Sprint review deck | Slides | Client |

**Status report template** (integrate into `docs/pm/STATUS-REPORTS.md`):

```markdown
# Status Report — Week 38 (Sep 16-22, 2026)

**Project:** Realtime Collab App  
**Sent to:** Product Owner, CTO  
**Period:** Sprint 3 (Week 2 of 2)  

## Summary

🟢 **Green** — On track for Sprint 3 completion Friday.

## This Week

**Completed:**
- ✅ M3: User authentication (OAuth + Email)
- ✅ M4: Real-time presence (WebSocket)
- ✅ T012: Supabase RLS policies

**In Progress:**
- 🟡 M5: Whiteboard canvas (80% done, deploy Monday)

**Blocked:**
- None

## Next Week

- M5: Complete whiteboard canvas
- M6: Drawing tools (pen, shapes, colors)
- Sprint 3 demo (Friday 3pm)

## Risks

- ⚠️ Canvas performance sluggish with 50+ shapes (needs optimization)
- Mitigation: Spike virtual scrolling (2h, Tuesday)

## Metrics

- Velocity: 21 story points (target: 20) ✅
- Test coverage: 82% (target: 80%) ✅
- Bug count: 3 open (2 low, 1 medium)

## Budget

- Spent: $12K / $15K (Sprint 3 budget) ✅
- Runway: 8 weeks remaining

---

**Next report:** Sep 29, 2026
```

## Q65g — Change Control

This is about *who approves scope changes mid-project*, which is different from the Roadmap/Timeline docs (which describe the current plan, not how the plan changes):

- **None** — solo, change freely; record decisions in `docs/dev-docs/DECISIONS.md` so future-you knows why a feature was cut or added.
- **Product owner approves** — one named person is the gatekeeper for scope changes; prevents "can you just also add X" from silently expanding the timeline. Agent must not start work on the change until approval is given explicitly.
- **Formal change request + impact assessment** — for client work or larger teams: use `templates/pm/CHANGE_REQUEST_TEMPLATE.md`. Every scope change gets an impact assessment (scope delta, timeline shift, budget delta, new risks) before work starts. Log approved CRs in `docs/pm/CHANGE-LOG.md`.

**Record the chosen option in CONTEXT.md as:**
```
change_control: [none | owner-approval | formal-cr]
change_control_authority: [name / role — or "self" for solo]
```

**Agent behavior when a scope change is requested during build:**
1. Do not start implementing immediately.
2. Check `change_control` in CONTEXT.md.
3. If `formal-cr`: create CR from `templates/pm/CHANGE_REQUEST_TEMPLATE.md`, present to user, wait for approval before touching any task.
4. If `owner-approval`: state the change + estimated impact (time, risk) in one message, wait for explicit "yes."
5. If `none`: proceed, but add one-line entry to `docs/dev-docs/DECISIONS.md`.

See Cross-phase rule 10b in SKILL.md for the enforcement rule.

## Q65h — Decision Log

Optional, but valuable the moment "why did we choose Postgres over Mongo again?" would otherwise require digging through old chat logs. If yes, `docs/dev-docs/DECISIONS.md` gets one entry per major decision: what was decided, what alternatives were considered, and why — written at the time of the decision, not reconstructed later from memory.

## Don't over-formalize a solo project

The most common failure mode for this section is generating enterprise-weight process documentation for a one-person side project. If Q12 (team size) is Solo and Q65c stakeholders is "none," keep `docs/pm/` short and honest rather than padding it with a fabricated RACI matrix or a change-control process no one will follow. A one-paragraph `STAKEHOLDERS.md` that says "solo project, no external stakeholders, I make all decisions" is more useful — and more honest — than a templated table with invented names.

---

**Version:** 1.0.0
**Part of:** Phase 5 (Project Management Fundamentals)
