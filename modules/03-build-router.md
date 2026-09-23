# Module 03 — Build

**When to read this module:**
- Tier Small, directly from the classifier
- Tier Medium+ with lifecycle docs already `complete` (Gate D pass)
- Tier Medium+ without lifecycle docs → see "Gate Check" below

This module is the full vibe-coding engine: from Rule 0 through closing. Post-project work (BAST, retrospective) is in `04-closure.md`.

---

## Gate Check — Before Starting Build

**Check `lifecycle_docs` in CONTEXT.md and apply planning skip policy from `engine/PROJECT-PROFILE.md`:**

| Status | Tier | Action |
|---|---|---|
| `complete` | Any | Continue to Consume Mode below |
| `none` | Small | Continue directly to Rule 0 (planning always skipped per PROJECT-PROFILE.md) |
| `none` | Medium | Apply ask-once policy with warning per PROJECT-PROFILE.md: prompt user, record `lifecycle_skipped: user_decision` if chosen, proceed to BUILD |
| `none` | Large | Apply ask-twice policy with risk confirmation per PROJECT-PROFILE.md: Prompt 1 warns of contract/interface breakage; Prompt 2 requires explicit confirmation ("I accept the risk of architecture rework and scope drift") before proceeding to BUILD |
| `none` | Enterprise | Block: state Enterprise requires planning, proceed to PLANNING phase (no skip option per PROJECT-PROFILE.md) |
| `partial` | Any | Read the existing docs. For missing docs, generate the minimum before build: `ARCHITECTURE.md` (module boundaries only) and `VERIFY.md` (gate commands). |

---

## Consume Mode (when `lifecycle_docs: complete`)

When the user arrives with completed lifecycle docs, the reading order is:

1. **`ARCHITECTURE.md`** — module boundaries and binding tech decisions. Non-negotiable.
2. **`VERIFY.md`** — gate ladder. All commits must pass these commands exactly.
3. **`docs/dev-docs/AGENT-PROMPTS.md` § Kickoff** — paste this prompt, answer the 5-line confirmation before writing any code.
4. **`docs/planning/FSD.md` or `PRD.md`** — feature scope. Do not build outside this without explicit user confirmation.
5. **`contracts/openapi.yaml`** — when present, every API route must match this contract. No improvised endpoints.

Map sprint milestones → this skill's `TASKS.md`. Do not rewrite milestones — add them as queued items with exactly the same acceptance criteria.

---

## Build Module Routing

| Section | File | When to read |
|---|---|---|
| Foundations & Setup | `03a-build-foundations.md` | Always — start here after gate check |
| Build Loop | `03b-build-loop.md` | During active development |
| Quality & Standards | `03c-build-quality.md` | Before first commit and at every milestone |
| Docs & Deployment | `03d-build-docs-deploy.md` | At Phase 4b and before release |
