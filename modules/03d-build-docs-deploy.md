# Module 03d — Build: Documentation & Deployment

**Contains:** Build Step 4b Documentation Scaffolding (root files, ADR, Memory, docs/ folder structure, agency document equivalents, contracts, scaffolding rules), Deployment Flow (approval, pre-deploy checklist, deploy, CI).

**When to read:** At Build Step 4b documentation scaffolding and before release.

---

## Build Step 4b: Documentation Scaffolding

Generate documentation from real decisions made during the build.

**Trigger (documentation does not depend on the user saying "ship it"):**

- **Run the manual document-validation checklist (`engine/STATE-MACHINE.md` § Document Validation) before every milestone commit.** This skill ships no `verify-docs` script — the checklist is a short set of file/field checks performed by reading the project directly. Any failed item = do not commit yet, resolve it first. This is part of the VERIFY gate, not optional.

**Automatic trigger Medium+: first runnable version plus one completed milestone.** At that point write the Medium core set: `README.md` upgraded from stub, `CONTEXT.md`, current `TASKS.md`, current `VERIFY.md`, `DESIGN.md` if UI. A user who simply stops replying still ends with a project another person can continue.
- Table of Permission decision "stop and wait" or any irreversible architecture choice, when made: write a five-line ADR (below).
- Any mock, stub, or deliberate shortcut shipped: `TECHNICAL_DEBT.md`, same cycle.
- User says "generate docs", "document this".
- Closing ceremony (top-up, not first write).
- User says they will continue later (continuation file).

**Rule: create a file only when it has real content.** No empty templates, no placeholder sections.

### Root files

| File | Purpose | Create when |
|---|---|---|
| `README.md` | What this is, install, run, reset path, stack in one line | Always. Stub in Build Step 4a, **upgraded to a real README at the automatic Medium+ trigger and again at closing.** A stub at handoff is a defect. |
| `TASKS.md` | Queued / Building / Blocked / Bug / Done, plus remaining 20% and visual hook | Medium+, Build Step 4a |
| `VERIFY.md` | Copy-paste gate command + critical-path manual checklist | Medium+, from first runnable version. Regression gate. |
| `CONTEXT.md` | Project identity, domain, constraints, current state + concrete `next_action` | Medium+ spanning sessions |
| `docs/dev-docs/CONTEXT-MAP.md` | **Routing map for agents** — by task type, which files to open and where to stop. Tier 0 must be < 15KB total. Without this, agents read all docs and the context window is gone before writing code. | **Medium+ REQUIRED** — generate from `templates/specs/CONTEXT_MAP_TEMPLATE.md` in Build Step 4a, update whenever the docs structure changes. |
| `OWNERSHIP.md` | Path ownership per agent — who may write what | **REQUIRED if `multi_agent: true`** — generate from `templates/dev/OWNERSHIP_TEMPLATE.md` before the build starts |
| `DESIGN.md` | Visual direction, tokens, token bridge mechanism, component rules | Any UI project, Build Step 4a |
| `AGENTS.md` | Cold-start contract for any agent that continues next, possibly a different model. Alias to `CLAUDE.md` / `.cursorrules` / `copilot-instructions.md` according to the user's tool, same content | Medium+, from automatic trigger. Required content: (1) exact run/build/test command — do not make the next agent rediscover this from `package.json`, (2) stack and why, one line each, (3) conventions not enforced by linter, (4) 2-3 things in this codebase that look wrong but are deliberate, (5) where `TASKS.md`, `CONTEXT.md`, `VERIFY.md` are and the order to read them. Conventions enforced by linter do not need to be here. |
| `TECHNICAL_DEBT.md` | Stubs, mocks, shortcuts, remaining 20%, upgrade path for each | Cycle when a mock or shortcut is introduced |
| `SECURITY.md` | Short "do not do this" list: auth boundary, ownership rule, data handling | Any project with auth, roles, sensitive data, webhook, upload, or deploy target. Ten lines is a complete SECURITY.md for Medium. |
| `DEPLOYMENT.md` | Exact command, env var, URL, deployed commit SHA, rollback steps | Project that is deployed or has a deploy target |
| `ARCHITECTURE.md` | Module boundary, data flow, dependency map | Two or more modules with a non-obvious seam |
| `MEMORY.md` | Cross-session state: taste preferences, rejected directions, lessons | User gives reusable preferences or rejects a direction |
| `.env.example` | Placeholder name + one-line purpose for each | Project uses env vars |
| `.gitignore` | Standard stack ignore | Always, Build Step 4a |
| `LICENSE` | Standard license text, not custom wording | Public repository (according to the public-repo decision in the Version Control hard gate) or user mentions a license. Default MIT unless the user states otherwise; mentioning a license is not a Stop and wait decision, but making the repo public still is. |

