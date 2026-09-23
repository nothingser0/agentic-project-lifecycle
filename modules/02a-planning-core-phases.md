# Module 02a — Planning: Core Phases

**Contains:** Phase 0 (Pre-Project/Initiation), Phase 1a (Requirement Gathering), Phase 1 (Discovery), Phase 2 (Resources), Phase 2a (Detailed Timeline).

**Used by:** All planning modes (Lightweight, Standard, Full). See `02-planning-router.md` for which sections to read per mode.

---

## Workflow

### Phase 0: Pre-Project / Initiation (10 core + conditional probes, ~30 min)

**Always run Phase 0 first.** No discovery, tech stack, or design questions should be asked
until Phase 0 gates pass. This phase produces the business-level artifacts that make the rest
of the planning credible.

Read `references/pm/PRE_PROJECT_GUIDE.md` before starting Phase 0 and before generating any
`docs/pm/` file in this phase — it explains the gate logic, what to do when gates fail, and
how to scale formality down for solo/internal projects.

#### Phase 0 Gates

Three gates are enforced before the interview proceeds:

| Gate | Trigger | Blocker |
|------|---------|---------|
| **Gate 0: Business case approved** | After Q0a–b | Block Phase 1 until sponsor + business case confirmed |
| **Gate 1: Legal sign-off** | After Q0e | Block Phase 2 until contract status confirmed |
| **Gate 2: Charter signed → Kick-off cleared** | After Q0f | Kick-off should not happen until charter approved |

For solo/personal projects: Gate 0 = one-paragraph rationale; Gate 1 = skip; Gate 2 = informal.
The agent must explicitly confirm each gate with the user before advancing, even if briefly.

#### Phase 0 Questions (10 main)

**Q0a — Business Case & Feasibility**
> "Before we get into features and tech stack, let's confirm the business case. What problem does
> this project solve, and why is it worth solving now rather than later?"

Probe for: technical feasibility / financial feasibility (rough ROI or "saves N hours/week") /
operational feasibility (team exists?) / scheduling feasibility (timeline realistic?)

Sub-questions:
- Q0a-i: Rough expected benefit? (Revenue uplift / Cost saving / Time saving / Risk reduction /
  Strategic — no direct financial metric / Learning / Personal use)
- Q0a-ii: Quantify if possible. (Open text: "saves ~4h/week", "target: 500 signups in month 1",
  "learning project — no financial metric")

**Q0b — Strategic Alignment**
> "Which company or personal goal does this project directly support?"

Examples: "Reduce customer churn" / "Enter SMB market" / "Replace legacy billing" /
"Personal learning project — deepen TypeScript skills" / "Validate market hypothesis"

**Q0c — Project Sponsor & Authority**
> "Who is the project sponsor — the person with budget authority and the ability to make final
> decisions on scope, timeline, and staffing?"

Sub-questions:
- Q0c-i: Who can approve scope changes? (Sponsor / PM alone / Formal change request / "I decide — solo")
- Q0c-ii: For client work — who on the client side has sign-off authority? (Day-to-day contact /
  Named decision-maker / Not yet identified)

**→ Gate 0 check:** Confirm sponsor named + business case articulated before continuing.

**Q0d — Stakeholder Register**
> "Beyond your end users, who else has a stake in this project's success or failure?"

Prompt categories: Internal teams (support, finance, legal, sales) / External (client, regulator,
integration partner) / Hidden stakeholders (teams whose process changes when this ships)

For each stakeholder: name/role → interest → influence (High/Med/Low) → power (High/Med/Low) →
RACI assignment → communication preference

**For Medium+ projects:** after collecting stakeholder answers, generate `docs/pm/RACI.md`
from `templates/pm/RACI_MATRIX_TEMPLATE.md`. This is mandatory per Cross-phase rule 21 (SKILL.md).
The RACI matrix must be complete before Gate 2 (charter sign-off) — a kick-off meeting with an
incomplete RACI leaves decision authority undefined. Fill only the roles that are active on this
project; remove unused role columns. Document veto rights (A★) explicitly for the Sponsor,
Client, and Legal columns. For solo projects: skip `RACI.md`, write one paragraph in
`docs/pm/STAKEHOLDERS.md` instead.

Sub-question:
- Q0d-i: For each stakeholder with High power + High interest: how often do they need a status
  update? (Weekly / Biweekly / At milestones / As-needed)

**Q0e — Legal & Contract Type**
> "What is the legal relationship for this project?"

