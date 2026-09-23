# Adoption Guide — Migrating Existing Projects to project-lifecycle

**When to use this guide:** You have an existing codebase without CONTEXT.md, and want to adopt project-lifecycle structure for continuation or handover.

---

## Why Adopt?

**Without project-lifecycle structure:**
- Agent resumes require re-reading entire codebase
- No single source of truth for "what's next"
- Context loss after breaks or handoffs
- No regression protection (VERIFY.md)
- Unclear ownership in multi-agent scenarios

**With project-lifecycle structure:**
- `CONTEXT.md` tells any agent exactly where to continue
- `VERIFY.md` prevents breaking what works
- `TASKS.md` preserves work queue across sessions
- `AGENTS.md` documents conventions for future-you or teammates

---

## 5-Step Adoption Path

### Step 1: Classify Tier

Run the classifier to determine complexity:

```bash
# Read git log and current file structure
git log --oneline -20
ls -la
```

**Ask:**
- How many user-visible features? (1 = Small, 3+ = Medium+)
- Does it have auth? (yes = Medium+)
- External API calls? (yes = Medium+)
- Multi-role access control? (yes = Large+)
- 5+ developers or payments or compliance? (yes = Large or Enterprise)

**Classify:**
- **Small:** 1 feature, no auth, no deploy, solo
- **Medium:** 3+ features OR auth OR external calls OR deploy
- **Large:** Multi-role auth, payments, public API, 5-20 devs
- **Enterprise:** 21+ devs, compliance, contracts

Record tier decision.

---

### Step 2: Extract Context from Existing Project

**Gather from existing files:**

Read these if they exist:
- `README.md` → extract run commands, stack description
- `package.json` / `Gemfile` / `requirements.txt` → stack
- `.env.example` → external services used
- Git log → last 10 commits for recent work
- Open PRs / issues → queued work

**Interview yourself (5 minutes):**
1. What is this project? (1 sentence)
2. What's the core feature that makes it what it is?
3. What was deliberately excluded from scope?
4. What's the stack? (language, framework, database, deploy target)
5. What was the last thing completed?
6. What should happen next?

Write answers down — you'll use them in Step 3.

---

### Step 3: Scaffold Tier-Appropriate Files

This skill ships no scaffold script — create the files by hand, per `SKILL.md`'s
"Scaffolding a project (markdown-only — no scripts required)": open
`references/pm/QUICKSTART_BY_TIER.md` for the tier's file list, copy each template from
`templates/`, and fill it in.

**What this produces (same result a scaffold script would have produced):**
- `CONTEXT.md`, `VERIFY.md`, `README.md`, `.gitignore`
- Medium+: adds `AGENTS.md`, `TASKS.md`, `ARCHITECTURE.md`, `CONTEXT-MAP.md`
- Large+: adds `OWNERSHIP.md` (if multi-agent), `contracts/`, `docs/decisions/`
- **Do not overwrite existing files** — check whether a file already exists before copying a template over it; if it exists, leave it and only create the files that are still missing

**Output:**
```
✓ CREATE CONTEXT.md
✓ SKIP README.md (exists)
✓ CREATE VERIFY.md
✓ CREATE AGENTS.md
✓ CREATE TASKS.md
✓ CREATE ARCHITECTURE.md
```

---

### Step 4: Fill CONTEXT.md from Step 2 Answers

Scaffold created a stub CONTEXT.md. Replace the stub with real context:

```markdown
# CONTEXT — [Your Project Name]

lifecycle_phase: BUILD
complexity_tier: [Tier from Step 1]
planning_mode: [n/a for Small, Lightweight for Medium, Standard for Large]
lifecycle_docs: none
multi_agent: [true if multiple agents, false if solo]
last_milestone: [Answer from Step 2.5: last completed work]
next_action: [Answer from Step 2.6: concrete next step]
handover_formality: [none for Small, email for Medium, full for Large]

# Rule 0 (from Step 2.1-2.3)
# Building: [Answer 2.1]. Core: [Answer 2.2]. Not building: [Answer 2.3].

# Stack (from Step 2.4)
# [Answer 2.4: language, framework, database, deploy target]

# Notes
# [Any critical constraints, known issues, or context agents must know]
```

