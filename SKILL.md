---
name: project-lifecycle
description: Single entry point for the entire project lifecycle — from spark/idea through build completion and closure. Automatically determines which phase is relevant; no need to know which skill to invoke. Use whenever the user has an unclear idea, wants project planning (PRD, FSD, architecture, timeline), wants to build directly, or wants to close a project (BAST, retrospective, handover). Also triggers for: "give me an idea", "I want to build X", "help me plan this project", "create a PRD and FSD", "start coding", "close this project". Do not use for small, clearly-defined features that can be implemented immediately.
---

# Project Lifecycle — Orchestrator

One skill that covers the entire lifecycle: from a vague idea through to a fully closed project. You don't need to know which phase you're in — this skill determines that.

**Read `modules/00-classifier.md` FIRST, before anything else.** The classifier determines the complexity tier and active phase. All other modules depend on the classifier's output.

---

## Pipeline

```
SPARK / IDEA
    ↓ [if the idea has no name yet or the user doesn't know what to build]
MODULE 01 — IDEATION
    ↓ [produces a brief: pitch, core loop, complexity read, first slice]
    ↓
    ├─ Small ──────────────────────────────→ MODULE 03 — BUILD
    │
    └─ Medium / Large / Enterprise ──────→ MODULE 02 — PLANNING
                                                ↓
                                            MODULE 03 — BUILD
                                                ↓
                                            MODULE 04 — CLOSURE
```

---

## How to read modules

**NEW USERS: Read `references/pm/QUICKSTART_BY_TIER.md` FIRST** — it tells you exactly which modules/references to read for your tier (Small/Medium/Large/Enterprise) and which to skip.

Read modules **only when relevant** — do not read them all at once.

| Situation | Read |
|---|---|
| Idea is vague / "don't know what to build" | `00-classifier.md` → `01-ideation.md` |
| Idea exists, needs planning (PRD, FSD, timeline) | `00-classifier.md` → `02-planning-router.md` (follow routing table) |
| Has brief from ideation, ready to build Small | `00-classifier.md` → `03-build-router.md` |
| Has lifecycle docs, ready to build Medium+ | `00-classifier.md` → `03-build-router.md` |
| Project is live, ready to close | `04-closure.md` |
| Continuing from a previous session | **Read Crash Resume Protocol below first**, then classifier |
| Needs formal documents for external parties (PRD/FSD/BAST that can be signed) | `00-classifier.md` → choose Standard or Full planning mode, use templates from `templates/` |
| "Which methodology does this follow?" / mapping to a standard PM life cycle | `references/pm/LIFECYCLE_MAPPING.md` |

---

## State that must be recorded in CONTEXT.md

On every phase transition, write this to the project's `CONTEXT.md`:

```
lifecycle_phase: [IDEATION | PLANNING | BUILD | MAINTAIN | CLOSURE | CLOSED]
complexity_tier: [Small | Medium | Large | Enterprise]
planning_mode: [Lightweight | Standard | Full]  # only if phase is PLANNING (Enterprise tier uses Full)
lifecycle_docs: [none | partial | complete]
multi_agent: [true | false]
handover_formality: [none | email | full | legal]  # set at classification, read again at CLOSED (see 04-closure.md)
last_milestone: [name of last completed milestone — must be concrete, not blank]
next_action: [concrete instruction for the next session — must be actionable]

# Optional — fill if using a multi-provider LLM router
# agent_routing:
#   coding: opencode/[model]
#   review: ohmyopenagent/[model]
#   planning: claude/[model]

# Optional — fill if the project extends existing infrastructure
# infra_context:
#   extends_pipeline: [name of pipeline being extended, or "new"]
#   estimated_ram_mb: [estimated additional RAM on STB]
#   estimated_cpu_percent: [estimated additional CPU load]
#   stb_capacity_check: [pending | ok | warning]
```

`next_action` is not optional and must not contain "continue" or "proceed" — it must be an instruction that can be executed directly by an agent in the next session without additional context.

---

## Scaffolding a project (markdown-only — no scripts required)

This skill ships **no executable scripts**. Scaffolding and ownership checks are both done by the agent directly, from markdown templates and checklists in `templates/` — this is deliberate, not a fallback: it works identically in every environment (no shell, no interpreter, no OS-specific quoting) and leaves no ambiguity about whether "the script ran."

**Scaffold a project (any tier):**