Options (filter by project type):
- **Client-facing:** NDA only / SoW / MSA+SoW / Fixed-price contract / Time & Materials (T&M)
- **Internal:** Internal project approval (email/ticket) / No formal approval needed

Sub-questions:
- Q0e-i: Document status? (Not started / Draft / Sent / **Signed ✓**)
- Q0e-ii: Regulated data requiring additional agreements? (GDPR DPA / HIPAA BAA / PCI-DSS /
  None)
- Q0e-iii: IP ownership? (Work-for-hire — client owns / License model / Open source /
  Retained IP — vendor keeps)

**→ Gate 1 check:** If Q0e-i ≠ "Signed" and project is client-facing, surface Gate 1 blocker.
Agent says: "Legal agreement should be signed before development starts. I'll note this as a
Gate 1 blocker in `LEGAL-REGISTER.md`. Proceeding to planning now at your direction."

**Q0f — Project Charter Sign-off**
> "Has the project charter been reviewed and approved by the sponsor? How will sign-off happen?"

Options: Digital signature (DocuSign/Adobe Sign) / Email confirmation / Verbal + MoM /
Not yet — need to draft charter first

If "Not yet": agent generates `docs/pm/PROJECT-CHARTER.md` draft from Phase 0 answers so far,
with a clear note that it requires sponsor review before Gate 2 passes.

**→ Gate 2 check:** Confirm charter approved (or in review) before proceeding to kick-off.

**Q0g — Kick-off Meeting Format**
> "How will the kick-off meeting be structured?"

Options: Async (Loom + shared doc) / Internal kick-off only / Client kick-off (formal meeting) /
Full program kick-off (multiple workstreams, breakout sessions)

Sub-questions:
- Q0g-i: Who attends? (Agent suggests based on Q0d stakeholder list; user confirms)
- Q0g-ii: Agenda items? (Multi-select: charter walkthrough / team introductions / scope Q&A /
  working agreements / tools & channels / next steps)
- Q0g-iii: Will Minutes of Meeting (MoM) be recorded? (Yes / No)

**Q0h — Definition of Done (Business Level)**
> "What does 'this project is done' mean at the business level — not the feature list, but the
> outcome that signals success to the sponsor?"

Push past "when features are built" — target a binary condition or measurable outcome.
Examples: "System live, processing 100% of transactions" / "Client has accepted and paid" /
"App in App Store with 100 users" / "I can build my next project without a tutorial"

**Q0i — Go / No-Go Criteria**
> "What conditions would make you decide NOT to start — or to stop mid-way?"

Capture: Go trigger (all must be true before starting) / No-Go trigger (pre-start) /
Kill switch (mid-project)

**Q0j — Constraints & Assumptions**
> "What is this project explicitly constrained by, and what are you assuming to be true that
> you haven't verified?"

Constraints: Fixed deadline / Fixed budget / Technology mandate / Regulatory requirement /
Team headcount cap

Assumptions: Push for at least 3. Common ones: third-party API availability / design file
delivery schedule / existing system compatibility / user device/browser assumptions

**→ Phase 0 complete.** Agent summarizes: Gate 0 status / Gate 1 status / Gate 2 status /
files to be generated. Then proceeds to Phase 1.

#### Phase 0 Output Files (always generated, scaled by project type)

| File | Solo/personal | Internal | Client-facing | Enterprise |
|------|-------------|----------|---------------|------------|
| `docs/pm/BUSINESS-CASE.md` | 1 paragraph | 1 page | Full doc | Full doc + ROI table |
| `docs/pm/PROJECT-CHARTER.md` | 1 page informal | 1-2 pages | Full charter | Full charter + sign-off block |
| `docs/pm/LEGAL-REGISTER.md` | Skip | Internal auth note | Contract log | MSA+SoW log + compliance |
| `docs/pm/KICKOFF-AGENDA.md` | Async Loom notes | Internal agenda | Full agenda + MoM template | Program kick-off package |
| `docs/pm/STAKEHOLDERS.md` | 1 line "solo project" | Team + manager | RACI matrix | Power/interest grid + RACI |

Templates: `templates/pm/BUSINESS_CASE_TEMPLATE.md`, `templates/pm/PROJECT_CHARTER_TEMPLATE.md`,
`templates/pm/KICKOFF_AGENDA_TEMPLATE.md`

Reference: `references/pm/PRE_PROJECT_GUIDE.md`

---

