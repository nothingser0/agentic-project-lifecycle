# Module 02 — Planning Router

**When this module is read:** after `00-classifier.md` determines tier Medium or above and `lifecycle_phase = PLANNING`. If the tier is Small, skip this module — go directly to `03-build-router.md`.

This module routes the planning engine: Phase 0 through Phase 6 (Build Setup). Phase 7 is in `04-closure.md`.

**Read `references/pm/PRE_PROJECT_GUIDE.md` before starting Phase 0.**
**Planning mode has already been determined in `00-classifier.md` — do not ask again.**

---

## Planning Mode Router — READ THIS FIRST

**DO NOT read every planning file.** Read only the files and phases relevant to the project's planning mode.

| Planning Mode | Tier | REQUIRED reading | SKIP |
|---|---|---|---|
| **Lightweight** | Medium | Read `02a-planning-core-phases.md` (Phase 0, 1a, 2a), then `02b-planning-stack-setup.md` (Phase 6 only) | Phase 1, 2, 3, 4, 5, Phase 7 |
| **Standard** | Large | Read `02a-planning-core-phases.md` (all), then `02b-planning-stack-setup.md` (Phase 3, 5, 6) | Phase 4 (if design already exists), Phase 7 |
| **Full** | Enterprise | Read all files in order: `02a-planning-core-phases.md` → `02b-planning-stack-setup.md` → `02c-planning-reference.md` | Nothing is skipped |

**Lightweight shortcut:** For Medium, only read `02a-planning-core-phases.md` through Phase 2a, then `02b-planning-stack-setup.md` Phase 6. The rest is not relevant.

---

## Brief Entry Check

Before Phase 0, run one 30-second check:

**Is there a brief from ideation (`idea-[slug].md`)?**
- Yes → consume the brief fields below, skip questions that are already answered:

| Brief field | Maps to | Skip if present |
|---|---|---|
| Pitch | Q0a business case description | ✅ |
| For + Why this | Q0b strategic alignment + persona Phase 1a | ✅ |
| Complexity tier | Scale classifier (do not downgrade) | ✅ |
| Not building | Phase 1a scope statement | ✅ |
| First slice Phase 0 | Phase 2a milestone M0 | ✅ |
| First slice Phase 1 + Accept | Phase 2a milestone M1 with acceptance criterion | ✅ |

Mark every consumed field as `source: ideation_brief` in the relevant artifact. The gate still must pass — the brief is not a signed artifact.

- No brief → start Phase 0 from Q0a.

---

## Decision-Driven Interview Engine

The interview is not a form-filling exercise. Every prompt must resolve a decision, constraint, risk, dependency, or acceptance condition. Before asking a prompt, the agent checks existing project context and the question registry.

### Decision loop

```text
CONTEXT
  ↓
IDENTIFY UNKNOWN
  ↓
CHECK EXISTING EVIDENCE
  ├─ already resolved → SKIP
  └─ unresolved → ASK MINIMUM SUFFICIENT PROMPT
                    ↓
             RECORD DECISION
                    ↓
             RECORD CONFIDENCE
                    ↓
             MAP TO ARTIFACT / GATE
                    ↓
          RE-EVALUATE DEPENDENCIES
```

### Stop rule

Stop a phase when all of the following are true:
1. required decisions for the phase have an owner;
2. hard constraints are captured;
3. unresolved unknowns are either accepted as explicit assumptions or assigned a follow-up;
4. required artifacts can be generated without inventing facts; and
5. the next gate's entry conditions are satisfied or a named blocker is recorded.

**Never ask a question merely because it exists in the registry.** If the answer is already established by a signed artifact, an existing project document, or a previous answer, reuse it and skip the duplicate prompt.

### Evidence states

Use one of: `DECIDED`, `PROVISIONAL`, `ASSUMED`, `UNKNOWN`, `BLOCKED`. Every material decision should carry `source`, `owner`, `date`, and `confidence` (`high|medium|low`).

### Human authority boundary

The agent may propose, draft, analyze, and validate. It must not silently change acceptance criteria, weaken verification gates, approve its own failed gate, change governance ownership, close a milestone, accept UAT/BAST on behalf of a human, or hide an unresolved blocker.

### Small-project rule

For solo/personal projects, reduce ceremony, not truthfulness. A one-line stakeholder record, abbreviated charter, lightweight milestone baseline, and concise retrospective are valid. Fabricated enterprise-style rows are not.