1. Open `references/pm/QUICKSTART_BY_TIER.md` and find the file list for the assigned tier.
2. For each file on that list, copy the matching file from `templates/` into the project (e.g. `templates/dev/PROJECT_README_TEMPLATE.md` → `README.md`, `templates/specs/PRD_TEMPLATE.md` → `docs/planning/PRD.md`), filling in the template's placeholders — do not leave placeholder text in a saved file.
3. Write `CONTEXT.md` by hand using the block in "State that must be recorded in CONTEXT.md" above — this is always written directly by the agent, tier list or not.
4. Confirm every file the tier requires now exists before moving on; do not silently skip a required file because "it's not needed yet" — either create it now or record in `CONTEXT.md` why it's deferred (`deferred_artifacts: [name: reason]`).

This produces the exact same file set a scaffold script would have produced. There is no `--dry-run` equivalent: since nothing is executed, listing the tier's required files in step 1 already **is** the preview — read the list before copying if you want to see what will be created.

**Check write ownership (`multi_agent: true` only):**

Do not rely on the agent "having read" `OWNERSHIP.md` from memory — that is exactly the failure mode this check exists to prevent (see Rule 6 below). Instead, before every `gate:pr`:

1. Open `OWNERSHIP.md` and find the row(s) for the path(s) this PR touches.
2. Confirm the PR's author role matches the `owner` column for every touched path. If any touched path has no matching row, treat it as **unowned = write denied** (the default in Rule 6) and stop — either add the path to `OWNERSHIP.md` with an explicit owner first, or route the change through the actual owner.
3. Record the result directly in the PR/commit description using `templates/dev/OWNERSHIP_TEMPLATE.md`'s "Verification" section: which paths were touched, which rows in `OWNERSHIP.md` covered them, and the outcome (`clear` / `escalated`).
4. A PR with touched paths but no completed step 3 record does not satisfy `gate:pr` — the recorded verification is the evidence, the same way a coverage report is the evidence for the testing gate (Rule 9).

This is slower per-PR than a script, but it is auditable by a human reading the PR description, and it works whether the agent is Claude, another model, or a human — nothing here depends on an interpreter being installed or a path being resolved correctly.

---

## Crash Resume Protocol

Run this before doing anything when resuming a session that may have crashed or been interrupted:

```
1. Read CONTEXT.md → check last_milestone and next_action
2. Run: git log --oneline -5
   → last commit = actual code state
3. Compare last commit with last_milestone in CONTEXT.md
   → if there's a gap (commit exists but milestone not updated): reconcile first
4. Read TASKS.md → which items are In Progress but have no matching commit
   → flag as "status unclear — needs verification"
5. Then continue from next_action as written in CONTEXT.md
```

Do not skip this step because "it looks like nothing crashed" — incorrect state is more dangerous than a slow session.

---

## Maintenance Mode

After the project is `RELEASED`, there are two paths:

```
RELEASED
  ├─ Significant new feature → return to BUILD (open a new build session)
  └─ Bug fixes / dependency updates / monitoring only → enter MAINTAIN
```

In state `MAINTAIN`, set in CONTEXT.md:
```
lifecycle_phase: MAINTAIN
maintain_cadence: [weekly | on-demand | continuous]
```

The kanban in MAINTAIN is different: columns are Bug Fix, Dependency Update, Security Patch, Monitoring Alert. No Feature column. If a feature request comes in during MAINTAIN, log it as backlog and ask the user: "This is a new feature — want to open a separate BUILD session, or defer?"

---

## Terminology

**Consistent usage throughout this skill:**

- **Phase:** Top-level lifecycle stage (IDEATION, PLANNING, BUILD, CLOSURE). Recorded in `CONTEXT.md` as `lifecycle_phase`.
- **Module:** A numbered `.md` file in `modules/` that implements one phase or routing logic (e.g., `00-classifier.md`, `03-build-router.md`).
- **Section:** A `##` or `###` heading within a module (e.g., "Design Bootstrap", "Security floor").
- **Artifact:** User-visible output file (CONTEXT.md, VERIFY.md, PRD, FSD, ADR, BAST). Templates live in `templates/`, examples in `examples/`.

When these terms appear in module instructions, they carry these specific meanings.

---

## Cross-phase rules

1. **Single source of truth per decision.** Complexity tier is defined in `00-classifier.md` only — not repeated in other modules. Other modules just say "see classifier."

2. **Modules do not know about each other.** `01-ideation.md` does not mention how to build. `03-build-router.md` does not redefine tiers. Each module has one responsibility.

