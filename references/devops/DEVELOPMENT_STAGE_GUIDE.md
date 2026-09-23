# Development Stage Guide — Kanban Board Operational Guide

**Purpose:** Transform Kanban columns (Backlog → Todo → In Progress → Testing → Code Review →
Ready to Deliver → SIT → UAT → Release) from process narrative into a daily operational guide:
which documents to open, which checklists must pass, and when to move to the next column.

> **Column mapping:** This guide uses the full formal Kanban (9 columns, Medium+ with team).
> The build loop in `03b-build-loop.md` uses a simplified 5-column model for single-agent work:
> Queued (= Backlog + Todo), Building (= In Progress), Blocked, Bug, Done (= post-UAT).
> Both are valid — use the model that matches the project's formality level.

Read this when: a new sprint starts, an item is stuck in a particular column, or you are a solo
developer who needs to know when to switch role "hats".

Pairs with `TESTING_STRATEGY_DETAIL.md` (detailed test cases per layer),
`DEVOPS_DEPLOYMENT_GUIDE.md` (CI/CD and release pipeline), and
`references/frontend/anti-slop-core.md` (quality gate before commit).

> **If the code is written by AI agents (opencode / Claude Code / multi-agent orchestrator),
> read `AGENT_ORCHESTRATION_GUIDE.md` alongside this file.** The column process and DoR/DoD below
> still fully apply, but every part that relies on human memory, honesty, or interpretation
> must be replaced with explicit artifacts: contracts in `contracts/`, write boundaries in `OWNERSHIP.md`,
> and gates executed in `VERIFY.md`. Machine-executable `□` checklists in this guide should be
> moved to `VERIFY.md` — checklists that are only read will always be reported as passing.

---

## Contents