**Boundary rules (no duplication):** stack summary in README for humans and AGENTS for agents, deep structure in ARCHITECTURE. Current state only in CONTEXT. Task queue only in TASKS. Conventions only in AGENTS. Verify command only in VERIFY, referenced elsewhere.

**Cold-start writing rule (applies to every file in this table, every tier where the file exists):** write as if the next reader is a different agent on a different model with no memory of this session, because with a multi-provider setup that is often literally true. State decisions and current state, not the conversation that produced them. Expand every acronym or internal noun once the first time it is used. A `TASKS.md` entry says what is done and how to verify it, not "the thing we discussed earlier". If a file cannot be understood by someone who only opens that file plus running code, the file fails its purpose no matter how complete it looks.

### ADR (Medium+, event-triggered, five lines)

Write one when an irreversible or high-coupling decision is made, not at closing. `docs/decisions/ADR-NNN-short-name.md`:

```
# ADR-003: Session cookies instead of JWT
Date: [date]
Decision: [what was chosen]
Because: [one reason]
Instead of: [main alternative and why not]
Reverses by: [cost to change, or "not reversible after users exist"]
```

Five lines written when the choice is made beats a perfect ADR that there is no time to write at the end.

### Memory: automatic when available, manual when not

`MEMORY.md` below is the manual fallback assumed by everything else in this document. When the environment provides automatic, persistent, cross-session memory (capturing what happened in the session, compressing it, surfacing relevant parts again in the next session without a file that must be managed manually), prefer it for the same content this section describes — architecture decisions, naming conventions, rejected directions, previous dead ends — and treat `MEMORY.md` as redundant with it rather than writing both. Do not stop writing `TASKS.md` or `CONTEXT.md` in that case: those are current project state and plan, not session memory, and automatic memory tooling does not replace either.

### MEMORY.md structure (rolling)

```markdown
## Current Preferences
- [date] Minimal UI, dislikes gradients
- [date] Prisma over Drizzle in this project

## Avoid
- [date] shadcn default purple theme, user rejected it
- [date] react-beautiful-dnd too heavy, switched to @dnd-kit

## Session Log (compact after 10 entries)
- [date] Session 1: auth + dashboard. Likes sidebar layout.
```

### Folder docs/

**Small:** none.

**Medium:**

```
docs/
├── architecture/TECH-STACK.md   # stack choice with reasons
├── decisions/                   # ADR, event-triggered
└── dev-docs/START-HERE.md       # how to run it
```

**Large:** the vibe session produces the Medium set plus `docs/security/THREAT-NOTES.md` and `docs/deployment/ENVIRONMENTS.md`, and no more. Full enterprise documentation apparatus (PRD, FSD, RBAC matrix, SLA document, incident runbook, stakeholder charter) is **not** a vibe-coding deliverable. Generating 50 to 80 files here violates Mandatory Rule 6 and there is no five-minute artifact budget that can honestly produce them. When the project truly needs that apparatus, state it and route:

> "The docs set this project needs (PRD, RBAC matrix, runbook) is formal planning work, not vibe work. Switch to planning mode: `modules/02-planning-router.md`."

### Agency document equivalents

Vibe coding does not produce a PRD, FSD, wireframe, project charter, or BAST. Those documents exist so a second party can sign them. A vibe session has one stakeholder, and the working artifact is wireframe, PRD, and demo at once. The function is still covered:

| Agency artifact | Covered here by |
|---|---|
| Project charter | Rule 0 intent echo, one line |
| PRD | `CONTEXT.md` (identity, domain, constraints) + `TASKS.md` (features with acceptance criteria) |
| FSD | Acceptance criteria + `contracts/openapi.yaml` or route map + `ARCHITECTURE.md` |
| Wireframe | The clickable prototype itself |
| Test case / test report | `VERIFY.md` + acceptance criteria + Bug entry |
| Release note / BAST | Closing handoff + `DEPLOYMENT.md` with deployed SHA |
| Post-mortem | Session Retrospective |

If the user truly needs a PRD or FSD that can be signed for an external party, that is planning work. Reclassify to planning mode via `00-classifier.md` → `02-planning-router.md`. Do not improvise it during the build loop.

### Contract