3. **The ideation brief is a contract.** The Pitch/Core loop/Not building fields from the brief must not be reinterpreted when moving to planning or build — they are copied verbatim.

4. **Gates cannot be silently bypassed.** Every phase transition requires one explicit confirmation from the user. If the user skips, record `skipped_by_user: true` in CONTEXT.md.

5. **Scale ceremony to complexity.** Small does not need a PRD. Enterprise must not skip the charter. Specific rules are in each module.

6. **OWNERSHIP.md is mandatory if multi_agent: true.** No parallel work starts before path ownership is defined. Default: deny writes, not allow. Enforce it at `gate:pr` with the markdown ownership-verification procedure in "Scaffolding a project" above (checked against `OWNERSHIP.md` and recorded via `templates/dev/OWNERSHIP_TEMPLATE.md`'s Verification section) — not by trusting the agent to have read the matrix from memory. The verification record, not the agent's recollection, is the gate evidence.

7. **Tier policy is canonical in `engine/PROJECT-PROFILE.md`.** Artifact, scaffold, validator, and lifecycle documents must conform to it.

8. **A gate is executable only when gate-specific evidence is recorded.**

9. **Quality gates are non-negotiable for Medium+ projects.** Security gate (SAST, dependency audit), performance budget (Lighthouse CI), design validation (a11y, usability test), code review checklist, and test coverage (80%+ overall, 100% on payment/auth paths — see `references/qa/TESTING_STRATEGY_DETAIL.md`) must pass before production deploy. See `references/security/SECURITY_GATE_GUIDE.md`, `references/frontend/PERFORMANCE_BUDGET_GUIDE.md`, `references/qa/LOAD_TESTING_GUIDE.md`, `references/frontend/DESIGN_VALIDATION_GUIDE.md`, `references/qa/CODE_REVIEW_CHECKLIST.md`, `references/qa/TESTING_STRATEGY_DETAIL.md`. **Coverage must be an enforced CI threshold (a failing exit code below 80%/100%), not just an uploaded report** — configure it as shown in `references/qa/TESTING_STRATEGY_DETAIL.md`'s `vitest.config.ts` example (or the equivalent for the project's test runner). A green test suite with a coverage report attached but no enforced threshold does not satisfy this gate, even though a number is present — the number must have teeth. Attach the raw coverage summary as a build artifact in addition to the enforced threshold, so a human reviewer can verify the actual figure rather than trusting the checkmark alone.

10. **Risk and tech debt are tracked, not ignored.** Risk register (`references/pm/RISK_MANAGEMENT_GUIDE.md`) reviewed weekly. Tech debt register (`references/devops/TECH_DEBT_HOTFIX_GUIDE.md`) capped at 5 high-priority items, with concrete metrics (estimated fix time, blast radius). Hotfix workflow bypasses normal PR only for P0/P1 incidents.

10a. **Schedule health is checked and surfaced, not silently recorded.** Every 3 milestones (or whenever a milestone slips), run the schedule health check in `references/pm/SCHEDULE_HEALTH_GUIDE.md`. If status is 🟡 At Risk, surface to user before continuing. If status is 🔴 Off Track (3+ consecutive slips or average slip >3 days), stop build, require a Change Request from `templates/pm/CHANGE_REQUEST_TEMPLATE.md`, and do not continue until CR is approved and recorded in `docs/pm/changes/`.

10b. **Scope changes go through change control, not silent acceptance.** Any addition, removal, or modification of scope after Gate R baseline requires a Change Request (`templates/pm/CHANGE_REQUEST_TEMPLATE.md`) with impact assessment (scope delta, timeline shift, budget delta, new risks) approved by the authority named in Q65g (CONTEXT.md). An agent must not begin implementing a scope change before the CR is approved — draft the CR, present it to the user, wait for explicit approval. The CR is then logged in `docs/pm/CHANGE-LOG.md`.

11. **Resource conflicts resolved systematically.** When milestones collide, apply leveling decision matrix (`references/pm/RESOURCE_LEVELING_GUIDE.md`): critical path → external dependency → business value → reallocation options. Document in `docs/pm/DECISIONS.md`.

12. **Scale targets verified with load testing.** Map Q8 scale target to concrete load test requirement (`references/qa/LOAD_TESTING_GUIDE.md`): k6 scripts, Lighthouse CI budget, soak/spike tests for Large+. Integrate into gate:production-deploy.

