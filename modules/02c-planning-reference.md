# Module 02c — Planning: Reference Material

**Contains:** Bundled Resources index, Key Features, Adaptive Examples, Control Plane and Validation, Implementation Steps, Pitfalls (40 items), Version History.

**Used by:** All planning modes — reference material, read on demand.

---

## Bundled Resources

Read these on demand during specific phases — do not load all upfront:

| Phase | Authority Guide | Key Templates |
|---|---|---|
| **Phase 0: Initiation** | `references/pm/PRE_PROJECT_GUIDE.md` | `BUSINESS_CASE_TEMPLATE.md`, `PROJECT_CHARTER_TEMPLATE.md`, `KICKOFF_AGENDA_TEMPLATE.md` |
| **Phase 1a: Requirements** | `references/pm/REQUIREMENT_GATHERING_GUIDE.md` | `FSD_TEMPLATE.md`, `PRD_TEMPLATE.md`, `SCOPE_STATEMENT_TEMPLATE.md`, `REQUIREMENT_TRACEABILITY_MATRIX_TEMPLATE.md`, `REQUIREMENT_SIGNOFF_LOG_TEMPLATE.md` |
| **Phase 2a: Timeline** | `references/pm/DETAILED_TIMELINE_GUIDE.md` | `DETAILED_TIMELINE_TEMPLATE.md` |
| **Phase 3: Architecture** | `references/backend/TECH_STACK_EXAMPLES.md`, `references/backend/DOMAIN_STACK_GUIDE.md` (read domain section first if Q15 matched a specific domain) | `ARCHITECTURE_TEMPLATE.md`, `ADR_TEMPLATE.md` |
| **Phase 4: Design** | `templates/specs/brand-questionnaire.md` | `DESIGN_TEMPLATE.md` |
| **Phase 5: Governance & Ops** | `references/pm/PM_FUNDAMENTALS_GUIDE.md`, `TESTING_STRATEGY_DETAIL.md`, `SECURITY_HARDENING_GUIDE.md`, `DEVOPS_DEPLOYMENT_GUIDE.md`, `MONITORING_OBSERVABILITY.md` | `INTEGRATION_CONTRACT_TEMPLATE.md`, `RUNBOOK_LOCAL_TEMPLATE.md` |
| **Phase 6: Build Setup** | `references/ai/AGENT_ORCHESTRATION_GUIDE.md`, `DEVELOPMENT_STAGE_GUIDE.md` | `VERIFY_TEMPLATE.md`, `OWNERSHIP_TEMPLATE.md`, `CONTEXT_MAP_TEMPLATE.md`, `AGENT_PROMPTS_TEMPLATE.md`, `DEVELOPMENT_KANBAN_TEMPLATE.md` |
| **Phase 7: Closure** | `references/pm/POST_PROJECT_CLOSURE_GUIDE.md` | `BAST_TEMPLATE.md`, `CLOSURE_REPORT_TEMPLATE.md`, `POST_MORTEM_TEMPLATE.md`, `HANDOVER_TEMPLATE.md` |
| **Troubleshooting** | `references/pm/PITFALLS.md` | — |

## Key Features

### 1. Context-Aware Filtering

Phase 1+2 answers filter Phase 3-5 recommendations:

**Example:**
```
Constraints: <1 week + Solo + $0

Laravel
  Hard constraints: PASS
  Soft constraints: strong
  Trade-off: framework conventions; verify current hosting/runtime support

Rails
  Hard constraints: PASS
  Soft constraints: strong
  Trade-off: Ruby ecosystem; verify current team familiarity

Django
  Hard constraints: PASS
  Soft constraints: acceptable
  Trade-off: Python stack; verify current deployment preference

Open question: does the team already have a language/runtime constraint?
```

### 2. Smart Skip Logic

- Q4="Figma ready" → Skip all 14 design questions (save 45 min)
- Q2="API-Only" → Skip frontend questions
- Q12="Solo" → Skip enterprise questions (GitOps, chaos, service mesh)
- Q10="None" → Skip 6 AI questions

### 3. Real-World Design Clones

Not generic "modern UI" — concrete, actionable references:

- **Apple.com:** Hero video, GSAP scroll, glassmorphism, premium feel
- **Jira:** Kanban @dnd-kit, resizable panels, ⌘K command palette
- **Linear:** Calm interfaces, 60fps animations, keyboard-first
- **Stripe:** Minimalist, trust-first, excellent docs UI
- **Figma:** Canvas, collaboration cursors, tools palette
- **Notion:** Tiptap block editor, nested pages, database views