**Example filled CONTEXT.md:**

```markdown
# CONTEXT — Expense Tracker

lifecycle_phase: BUILD
complexity_tier: Medium
planning_mode: Lightweight
lifecycle_docs: none
multi_agent: false
last_milestone: CSV export working, deployed to Vercel
next_action: Read TASKS.md item about category filter, implement GET /api/expenses?category=X with Prisma where clause, add CategoryFilter dropdown to ExpenseList component, write test asserting filtering works, run npm test && npm run build

handover_formality: email

# Rule 0
# Building: Expense tracker. Core: log expenses with categories, see monthly totals, export CSV. Not building: multi-currency, receipt OCR, team sharing.

# Stack
# Next.js 14 App Router, Prisma + SQLite, Tailwind CSS, deployed on Vercel

# Notes
# Database has 3 months of real data — DO NOT run destructive migrations without backup
# Mock Plaid integration (real API keys in production only)
```

---

### Step 5: Fill VERIFY.md, AGENTS.md, TASKS.md

**VERIFY.md** — gate commands that must pass:

```markdown
# VERIFY — [Project Name]

## Gate: runnable

```bash
npm run build  # or: cargo build, python -m pytest, make
```

```bash
npm test
```

```bash
npm run lint  # or: eslint ., cargo clippy
```

## Critical path (manual)

1. Start: `npm run dev`
2. Navigate to http://localhost:3000
3. [Key interaction 1]
4. [Key interaction 2]
5. Expected: [result]
```

**AGENTS.md** — cold-start contract (Medium+ only):

```markdown
# AGENTS — [Project Name]

## Run commands

```bash
npm install
npm run dev
npm run build
npm test
```

## Stack

- [Framework] — [reason]
- [Database] — [reason]
- [Styling] — [reason]

## Reading order

1. This file (AGENTS.md)
2. CONTEXT.md → lifecycle_phase + next_action
3. VERIFY.md → gate commands
4. TASKS.md → work queue

## Conventions

- Commit message: [format]
- Error format: [format]
- API routes: [pattern]

## Intentionally unchanged (do not "fix")

- [Thing that looks wrong but is deliberate]
```

**TASKS.md** — work queue (Medium+ only):

Extract from:
- Open GitHub issues → Queued
- Git branch names → Building
- Known bugs → Bug
- Last 5 commits → Done

```markdown
# TASKS — [Project Name]

## Queued
- [ ] #3: [Feature from backlog]
- [ ] #4: [Feature from backlog]

## Building
- [ ] #2: [Current branch work]

## Done
- [x] #1: [Recent completed work from git log]
- [x] #0: [Earlier completed work]

## Bug
- [ ] [Known issue 1]

## Needs Spec
(empty)
```

---

### Step 6: Verify Adoption