13. **Information architecture precedes navigation build.** For 7+ pages, pause before wireframing, create IA document (`references/frontend/INFORMATION_ARCHITECTURE_GUIDE.md`), validate with users. Navigation pattern (sidebar/tabs/breadcrumbs) recorded in DESIGN.md.

14. **Chaos engineering for Large+ scale.** Systems with 100K+ users or uptime SLA ≥99% require chaos experiments (`references/qa/CHAOS_ENGINEERING_GUIDE.md`): component failure, network partition, resource exhaustion. 3+ experiments pass before production deploy.

15. **Supply chain security for Medium+.** Dependency pinning (lock files), SBOM generation, vulnerability scanning (grype/trivy), OWASP Top 10 checklist integrated into security gate (references/security/SECURITY_GATE_GUIDE.md).

16. **Tooling is concrete.** Every check X instruction references specific tool plus command in references/devops/TOOLING_REFERENCE.md. Never say check for N+1 queries without naming the tool.

17. **Observability before production.** Medium+ projects must have metrics endpoint, structured logging, 3+ alert rules, and runbooks before first production deploy. See references/devops/OBSERVABILITY_GUIDE.md.

18. **Infrastructure as code for cloud.** Medium+ cloud deployments use IaC (Terraform/Pulumi/CDK). Remote state backend required, security scan passes before apply. See references/devops/INFRASTRUCTURE_AS_CODE_GUIDE.md.

19. **Design system governance for UI.** Medium+ UI projects version design tokens, track changes in DESIGN_CHANGELOG.md, define component approval process. See references/frontend/DESIGN_SYSTEM_GOVERNANCE.md.

20. **Database strategy for persistence.** Medium+ projects with database must review migrations, configure automated backups, run restore drill quarterly, add indexes on foreign keys, document data retention policy. See references/backend/DATABASE_STRATEGY_GUIDE.md.

21. **Conflict resolution is systematic.** Medium+ projects define escalation ladder (Direct → Mediation → Authority → Steering → Legal), RACI matrix with veto power, prioritization framework (RICE/WSJF), decisions documented in ADR. See `references/pm/CONFLICT_RESOLUTION_GUIDE.md`. RACI matrix generated from `templates/pm/RACI_MATRIX_TEMPLATE.md` → `docs/pm/RACI.md` at Phase 0 Q0d. Mandatory at gate:kickoff. Solo projects: replace RACI with one paragraph in `docs/pm/STAKEHOLDERS.md`.

22. **Vendor management for externals.** Projects with external vendors require contract essentials (SOW, IP ownership, SLA), vendor scorecard (monthly review), onboarding/offboarding checklist, vendor lock-in risk assessment. See references/pm/VENDOR_MANAGEMENT_GUIDE.md.

23. **Product roadmap is visible.** Medium+ projects publish roadmap (Now-Next-Later or Quarterly Gantt), use prioritization framework (RICE/WSJF/MoSCoW), track dependencies, communicate to stakeholders weekly. See references/pm/PRODUCT_ROADMAP_GUIDE.md. Mandatory at gate:planning-complete.

24. **Test environments are managed.** Medium+ projects provision local/dev/staging/prod environments, document setup (onboarding guide), enforce environment parity (12-factor), define teardown policy, optimize costs (auto-shutdown non-prod). See references/qa/TEST_ENVIRONMENT_GUIDE.md.

25. **Budget & cost tracking for Large+.** Large and Enterprise projects must track planned vs. actual expenditures using `templates/pm/BUDGET_TRACKING_TEMPLATE.md` (`docs/pm/BUDGET.md`). Any variance > 15% requires formal change control before further financial commitments.

26. **API lifecycle, documentation & versioning.** Medium+ projects exposing APIs must document endpoints with OpenAPI 3.1 (`references/docs/API_DOCUMENTATION_GUIDE.md`), define versioning policy (`references/backend/API_VERSIONING_STRATEGY.md`), and return RFC 8594 Sunset headers on deprecated endpoints.

27. **Consumer contract testing.** Large+ projects with decoupled consumers (mobile apps, external partners, microservices) must establish contract tests (`references/qa/CONTRACT_TESTING_GUIDE.md`) before production deploy.

28. **Frontend state & security hygiene.** Medium+ web apps must separate server cache from client state (`references/frontend/STATE_MANAGEMENT_GUIDE.md`) and enforce Content Security Policy headers (`references/security/CSP_CONFIGURATION_GUIDE.md`) in production.