| File | Create when |
|---|---|
| `contracts/openapi.yaml` (or route map in `ARCHITECTURE.md`) | **Whenever the same session builds an API and its consumer**, and before any parallel work on the consumer. A single-agent session building both sides is exactly where seams break silently. |
| `contracts/tokens.json` | UI project with a design system worth persisting |
| `contracts/errors.json` | Large project with multiple error surfaces |

### Scaffolding rules

1. Real content only. Boilerplate file, skip.
2. Do not gitignore `docs/`.
3. Alias `AGENTS.md` to the user's tool filename. Same content.
4. `MEMORY.md` compact after 10 log entries.
5. Lock shared contract before parallel work.
6. Expand, do not regenerate. Medium that grows to Large adds files.
7. Validate package names before writing them to docs.
8. **Budget.** Small: 0-1 file. Medium: max 8 root + 4 docs/. Large: max 12 root + 8 docs/ per session. Every file needs a creation reason, not just a trigger. If the budget cannot cover what the tier asks for, that is a routing signal (Mandatory Rule 6), not a reason to generate stubs.

---

## Deployment Flow

Top-level procedure. This is not part of the Closing Ceremony and never replaces it.

### Approval

**Deploying anything that reaches a public URL, real users, real data, or a billing account is a Stop and wait decision.** One precise question, then wait for the actual answer:

> "Ready to deploy to production at [target]. This makes it publicly reachable and [cost note]. Confirm and I will run it."

There is no "continue unless you object" path here, in any tier. Local preview and ephemeral preview build on a branch may continue silently.

### Pre-deploy readiness checklist (all blocking)

1. Production build passes locally.
2. The entire `VERIFY.md` set passes, including regression pass.
3. Every required env var is identified, exists in `.env.example`, and is resolved on the host. No fabricated values.
4. Pre-push secret scan is clean, and git history does not contain live credentials.
5. Server routes and API handlers enforce authentication **and ownership**, verified with a negative test, not only UI navigation.
6. Seed route, reset endpoint, and demo credentials are removed or auth-gated in the deployed build.
7. Error page and basic request/error log exist. A deployed app without logs cannot be debugged.
8. Database: migrations are applied in order on the target, and a snapshot is taken before any migration against an environment that already stores data.
9. Cost is stated in one line before anything that bills.

Anything not checked is stated to the user before deploy, not after.

### Deploy

1. Classify target: local preview, staging, production. Production with real users, payments, or sensitive data triggers Mandatory Rule 10 for that slice before deploy.
2. Prefer existing hosting project setup. If none exists, recommend the smallest compatible target (Vercel, Netlify, Railway, fly.io) and get approval above.
3. Environment parity: staging and production use the same build command and migration path, with separate env var sets and separate databases. Do not point staging build at production database.
4. Deploy only after the checklist passes.
5. **Record deployed commit SHA** and tag (`git tag deploy-YYYYMMDD-HHMM`). Rollback needs a target, not a paragraph.
6. Write or update `DEPLOYMENT.md`: exact command, env var, URL, deployed SHA, rollback command, known blocker.

### SIT — System Integration Testing (Medium+, before UAT)

**When:** after staging deploy passes the pre-deploy checklist and before UAT is scheduled. SIT is not a QA phase inside the build loop — it is a formal verification that external integrations work end-to-end on a production-equivalent environment.

**Scope (what SIT covers that VERIFY.md does not):**
- All third-party integrations tested with real sandbox credentials (payment gateway, email provider, SMS, map tile service, OAuth, external APIs) — not mocks
- Cross-module data flow: data written in Module A is correctly read by Module B
- Background job execution confirmed on staging queue, not in-process test
- Webhook callbacks received and processed correctly from external providers
- Migration applied on staging database without error

**SIT artifacts to produce:**
```
docs/testing/SIT-REPORT.md
  - integration: [name]
  - environment: staging
  - credential type: sandbox
  - test case: [what was tested]
  - result: PASS | FAIL
  - notes: [any deviation from expected]
```

**Gate:** SIT must be PASS on all critical integrations before UAT is scheduled. A FAIL that is deferred to post-UAT must be documented as a known risk in `CONTEXT.md` with explicit user acknowledgment.

**Difference from UAT:**
- SIT is run by the dev/QA team using test data; UAT is run by the end user/client using real or real-representative data
- SIT validates integration correctness; UAT validates business workflow fit
- SIT happens on staging; UAT happens on production-equivalent or production itself

### CI (Medium+)

Add one minimal workflow that runs the `VERIFY.md` command on push and pull request. One file, roughly twenty lines. This is the only thing that makes the regression rule survive an agent that forgets to run it.

---
