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
| **Lightweight** | Medium | Read `02a-planning-core-phases.md` (Phase 0, 1a, 2a), then `02b-planning-stack-setup.md` (Phase 3 Tech Stack and Phase 6 Build Setup) | Phase 1, 2, 4, 5, Phase 7 |
| **Standard** | Large | Read `02a-planning-core-phases.md` (all), then `02b-planning-stack-setup.md` (Phase 3, 5, 6) | Phase 4 (if design already exists), Phase 7 |
| **Standard (Regulated-MVP)** | Enterprise (`regulated_mvp_track: true`) | Read `02a-planning-core-phases.md` (Phase 0, 1a, 2, 2a), then `02b-planning-stack-setup.md` (Phase 3 Tech Stack, Phase 5 Security Q34–Q39b & Compliance COMP1–COMP2, Phase 6 Build Setup) | Phase 1 full discovery, Phase 4 (if design exists), corporate enterprise governance in Phase 0 (use startup `STAKEHOLDERS.md` and single-tier charter), Phase 7 |
| **Full** | Enterprise (Default) | Read all files in order: `02a-planning-core-phases.md` → `02b-planning-stack-setup.md` → `02c-planning-reference.md` | Nothing is skipped |

**Lightweight shortcut:** For Medium, read `02a-planning-core-phases.md` through Phase 2a, then `02b-planning-stack-setup.md` Phase 3 (Tech Stack) and Phase 6 (Build Setup). Tech stack decisions in Phase 3 are strictly required because Phase 6 generates `VERIFY.md` and `ARCHITECTURE.md` bound to that stack. Phase 1, 2, 4, 5 are skipped.

**Regulated MVP Fast-Track shortcut:** For lean teams with statutory compliance overrides (`regulated_mvp_track: true`), do not default to Full 100-doc Enterprise planning. Follow the **Standard (Regulated-MVP)** row above: preserve non-negotiable security and compliance deep-dives (Q34–Q39b, COMP1–COMP2, encryption, audit logging, BAA tracking) while pruning enterprise corporate administration.

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

### Deadlock & Ambiguity Escalation Protocol (Non-Expert / Autonomous Guard)

If any decision, requirement conflict, or constraint trade-off remains unresolved after **2 interview exchanges** (e.g. user cannot decide, provides contradictory inputs, or critical technical information is missing), the agent MUST NOT guess silently or invent an unverified default.

1. **Stop probing immediately.**
2. **Output a structured Human Escalation Block:**
   ```markdown
   ## 🚨 Escalation Required: [Specific Decision/Conflict]
   - **Conflict / Ambiguity:** [Explain the exact contradiction or missing fact]
   - **Trade-off Analysis:**
     - Option A: [Description + cost/risk implications]
     - Option B: [Description + cost/risk implications]
   - **Impact if unresolved:** [What architectural or schedule damage occurs]
   - **Required Action:** Human decision required. Reply with 'Option A' or 'Option B' to unblock.
   ```
3. Halt phase transition until explicit human confirmation is received and recorded in `docs/dev-docs/DECISIONS.md`.

### Small-project rule

For solo/personal projects, reduce ceremony, not truthfulness. A one-line stakeholder record, abbreviated charter, lightweight milestone baseline, and concise retrospective are valid. Fabricated enterprise-style rows are not.