### 4. Constraint-Fit Recommendations (no artificial ranking)

When the user needs a technology recommendation, compare a short list against explicit project constraints instead of using star ratings or a global ranking.

For each option show:
- **Hard constraints:** pass / fail / unknown
- **Soft constraints:** strong / acceptable / weak fit
- **Why it fits**
- **Trade-offs**
- **Freshness check:** official docs/version/pricing checked when currentness matters
- **Open question:** what could change the choice

If one option satisfies all hard constraints, say so descriptively. Do not manufacture precision with stars, scores, or a winner label.

### 5. Comprehensive Infrastructure

Not just "PostgreSQL" — full picture:

**Q18b: Additional Infrastructure?**
- Cache (Redis/Upstash)
- Search (Algolia/Meilisearch/Typesense)
- Analytics DB (ClickHouse/BigQuery)
- File storage (S3/R2/Supabase Storage)
- Queue/Jobs (BullMQ/Inngest/Trigger.dev)

Result: PostgreSQL + Redis + S3 + BullMQ (complete setup)

### 6. AGENTS.md as the Entry-Point Contract

Generated AGENTS.md is a root-level instruction file that a coding agent (OpenCode, Codex, Claude Code) will read first if it's told to — it directs the agent to:
- Read planning docs in a specific order (9 files, 1-2 hours) before writing code
- Follow sprint-by-sprint execution rather than jumping ahead
- Check the design checklist before every component (50 items, catches AI slop)
- Pass a security gate before merge (13 checks)
- Update progress daily

This only works if the human actually points the coding agent at AGENTS.md first (see Pitfall 4 below) — the file can't enforce anything on its own.

## Adaptive Examples

### Example 1: Solo MVP

**Context:** Fullstack Web, Figma ready, no AI, solo, short timeline, $0 budget.

**Behavior:**
- Skip the full Design phase because the design source already exists.
- Use abbreviated initiation, requirements, and timeline artifacts.
- Run only the Phase 6 questions that are meaningful for a human coding alone.
- Do not activate enterprise, compliance, mobile, AI, payments, email, CMS, or edge prompts unless the actual scope requires them.
- Generate the small-project documentation profile; do not force the 101-file base profile if the project does not need it.

**Important:** there is intentionally no hard-coded total question count. Repeated user/feature prompts expand only when the project contains those entities.

### Example 2: SaaS with payments + AI

**Context:** Fullstack Web, collaborative features, billing, basic AI, 2–5 developers.

**Behavior:**
- Activate Real-Time, AI, and Payments capability prompts.
- Keep Compliance off unless the data/business context activates it.
- Use the full Phase 6 agent-ready setup because multiple developers/agents need contracts and ownership boundaries.
- Generate payment and AI documentation only after their capability decisions are actually made.

### Example 3: Enterprise platform

**Context:** Multi-platform, AI-first, real-time, payments, email, CMS, 21+ developers, enterprise governance.

**Behavior:**
- Activate Enterprise DevOps, Design Systems at Scale, Compliance, Mobile, AI, Payments, Email, CMS, and any Edge/Data capabilities actually justified by requirements.
- Require all lifecycle gates explicitly.
- Use full agent orchestration, machine-readable contracts, ownership matrix, context routing, and verification ladder.
- Phase 7 remains a separate closure mode after production acceptance.

**The registry, not this example, is the source of truth for what gets asked.**

## Control Plane and Validation

The following files are the source of truth for the adaptive engine:

- `engine/QUESTION-REGISTRY.md` — stable IDs, activation conditions, dependencies, artifact mappings, and prompt-unit counts.
- `engine/GATE-REGISTRY.md` — gate entry/exit conditions and blockers.
- `engine/ARTIFACT-REGISTRY.md` — artifact ownership, required/optional status, and capability mappings.
- `engine/STATE-MACHINE.md` — PLAN → EXECUTE → CLOSE lifecycle states and legal transitions.
- `engine/DECISION-RULES.md` — decision/evidence/assumption rules and human authority boundaries.

After modifying the skill, verify consistency manually: check that question IDs, file references, gate names, and artifact lists match across modules. Cross-reference the registries above to catch drift.

## Implementation Steps

### 1. Load Skill

```
load skill project-lifecycle

generate project: TaskFlow
```

### 2. Answer Questions (2-4 hours)

Agent asks adaptive questions (adaptive).