### Phase 1a: Requirement Gathering & Elicitation (8 prompt units, 45-60 min)

**Always run Phase 1a after Phase 0 passes, before Phase 1's product/feature questions.** Phase 0
confirms the project is authorized; Phase 1a confirms *what "it" means and who says so* — this is
the difference between a feature list and a requirement that traces to a source, a type, and an
approval. Skipping straight from Phase 0 into Phase 1 means `PRD.md` ends up carrying business
context, functional spec, scope boundary, acceptance criteria, and approval record all at once —
exactly the blur that causes "we never agreed to that" disputes later.

Read `references/pm/REQUIREMENT_GATHERING_GUIDE.md` before starting Phase 1a and before generating
`docs/planning/FSD.md`, `SCOPE-STATEMENT.md`, `TRACEABILITY-MATRIX.md`, or
`REQUIREMENTS-SIGNOFF.md` — it explains the BABOK/PMBOK mapping, Gate R logic, and how to scale
formality down for solo/internal projects.

#### Gate R: Requirements Baseline Approved

**Trigger:** After QR7–QR8. **Blocker (client-facing/enterprise only):** Phase 4 (Design) and the
heavy parts of Phase 5 should not be treated as final until Gate R passes — tech/design choices
built on unverified requirements get rebuilt when a requirement turns out different than assumed.
For solo/internal projects this is advisory (see `REQUIREMENT_GATHERING_GUIDE.md` §"Don't
over-formalize").

#### Phase 1a Questions (8 main)

**QR1 — Elicitation Technique Selection**
> "How will you actually collect the requirements for this project — not what they are yet, just
> how you'll find out?"

Options (multi-select): 1:1 interview / Workshop-FGD / Survey-questionnaire / Observation-shadowing
/ Document analysis (brownfield/legacy SOP) / Prototyping-mockup review / Solo self-elicitation

**QR2 — Requirement Source Mapping**
> "For each major requirement area, who is the source — which named stakeholder or document?
> (Reuse the Q0d stakeholder register; for solo, 'self, based on [X]' is a legitimate answer.)"

**QR3 — Requirement Classification**
> "For each requirement, what kind is it: Business (why the org needs this) / Stakeholder (what a
> specific group needs) / Functional (what the system must do) / Non-Functional (how it must
> perform — speed, security, usability) / Transition (data migration, training, cutover)?"

**QR4 — Scope Statement (In/Out)**
> "What is explicitly in scope for this release, and what is explicitly out — especially anything
> a stakeholder might reasonably assume is included but isn't?"

**QR5 — Dependency & Constraint Capture**
> "Are there dependencies between requirements, or on something outside this project's control —
> another system, another team, a third party, a regulatory approval?"

**QR6 — Draft Acceptance Criteria (Shift-Left)**
> "For each must-have requirement, what would prove it's done? Try Given/When/Then — this is a
> draft, refined later at grooming, not a final test case."

**QR7 — Verification & Validation Checklist**
> "Run each must-have requirement through: is it consistent (doesn't contradict another
> requirement), measurable/testable, realistic given constraints, and relevant to the business
> objective? Flag anything that fails back to its source — don't silently rewrite it."

**QR8 — Requirement Sign-off**
> "How will the FSD/PRD be approved before development starts, and by whom? Formal sign-off (key
> user + client PIC) / Product Owner approval / Steering committee review / Self-approval (solo)."

**→ Gate R check:** Confirm the checklist in `REQUIREMENT_GATHERING_GUIDE.md` before treating
requirements as a baseline. Then proceed to Phase 1.

#### Phase 1a Output Files (always generated, scaled by project type)

| File | Solo/personal | Internal | Client-facing | Enterprise |
|------|-------------|----------|---------------|------------|
| `docs/planning/FSD.md` | Short, self-elicited | Grouped by module, informal | Full — all 5 classification buckets | Full + verification log |
| `docs/planning/SCOPE-STATEMENT.md` | One paragraph | Half page | Full, per module | Full, per module + change process |
| `docs/planning/TRACEABILITY-MATRIX.md` | Lightweight table | Table, informal | Full RTM linked to user stories/tests | Full RTM + coverage summary |
| `docs/planning/REQUIREMENTS-SIGNOFF.md` | Self-dated review | PO/manager confirms | Client PIC + key user sign-off | Steering committee sign-off |