Run the manual validation checklist in `engine/STATE-MACHINE.md` ("Document Validation
and Pre-Transition Checklist") — this skill has no `verify-docs` script, so this is a short set
of file/field checks performed directly against the project.

**Expected result (every item on the checklist passes):**
```
✓ CONTEXT.md exists
✓ lifecycle_phase: BUILD
✓ complexity_tier: Medium
✓ next_action: Read TASKS.md item...
✓ VERIFY.md exists
✓ AGENTS.md exists
✓ TASKS.md exists
✓ All required documents valid
Exit 0
```

**If exit 1:** fix errors reported, re-run until exit 0.

---

### Step 7: Commit Adoption

```bash
git add CONTEXT.md VERIFY.md AGENTS.md TASKS.md ARCHITECTURE.md docs/
git commit -m "chore: adopt project-lifecycle structure"
git push
```

**Done.** Project is now structured for continuation by any agent.

---

## Post-Adoption Workflow

**Next session starts with:**
1. Read `AGENTS.md` (if Medium+) or `CONTEXT.md` (Small)
2. Check `next_action` in CONTEXT.md
3. Run commands in VERIFY.md to confirm baseline
4. Execute next_action
5. Update CONTEXT.md `last_milestone` and `next_action` after work
6. Commit

---

## FAQ

**"What if my README.md already has different structure?"**

Keep your README. Scaffold skips existing files. Project-lifecycle adds supplementary files (CONTEXT.md, VERIFY.md, etc.) that work alongside existing docs.

**"Do I need to rewrite my entire codebase?"**

No. Adoption only adds lifecycle control files. Application code stays unchanged.

**"My project has 10 years of git history. Do I read it all for Step 2?"**

No. Only last 10-20 commits. For `last_milestone`, use the most recent completed feature visible in git log.

**"What if I don't know the answers to Step 2 questions?"**

Best-effort answers are fine. For `next_action`, write: "Read ARCHITECTURE.md and codebase structure, identify highest-priority incomplete feature from TASKS.md, then implement." The next agent will figure it out.

**"Can I adopt partway through a project?"**

Yes. Most projects adopt project-lifecycle mid-stream when they realize they need structure. That's the primary use case.

**"What if my project is bigger than Medium but I'm solo?"**

Use Medium tier with simplified docs (see `references/pm/SOLO_DEVELOPER_GUIDE.md`). Tier measures technical complexity (features/auth/deploy), not team size. Solo devs can build Medium projects.

**"Do I need to fill every template field?"**

No. Templates have optional sections. Fill what you know. Skip what doesn't apply. The manual validation checklist only checks mandatory fields (see `engine/STATE-MACHINE.md` for the list).

**"My stack is Go/Rust/Java, not JS. Does this work?"**

Yes. CONTEXT.md, VERIFY.md, TASKS.md are language-agnostic. VERIFY.md gate commands change (`cargo build` instead of `npm run build`), but structure stays the same.

**"Can I use this for non-web projects (CLI, library, data pipeline)?"**

Yes. Adjust VERIFY.md commands and ARCHITECTURE.md sections for your artifact type. The lifecycle structure (classify → build → verify → ship) applies to all software.

---

## Example: Real Adoption (Medium Project)

**Before adoption:**
```
my-app/
├── src/
├── tests/
├── package.json
├── README.md
└── .gitignore
```

**After Step 3 (scaffold):**
```
my-app/
├── src/
├── tests/
├── docs/
│   ├── decisions/
│   └── dev-docs/
│       └── CONTEXT-MAP.md
├── AGENTS.md          ← NEW
├── ARCHITECTURE.md    ← NEW
├── CONTEXT.md         ← NEW
├── TASKS.md           ← NEW
├── VERIFY.md          ← NEW
├── package.json
├── README.md          (unchanged)
└── .gitignore         (unchanged)
```

**Time investment:** 15-30 minutes to extract context and fill files.

**Benefit:** Next session starts with `CONTEXT.md` next_action instead of re-reading entire codebase.

---

## When NOT to Adopt

**Skip project-lifecycle if:**
- One-off script that will never be touched again
- Throwaway prototype (< 1 day lifespan)
- Exploration/spike with no preservation intent
- Project already has comparable structure (custom docs/, clear handoff process)

**Adopt when:**
- You'll resume this in 1+ weeks
- Another person will touch it
- You're handing it off
- You want regression protection
- Multi-agent collaboration

---

## Next Steps After Adoption

- If project needs planning: read `02-planning-router.md`
- If ready to build: read `03-build-router.md`
- If solo Medium: simplify with `references/pm/SOLO_DEVELOPER_GUIDE.md`
- If multi-agent Large: set up the manual ownership-verification procedure in `templates/dev/OWNERSHIP_TEMPLATE.md` ("Violation detection") before any parallel work starts — this skill has no automated pre-commit hook, the check is done and recorded by hand at every `gate:pr`