**Tips:**
- Answer honestly (constraints shape recommendations)
- Pick "Not sure" when unsure (agent recommends default)
- Budget=$0 OK (lots of free-tier options)

### 3. Agent Generates Files (30 seconds)

- Checks latest versions (web_search)
- Generates the minimum sufficient documentation profile; full base profile is 101 files and the current maximum is 148
- Saves to `~/projects/TaskFlow/`
- Creates setup-git.sh (automated git branch setup)
- Creates GIT_BRANCH_STRATEGY.md (workflow guide)

### 4. Setup Git Branches (2 min)

```bash
cd ~/projects/TaskFlow
bash setup-git.sh
```

Creates:
- `dev` branch: Full documentation (for AI agents & development)
- `main` branch: Production code only (clean, no docs/)

### 5. Verify Files Ready (1 min)

**CRITICAL: Check docs/ are NOT blocked by .gitignore**

```bash
# Check all docs present
ls docs/  # Should show 13 folders

# Check git status
git status  # Should show clean working tree (all files committed)

# Verify .gitignore does NOT block docs/
grep "^docs/" .gitignore && echo "❌ ERROR: Remove docs/ from .gitignore!" || echo "✓ docs/ not blocked"
grep "^AGENTS.md" .gitignore && echo "❌ ERROR: Remove AGENTS.md from .gitignore!" || echo "✓ AGENTS.md not blocked"
```

**If docs/ blocked:** Edit .gitignore, remove docs/ line, re-add files, amend commit.

### 6. Push to GitHub (1 min)

```bash
gh repo create TaskFlow --private
git push -u origin dev
git push -u origin main
```

### 7. Review AGENTS.md (10 min)

```bash
git checkout dev
cat AGENTS.md
```

Read root contract — tells you what to do next.

### 8. Run the Gate D readiness check (10 min)

Work through the checklist at the end of `references/ai/AGENT_ORCHESTRATION_GUIDE.md`. Every box
must be ticked before the first agent runs. An unticked box means adding agents will accelerate
the production of problems rather than features.

```bash
ls ARCHITECTURE.md VERIFY.md OWNERSHIP.md CONVENTIONS.md   # Tier 0 present?
ls contracts/                                               # contracts locked for sprint 1?
bash -c 'source VERIFY.md 2>/dev/null; true'                # do the gate commands actually exist?
```

### 9. Register subagents and start the first sprint

- Paste the kickoff prompt from `docs/dev-docs/AGENT-PROMPTS.md` § Kickoff into the harness, and answer its five-line confirmation before letting the agent start
- Copy the per-role prompts from the same file into the orchestrator config
- One `git worktree` per active agent
- Run in contract-first order: ba-spec → (ui-ux ∥ api-designer ∥ data) → **lock** →
  (frontend ∥ backend ∥ system-integrator) → qa → reviewer → release
- Each agent runs its gate from `VERIFY.md` and pastes the output; a claimed pass is not a pass

## Pitfalls

Forty mistakes come up repeatedly when running this workflow. The full list with worked examples (bad vs. good) is in `references/pm/PITFALLS.md` — consult that file when troubleshooting.

Key rules to keep in context:
1. **Never skip Phase 0/1a on non-trivial projects** — ungrounded requirements lead to mid-build scope disputes.
2. **Lock shared contracts before parallelizing work** — two agents building against a prose spec will produce incompatible code.
3. **Route reads through CONTEXT-MAP.md** — loading all planning docs at once exhausts the agent context window before code is written.
4. **Enforce gates with machine-executable commands** — prose checklists are always reported as passing by agents.
5. **Enforce path ownership in multi-agent mode** — without `OWNERSHIP.md`, parallel agents overwrite each other's work.
    `ARCHITECTURE.md` describes a repository layer that was removed, the agent will write code
    calling something that doesn't exist — or helpfully recreate it in the wrong place. Structural
    PRs must update Tier 0 in the same PR, and contract drift must be machine-checked.

**Existing pitfalls:**