Templates: `templates/specs/FSD_TEMPLATE.md`, `templates/pm/SCOPE_STATEMENT_TEMPLATE.md`,
`templates/specs/REQUIREMENT_TRACEABILITY_MATRIX_TEMPLATE.md`,
`templates/specs/REQUIREMENT_SIGNOFF_LOG_TEMPLATE.md`

Reference: `references/pm/REQUIREMENT_GATHERING_GUIDE.md`

---

### Phase 1: Discovery (10 core + conditional probes, ~45 min)

**Main questions (10):**
1. Project Name
2. Project Type (10 options: Fullstack/Microservices/JAMstack/Mobile/Desktop/API-Only/Browser Extension/CLI/IoT/Multi-Platform)
3. Current State (Greenfield / Brownfield / Migration)
4. Existing Design (Figma ready / Design system / Brand guidelines / Need full design)
5. Target Users (count)
6. Core Problem Solved
7. Must-Have Features (list)
8. Scale Target (<1K / 1K-10K / 10K-100K / 100K-1M / 1M-10M / 10M+)
9. Performance Requirements (Standard / High / Extreme / Real-time)
10. AI Features (None / Basic / Advanced / AI-First)

**Sub-questions (8, conditional):**
- Q3a: Existing Tech Stack? (if Brownfield)
- Q3b: Migrating From? (if Migration)
- Q3c: Migration Strategy? (if Migration)
- Q5a-e: Per user type (Role, Age, Tech level, Goal, Pain) × N users
- Q7a-d: Feature prioritization (Must/Should/Could/Won't)
- Q8b: Timeframe to reach scale? (<6mo / 6-12mo / 1-2y / 2-5y / Unsure)
- Q10a: AI Use Case? (Text/Image/Code/Chat/Search/Recommendation)
- Q10b: AI Audience? (User-facing / Internal / Both)

### Phase 2: Resources (5 core + 4 conditional probes, ~30 min)

**Main questions (5):**
11. Timeline (<1w / 1-4w / 1-3mo / 3-6mo / 6-12mo / 12+mo / Ongoing)
12. Team Size (Solo / 2-5 / 6-20 / 21-100 / 100+)
13. Team Composition (Solo / Dev-only / Dev+Designer / Dev+Designer+PM / Full team / Enterprise)
14. Team Experience (Junior / Mid / Senior / Expert / Mixed)
15. Budget Monthly ($0 / $5-50 / $50-500 / $500-5K / $5K-50K / $50K+ / Unlimited)

**Sub-questions (4):**
- Q11a: Work Schedule? (Full-time 40h / Part-time 20h / Weekends 10h / Flexible)
- Q12a: Team Growth Plan? (No hiring / Soon 1-3mo / Later 6-12mo / Rapid 10+ in 6mo)
- Q15a: Budget Timeline? (Now / After launch / After revenue / After funding)
- Q15b: One-Time Budget? ($0 / $100-500 / $500-5K / $5K-50K / $50K+)

### Phase 2a: Detailed Timeline (8 prompt units, 30-45 min)

**Always run Phase 2a after Phase 2 (Resources).** Phase 2 captures the high-level timeline and
team size; Phase 2a turns those answers into a defensible, baselined schedule with milestones,
delivery gates, sprint structure, dependency map, calendar constraints, and deviation thresholds.
Skipping Phase 2a leaves the project without a single source of truth for schedule — the most
common cause of missed delivery dates and scope creep disputes.

**Read `references/pm/DETAILED_TIMELINE_GUIDE.md` before starting Phase 2a and before writing
any `docs/pm/TIMELINE.md`, `docs/pm/SPRINT-PLAN.md`, or `docs/pm/MILESTONE-REGISTER.md` file.**

#### Phase 2a Gates

| Gate | Trigger | Block |
|---|---|---|
| **Gate T: Timeline Baseline Approved** | After QT8 | Block Phase 3 until scheduling model confirmed and milestone register has at least M0–M6 with target dates |

Gate T is lightweight for solo/personal projects (a one-page milestone list with dates is enough)
and heavyweight for enterprise/client-facing projects (full TIMELINE.md, SPRINT-PLAN.md,
MILESTONE-REGISTER.md, calendar constraints, and a named approver on each gate).

#### Phase 2a Questions (8 main)

**QT1 — Scheduling Model**
> "Based on your team and deliverable, which scheduling model fits best?"

Options to present with brief descriptions:
- **Hybrid** (Phase-Gate milestones + Agile sprints inside each phase) — *recommended default for enterprise client projects*
- **Agile / Scrum** (2-week sprints, evolving requirements)
- **Waterfall / Phase-Gate** (fixed requirements, sequential phases)
- **Kanban** (continuous flow, no sprint cadence)
- **Rolling Wave** (plan 2–4 weeks ahead in detail, future stays high-level)

> If the user says "I don't know" → recommend Hybrid and explain why (fixed client milestones + internal agility). See DETAILED_TIMELINE_GUIDE.md § Step 1 for the full decision table.

---

**QT2 — Sprint Duration** *(skip if Waterfall or Kanban)*
> "How long will each sprint be?"

Options: 1 week / 2 weeks (default) / 3 weeks / No sprints (milestone-based only)

---

**QT3 — Key Milestone Dates**
> "Do you have any fixed external deadlines — a client go-live date, a launch event, a regulatory date?"

- If yes → capture the date(s) and label them as hard constraints; build the timeline backward from them
- If no → build forward from project start using estimated durations

> Hard deadline on a critical-path milestone = highest-priority risk. Log it in RISKS.md with mitigation.

---

**QT4 — Calendar Constraints**
> "Are there any blackout periods, public holidays, or significant team leaves during the project window?"

Capture:
- National/regional holidays per team location
- Client blackout periods (month-end close, product launches, procurement freezes)
- Planned team leave (name, dates, % impact on sprint capacity)

> For multi-country teams, flag dates where more than one team member is unavailable simultaneously — these are capacity troughs, not single-person leaves.

---

**QT5 — Team Allocation**
> "Is each team member 100% on this project, or split across multiple projects?"

- Capture % allocation per role (Dev, QA, PM, Designer)
- If anyone is < 80%: flag as a schedule risk and apply 70–80% productive capacity assumption to their estimates
- If a key role has 0 allocation yet (e.g., "QA TBD"): log as a resource risk with a date by which it must be resolved

---

**QT6 — Estimation Approach**
> "How will you estimate task duration?"

Options:
- **Three-point / PERT** (Optimistic + Most Likely + Pessimistic) — recommended for waterfall/hybrid
- **Story points + velocity** — for teams with sprint history
- **T-shirt sizing then conversion** (S/M/L/XL → days) — for early-stage planning
- **PM judgment** — last resort; flag explicitly as low-confidence

> If the team has no sprint history, steer toward three-point. Velocity from a past project on a different team is not transferable.

---

**QT7 — Buffer Policy**
> "How much schedule buffer do you want to allocate, and where?"

Default recommendations (from DETAILED_TIMELINE_GUIDE.md § Step 6):
- < 3 months project: 10% buffer
- 3–6 months: 15%
- > 6 months: 20%

Clarify: buffer goes into a visible "Schedule Reserve" work package at the end — NOT distributed
invisibly across task estimates.

---

**QT8 — Deviation & Escalation Threshold**
> "At what point does a schedule slip require you to notify the client or sponsor?"

Default thresholds (from DETAILED_TIMELINE_GUIDE.md § Step 9):
- ≤ 2 days: PM absorbs via buffer
- 3–5 days: escalate to sponsor
- > 5 days (non-critical path): inform client
- Any critical path slip: immediate escalation + milestone Go/No-Go review
- > 10% total schedule: formal change request required

If the client has a different tolerance, capture it here and override the defaults in TIMELINE.md.

---

**→ Phase 2a complete.** Agent summarizes: scheduling model / sprint duration / milestone count /
calendar constraints noted / buffer allocated / baseline status. Then proceeds to Phase 1 (Discovery).

#### Phase 2a Output Files (scaled by project type)

| File | Solo/personal | Internal | Client-facing | Enterprise |
|---|---|---|---|---|
| `docs/pm/TIMELINE.md` | 1-page milestone list | Phase plan + sprints | Full timeline + calendar constraints | Full timeline + WBS flat list + Gantt narrative |
| `docs/pm/SPRINT-PLAN.md` | Skip (or minimal) | Sprint cards × N | Sprint cards × N + DoD | Sprint cards × N + velocity baseline + DoD |
| `docs/pm/MILESTONE-REGISTER.md` | Inline in TIMELINE.md | M0–M6 with dates | M0–M7 + gate criteria | M0–M7 + gate criteria + named approvers + sign-off blocks |

Template: `templates/pm/DETAILED_TIMELINE_TEMPLATE.md`
Reference: `references/pm/DETAILED_TIMELINE_GUIDE.md`

---
