# Agent Orchestration Guide — Development Stage with Multi-Agent Coding

**Purpose:** Run the Development stage when the code is written by multiple AI agents
running in parallel (opencode / orca / Claude Code / orchestrator plugin), not a single human
switching hats sequentially.

**Read this when:** the first sprint starts with an agentic setup, two agents are overwriting
each other's work, an agent's output "passes all checklists" but does not work, or the agent's
context window runs out before it touches code.

**Pairs with:** `DEVELOPMENT_STAGE_GUIDE.md` (Kanban process and DoR/DoD per column — still
fully applies), `anti-slop-core.md` (output quality), `TESTING_STRATEGY_DETAIL.md`.

---

## Contents

- [Fundamental difference: sequential humans vs parallel agents](#fundamental-difference-sequential-humans-vs-parallel-agents)
- [Three foundations that must exist before the first agent runs](#three-foundations-that-must-exist-before-the-first-agent-runs)
- [Document tiers: why 150 files actually worsen results](#document-tiers-why-150-files-actually-worsen-results)
- [Contract-first: the order that must not be reversed](#contract-first-the-order-that-must-not-be-reversed)
- [Agent role map](#agent-role-map)
- [Task decomposition: vertical, not horizontal](#task-decomposition-vertical-not-horizontal)
- [Work isolation: worktrees and merge queue](#work-isolation-worktrees-and-merge-queue)
- [Verified gates replace checklists](#verified-gates-replace-checklists)
- [Role separations that must not be violated](#role-separations-that-must-not-be-violated)
- [Doc drift: a lying document is worse than no document](#doc-drift-a-lying-document-is-worse-than-no-document)
- [Mapping to tooling](#mapping-to-tooling)
- [Common agentic setup failures](#common-agentic-setup-failures)
- [Readiness checklist](#readiness-checklist)

---

## Fundamental difference: sequential humans vs parallel agents

`DEVELOPMENT_STAGE_GUIDE.md` describes a process for one person switching hats: coding today,
testing tomorrow, reviewing the day after. The sequence is correct and still applies. But three
of its assumptions collapse when the workers are agents:

| Human process assumption | Reality with agents |
|---|---|
| One person, one item, sequential | Multiple agents, multiple items, simultaneous |
| Context carries over in the person's head between sessions | No memory — every session starts from zero |
| "Testing tomorrow" provides cognitive distance | There is no tomorrow; distance must be created through role separation |
| Document ambiguity is questioned | Ambiguity is filled with confident-sounding guesses |
| Checklists are read and evaluated honestly | Checklists are reported as passing because that is the expected answer |

The consequence is not "the Kanban process does not apply." The consequence is: every place in
that process that relies on **memory, honesty, or interpretation** must be replaced with explicit
artifacts.

---

## Three foundations that must exist before the first agent runs

If you only have time to prepare three things, prepare these. Without all three, adding agents only
increases the speed of producing code that must be thrown away.

**1. Machine-readable contracts (`contracts/`)**
Two agents reading the same prose will produce two different interpretations, and that is
only discovered at integration — the most expensive point to find it. `openapi.yaml`, `tokens.json`,
`schema.sql`, `errors.catalog.json`, and `acceptance/*.feature` eliminate room for interpretation.
Markdown still exists, but its status is derivative: if markdown and contract differ, the contract is correct.

**2. File ownership boundaries (`OWNERSHIP.md`)**
Without this, two agents will write to the same file. What you see is strange merge conflicts,
or worse: changes that disappear without a trace because the second agent read the file before
the first agent wrote to it.

**3. Executable gates (`VERIFY.md`)**
"I have verified there are no N+1 queries" is a claim. `pnpm lint:queries` exiting with exit
0 is evidence. Agents will always report checklists as passing — not because they lie, but
because "done" is the most natural completion pattern for a task.

Templates for all three are in `templates/specs/ARCHITECTURE_TEMPLATE.md`, `templates/dev/OWNERSHIP_TEMPLATE.md`,
`templates/dev/VERIFY_TEMPLATE.md`.

---

## Document tiers: why 150 files actually worsen results

This skill generates 100+ documentation files. For humans that is an asset — they can be skimmed, the rest
ignored. For agents that is a burden: irrelevant documents push relevant ones out of the context
window, and the agent runs out of space right when it starts reading code.

**Tier 0 — root, read by every agent on every task. Target total < 15 KB.**
```
AGENTS.md          router, not encyclopedia
ARCHITECTURE.md    boundaries, modules, dependency rules, binding decisions
CONVENTIONS.md     naming, folders, error format, commit format
VERIFY.md          gates and thresholds
OWNERSHIP.md       who writes what
```

**Tier 1 — contracts, sources of truth.**
```
contracts/openapi.yaml, schema.sql, tokens.json, errors.catalog.json
acceptance/*.feature
```

**Tier 2 — opened by task type.** The entire contents of `docs/`, routed by
`docs/dev-docs/CONTEXT-MAP.md` (template: `templates/specs/CONTEXT_MAP_TEMPLATE.md`).

**Tier 3 — never read by coding agents.** `docs/pm/BUSINESS-CASE.md`,
`PROJECT-CHARTER.md`, `STAKEHOLDERS.md`, `COMMUNICATION-PLAN.md`, `RETROSPECTIVE.md`.
These documents are for humans and sponsors. Making an agent read them is not caution,
it is a waste of context.

> **The instruction "read all planning documents before starting" is an anti-pattern.** Replace with
> "read Tier 0, then the matching rows in CONTEXT-MAP.md, then stop."

---

## Contract-first: the order that must not be reversed

```
ba-spec
   ↓  (AC becomes acceptance/*.feature)
ui-ux  ∥  api-designer  ∥  data
   ↓  (tokens.json, openapi.yaml, schema.sql)
═══ CONTRACTS LOCKED ═══
   ↓
frontend  ∥  backend  ∥  system-integrator
   ↓
qa
   ↓
reviewer
   ↓
release
```

**Locked means locked.** As long as contracts can still change, parallelizing frontend and backend
is not parallelization — it is two guesses scheduled to meet at the end of the sprint. If a contract
must change mid-sprint, that is an event the orchestrator halts: the change goes in,
consumer tasks are recreated (see the "Contract changed" table in `OWNERSHIP.md`), then work resumes.

The cost of locking contracts first feels like a slowdown on day one. Compare with
the cost of discovering that FE expected `{ data: [...] }` and BE sent `[...]` on day eight,
after 40 components were built on that assumption.

---

## Agent role map

Human roles in `DEVELOPMENT_STAGE_GUIDE.md` §"Solo multi-role" remain the same; what changes
is that each hat becomes a separate subagent with different context, write permissions, and
reasons to refuse.

| Agent | Kanban Column | Owns | Exit gate |
|---|---|---|---|
| orchestrator | all | `TASKS.md` | all subagents report done |
| ba-spec | Backlog → Todo | `acceptance/**` | every AC is verifiable |
| ui-ux | Todo | `contracts/tokens.json`, `docs/design/**` | AA contrast, complete scale |
| api-designer | Todo | `contracts/openapi.yaml`, `errors.catalog.json` | spec lint pass |
| data | Todo → In Progress | `migrations/**`, `schema.sql` | migrate up+down dry-run |
| backend | In Progress | `src/server/**`, `src/modules/**` | `gate:pr` |
| frontend | In Progress | `src/app/**`, `src/components/**` | `gate:pr` |
| system-integrator | In Progress, SIT | `src/integrations/**`, `tests/mocks/**` | `gate:sit` |
| qa | Testing | `tests/**` | `gate:qa`, all ACs mapped |
| appsec | Code Review | `docs/security/**` | SAST + clean audit |
| reviewer | Code Review | PR comments, `TECHNICAL-DEBT.md` | 6 questions in `VERIFY.md` answered |
| release | Release | Release notes, deployment checklist | `gate:release` + smoke pass |

Full system prompts per agent: `templates/dev/AGENT_PROMPTS_TEMPLATE.md`.

Roles often missing in agentic setups that should be added at enterprise scale:
**appsec** (once auth/payments/personal data are involved), **sre/devops** (once staging +
production exist), **data/DBA** (once there are migrations on a system with real data), and
**release manager** (once there is an external client receiving release notes).

---

## Task decomposition: vertical, not horizontal

**Horizontal (wrong):**
"Agent A builds all endpoints for this sprint, Agent B builds all pages."
Nothing can be demoed until both finish, integration piles up at
the end, and if one slips, nothing can be shipped.

**Vertical (correct):**
"Agent A: *create order* feature — endpoint, page, test, complete. Agent B: *order history* feature — complete."
Each agent produces something that can be tested independently, and path conflicts are minimal because
different features touch different modules.

Minimum task format the orchestrator may issue:

```
ID:        WP-014
Story:     acceptance/order-create.feature
AC:        AC-01..AC-05 (in the file above — do not copy, reference)
Contract:  contracts/openapi.yaml#/paths/~1orders
           contracts/tokens.json
May write: src/modules/orders/**, src/app/(app)/orders/**
Forbidden: migrations/**, contracts/**
Gate:      gate:pr
Done:      gate:pr exit 0 + PR created + gate output pasted in PR
```

**Tasks without AC must not be issued.** An agent receiving a task without AC will invent
its own done criteria, and will meet them — so it reports success, and nothing is wrong
from its perspective.

If two agents need to write to the same path, that is not a coordination problem. That is a sign
the task decomposition is wrong — redecompose, do not schedule turns.

---

## Work isolation: worktrees and merge queue

```bash
git worktree add ../{proj}-wp014 feat/s3-order-create
git worktree add ../{proj}-wp015 feat/s3-order-history
```

One worktree per active agent. A single working directory used in turns will produce
agents that read half-finished files from another agent and conclude the system is broken.

**Merge sequentially through a single queue, not simultaneously.** Each merge:
1. rebase to the latest integration branch
2. run `gate:pr` **again** after rebase — not the result from before rebase
3. only then merge

Step 2 is often skipped and that is the most common cause of "passed in PR, broken in integration":
two changes that are each correct individually can be wrong when combined.

---

## Verified gates replace checklists

`DEVELOPMENT_STAGE_GUIDE.md` has many `□` checklists. In agentic mode, those checklists are split
in two:

- **Machine-executable** → move to `VERIFY.md` as commands. Examples: "no console.log",
  "unit tests exist", "migration is reversible", "no hardcoded secrets",
  "no N+1 queries". All have a linter/test counterpart.
- **Requiring judgment** → remain as checklists, but answered by the reviewer in sentences, not
  checkmarks. Examples: "is the naming misleading", "is this what the AC asked for", "are the logs
  sufficient to diagnose at 2 AM".

Separating the two is important. When mixed, agents treat the entire list as a single
formality and check everything at once.

**Hard rule for agents:** gate failure must not be answered by relaxing the gate.
Lowering the coverage threshold, adding `it.skip`, or using `continue-on-error`
requires an ADR — not a mid-task decision.

---

## Role separations that must not be violated

Three rules most often compromised because "it's faster", and all three
eliminate the entire value of having multiple agents:

1. **The agent that writes code does not write tests for that code.** If the same agent does both,
   the tests will verify what happens to be implemented — not what the AC asked for. Tests pass,
   AC is not met.
2. **The QA agent must not fix production code.** Once allowed, it will fix first then report
   pass, and no one knows there was a bug.
3. **Reviewer runs after QA passes, not before.** Same as the human version
   (`DEVELOPMENT_STAGE_GUIDE.md` §Column 5) — reviewing code whose output is not yet proven correct
   is wasting the review budget on code that will change.

For solo developer + agent: you are the final reviewer. Do not make the reviewer agent a substitute
for reading the code yourself on changes touching money, auth, or personal data.

---

## Doc drift: a lying document is worse than no document

Agents trust documents completely. If `ARCHITECTURE.md` says there is a repository layer and
in reality it no longer exists, the agent will write code calling something that does not exist,
or — worse — recreate it in the wrong place.

Minimum prevention:

- **Every PR that changes structure must include a Tier 0 update.** Make it part of the
  PR template, and check in `gate:pr` (`git diff --name-only` contains a new `src/modules/*/index.ts`
  but `ARCHITECTURE.md` did not change → fail, or at minimum a warning).
- **Contract drift checked by machine:** `test:contract` compares implementation with
  `openapi.yaml`. An endpoint not in the spec = build fails.
- **Mock drift checked periodically:** `test:contract:live` against vendor sandbox, at minimum every
  sprint start (see `INTEGRATIONS.md` §Contract verification).
- **Sprint closure:** `CURRENT-STATE.md`, `DECISIONS.md` (ADR index), and `TECHNICAL-DEBT.md`
  updated as part of the sprint, not "later if there is time".

---

## Mapping to tooling

Tooling changes quickly; what follows is a concept mapping, not configuration instructions.
Verify against each tool's documentation before applying.

| Need | Where to place |
|---|---|
| Rules that apply to all agents | `AGENTS.md` at root — the harness (opencode, Claude Code, etc.) reads it |
| Persona + permissions per subagent | orchestrator subagent config, populated from `AGENT-PROMPTS.md` |
| Reading routing per task type | `CONTEXT-MAP.md`, referenced from `AGENTS.md` |
| Write boundaries per agent | `OWNERSHIP.md` + `CODEOWNERS` + check script in `gate:pr` |
| Gates | `VERIFY.md` + CI, commands identical so local = CI |
| Isolation | `git worktree` per agent |

**One thing that must not be delegated to tooling:** the decision that contracts are ready to be
locked. That is a human decision, and it is the single most influential control point you have in
the entire sprint.

---

## Common agentic setup failures

1. **Agent reports done, code does not work.** Cause: gate was not executed, only
   claimed. Fix: require command output to be pasted, not a narrative summary.
2. **FE and BE do not connect at the end of the sprint.** Cause: parallelized before contracts were locked.
3. **Two agents overwrite each other's work.** Cause: no `OWNERSHIP.md`, or
   tasks decomposed horizontally.
4. **Agent fabricates contents of a document that does not exist.** Fix: explicit instruction to "stop
   and report" — this must be in every agent's prompt, because the default is to guess.
5. **Context runs out before touching code.** Cause: instructed to read the entire `docs/` tree.
6. **Tests pass, AC is not met.** Cause: the code author wrote their own tests.
7. **Thresholds silently drop every sprint.** Cause: gate failure is answered by relaxing the
   gate. This is only visible if `VERIFY.md` changes are reviewed like code changes.
8. **Migration works in dev, breaks staging.** Cause: `down` was never tried, and
   dry-run did not use production-like data.
9. **Integration passes SIT, fails production.** Cause: mock only reproduces success responses.
10. **No one knows why the architecture is this way.** Cause: monolithic `DECISIONS.md`
    that is never filled because it is too large to touch. Fix: one ADR per file.

---

## Readiness checklist

Run before the first agent is released into the sprint:

```
Foundations:
□ ARCHITECTURE.md exists, < 6 KB, boundaries and dependency rules filled
□ OWNERSHIP.md exists, every path has an owner, Tier 0 marked human-only
□ VERIFY.md exists, every command has been tried and actually runs
□ CONVENTIONS.md exists
□ CONTEXT-MAP.md exists and is referenced from AGENTS.md
□ AGENTS.md is a router (< 5 KB), not an encyclopedia

Contracts:
□ contracts/openapi.yaml exists and passes spec lint
□ contracts/tokens.json exists, frontend generates CSS from it
□ contracts/errors.catalog.json exists
□ acceptance/*.feature exists for every story in this sprint
□ All contracts above are LOCKED before FE/BE are run

Execution:
□ Prompts per subagent registered in orchestrator, contain "you REFUSE if…" section
□ One worktree per active agent
□ QA agent has no write permissions to src/**
□ Code author does not write tests for their own code
□ Reviewer scheduled after gate:qa, not before
□ RUNBOOK-LOCAL.md has been tried from a clean clone and succeeded
```

If any box is unchecked, adding agents will accelerate the production of problems,
not the production of features.

---

**Last updated:** 2026-09-19
**Author:** OmahKene
**Version:** 1.0 (initial — multi-agent development orchestration: contract-first sequencing,
document tiering, ownership boundaries, executable gates, role separation)
**Part of:** pairs with `DEVELOPMENT_STAGE_GUIDE.md`, `anti-slop-core.md`,
`TESTING_STRATEGY_DETAIL.md`, `DEVOPS_DEPLOYMENT_GUIDE.md`

---

## Control-Plane Hardening

The skill now treats the interview and agent setup as a control plane rather than a static
questionnaire. Use these rules together with `engine/QUESTION-REGISTRY.md`,
`engine/GATE-REGISTRY.md`, `engine/ARTIFACT-REGISTRY.md`, `engine/STATE-MACHINE.md`, and
`engine/DECISION-RULES.md`.

### Minimum sufficient context

Do not make an agent read the entire documentation tree. Route the task through
`CONTEXT-MAP.md`, then open only the documents required by that task. A document is useful when
it changes a decision, constraint, contract, verification step, or implementation boundary.

### Human authority boundary

An agent may draft and verify evidence but must not silently approve legal commitments, accept UAT
or BAST, weaken a gate, change a scope baseline, or close a project. Record the human owner for
material decisions.

### Contract changes

A contract change is a change to the interface between agents or between code and an external
system. Before merging it:
1. identify affected consumers;
2. update the machine-readable contract;
3. update acceptance tests/mocks;
4. run the relevant verification gate;
5. notify affected owners;
6. record the decision/ADR when the change is architectural.

### Documentation scaling

The full base profile is not a mandatory minimum for every project. For a small project, keep the
same truthfulness and gate evidence while reducing ceremony. Never fabricate stakeholders,
approvals, metrics, risks, or governance records to fill a template.
