# Detailed Timeline Guide — Execute & Control Phase

**Purpose:** Turn the answers from Phase 2 (Resources) + Phase 1a (Requirements) into a
defensible, living project schedule — one that survives first contact with reality.

Read this when: building or reviewing a Detailed Timeline, or when generating any file under
`docs/pm/TIMELINE.md`, `docs/pm/SPRINT-PLAN.md`, or `docs/pm/MILESTONE-REGISTER.md`.

---

## Contents

- [Why "Detailed" ≠ "Detailed Enough"](#why-detailed--detailed-enough)
- [Step 1 — Choose Your Scheduling Model](#step-1--choose-your-scheduling-model)
- [Step 2 — Decompose Into a Work Breakdown Structure (WBS)](#step-2--decompose-into-a-work-breakdown-structure-wbs)
- [Step 3 — Estimate Duration per Work Item](#step-3--estimate-duration-per-work-item)
- [Step 4 — Map Dependencies (the part everyone skips)](#step-4--map-dependencies-the-part-everyone-skips)
- [Step 5 — Build the Critical Path](#step-5--build-the-critical-path)
- [Step 6 — Load Calendar Constraints](#step-6--load-calendar-constraints)
- [Step 7 — Define Milestones & Delivery Gates](#step-7--define-milestones--delivery-gates)
- [Step 8 — Build the Sprint or Phase Plan](#step-8--build-the-sprint-or-phase-plan)
- [Step 9 — Establish a Baseline and Deviation Threshold](#step-9--establish-a-baseline-and-deviation-threshold)
- [Step 10 — Embed the Timeline into Your Monitoring Cadence](#step-10--embed-the-timeline-into-your-monitoring-cadence)
- [Scheduling Models Reference](#scheduling-models-reference)
- [Common Timeline Pitfalls](#common-timeline-pitfalls)
- [Methodology Compatibility Matrix](#methodology-compatibility-matrix)

---

## Why "Detailed" ≠ "Detailed Enough"

A timeline that says "Development: Week 3–10" is a schedule in name only. It cannot answer:
- Which tasks are blocking others?
- Who is responsible on which days?
- What is the last safe date to slip Feature X before the release date breaks?
- If a developer goes on leave, which deliverable is at risk?

A *detailed* timeline answers all four. This guide explains how to build one that does.

---

## Step 1 — Choose Your Scheduling Model

The scheduling model determines the shape of everything else. Don't pick one based on what
sounds right — pick based on the **nature of the deliverable and the team's actual working style**.

| Signal | Use this model |
|---|---|
| Requirements are fixed and agreed before dev starts (client contract, regulatory) | **Phase-Gate / Waterfall** |
| Requirements will evolve; delivery value matters more than delivery date | **Agile / Scrum** |
| Flow of work matters more than iteration cadence; no fixed sprint needed | **Kanban** |
| Hard external deadline *and* evolving requirements | **Hybrid** (Phase-Gate milestones + Agile sprints inside each phase) |
| Research or innovation project; output is uncertain | **Rolling Wave** (plan 2–4 weeks ahead in detail, rest stays high-level) |

**For most enterprise client projects:** Hybrid is the correct default. The client expects
milestone sign-offs (waterfall outer shell), but internal dev works better in sprints (agile
inner loop). The templates in this skill use Hybrid as the baseline.

---

## Step 2 — Decompose Into a Work Breakdown Structure (WBS)

A WBS is **not** a task list. It is a hierarchical decomposition of *scope* — everything the
project must produce, organized from deliverable down to work package.

### Standard 3-Level WBS for Software Projects

```
Level 1 — Project
└── Level 2 — Phase / Deliverable Category
    └── Level 3 — Work Package (what one person or team can own)
        └── (optional) Level 4 — Task (specific actions within a work package)
```

### Example WBS for an enterprise web application

```
1.0 PROJECT: Client Portal v2
│
├── 1.1 MANAGEMENT
│   ├── 1.1.1  Project kick-off & charter
│   ├── 1.1.2  Weekly status reporting
│   └── 1.1.3  Change control process
│
├── 1.2 REQUIREMENTS & DESIGN
│   ├── 1.2.1  Requirement elicitation sessions
│   ├── 1.2.2  FSD & PRD drafting
│   ├── 1.2.3  Requirement sign-off (Gate R)
│   ├── 1.2.4  UI/UX wireframes
│   └── 1.2.5  Design sign-off
│
├── 1.3 DEVELOPMENT
│   ├── 1.3.1  Environment setup & CI/CD pipeline
│   ├── 1.3.2  Authentication & access control module
│   ├── 1.3.3  Dashboard & reporting module
│   ├── 1.3.4  Transaction / core-feature module
│   ├── 1.3.5  Third-party integration (API X)
│   └── 1.3.6  Admin panel
│
├── 1.4 TESTING
│   ├── 1.4.1  Test plan & test case authoring
│   ├── 1.4.2  Unit & integration testing (Dev-owned)
│   ├── 1.4.3  QA regression testing
│   ├── 1.4.4  SIT — system integration testing
│   └── 1.4.5  UAT — user acceptance testing
│
├── 1.5 DEPLOYMENT & RELEASE
│   ├── 1.5.1  Staging deployment & smoke test
│   ├── 1.5.2  Production deployment
│   ├── 1.5.3  Release notes & user manual
│   └── 1.5.4  Post-release monitoring (hypercare window)
│
└── 1.6 CLOSURE
    ├── 1.6.1  Handover documentation
    ├── 1.6.2  Lessons learned / retrospective
    └── 1.6.3  Project sign-off & archiving
```

**Rule:** Every WBS leaf node must have a single accountable owner (not "the team").
If you cannot name one person, the work package is not yet specific enough.

---

## Step 3 — Estimate Duration per Work Package

### The Three-Point Estimate (industry standard, avoids overconfidence)

For each work package, gather three numbers:

| Label | Meaning |
|---|---|
| **O** (Optimistic) | Best case — everything goes right |
| **M** (Most Likely) | Expected realistic duration |
| **P** (Pessimistic) | Worst case — realistic worst, not apocalyptic |

**Formula (PERT):**
```
Expected Duration = (O + 4M + P) / 6
Standard Deviation = (P - O) / 6
```

**Example:**
```
WP 1.3.3 — Dashboard module
O = 3 days  |  M = 5 days  |  P = 10 days
Expected = (3 + 20 + 10) / 6 = 5.5 days
SD = (10 - 3) / 6 = 1.2 days
→ Estimate: 5–7 days (5.5 ± 1 SD)
```

### Velocity-Based Estimation (Agile teams only)

If the team has run sprints before:
1. Take average story points completed per sprint (team velocity)
2. Count total story points in backlog
3. `Sprints needed = Total points ÷ Velocity`
4. Add 10–20% buffer for sprint ceremonies and unplanned work

**Do not use velocity from a different team or a different project.** Velocity is team-specific.

### Estimation Calibration Checklist

Before locking estimates, verify:
- [ ] Estimates include code review time, not just coding time
- [ ] Estimates include QA handoff and bug-fix iteration, not just development
- [ ] Estimates account for team members at < 100% allocation to this project
- [ ] Estimates include time for documentation (not "we'll do it later")
- [ ] Buffer exists for dependency delays (third-party API, client feedback)

---

## Step 4 — Map Dependencies (the part everyone skips)

Every work package has a relationship to others. These four types cover all cases:

| Type | Meaning | Example |
|---|---|---|
| **FS** (Finish-to-Start) | B cannot start until A finishes | UAT cannot start until SIT passes |
| **SS** (Start-to-Start) | B cannot start until A starts | UI development cannot start until wireframes start |
| **FF** (Finish-to-Finish) | B cannot finish until A finishes | Documentation finishes when dev finishes |
| **SF** (Start-to-Finish) | B cannot finish until A starts | (rare — mostly in shift-handover scenarios) |

**Dependency registry for each work package:**

```
WP ID   | Depends On (Predecessors) | Type | Lag/Lead
1.3.2   | 1.2.3 (Req sign-off)      | FS   | 0 days
1.4.3   | 1.3.x (all Dev WPs)       | FS   | 1 day (handoff prep)
1.4.5   | 1.4.4 (SIT pass)          | FS   | 0 days
1.5.2   | 1.4.5 (UAT sign-off)      | FS   | 1 day (release prep)
```

**External dependencies must also be listed:**
- Client feedback turnaround (e.g., "Client reviews FSD — estimated 5 business days")
- Third-party API availability / sandbox access
- Infrastructure provisioning by client's IT team
- Legal / compliance sign-off windows

If an external dependency has no committed date, it is a **risk** — log it in `RISKS.md` with a
buffer day built into the timeline.

---

## Step 5 — Build the Critical Path

The **Critical Path** is the longest chain of dependent tasks that determines the project's
minimum duration. Any delay on the critical path = project delay.

### How to find it (manual method for small projects)

1. List all work packages with estimated durations
2. Draw the dependency network (or use a table)
3. Calculate **Early Start (ES)** and **Early Finish (EF)** by forward pass
4. Calculate **Late Start (LS)** and **Late Finish (LF)** by backward pass
5. **Float = LS − ES** — tasks with float = 0 are on the critical path

### What to do with the critical path

- Assign your most experienced/reliable people to critical path tasks
- Flag critical path tasks visually in the Gantt chart (red or bold)
- Review critical path status in **every** weekly PM review
- When a client asks "can we add X?", check if X touches the critical path before answering

---

## Step 6 — Load Calendar Constraints

A schedule that ignores the calendar is fiction. Capture:

### National / Regional Holidays
List all public holidays within the project window by country/location of each team member.
For multi-country teams, build a unified calendar showing blackout days per team.

### Client Blackout Periods
- Accounting close periods (no UAT sign-offs during month-end)
- Client internal events (annual offsite, product launches that freeze change windows)
- Procurement freeze periods

### Team Availability
For each team member, document:
- Planned leave during project window (at project start — do not assume 100% availability)
- Part-time allocation to this project (e.g., "Dev A is 60% on this project, 40% on maintenance")
- Any scheduled training, conferences, or onboarding periods

### Buffer Policy (enterprise standard)
- Add **10%** schedule buffer for projects < 3 months
- Add **15%** schedule buffer for projects 3–6 months
- Add **20%** schedule buffer for projects > 6 months
- Do NOT consume buffer proactively — it is for unforeseen events only

**Where to put the buffer:** As a dedicated "Schedule Reserve" work package at the end,
not distributed invisibly across task estimates. Visible buffers are manageable; hidden
padding is unaccountable and gets consumed invisibly.

---

## Step 7 — Define Milestones & Delivery Gates

A **milestone** is a point-in-time marker, not a duration. It signals that a meaningful
deliverable or decision has been reached.

### Enterprise Milestone Taxonomy

| Milestone Code | Name | Trigger |
|---|---|---|
| M0 | Project Kick-Off | Charter signed, team assembled |
| M1 | Requirements Baseline | Gate R approved (FSD, RTM signed off) |
| M2 | Design Approved | UI/UX sign-off by client |
| M3 | Dev Complete (Feature Freeze) | All features pass internal QA |
| M4 | SIT Complete | All SIT test cases pass / issues closed |
| M5 | UAT Sign-Off | Client signs UAT acceptance letter |
| M6 | Production Release | App live on production |
| M7 | Hypercare End / Project Close | Post-release support window closed |

### Delivery Gates (Go/No-Go checkpoints)

Each gate has explicit entry criteria. If criteria are not met, the project does not proceed.

```
Gate R (Requirements Approved)
  Entry criteria:
    ✓ FSD reviewed and signed by key user + PIC client
    ✓ All TBD items in FSD resolved (zero open TBDs)
    ✓ RTM populated with at least 80% of requirements
    ✓ Scope statement finalized (no open scope items)
  Consequence of fail: Requirement gathering session re-opened; target date shifts

Gate M3 (Dev Complete)
  Entry criteria:
    ✓ All backlog items in "Ready to Deliver" or "Done" status
    ✓ Zero P1/P2 bugs open in internal QA
    ✓ Code review complete for all modules
    ✓ Staging environment mirrors production configuration
  Consequence of fail: Failed items return to sprint; SIT date shifts

Gate M5 (UAT Sign-Off)
  Entry criteria:
    ✓ UAT sign-off letter received (dated, named, authorized signatory)
    ✓ All P1 bugs resolved; P2 bugs documented with agreed resolution path
    ✓ User manual delivered and acknowledged
    ✓ Release checklist completed and approved internally
  Consequence of fail: UAT session extended; release date shifts
```

---

## Step 8 — Build the Sprint or Phase Plan

### For Hybrid (recommended for enterprise client projects)

Structure: **Phase-level milestones → Sprint-level execution inside each phase**

```
PHASE 1: INITIATION & REQUIREMENTS    [Weeks 1–3]
  Sprint 0: Kick-off, environment setup, tool onboarding
  Sprint 1: Requirement elicitation sessions
  Sprint 2: FSD draft → review → Gate R sign-off
  └─ Milestone M1: Requirements Baseline

PHASE 2: DESIGN                       [Weeks 4–5]
  Sprint 3: Wireframes + UI design
  Sprint 4: Client design review → revisions
  └─ Milestone M2: Design Approved

PHASE 3: DEVELOPMENT                  [Weeks 6–14]
  Sprint 5:  Module A + CI/CD setup
  Sprint 6:  Module B + Unit tests
  Sprint 7:  Module C + Internal QA
  Sprint 8:  Module D + Integration
  Sprint 9:  Bug fixes + Code review
  └─ Milestone M3: Feature Freeze

PHASE 4: TESTING                      [Weeks 15–17]
  Sprint 10: SIT execution
  Sprint 11: UAT preparation + execution
  └─ Milestone M4: SIT Complete
  └─ Milestone M5: UAT Sign-Off

PHASE 5: DEPLOYMENT & CLOSURE        [Weeks 18–19]
  Sprint 12: Staging → Prod deployment + smoke test
  Sprint 13: Hypercare + documentation handover
  └─ Milestone M6: Production Release
  └─ Milestone M7: Project Close
```

### Sprint Card — What Each Sprint Definition Must Contain

For each sprint before it starts, define:

```
Sprint N: [Name]
Period:   [Start date] → [End date]
Goal:     One sentence — what does "done" look like for this sprint?

Committed items:
  - [WP ID] [Work package name] | Owner: [Name] | Est: [Xd] | AC: [link or inline]
  - ...

Dependencies this sprint:
  - [External: e.g., "Client provides test data by Day 3"]
  - [Internal: e.g., "WP 1.3.2 must be done before WP 1.3.3 can start"]

Definition of Done (sprint-level):
  ✓ All committed items in "Ready to Deliver" or moved to next sprint with documented reason
  ✓ Sprint retrospective notes saved
  ✓ Status report sent to client
```

---

## Step 9 — Establish a Baseline and Deviation Threshold

Once the timeline is approved by all parties, **baseline it**. A baseline is a locked snapshot
of the approved schedule — changes after this point go through change control.

### What to baseline

- Target dates for all milestones (M0–M7)
- Sprint start/end dates
- Delivery dates per module or feature group
- Resource allocation per sprint

### Deviation Thresholds (escalation triggers)

| Slippage | Action |
|---|---|
| ≤ 2 business days | PM absorbs via buffer; note in weekly status |
| 3–5 business days | PM escalates to project sponsor; recovery plan drafted |
| > 5 business days on non-critical path | Risk register updated; client informed |
| Any slippage on critical path | Immediate escalation; Go/No-Go review on impacted milestone |
| > 10% of total schedule | Formal change request required; baseline re-approved |

### Schedule Performance Index (SPI) — optional but enterprise-standard

```
SPI = Earned Value (EV) ÷ Planned Value (PV)

SPI > 1.0 = Ahead of schedule
SPI = 1.0 = On schedule
SPI < 1.0 = Behind schedule
SPI < 0.8 = Red flag — recovery plan required immediately
```

---

## Step 10 — Embed the Timeline into Your Monitoring Cadence

A timeline only has value if it is actively maintained. Define:

### Weekly PM Review Checklist

- [ ] Update actual progress for each in-flight work package
- [ ] Recalculate forecast completion dates for impacted work packages
- [ ] Identify new risks or issues that affect the schedule
- [ ] Check critical path status — any new items on the critical path?
- [ ] Compare to baseline — are we within deviation threshold?
- [ ] Prepare weekly status report for client (see COMMUNICATION-PLAN.md)

### Timeline Artifact Ownership

| Artifact | Owner | Update Frequency |
|---|---|---|
| TIMELINE.md (milestone-level) | PM | Per milestone event or schedule change |
| SPRINT-PLAN.md | PM + Team | Before each sprint starts; updated mid-sprint if blocked |
| RISK register (schedule risks) | PM | Weekly |
| Status report | PM | Weekly (or per agreed cadence with client) |

---

## Scheduling Models Reference

### Waterfall
- Plan everything up front, execute in sequence
- Use when: requirements are fixed, contract is time-and-materials with fixed scope
- Risk: late discovery of requirement gaps is expensive

### Agile / Scrum
- 2-week sprints; requirements evolve via backlog grooming
- Use when: product direction may change; team is co-located or async-capable
- Risk: hard to give clients a fixed delivery date

### Hybrid (recommended for enterprise)
- Fixed milestone dates (client-facing) + agile sprints (internal)
- Use when: client needs date certainty but internal dev benefits from flexibility
- Trade-off: milestone dates must absorb sprint variance → buffer planning critical

### Kanban
- Continuous flow; no sprints; WIP limits control throughput
- Use when: maintenance mode, support projects, or unpredictable demand
- Metric: cycle time per item, not velocity

### Rolling Wave
- Plan 2–4 weeks in full detail; future phases stay high-level
- Use when: research project, innovative product where future shape is genuinely unknown
- Risk: harder to give long-horizon date commitments

---

## Common Timeline Pitfalls

### 1. Planning at 100% Availability
People are not available 100% of the time. Factor in:
- Meetings (recurring standups, reviews, client calls)
- Context switching between projects
- Unplanned interruptions (production issues, ad-hoc requests)
**Industry standard:** plan at 70–80% productive capacity, not 100%.

### 2. No External Dependency Buffer
Client turnaround for feedback is almost never as fast as clients promise.
**Fix:** For every deliverable awaiting client review, add a buffer equal to **client-stated
turnaround × 1.5**. If they say "2 days," plan for 3.

### 3. Merging Testing Into Development
QA is not the tail end of development — it is a parallel and gate-keeping activity.
If testing is only accounted for as "the last week," the first bug-fix cycle breaks the schedule.
**Fix:** QA time must be explicitly allocated in the WBS and timeline as its own work package.

### 4. Milestone ≠ Task Completion
A milestone is not just "everything is done." It is a **decision point** requiring explicit
sign-off. Without a named approver and a sign-off process, milestones slip silently.
**Fix:** Every milestone must have: a definition of done, a named approver, and a sign-off artifact.

### 5. Timeline Lives Only in the PM's Head
If the timeline is only in a Gantt chart the team doesn't look at, it is decorative.
**Fix:** The timeline must live in the tool the team uses daily (Jira, Linear, Notion, etc.)
and be referenced explicitly in every sprint planning and status review.

### 6. Ignoring Change Impact on Timeline
Every scope change is also a schedule change. "Can we add this feature?" must always be
answered with: "Yes, and it moves milestone M3 by X days" — never silently absorbed.
**Fix:** Change control process must include a mandatory timeline impact assessment.

---

## Methodology Compatibility Matrix

| Practice | Waterfall | Agile | Hybrid | Kanban |
|---|---|---|---|---|
| WBS decomposition | ✅ Required | ✅ As backlog | ✅ Required | ⚠️ Lightweight |
| Three-point estimates | ✅ | ⚠️ Story points preferred | ✅ | ❌ Use cycle time |
| Critical path | ✅ | ⚠️ Sprint-level only | ✅ Milestone CP | ❌ |
| Sprint planning | ❌ | ✅ | ✅ Inside phases | ❌ |
| Baseline + change control | ✅ | ⚠️ Loose | ✅ | ❌ |
| Delivery gates / milestones | ✅ | ⚠️ As release goals | ✅ | ⚠️ |
| Velocity tracking | ❌ | ✅ | ✅ Inside sprints | ❌ |
| Cycle time / throughput | ❌ | ⚠️ | ⚠️ | ✅ |

---

**Version:** 1.0.0
**Complements:** PRE_PROJECT_GUIDE.md (Phase 0), REQUIREMENT_GATHERING_GUIDE.md (Phase 1a),
PM_FUNDAMENTALS_GUIDE.md (Phase 5)
**Used by:** TIMELINE.md, SPRINT-PLAN.md, MILESTONE-REGISTER.md output files