- [Why Kanban columns can become decoration](#why-kanban-columns-can-become-decoration)
- [Role × column × document map](#role--column--document-map)
- [Solo multi-role: hat-switching guide](#solo-multi-role-hat-switching-guide)
- [Column 1: Backlog](#column-1-backlog)
- [Column 2: Todo](#column-2-todo)
- [Column 3: In Progress](#column-3-in-progress)
- [Column 4: Testing](#column-4-testing)
- [Column 5: Code Review](#column-5-code-review)
- [Column 6: Ready to Deliver](#column-6-ready-to-deliver)
- [Column 7: SIT](#column-7-sit)
- [Column 8: UAT](#column-8-uat)
- [Column 9: Release](#column-9-release)
- [System Integrator role — often overlooked](#system-integrator-role--often-overlooked)
- [End-of-sprint checklist](#end-of-sprint-checklist)

---

## Why Kanban columns can become decoration

A Kanban board without Definition of Ready (DoR) and Definition of Done (DoD) only moves
cards from left to right without proving anything. An "In Progress" item without clear AC
(Acceptance Criteria), or a "Testing" item without test cases written before the code, will
always pass to the next column based on feeling — not fact.

Three most common failure patterns:

1. **Grooming is skipped because "it's already clear."** Abstract items enter the sprint, the developer
   interprets differently from what was intended, and a requirement bug surfaces mid-sprint.
2. **Testing is done by the person who wrote the code, on the same day.** Confirmation bias
   kicks in, logic bugs go undetected until UAT or even production.
3. **Code Review is done before QA passes.** The reviewer wastes time reviewing code whose
   output is not yet correct — and often the code changes again after review due to bug fixes.

This guide gives each column one explicit entry condition (DoR) and one exit condition (DoD),
along with a list of documents to open and update at each column.

---

## Role × column × document map

This table answers: at this column, who is active, and which documents are relevant?

| Column | Active Role | Subagent (agentic mode) | Documents Opened | Documents Updated |
|---|---|---|---|---|
| Backlog | PM / Product Owner | orchestrator + ba-spec | `docs/planning/PRD.md`, `TRACEABILITY-MATRIX.md` | `docs/dev-docs/TASKS.md` |
| Todo | PM + FE/BE + QA | ba-spec, ui-ux, api-designer, data | `docs/planning/FSD.md`, `docs/dev-docs/MODULE-MAP.md` | `TASKS.md`, item AC in FSD |
| In Progress | FE Engineer, BE Engineer | frontend, backend | `docs/architecture/API-REFERENCE.md`, `CODING-RULES.md`, `MENTAL-MODEL.md`, `FOLDER-STRUCTURE.md` | `CURRENT-STATE.md`, `KNOWN-ISSUES.md` |
| Testing | QA Engineer | qa | `docs/testing/STRATEGY.md`, AC in FSD, `COVERAGE.md` | test report (external or in `COVERAGE.md`) |
| Code Review | Tech Lead / Senior Dev | reviewer + appsec | `docs/architecture/TECH-STACK.md`, `CODING-RULES.md`, `anti-slop-core.md` | `TECHNICAL-DEBT.md`, `DECISIONS.md` |
| Ready to Deliver | PM | orchestrator | `docs/planning/TRACEABILITY-MATRIX.md`, `DELIVERY_GATE_TEMPLATE.md` | `MILESTONES.md`, `CHANGE-LOG.md` |
| SIT | System Integrator + QA | system-integrator + qa | `docs/misc/INTEGRATIONS.md`, SIT test plan, environment matrix | SIT result log, `KNOWN-ISSUES.md` |
| UAT | Key User + PM + QA | human — not delegated to agents | AC in FSD, UAT script, `docs/planning/SCOPE-STATEMENT.md` | UAT sign-off letter, `REQUIREMENTS-SIGNOFF.md` |
| Release | PM + DevOps / BE | release + sre | `docs/deployment/CHECKLIST.md`, `CI-CD.md`, `ENVIRONMENTS.md` | `docs/pm/CHANGE-LOG.md`, release notes |

---

## Solo multi-role: hat-switching guide

If you are the only person on this project, all roles in the table above still need to be performed —
the person is the same, the hat changes. This is not formality: without switching perspectives, you will
test code with the same brain that wrote it, and review code with the same bias.

### Eight hats you wear

| Hat | When to wear | Primary mindset |
|---|---|---|
| **PM / Product Owner** | Backlog grooming, prioritization, DoD sign-off | "Is this what was requested and is the value worth it?" |
| **Business Analyst** | Writing AC, classifying requirements | "Is this requirement verifiable and unambiguous?" |
| **UI/UX Designer** | Before coding new components | "Is this flow and appearance consistent with the design system?" |
| **Frontend Engineer** | In Progress — components, routing, state | "Is this clean, accessible, performant?" |
| **Backend Engineer** | In Progress — API, DB, business logic | "Is this secure, idempotent, documented?" |
| **System Integrator** | In Progress (third-party integrations), SIT | "Is the external API contract verified across all environments?" |
| **QA Engineer** | Testing — after coding is done, on a different day | "Is the AC met? What edge cases did the developer not think of?" |
| **Tech Lead / Reviewer** | Code Review — after QA passes | "Is this code maintainable, secure, and not creating new debt?" |

### Hat-switching rules for solo developers

**1. Do not test code on the same day you wrote it.**
Finish coding → commit, push, close the editor. Open it tomorrow as QA. At minimum, one night's
sleep provides enough cognitive distance to find bugs that were invisible yesterday.

**2. Use AI as a second reviewer in Code Review.**
Not to regenerate code — but paste code into Claude/Copilot with this prompt:
> "Review this code as a senior engineer. Look for: security issues, unhandled edge cases,
> misleading naming, and logic that could break under condition X. Do not suggest cosmetic refactors."

Then check the results against `references/frontend/anti-slop-core.md` before merging.

**3. For UI/UX — open `docs/design/SYSTEM.md` and `UI-REFERENCE.md` before coding new
components.** Do not rely on memory for colors, spacing, or typography. The design system exists to
eliminate unnecessary decisions during coding.

**4. For System Integrator — write the integration contract first.**
Before touching any third-party integration code, open `docs/misc/INTEGRATIONS.md` and ensure:
- Endpoints, auth method, and error codes are documented
- A mock/stub exists for local development (not hitting the real API on every test)
- Environment matrix exists: which uses sandbox, which uses production

---

## Column 1: Backlog

**Who:** PM / Product Owner

**Definition of Ready (item may enter Backlog):**
- Item is traceable to a requirement in `FSD.md` or `PRD.md`
- MoSCoW priority is set (Must / Should / Could / Won't)
- Story points or rough estimate exists

**Definition of Done (item may move to Todo):**
- Item enters sprint commitment (selected during sprint planning)
- AC (Acceptance Criteria) is at draft level — can be refined during grooming

**Documents opened:**
- `docs/planning/PRD.md` — features not yet in a sprint
- `docs/planning/TRACEABILITY-MATRIX.md` — ensure item is tracked to a requirement
- `docs/dev-docs/TASKS.md` — active task list

**Common mistake:**
Items enter the sprint with a description like "Build dashboard page" with no further detail. The result:
the developer interprets on their own, QA does not know what to test, and PM cannot validate.
Minimum: one item = one user story with draft AC.

---

## Column 2: Todo

**Who:** PM + full team (short grooming session)

**Definition of Ready (item may enter Todo / be selected for sprint):**
- Description specific enough to be worked on without asking PM again
- AC is clear and verifiable (Given/When/Then is better than narrative)
- Dependencies between items are mapped
- UI/UX design is final for items requiring new views

**Definition of Done (item may move to In Progress):**
- Grooming completed: item is no longer abstract
- QA has reviewed AC and agrees it can be tested
- Developer understands scope and has no blocking questions

**Documents opened:**
- `docs/planning/FSD.md` — detailed functional requirements per feature
- `docs/dev-docs/MODULE-MAP.md` — which modules are affected
- `docs/design/UI-REFERENCE.md` — UI components to be used

**For solo developers:**
Grooming can be 15 minutes alone. Questions to answer before starting coding:
1. Can the AC be tested? (If not, rewrite it first)
2. Which module or files will be touched?
3. Are there dependencies on third parties or other modules that are not yet done?

---

## Column 3: In Progress

**Who:** Frontend Engineer, Backend Engineer

**Definition of Ready (may start In Progress):**
- Item meets the DoD from Todo (grooming complete, AC clear)
- Design assets (if any) are available
- Local environment is running — no technical blockers at the start

**Definition of Done (may move to Testing):**
- All main functionality is complete and running in local / dev environment
- Unit tests for critical business logic are written alongside (not after)
- No debug `console.log`, commented-out code, or critical TODOs left behind
- Pushed to feature branch and PR is created (draft is OK)
- `CURRENT-STATE.md` updated if there are architecture changes or important decisions

**Documents opened:**
- `docs/architecture/API-REFERENCE.md` — endpoint contracts used or created
- `docs/dev-docs/CODING-RULES.md` — mandatory coding conventions
- `docs/dev-docs/MENTAL-MODEL.md` — how the system thinks (data flow, state management)
- `docs/architecture/FOLDER-STRUCTURE.md` — where new files should be placed
- `docs/design/SYSTEM.md` — design tokens (colors, spacing, typography) — not from memory

**For Frontend Engineers:**
- Check `docs/design/UI-REFERENCE.md` before creating a new component — it may already exist
- All colors and spacing from design tokens, not hardcoded
- New components must be accessible (minimum: keyboard-navigable, aria-label on interactive elements)

**For Backend Engineers:**
- All input validated before entering business logic
- Error responses follow the format defined in `API-REFERENCE.md`
- No raw SQL string concatenation — use ORM or parameterized queries
- Migration file created for every DB schema change

**Common mistake:**
"In Progress" lasts too long due to micro scope creep — the developer adds small features not
in the AC because "might as well." If additional ideas arise during coding, log them in `TASKS.md`
as new items, do not work on them now.

---

## Column 4: Testing

**Who:** QA Engineer

**Definition of Ready (may enter Testing):**
- Developer has pushed to branch and PR is created
- Item runs in dev / staging environment without crashing
- AC for the item is final (not still being revised)

**Definition of Done (may move to Code Review):**
- All test cases have been executed
- All P1 (blocker) and P2 (major) bugs are fixed and retested
- Test report is written — at minimum status per AC: Pass / Fail / Blocked
- P3 (minor) and P4 (cosmetic) may be carried over with clear notes

**Documents opened:**
- AC in `docs/planning/FSD.md` — this is what gets tested, not assumptions
- `docs/testing/STRATEGY.md` — required test types per feature type
- `docs/testing/COVERAGE.md` — update coverage after testing

**Minimum test report format:**

```
Item: [Item name / ID]
Sprint: [Sprint N]
Tester: [Name / "Self" if solo]
Date: [YYYY-MM-DD]

| AC ID | AC Description | Status | Bug ID (if Fail) |
|-------|---------------|--------|-------------------|
| AC-01 | ... | Pass | — |
| AC-02 | ... | Fail | BUG-001 |

Bug P1: 0 | Bug P2: 1 | Bug P3: 2 | Bug P4: 0
Decision: HOLD (has P2) / PASS to Code Review
```

**For solo developers:**
Testing must be done after a break from coding — at minimum a day after coding is finished.
Open AC from `FSD.md`, not from memory. Test as a user, not as a developer who knows where
the buttons are.

**Common mistake:**
Testing is skipped because "I'm sure it's correct" or done only for the happy path. AC exists for
this reason: test all conditions written in the AC, including error states and edge cases.

---

## Column 5: Code Review

**Who:** Tech Lead / Senior Developer (or AI + checklist for solo)

**Definition of Ready (may enter Code Review):**
- QA has passed (no open P1/P2 bugs)
- PR is complete: description, screenshot/recording if there are UI changes
- Self-review by the developer has been done before requesting someone else's review

**Definition of Done (may move to Ready to Deliver):**
- All PR comments have been resolved or answered
- No issues from the checklist remain unaddressed
- Approval from the reviewer has been given
- Branch has been rebased / is up-to-date with main or staging

**Documents opened:**
- `docs/dev-docs/CODING-RULES.md` — standards being reviewed against
- `references/frontend/anti-slop-core.md` — 50-item quality gate, must be read before approving
- `docs/architecture/TECH-STACK.md` — ensure new dependencies do not violate stack decisions
- `docs/security/CHECKLIST.md` — for features touching auth, user data, or payments

**Minimum code review checklist:**

```
□ No hardcoded secrets / API keys
□ Input validation present at all entry points
□ Error handling does not silently swallow exceptions
□ No N+1 queries
□ Variable and function naming is descriptive and consistent
□ No dead code or commented-out blocks
□ DB changes have a reversible migration
□ Logs do not expose sensitive data
□ New dependencies reviewed (license, last update, number of maintainers)
```

**For solo developers:**
Paste code into Claude with the reviewer prompt (see Solo multi-role section above). Do it
in a separate tab/session, not in the middle of a coding session. Log findings in the PR
description before merging — this is audit trail that will be useful later.

**Note on ordering:**
Code Review is done AFTER QA passes. This is opposite to the habit of many teams that review
code first then QA. The reason: reviewers focus on code quality and maintainability of code whose
output has been proven correct — not code that might still change due to bug fixes.

---

## Column 6: Ready to Deliver

**Who:** PM

**Definition of Ready (may enter Ready to Deliver):**
- Code Review has approved and PR has been merged to staging / release branch
- Final test report exists
- No open P1/P2 bugs

**Definition of Done (development phase for this sprint is complete — may proceed to SIT):**
- All committed sprint items are in this column or moved to next sprint with documented reasons
- Feature freeze announced: no new commits to release branch except hotfixes
- `TRACEABILITY-MATRIX.md` updated: every covered requirement is marked
- `MILESTONES.md` updated: milestone M3 (Feature Freeze / Ready to Deliver) recorded

**Documents opened:**
- `docs/planning/TRACEABILITY-MATRIX.md` — requirement coverage checklist
- `templates/dev/DELIVERY_GATE_TEMPLATE.md` — gate criteria before SIT
- `docs/pm/MILESTONES.md` — record actual vs planned dates

**Common mistake:**
Items enter Ready to Deliver because the sprint ran out, not because they are truly done. This
hides debt into SIT/UAT, where it will explode with greater cost.
Better to move to next sprint with a clear reason than to fake-done.

---

## Column 7: SIT

**Who:** System Integrator + QA Engineer

**What is SIT:**
System Integration Testing — testing that the application functions correctly when
interacting with external systems (payment gateways, third-party APIs, ERP, legacy systems,
etc.). Not testing features in isolation, but testing the connection points.

**Definition of Ready (may start SIT):**
- All sprint items are in Ready to Deliver (feature freeze)
- Staging environment uses configuration that approximates production
- Integration contract for every third party is documented in `INTEGRATIONS.md`
- Test data (not production data) is prepared for each integration
- Access to third-party sandbox / test environments is confirmed active

**Definition of Done (may proceed to UAT):**
- All SIT test cases have been executed
- All P1 integration issues are fixed and retested
- SIT result log is written and reviewed by PM
- No open blockers for critical flows (checkout, auth, data sync, etc.)

**Documents opened:**
- `docs/misc/INTEGRATIONS.md` — external API contracts, auth methods, error codes
- `docs/deployment/ENVIRONMENTS.md` — environment matrix: dev/staging/prod have different configs
- `docs/security/REQUIREMENTS.md` — ensure sensitive data is not exposed in logs or responses

**Minimum SIT test scope:**

```
For each integration in INTEGRATIONS.md:
□ Happy path: data sent, response received, system reacts correctly
□ Error handling: third party returns error — does the system handle gracefully?
□ Timeout: third party is slow — is there a timeout and fallback?
□ Auth: token expired / invalid — does the system refresh or fail correctly?
□ Data mapping: fields from third party are correctly mapped to internal model
□ Idempotency: if request is sent twice (retry), no duplication occurs
```

**For solo developers:**
You become the System Integrator here. Do not directly hit the production API — use the
sandbox. If the third party does not have a sandbox, create a local mock server that simulates
its responses (msw, WireMock, json-server). SIT without mocks = roulette.

---

## Column 8: UAT

**Who:** Key User + PM (QA assists)

**What is UAT:**
User Acceptance Testing — testing by the actual end user (or their representative)
to ensure the application matches real workflows and the requirements agreed upon from
the start. Not a technical bug hunt, but business confirmation.

**Difference between SIT and UAT:**

| Aspect | SIT | UAT |
|---|---|---|
| Focus | System integration with third parties | Functionality from the end-user perspective |
| Performed by | IT team / System Integrator + QA | Key User, assisted by IT team |
| Data | Test data | Real data (or near-real) |
| Environment | Staging | Staging (must match production behavior) |
| Output | SIT result log | UAT sign-off letter (written, dated, signed) |

**Definition of Ready (may start UAT):**
- SIT is complete with no open P1 issues
- UAT environment uses configuration identical to production
- UAT script is prepared — not "try things on your own", but sequential scenarios
- Key User is confirmed available and aware of the UAT schedule
- PM has briefed Key User: this is not a demo, this is formal acceptance testing

**Definition of Done (may proceed to Release):**
- All UAT scenarios have been executed
- Key User has provided written sign-off: dated, clear name, title
- All P1/P2 issues from UAT are fixed, retested, and confirmed by Key User
- P3/P4 are documented with a decision: fix before release or post-release
- `REQUIREMENTS-SIGNOFF.md` updated with UAT notes
- UAT sign-off letter saved in project folder (not only in chat / email)

**Documents opened:**
- AC in `docs/planning/FSD.md` — UAT scenarios must cover all must-have ACs
- `docs/planning/SCOPE-STATEMENT.md` — reminder of what is in-scope and out-of-scope
- `docs/pm/MILESTONES.md` — record actual UAT sign-off date

**Minimum UAT sign-off format:**

```
UAT SIGN-OFF — [Project Name]
Date: [YYYY-MM-DD]
Environment: [Staging URL]
Version: [Version / Build number]

I, [Key User Name], [Title], declare that:
- All UAT scenarios have been executed per the agreed UAT script
- The application functions according to the agreed requirements and workflows
- The following open issues have been agreed to be resolved [before release / post-release]:
  [list of issues if any]

Approval to proceed to Release: YES / NO

Signature: _______________
```

**Common mistake:**
Verbal UAT sign-off or "the client said OK on Zoom" without a written document. If after
release there is a complaint that "this is not what I asked for", a written sign-off is the only
evidence the PM can use. Verbal = nothing.

---

## Column 9: Release

**Who:** PM + DevOps / Backend Engineer

**Definition of Ready (may start Release):**
- UAT sign-off received in writing
- Release checklist is prepared and reviewed by the team
- Rollback plan exists and has been tested (not just written)
- Maintenance window has been communicated to stakeholders

**Definition of Done (release is complete):**
- Deployment to production completed without errors
- Post-deployment smoke test passes (minimum test to validate production is alive)
- Release notes sent to client / stakeholders
- Deliverables sent per contract: release notes, user manual, source code (if required), maintenance info
- Readme and deployment docs updated

**Documents opened:**
- `docs/deployment/CHECKLIST.md` — deployment step sequence that must not be skipped
- `docs/deployment/CI-CD.md` — pipeline to run
- `docs/deployment/ENVIRONMENTS.md` — production configuration
- `docs/operations/INCIDENT-RESPONSE.md` — ready in another tab in case of post-deploy issues

**After Release is complete and stable:** proceed to closure — `references/pm/POST_PROJECT_CLOSURE_GUIDE.md`
§Gate C. Do not start closure before the production smoke test truly passes; a BAST or
sign-off signed earlier than that is a promise, not evidence.

**Minimum release checklist (coordinate with `docs/deployment/CHECKLIST.md`):**

```
Pre-deployment:
□ Production database backup completed and verified
□ All production environment variables set and verified
□ Migration script dry-run completed on staging with production-like data
□ Rollback script / plan available and previously tested

Deployment:
□ Deployment executed per SOP (not ad-hoc)
□ Migration executed in the correct order
□ No manual steps skipped

Post-deployment:
□ Smoke test: login, core transactions, critical integrations — all alive
□ Error monitoring shows no spikes (Sentry / Datadog / etc.)
□ Response time is normal (check monitoring dashboard)
□ Rollback decision point: if P1 issue within the first 30 minutes, roll back now

Delivery:
□ Release notes sent to client
□ User manual sent (if updated)
□ Maintenance phase information communicated
□ Source code delivered if contract requires it
```

---

## System Integrator role — often overlooked

System Integrator is the role most often assumed to be "already included in the backend developer"
even though its concerns are different. The backend developer focuses on the system being built; the
System Integrator focuses on the contract between the system being built and the outside world.

**When this role is active:**
- When selecting and documenting third-party integrations (not just "use Midtrans")
- When creating mocks / stubs for local development
- When preparing the environment matrix (sandbox vs production per environment)
- When running SIT
- When there is a post-release incident involving a third party

**Artifacts produced by the System Integrator:**

```
docs/misc/INTEGRATIONS.md must contain for each integration:
- Vendor name and integration type (payment / auth / storage / notification / etc.)
- Auth method (API Key / OAuth2 / mTLS / Webhook secret)
- Base URL per environment (sandbox, staging, production)
- Endpoints used with method, request schema, and response schema
- Possible error codes and how the application handles them
- Rate limit (if any)
- Configured timeout
- Fallback behavior if vendor is unavailable
- Vendor support contact + their SLA
- Last date the contract / API version was verified
```

**For solo developers who are also the System Integrator:**
Create `INTEGRATIONS.md` before writing a single line of integration code. This is not documentation
after the fact — this is a contract you make with your future self before starting, so you are
not surprised when SIT discovers vendor behavior you did not anticipate.

---

## End-of-sprint checklist

Run this at the end of every sprint before the sprint review / demo:

```
Sprint Closure Checklist
Sprint: [N] | Date: [YYYY-MM-DD]

Items:
□ All committed items are in Ready to Deliver or moved to next sprint (with reason)
□ No items "in progress" without updates for more than 2 days
□ P1/P2 bugs found in this sprint: all closed or explicitly carried over

Documentation:
□ CURRENT-STATE.md updated with changes that occurred in this sprint
□ KNOWN-ISSUES.md lists all P3/P4 not yet fixed
□ TECHNICAL-DEBT.md lists shortcuts taken and their reasons
□ DECISIONS.md lists architectural decisions made in this sprint

For the last sprint before SIT:
□ Feature freeze announced
□ TRACEABILITY-MATRIX.md updated — all must-have requirements covered
□ MILESTONES.md: M3 (Feature Freeze) recorded with actual date
```

---

**Last updated:** 2026-09-19
**Author:** OmahKene
**Version:** 1.1 (agent-aware pass: subagent column added to role map, pointer to
AGENT_ORCHESTRATION_GUIDE.md, MODULE-MAP path corrected to `docs/dev-docs/`)
**Part of:** pairs with `AGENT_ORCHESTRATION_GUIDE.md`, `TESTING_STRATEGY_DETAIL.md`,
`DEVOPS_DEPLOYMENT_GUIDE.md`, `anti-slop-core.md`, `DETAILED_TIMELINE_GUIDE.md`
