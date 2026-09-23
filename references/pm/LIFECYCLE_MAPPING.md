# Lifecycle & Methodology Mapping — Single Reference

**Purpose:** Answer two questions an agent or user will ask sooner or later —
"how does this skill map to the standard 3-stage / 5-phase PM life cycle?" and
"which development methodology (Waterfall / Agile / SDLC / Spec-Driven) does this
skill actually run?" — from one place, instead of piecing it together across
`PRE_PROJECT_GUIDE.md`, `REQUIREMENT_GATHERING_GUIDE.md`, `PM_FUNDAMENTALS_GUIDE.md`,
`DETAILED_TIMELINE_GUIDE.md`, `DEVELOPMENT_STAGE_GUIDE.md`, and `POST_PROJECT_CLOSURE_GUIDE.md`.

Read this when: onboarding to the skill, comparing it against an external PM framework,
or when a user asks which methodology the skill follows.

---

## 1. Three-stage PM life cycle mapping

Most practical PM write-ups (and this skill's own module boundaries) use three stages:
Pre-Project, On-Going Project, Post-Project. Each maps to a skill phase and produces the
same artifacts a traditional PM lifecycle expects — the skill doesn't skip any of them,
it scales their formality by tier (see `engine/ARTIFACT-REGISTRY.md`).

| Stage | Standard activity | Skill module | Skill artifact |
|---|---|---|---|
| **Pre-Project** (Initiation & Planning) | Feasibility/assessment | `02-planning-router.md` Phase 0 | `BUSINESS-CASE.md` |
| | Legal/contract | Phase 0 Q0e, Gate 1 | `LEGAL-REGISTER.md` |
| | Project charter (signed) | Phase 0 Q0f, Gate 2 | `PROJECT-CHARTER.md` |
| | Kick-off meeting | Phase 0 Q0g | `KICKOFF-AGENDA.md` |
| | Requirement gathering (FSD/PRD/wireframe) | Phase 1a | `PRD.md`, `FSD.md`, `SCOPE-STATEMENT.md` |
| | Detailed timeline | Phase 2a | `TIMELINE.md`, `MILESTONE-REGISTER.md` |
| **On-Going Project** (Execution & Controlling) | Backlog → Todo → In Progress → Testing → Code Review → Ready to Deliver → SIT → UAT → Release | `03-build-router.md` + `references/devops/DEVELOPMENT_STAGE_GUIDE.md` | `TASKS.md` Kanban, `VERIFY.md` gate ladder |
| | Status reports, change control | Ongoing during BUILD | `STATUS-REPORTS.md`, `CHANGE-LOG.md` |
| **Post-Project** (Closure) | Closure documentation (charter, specs, manual, UAT result, timeline report, BAST) | `04-closure.md`, Gate C | `PROJECT-CLOSURE-REPORT.md`, `BAST.md`, `HANDOVER.md` |
| | Post-mortem / project review (achievements, issues+resolution, project score, anonymous 360) | `04-closure.md` | `RETROSPECTIVE.md` |

This is a deliberate 1:1 correspondence, not a loose analogy — the Kanban column
names and order above are exact matches to `DEVELOPMENT_STAGE_GUIDE.md`.

**PMBOK/PRINCE2/BABOK cross-reference:** the 5-phase PMI model (Initiation → Planning →
Execution → Monitoring & Controlling → Closure) maps onto the three stages as: Pre-Project
= Initiation + Planning, On-Going Project = Execution + Monitoring & Controlling,
Post-Project = Closure. Individual artifact-to-process-group mappings are in
`PRE_PROJECT_GUIDE.md` (Initiation), `REQUIREMENT_GATHERING_GUIDE.md` (BABOK elicitation),
and `PM_FUNDAMENTALS_GUIDE.md` (Planning-phase risk/comms/change-control).

---

## 2. Methodology positioning

The skill is **methodology-agnostic at the scheduling layer** and **tier-gated at the
execution layer** — it does not lock a project into one methodology; it asks which one
fits (Phase 2a QT1) and then enforces the practices that methodology implies.

### 2a. Scheduling layer (Phase 2a) — user selects one

| Model | When the skill recommends it | Source |
|---|---|---|
| Waterfall / Phase-Gate | Requirements fixed, contract is time-and-materials | `DETAILED_TIMELINE_GUIDE.md` |
| Agile / Scrum | Requirements will evolve, 2-week sprints | `DETAILED_TIMELINE_GUIDE.md` |
| **Hybrid** *(default recommendation for enterprise/client work)* | Client needs fixed dates but internal dev wants sprint flexibility — fixed milestones (Waterfall shell) + sprints inside (Agile) | `02a-planning-core-phases.md`, `DETAILED_TIMELINE_GUIDE.md` |
| Kanban | Maintenance mode, support projects, unpredictable demand | `DETAILED_TIMELINE_GUIDE.md`, `MAINTAIN` state in `engine/STATE-MACHINE.md` |
| Rolling Wave | Research/innovation where future shape is genuinely unknown | `DETAILED_TIMELINE_GUIDE.md` |

The `Methodology Compatibility Matrix` in `DETAILED_TIMELINE_GUIDE.md` states which
practices (WBS, three-point estimate, critical path, velocity, cycle time) apply to
each choice, so an agent doesn't mix incompatible practices (e.g. velocity tracking
under Waterfall).

