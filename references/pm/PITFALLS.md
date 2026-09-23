# Common Pitfalls (Detailed)

Read this when troubleshooting a stalled, chaotic, or failing project session.

---

### 1. Estimating Timeline Without Work Schedule

**Problem:**
```
Timeline question → "3 months"
[User works weekends only: 10h/week = 120h total]
[Agent recommends complex microservices stack = 480h required]
→ Result: Project fails (4x over budget)
```

**Correct Approach:**
```
Timeline → "3 months"
Schedule probe → "Weekends only, ~10h/week"
[Calculation: 12 weeks × 10h = 120h total capacity]
[Agent recommends: batteries-included stack (Next.js + Supabase) = 80h estimated]
→ Result: Project ships with 40h buffer
```

**Rule:** Always convert calendar duration to total available engineering hours before recommending a stack or committing to scope.

---

### 2. Unrealistic Scale vs. Infrastructure Budget

**Problem:**
```
Scale expectation → "1 million users"
Current budget → "$0 / month"
[Agent deploys to free tiers that throttle at 10K requests]
→ Result: App crashes on first traffic spike
```

**Correct Approach:**
```
Scale expectation → "1M users target, 1K users at launch"
Budget → "$0 now, $50/month after revenue"
[Agent recommends: Free tier for launch, document migration triggers in ARCHITECTURE.md]
→ Result: Appropriate architecture that scales gradually without premature over-engineering
```

**Rule:** Design for Day 1 traffic with a documented upgrade path for Day 100, not the reverse.

---

### 3. Coding Before Reading the Contract

**Problem:**
```
Agent starts coding immediately upon receiving a prompt.
[Skips AGENTS.md, CONTEXT.md, and VERIFY.md]
[Builds wrong colors, invents non-existent API routes, breaks module boundaries]
→ Result: Entire session output must be discarded
```

**Correct Approach:**
```
Agent reads AGENTS.md first → understands stack, conventions, and reading order
Reads CONTEXT.md → identifies active phase and concrete next_action
Reads VERIFY.md → learns the gate commands that must pass before commit
→ Result: Code conforms to established patterns and passes verification on first try
```

**Rule:** The kickoff prompt in `docs/dev-docs/AGENT-PROMPTS.md` must be used at session start. Agents must never begin writing application code without first reading `AGENTS.md` and `CONTEXT.md`.

---

### 4. .gitignore Blocking Documentation

**Problem:**
```gitignore
# WRONG: blocks docs/ from being tracked
docs/
AGENTS.md
```
Git status shows clean, but 80% of project specifications are never committed to version control. When another developer or agent clones the repository, all planning context is gone.

**Correct Approach:**
```gitignore
# CORRECT: ignore build output and secrets, never specifications
node_modules/
dist/
.env
.next/
*.log
```

**Rule:** Never add `docs/`, `AGENTS.md`, `CONTEXT.md`, `VERIFY.md`, or `TASKS.md` to `.gitignore`. Specifications are source code.

---

### 5. Multi-Agent Write Collisions

**Problem:**
Two agents work in parallel without path boundaries. Both modify the same shared utility file, database schema, or router. Merging produces conflicts that neither agent can resolve cleanly.

**Correct Approach:**
1. Generate `OWNERSHIP.md` before any parallel work begins.
2. Define explicit directory boundaries per agent.
3. Lock shared interfaces in `contracts/` before development starts — no agent may modify contracts unilaterally.

**Rule:** If `multi_agent: true` in `CONTEXT.md`, an agent may write ONLY to paths explicitly assigned to it in `OWNERSHIP.md`.

---

### 6. Premature Completion Without Gate Verification

**Problem:**
Agent reports "All tasks completed!" based on having written the files, without running the commands in `VERIFY.md`. The code contains syntax errors, broken imports, or failing tests.

**Correct Approach:**
1. Run every command listed under `Gate: runnable` in `VERIFY.md`.
2. Confirm exit code 0 for all commands.
3. Run the manual document-validation checklist in `engine/STATE-MACHINE.md` (this skill has no `verify-docs` script) to confirm documentation integrity.
4. Only declare the milestone complete after both passes are clean.

**Rule:** `VERIFY.md` and the manual validation checklist are the authority, not chat affirmations. A milestone is not complete until every command exits 0 and every checklist item passes.