21. **Answering timeline/budget questions too fast.** "3 months" means something different for a solo dev working weekends vs. full-time — always get the sub-question (work schedule, budget timeline) before recommending a stack, or the hour estimate will be off by 4x.
22. **Unrealistic budget + scale combos.** A $0 budget and a 1M-user target aren't contradictory if the timeframe is 2-5 years — but the agent must say so explicitly and propose a staged plan (free tier → paid at 10K users), not silently accept both.
23. **Skipping design questions without real Figma files.** "Figma ready" should only be picked if design files actually exist; otherwise OpenCode/Codex builds a generic UI and the user is unhappy with the result.
24. **Ignoring AGENTS.md.** If the user pastes the kickoff prompt from `docs/dev-docs/AGENT-PROMPTS.md` § Kickoff, the coding agent reads AGENTS.md first and follows the planning docs; skipping that step is the single most common cause of wrong architecture/colors downstream. Skipping the prompt's five-line confirmation step is the second most common — it is the only point where a misreading gets caught before code is built on top of it.
25. **.gitignore blocking docs/.** Never let `docs/` or `AGENTS.md` land in `.gitignore` — removal from the `main` branch happens via `git rm` in the release step, not via ignore rules. Verify with `grep "^docs/" .gitignore` before pushing.
26. **Ghost file references in hooks/scripts.** Only reference files that were actually generated — check with `ls` before writing cleanup commands into SETUP.md or git hooks.

27. **Estimating at 100% team availability.** A developer who attends 4 hours of meetings per day, handles production incidents, and is 70% allocated to this project does not have 8 hours of productive output. Plan at 70–80% productive capacity per person, not 100%. Over-optimistic availability is the single most common reason sprints miss their targets.

28. **No visible buffer — padding hidden inside task estimates.** Distributing buffer invisibly across individual task estimates looks safe but is unmanageable: the PM can't see when buffer is being consumed, and the team treats padded estimates as the real target (then delivers them, not early). Always place buffer in an explicit "Schedule Reserve" work package. Visible buffer is manageable; hidden padding is not.

29. **Skipping dependency mapping.** "We'll figure out the order as we go" works on a 2-week project; it fails on a 3-month one. The first time an undocumented external dependency (client provides test data, third-party API sandbox access, another team delivers an integration) slips without a buffer day allocated, the downstream sprint starts late — and every sprint after it. Map dependencies at Phase 2a, not mid-sprint.

30. **Milestone = "task is done", not "gate is signed."** A milestone without a named approver and a sign-off artifact is a wish, not a gate. UAT sign-off that is verbal or informal ("the client seemed happy in the call") will not protect the PM when the client reports issues after go-live and claims they never formally accepted. Every milestone must have: a definition of done, a named approver, and a dated sign-off artifact.

31. **No baseline — impossible to measure slip.** If the timeline is never baselined, every revision is just "the current plan" and there is no way to know whether the project is on track, behind, or ahead. Baseline the timeline after QT8 (Gate T). Any change after that goes through change control. A PM who never baselines cannot report schedule variance — and cannot defend delivery performance to a client.

32. **Scope change absorbed silently into the timeline.** "Can we add X?" answered with "sure" — and the sprint just quietly gets heavier — is how timelines die by a thousand cuts. Every scope change is also a schedule change. The answer to "can we add X?" is always "yes, and it moves [milestone] by [N days]" — stated explicitly, confirmed, and logged in the Deviation Log and CHANGE-LOG.md.

**Phase 7 pitfalls:**

33. **Starting closure before release is actually stable.** BAST or sign-off signed before the
    production smoke test passes is a promise, not proof. QC1 exists specifically to block
    this — if it's not "yes" on both counts, closure doesn't start yet.
34. **Rewriting success criteria after the fact to make them look met.** If the target was
    "500 signups" and the result was 320, the closure report says 320. A closure report that
    quietly loosens its own targets is worthless as a reference for the next project's estimates.
35. **Using project score to judge individual performance.** The moment that happens, people
    fill in scores to look good rather than to be honest, and the data becomes useless for
    spotting real patterns across projects.
36. **Running a 360 review without clustering by theme first.** Discussing feedback one item at
    a time with an easily-guessed author turns the session into personal judgment instead of
    process improvement.
37. **Writing credentials directly into BAST or the closure report.** These documents get
    stored long-term and shared widely (finance, legal, archives). A credential written inside
    one is a leak waiting to happen — record where it's stored, never the value.
38. **Access never revoked because "we'll do it later."** There's no other natural checkpoint
    after closure where "who still has access" gets reviewed. Skip it here and it likely never
    happens until there's an incident.
39. **Retrospective written in language too polite to be useful.** "Communication could be
    better" isn't actionable. Ask "why" three times until you reach a fixable root cause, not
    a symptom.
40. **Handover written in a rush on the last day.** Tacit knowledge — things a developer knows
    but never wrote down anywhere else — takes time to recall; it can't be dumped in the final
    hour before moving to the next project.