### 2b. Execution layer (Module 03 — Build) — tier-gated default

For **Small** tier and any low-stakes slice regardless of tier, the default execution
mode is **vibe coding**: build → show → react → adjust, no formal spec, Rule 0 intent
echo instead of a requirements document (`03a-build-foundations.md`).

This is not the whole story — the **Spec Escalation Protocol**
(`03b-build-loop.md`) forces a slice out of vibe coding into
**Spec-Driven Development** the moment it hits a graduation trigger: real customers,
real payments, regulated data, public launch, uptime SLA, or strict acceptance criteria.
Once escalated, the slice needs an interface contract, one acceptance criterion per
requirement (`Accept: do X, see Y`), and a data-model/migration plan before implementation
resumes — the same rigor a full spec-driven flow would require, scoped to just that slice.

The On-Going Project Kanban itself (§1 above) is **Agile/Kanban in flow, Waterfall in
gating** — cards move continuously through columns (Agile/Kanban), but `PLANNING → BUILD`
and `BUILD → CLOSURE` are hard gates requiring signed-off evidence (`engine/GATE-REGISTRY.md`),
which is the Waterfall half of the Hybrid model recommended in §2a.

### 2c. Where "SDLC" fits

"SDLC" is not run as a competing process model here — it's referenced once
(`REQUIREMENT_GATHERING_GUIDE.md`) to note that FSD is an SDLC-native *artifact*
(Requirements Analysis & Design Definition), not a PMBOK process group. The skill treats
SDLC phase names (Analysis, Design, Implementation, Testing, Maintenance) as artifact
sources feeding the tier-scaled pipeline above, not as the top-level model.

### 2d. One-line answer for "which methodology is this?"

> Hybrid by default for Medium+ (Phase-Gate milestones outside, Agile/Kanban sprints
> inside), Kanban-only for Maintenance mode, and vibe-coding-with-Spec-Driven-Development-
> escalation for the Build phase itself — the methodology is a per-project choice at
> Phase 2a, not a fixed assumption.

---

**Version:** 1.0.0
**Consolidates:** `PRE_PROJECT_GUIDE.md`, `REQUIREMENT_GATHERING_GUIDE.md`,
`PM_FUNDAMENTALS_GUIDE.md`, `DETAILED_TIMELINE_GUIDE.md`, `DEVELOPMENT_STAGE_GUIDE.md`,
`POST_PROJECT_CLOSURE_GUIDE.md`, `03a-build-foundations.md`, `03b-build-loop.md`
**Read alongside:** `engine/STATE-MACHINE.md` (formal phase transitions),
`engine/GATE-REGISTRY.md` (gate pass/block conditions)
