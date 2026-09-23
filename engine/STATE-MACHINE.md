# State Machine

Formal model mapping `lifecycle_phase` values in CONTEXT.md to allowed transitions.

Canonical policy: `engine/PROJECT-PROFILE.md`. `NEW` is diagram-only and is not a valid CONTEXT.md phase.

```text
IDEATION (lifecycle_phase: IDEATION)
 │ Brief produced
 ├─ Small ────────────────────────────→ BUILD
 └─ Medium+ ────→ PLANNING
                     │
                     ▼
PLANNING (lifecycle_phase: PLANNING)
 │ Phases 0–6
 │ Gate D
 ▼
BUILD (lifecycle_phase: BUILD)
 │
 ├─ Kanban: Queued → Building → Blocked → Bug → Done
 │
 ▼
RELEASED
 │ UAT + production smoke test confirmed
 ├─────────────────────────────────────────┐
 │ significant new feature                 │ bug fix / dependency /
 │ → return to BUILD                       │ monitoring only
 ▼                                         ▼
CLOSURE (lifecycle_phase: CLOSURE)      MAINTAIN (lifecycle_phase: MAINTAIN)
 │ Gate C                                  │ Bug Fix / Dep Update /
 ▼                                         │ Security Patch / Alert
CLOSED (lifecycle_phase: CLOSED)           │
                                           │ feature request?
                                           └─→ log backlog, ask user
                                               whether to open new BUILD
```

## Mode

### IDEATION
Spark to brief. Producing a grounded brief with pitch, core loop, and first slice.

### PLANNING
Phases 0–6. Producing planning and execution-control artifacts. Not writing production code.

### BUILD
Development Stage. Using output from PLANNING and following Kanban/verification rules in `references/devops/DEVELOPMENT_STAGE_GUIDE.md`.

### MAINTAIN
Post-release maintenance. Kanban columns: Bug Fix, Dependency Update, Security Patch, Monitoring Alert. No Feature column. Set `lifecycle_phase: MAINTAIN` in CONTEXT.md.
Feature requests that come in this state are recorded as backlog and clarified with the user before execution — do not silently start building a feature in maintenance mode.

### CLOSURE
Phase 7 only after release evidence exists. Do not auto-enter CLOSURE just because code has been merged.

## Legal Transitions

- `PLANNING → BUILD` requires Gate D for agentic builds.
- `BUILD → CLOSURE` requires release + UAT/smoke evidence.
- `BUILD → MAINTAIN` requires release + production stable (no active incident).
- `MAINTAIN → BUILD` when there is a significant feature to scope — open a new BUILD session.
- `MAINTAIN → CLOSURE` only when the project is deliberately sunset.
- `CLOSURE → CLOSED` requires Gate C conditions according to `handover_formality` (`none|email|full|legal`). The validator must not require BAST signatures for `none` or `email`.
- Blocked gates return the workflow to the owner phase, not silently advancing.

## Document Validation and Pre-Transition Checklist

This skill ships **no executable scripts** — no `.sh`, no `.ps1`. All verification is performed by the agent reading files directly rather than parsing a script's exit code.

Before treating any legal phase transition or gate as passed, verify the following checklist by hand:

1. **`CONTEXT.md` exists and contains**, all non-empty:
   - `lifecycle_phase:` one of `IDEATION | PLANNING | BUILD | MAINTAIN | CLOSURE | CLOSED`
   - `complexity_tier:` one of `Small | Medium | Large | Enterprise`
   - `next_action:` passes the three-question self-check in `modules/00-classifier.md` Step 7 (must be an actionable instruction, never "continue" or "proceed")
2. **Medium+ only:** `VERIFY.md`, `AGENTS.md`, and `TASKS.md` exist and are populated.
3. **Large+ with `multi_agent: true`:** `OWNERSHIP.md` exists and has a filled-in Ownership matrix (no placeholder rows).
4. **`lifecycle_phase: CLOSED` only** — closure evidence is present:
   - `closure_date` is set
   - `access_revoked: true` is confirmed
   - Per `handover_formality`: `email` requires `handover_confirmed_by`; `full` requires `bast_signed_by`; `legal` requires `bast_signed_by` **and** `legal_reviewed_by`
5. **If a `tier_dispute` block is present**, confirm it has not been silently dropped in later sessions — see `modules/00-classifier.md`'s "Downstream visibility" note.

A failed item on this checklist = **transition blocked** until resolved. This is not optional — the gate is not valid until every applicable item on this checklist passes.
