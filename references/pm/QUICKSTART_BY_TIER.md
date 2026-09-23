# Quickstart Guide by Tier

**Read this FIRST** if you don't know which modules/references to load.

---

## Small (Solo, 1-3 features, <1 month)

### You MUST read:
- `modules/00-classifier.md` (2 min — determines tier)
- `modules/03-build-router.md` → `03a-build-foundations.md` + `03b-build-loop.md` (15 min — core vibe-coding engine)

### You CAN skip:
- All of Phase 0–2 (planning) — Small always skips
- Phase 4 (Design) — optional if no UI
- Phase 5 (PM Fundamentals, DevOps, Security probes) — overkill for solo

### Files you'll create:
- `CONTEXT.md` (scaffold auto-generates)
- `VERIFY.md` (typecheck + 1 smoke test minimum)
- `.gitignore` + remote repo (mandatory, even for Small)

### Quality floor (non-negotiable):
- Git init before first file
- Typecheck passes before commit
- 1 smoke test of core flow

**Time to first code:** 10 minutes after reading classifier.

---

## Medium (2-5 people, 3-6 features, auth/deploy, 1-3 months)

### You MUST read:
- `modules/00-classifier.md` (2 min)
- `modules/02-planning-router.md` → **Lightweight mode only**:
  - `02a-planning-core-phases.md` Phase 0 (10 questions, 20 min — business case + sponsor)
  - `02a-planning-core-phases.md` Phase 1a (4 questions, 15 min — requirement gathering SHORT version)
  - `02a-planning-core-phases.md` Phase 2a (5 questions, 15 min — timeline baseline)
  - `02b-planning-stack-setup.md` Phase 6 only (tech stack + scaffold, 10 min)
- `modules/03-build-router.md` → all sections (45 min — build loop + quality gates)
- `references/security/SECURITY_GATE_GUIDE.md` (10 min — MUST read before first PR)
- `references/frontend/DESIGN_VALIDATION_GUIDE.md` (10 min — MUST read before first demo)

### You CAN skip:
- Phase 1 full discovery (use Phase 1a short version instead)
- Phase 3-4-5 deep probes (use lightweight alternatives)
- Enterprise references (EVM tracking, chaos engineering, vendor management)

### Files you'll create:
- `CONTEXT.md` + `VERIFY.md` (scaffold)
- `docs/planning/PRD.md` (short, from Phase 1a)
- `docs/pm/TIMELINE.md` (milestone list with dates)
- `ARCHITECTURE.md` (module boundaries only)
- `TASKS.md` (Kanban: Backlog → Todo → In Progress → Done)

### Quality gates (mandatory):
- **Gate 0:** Business case confirmed (1 paragraph OK for internal)
- **gate:pr:** Security checklist + code review
- **gate:sprint-demo:** Design validation (Lighthouse ≥85, keyboard nav works)
- **gate:production-deploy:** UAT passed + rollback plan documented

**Time to first code:** 1 hour after planning complete.

---

## Large (5-20 people, multi-role, payments/regulated data, 3-12 months)

### You MUST read:
- `modules/00-classifier.md` (2 min)
- `modules/02-planning-router.md` → **Standard mode**:
  - All of `02a-planning-core-phases.md` (Phase 0, 1a, 1, 2, 2a — 2 hours total)
  - `02b-planning-stack-setup.md` Phase 3, 5, 6 (1 hour)
- `modules/03-build-router.md` → all sections (1 hour)
- `modules/04-closure.md` (30 min — read BEFORE starting Phase 7)
- **Mandatory references (read before relevant phase):**
  - `references/security/SECURITY_GATE_GUIDE.md` + `references/security/SECURITY_HARDENING_GUIDE.md`
  - `references/frontend/DESIGN_VALIDATION_GUIDE.md`
  - `references/qa/TESTING_STRATEGY_DETAIL.md`
  - `references/devops/OBSERVABILITY_GUIDE.md`
  - `references/devops/DEVOPS_DEPLOYMENT_GUIDE.md`
  - `references/qa/LOAD_TESTING_GUIDE.md`

### You CAN skip:
- Enterprise-specific (Phase 4 Full, EVM, chaos engineering) — unless compliance requires

### Files you'll create:
- Full planning suite: PRD, FSD, ARCHITECTURE, TIMELINE, MILESTONES, RISKS, STAKEHOLDERS
- Build artifacts: TASKS.md, VERIFY.md, TECHNICAL_DEBT.md, OWNERSHIP.md (if multi-agent)
- Deployment: CI-CD.md, ENVIRONMENTS.md, RUNBOOK.md
- Closure: BAST, HANDOVER, RETROSPECTIVE

### Quality gates (mandatory):
- All Medium gates +
- **Gate SIT:** System integration test before UAT
- **gate:security-audit:** SAST + dependency audit + penetration test
- **gate:load-test:** p95 < 500ms, error rate < 1%

**Time to first code:** 1 day (8h planning) after kickoff.

---

## Enterprise (21+ people, compliance/SLA, 12+ months)

### You MUST read:
- Everything in Large +
- `modules/02-planning-router.md` → **Full mode** (all phases, all probes)
- `02c-planning-reference.md` (advanced PM techniques)
- **Additional mandatory references:**
  - `references/qa/CHAOS_ENGINEERING_GUIDE.md`
  - `references/pm/RESOURCE_LEVELING_GUIDE.md`
  - `references/pm/CONFLICT_RESOLUTION_GUIDE.md`
  - `references/pm/VENDOR_MANAGEMENT_GUIDE.md`
  - `references/devops/INFRASTRUCTURE_AS_CODE_GUIDE.md`

### You CAN'T skip:
- Nothing. Full is full.

### Quality gates (mandatory):
- All Large gates +
- **Gate C:** Project Closed (legal BAST sign-off, access revoked, post-mortem)
- **EVM tracking:** CPI/SPI reported monthly
- **Chaos experiments:** 3+ pass before production

**Time to first code:** 2 weeks (80h planning + charter approval) after contract signed.

---

## Troubleshooting

**"I'm between two tiers, which one?"**
→ Always round UP. Classifier anti-downgrade rule: localStorage doesn't make it Small if it has auth + deploy.

**"Planning feels like overkill for my project."**
→ Check if you're reading Full mode docs when you should read Lightweight. Medium tier = Lightweight by default.

**"I just want to code, skip everything."**
→ Minimum: classifier (2 min) + git init + VERIFY.md (typecheck + 1 test). But you'll regret skipping Phase 0 when your sponsor asks "why are we building this again?"

**"Skill says 'read X' but I already know X."**
→ Skim the anti-patterns section only (usually at the bottom). Skip if genuinely no new info.

---

**Last updated:** 2026-09-22
**Version:** 1.0.0
