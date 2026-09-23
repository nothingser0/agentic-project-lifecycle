# Module 03b — Build: Build Loop

**Contains:** Version Control (hard gate), Task Tracking, Build Loop (5-step cycle), Pivot Handling, When Blocked, Spec Escalation Protocol.

**When to read:** During active development — the operational core of the build phase.

---

## On-Going Project

### Version Control (HARD GATE)

**Before scaffolding:** if the directory is not a git repository, run `git init` before creating app files. Create `.gitignore` before installing packages or generating build artifacts. Do not skip this because the project is Small.

**Secret scan hook (MANDATORY for Medium+, RECOMMENDED for Small):** Install pre-commit secret scan hook immediately after `git init`. Read `references/security/PRE_COMMIT_SECRET_SCAN_SETUP.md` for setup (5 min). This blocks secrets from entering git history before it's too late.

**Remote:** finish this before app scaffolding, not at the end. If there is no remote and `gh` is installed and authenticated, ask once right after `git init`: \"Create a private GitHub repo for this project?\" If the user has approved repo creation, run `gh repo create` directly. Default private. **A public repository is a Stop decision and wait. Do not create a public repo silently.** Do not reach the first runnable state without a remote or an explicit local-only decision.

**Branch strategy:**
- Small new project: `main` unless the user asks for a branch.
- Medium: feature branch if `main` already has content, otherwise `main` for the initial baseline.
- Large: named feature branch before implementation.

**Commit and push rhythm:**
- First runnable baseline: run VERIFY, commit, push.
- Every completed task or milestone: run VERIFY, commit, push.
- Do not commit every file save. Do not make one giant commit at the end of the session.
- If a task changes 3+ files, split commits by logical concern when possible.
- A task is not finished while `git status --porcelain` shows untracked or modified files from that task.
- If the app is runnable and files are still untracked, stop feature work and create a baseline commit.

**All tiers:**
- Do not commit broken state. The full VERIFY set passes before commit, not only the fastest check.
- Do not commit secrets, `.env`, credentials, build output, or dependency folders.
- Run a pre-push secret scan (below) before the first push and before any push that touches config, env handling, or client code.
- Do not force-push or rewrite history without asking, with one exception: Leaked Secret Protocol.
- Commit message: one line, what was built. Not "WIP", "update", or "fix".
- No remote and no approval: commit locally, tell the user push is blocked by missing remote.

**Pre-push secret scan:** grep the diff (and on the first push, the tracked tree) for high-entropy strings and common key prefixes: `sk-`, `ghp_`, `AKIA`, `AIza`, `xoxb-`, `-----BEGIN`, `password=`, `secret=`, `token=`. Use the repo scanner (`gitleaks`, `trufflehog`, `git secrets`) if available.

**Leaked Secret Protocol (explicit exception to the history-rewrite ban):**

1. **Rotate first.** Treat the key as burned as soon as it is committed. Tell the user exactly which credential must be revoked and where. Nothing is more important until this is done.
2. Remove the value from the working tree, move it to `.env`, add a placeholder to `.env.example`, confirm `.gitignore` covers it.
3. If the secret reached any remote or shared branch, tell the user that history rewriting is required, name the tool (`git filter-repo`, BFG), warn that collaborators must re-clone, and **ask before rewriting**. If the commit is local and not yet pushed, amend or rebase directly and state it.
4. Leaving a live secret in history because "do not rewrite history" is the wrong resolution of that rule. Rotation is never optional; rewriting is what needs consent.

### Task Tracking

One system, one state model. Track what the user mentioned against what exists.

| State | Meaning |
|---|---|
| **Queued** | Mentioned, not built yet |
| **Building** | Current cycle |
| **Blocked** | Cannot continue, state what blocks it |
| **Bug** | Built, shipped or shown, known broken or incomplete. Carries reproduction in one line. |
| **Done** | Acceptance criterion performed and observed |

- **Small:** track mentally.
- **Medium/Large:** `TASKS.md` is the persistent record, updated at every checkpoint.

A discovered defect never lives only in chat. A defect becomes a Bug entry in the same cycle when it is found, even if you intend to fix it in the next five minutes.

**Completion gate.** Do not declare a task Done in `TASKS.md` while any tracked sub-step is unchecked, and do not treat a plan as reliable if it only lives in chat history — a crash, `/clear`, or context reset must not be able to erase the trace of what has been decided. If a crash-proof file-based planning mechanism is available as a separate skill, it validates this same rule, not replaces it; either way, the file on disk is the source of truth above anything remembered from earlier conversation.

The first implementation item must include hard gates: git init/status, `.gitignore`, remote decision, `DESIGN.md` for UI. Do not start the task list with "Recon" or "Build UI" while the gate is missing.

**Checkpoint ledger line (Medium+):** every checkpoint states four things, including what was displaced by the user's addition.

> "Done: auth, dashboard. Building: employee CRUD. Queued: role-based nav. Added this session: CSV export (pushed role-based nav to next)."

**Schedule health check (Medium+):** setiap 3 milestone selesai, atau setiap kali milestone slip, jalankan health check dari `references/pm/SCHEDULE_HEALTH_GUIDE.md` dan tambahkan hasilnya ke ledger:

> "Schedule health: 🟢 On track (0 slipped milestones)"
> "Schedule health: 🟡 AT RISK — M2 +2 hari, M3 +3 hari — sudah surface ke user, user pilih defer CSV export"

Jika status 🔴 Off Track: stop build, buat CR, jangan lanjut sampai disetujui.

### Build Loop

#### 1. Absorb Intent

Listen to **what** and **why**, ignore non-existent **how**. Translate vague descriptions into concrete scope.

When genuinely ambiguous (two readings that lead to very different work), ask **one** short question as a choice:

> "Dashboard: one page with everything, or tabs per section?"

**Grooming check (Medium+):** before starting a queued item, test whether it is concrete enough to carry an acceptance criterion. If you cannot write "do X, see Y" for it, the item is still abstract. Split it into two or three concrete items underneath and requeue them, in `TASKS.md`, in under a minute. Abstract items built directly are the most common source of rework and features the user does not recognize.

**Intent checksum:** compare the next build target with the user's original noun and core feature from Rule 0. If it has drifted, stop, restate the corrected target to the user, and only then scaffold. Silent self-correction is not enough; the user must see the noun.

**Done when:** the next change can be described in one sentence and matches the Rule 0 line.

#### 1b. Three-Prompt Patience Threshold (ALL TIERS, cross-cutting)

Applies to every activity in the build loop, not only debugging:

If the same problem, styling issue, layout bug, or implementation approach fails after **three attempts**, stop iterating on it. Choose one of:
- Start a fresh session with a rephrased request (clears corrupted context)
- Split the problem into smaller parts and solve each independently
- Escalate to Oracle if the issue is genuinely hard (see Oracle Escalation Criteria in Debugging below)

This rule prevents context pollution — three failed attempts in the same conversation leave residual confusion that makes attempt four worse, not better. A clean slate almost always outperforms continued iteration on a broken thread.

#### 2. Decide and Build

Make implementation decisions according to the Permission Table. Optimize for speed to first result, ease of iteration, and runnability. Apply the Quality Floor and Anti-Slop Defaults in every cycle, not at the end.

State what you built in 1-3 lines per cycle. Not what you decided, what exists now.

**Per-cycle verification:**

- Run the fastest available check (diagnostics, typecheck, build) after every coherent change. Fix before showing.
- Run the acceptance criterion for the current milestone as a real interaction, not compilation.
- External service with real credentials: verify end to end. No credentials: mock with the same interface, label in the UI, **and register it in `TECHNICAL_DEBT.md` in the same cycle** (same discipline as the `.env.example` rule).
- Critical path (checkout, login, data submission, export): run once before showing.

#### 3. Regression Rule (MANDATORY, all tiers)

Mandatory Rule 4 has a mechanism, and this is it.

**Before marking any task Done and before every commit:**

1. Run the full command set in `VERIFY.md` (Medium+). In Small, run the project build/typecheck plus the previously working critical path manually.
2. Re-run the acceptance criterion for **every previously completed feature that shares a module, data model, route, or store with what you just changed.** Not every feature, only the blast radius. State the blast radius explicitly in one clause when not obvious.
3. If something that used to pass now fails, it becomes the current task. Fixing the regression beats finishing the feature that caused it.

Vibe coding is not append-only. Cycle 7 breaking cycle 2 is the default outcome without this rule, and typecheck catches almost none of it.

**`VERIFY.md` is mandatory in Medium+ from the first runnable version.** This is a standing regression gate, not a convenience doc. It contains exact copy-paste commands that must pass: typecheck, lint, test, build, plus a short manual checklist of critical paths with expected result.

**At least one automated check must exist before the first Medium commit.** One smoke test of the core flow is enough to start. A project whose VERIFY set is only typecheck has no regression protection at all.

#### 4. Show and Checkpoint

Present the result. Match depth to tier:

- **Small:** "Todo app is up. Add, complete, delete all work. Take a look."
- **Medium:** "Booking calendar is live. Try: choose date, choose slot, fill form, submit."
- **Large:** "Auth + dashboard done. Try: (1) login with the seeded local account, (2) sidebar nav appears, (3) click Employees, list loading."
- **CLI:** "Try `tool convert sample.json`. Expected: writes `out.csv`, exit 0."
- **Library:** "Try this import snippet, return [x]."
- **API:** "Try this curl, expected response shape [x]."

**Done, by artifact type, is observable, not a feeling:**

| Type | Done means |
|---|---|
| Web UI | Acceptance criterion performed on the rendered page, in one narrow viewport and one desktop, with keyboard reachability on the critical path |
| CLI | Command run on real sample input and exit 0, plus one failure-path run |
| Library | Import example run and documented return value observed |
| API | One real request returns documented shape, plus one validation-failure request returns a reasonable error |
| Automation | Dry run produces expected output on sample data before any destructive execution |

**Visual verification evidence (UI, no silent compile-only handoff).** Before showing a UI slice, produce one of:

1. screenshot from the rendered result, or
2. rendered-DOM inspection (browser tool, headless render, or equivalent), or
3. explicit disclosure line: **"Not visually verified: no browser tool available in this session."**

Option 3 is allowed. Saying nothing is not. Do not present only a URL as proof that the UI was reviewed.

#### 5. Iterate from Feedback

| User says | You do |
|---|---|
| "I don't like it" | One question: "The layout, the colors, or the overall vibe?" |
| "Bikin lebih pop" | Increase contrast, add accents, sharpen hierarchy |
| "Terlalu rame" | Reduce noise: fewer colors, less decoration, more whitespace |
| "Not that vibe" | Do not defend. Offer one direction: "More minimal, more playful, or more premium?" |
| "Bikin kayak [app]" | Borrow density, navigation, energy. Do not copy branding or assets. |
| "Bisa X juga?" | Scope addition, apply Phase 2 rules, update ledger line |
| "Balikin" | Revert to last working state (git stash/checkpoint, or save previous file version) |
| "Sempurna, lanjut" | Mark Done in `TASKS.md` only if the acceptance criterion was actually run. Move to the next queued item. |
| "Mulai ulang" | Pivot Handling, rerun Rule 0 |
| "Ship" | Closing Ceremony |

---

## Debugging & Problem Resolution

### When Something Breaks

**Debugging Protocol (5 steps):**

1. **Add targeted logging first**: Before attempting any fix, add logs to trace execution flow and inspect variable state at the failure point. Logs eliminate guesswork.
   
2. **Paste full error message**: Include complete stack trace plus a one-sentence description of what you were doing when it broke.

3. **Let AI diagnose**: Provide error + context, let AI propose root cause before manually debugging.

4. **Three-prompt patience threshold**: If the same problem persists after 3 fix attempts, STOP. Either:
   - Start a fresh session with rephrased request (clears corrupted context), OR
   - Escalate to Oracle if genuinely hard (see criteria below)

5. **Role-based prompting for complex issues**: Frame requests as "Act as a senior [domain] engineer debugging this [issue type]" to shift AI toward domain-specific reasoning patterns.
   - Example: "Act as a senior backend engineer debugging this race condition in the payment processing flow."
   - Example: "Act as a database specialist analyzing this N+1 query performance issue."

### Oracle Escalation Criteria

Consult Oracle (read-only high-IQ reasoning agent) when ANY of these apply:

- 3+ fix attempts failed on same issue
- Bug blocks runnability (app won't start/deploy)
- Root cause unclear after adding comprehensive logging
- Architectural decision needed to resolve (not just implementation fix)
- Security vulnerability with unclear remediation path

**Do not** escalate to Oracle for: syntax errors, missing imports, typos, or issues solvable by reading error messages.
| "Deploy ini" | Deployment Flow |

Unsafe, destructive, deceptive, or illegal requests: refuse that part briefly, offer the nearest safe implementation.

**Convergence stop:** if the same element is iterated 3+ times without convergence, stop guessing. Show 2-3 concrete named directions and let the user choose.

**Time-box signal:** a milestone is scoped, in Phase 3, as "the smallest slice that proves one thing." If a milestone passes roughly twice the number of cycles of other milestones in this session, and still has no runnable evidence, that is not a reason to keep grinding silently — it is a signal that the milestone is wrongly scoped (split it, ship a smaller part first) or the tier is under-classified (round up, according to the anti-downgrade rule). State it in one line at the next checkpoint instead of letting the ledger stay silent: \"This is taking longer than other milestones — split into [smaller part] first.\" This is a signal to state and follow up, not a hard stop or monitored timer.

**Scope Change Gate (Medium+):** during BUILD, if the user requests or discovers scope that was not in the original PRD/FSD/ideation brief, apply this gate before implementing:

```
SCOPE ADDITION DETECTED
  ↓
1. Name the addition explicitly: "This is new scope — not in the original brief."
2. Count cumulative additions this session: how many net-new features/entities have been added?
3. Assess tier impact:
   - 2+ new features or 1+ new entity beyond the original brief → re-run classifier (modules/00-classifier.md Step 2) silently; if tier changes, surface it.
   - Regulated data newly introduced → always escalate to Large/Enterprise regardless of other signals.
4. Record in TASKS.md under "Added this session" (checkpoint ledger line).
5. Get explicit user confirmation before building: "Added scope: [X]. This shifts timeline by ~[N]. Build it now or defer to backlog?"
6. If user defers: log to BACKLOG section of TASKS.md with "scope_source: mid-build-addition".
7. If user confirms now: re-baseline the active milestone estimate before starting.
```

**Never absorb scope additions silently.** The checkpoint ledger line must show what was displaced by the addition. A user who says "oh also add X" and sees nothing change in the plan has been misled about the project's state.

**Mid-build escalation:** if a slice that seemed Medium turns out to have multi-role logic, payments, or regulated data, escalate that slice through the Spec Escalation Protocol. Do not silently cowboy.

**Refactor trigger:** pause feature work for one cleanup cycle when one of these happens: the same logic appears for the third time, a file passes ~400 lines or clearly holds more than one responsibility, or three consecutive cycles each require edits in the same file for unrelated reasons. Cleanup is a cycle with its own regression pass, not a background activity.

**Proactive refactoring checkpoint (Medium+):** after every 3 completed milestones or at the start of a resumed session, run one review-and-refactor pass: scan for dead code, duplicated patterns, oversized files, and stale `TECHNICAL_DEBT.md` entries. This is a scheduled 15-minute pause, not a reactive trigger — do not wait for code to rot before cleaning. State what was cleaned in the checkpoint ledger line. Small projects: skip the schedule, but still clean up before showing each result.

### Tech Debt Retirement Planning (Medium+)

After every 3 completed milestones, review `TECHNICAL_DEBT.md` and categorize entries:

| Category | Action | Timeline |
|----------|--------|----------|
| **Blocker** (blocks new features) | Fix now | Current sprint |
| **High** (impacts performance/security) | Schedule next sprint | 1-2 weeks |
| **Medium** (maintenance burden) | Backlog with priority | 1-2 months |
| **Low** (cosmetic, nice-to-have) | Defer or Won't Fix | 3+ months |

**Retirement trigger:** When `TECHNICAL_DEBT.md` has 5+ High entries, pause feature work for one cleanup sprint.

**Record in CONTEXT.md:**
```
tech_debt_status: [healthy | warning | critical]
tech_debt_high_count: [number]
last_cleanup_sprint: [date]
next_cleanup_due: [date or milestone]
```

**Debt audit questions (run at retirement trigger):**
1. Does this debt still exist? (may have been fixed incidentally)
2. Does it still block/impact what we thought it would?
3. What's the actual cost to fix vs. cost to live with it?
4. Can it be split into smaller, less risky pieces?

**Status thresholds:**
- `healthy`: 0-2 High entries
- `warning`: 3-4 High entries
- `critical`: 5+ High entries → cleanup sprint mandatory

### Pivot Handling

1. Save the last working state (branch or commit).
2. State the pivot: \"Switching from [old] to [new]. Reuse [parts], discard [parts].\"
3. Delete or isolate abandoned code before continuing the build.
4. Rerun classifier and **Rule 0 intent echo**. Tier can change.
5. Start the new first runnable target.

**Catastrophic miss:** if the user says the whole direction, architecture, or stack is wrong, stop patching. Ask one diagnostic: \"Wrong problem, wrong workflow, or wrong feel?\" Save the failed version on a branch, revert to the last accepted milestone, rebuild one thin vertical slice in the new direction before reusing old code.

### When Blocked

Blocked for more than one attempt (install failed, API unavailable, missing env var, version conflict):

1. Save runnable state.
2. Stub or mock the blocked dependency if safe, label in the UI, register it in `TECHNICAL_DEBT.md`.
3. Tell the user the blocker and fallback.
4. Queue the real integration in `TASKS.md`.

### Spec Escalation Protocol

1. Stop the build loop for that slice only. Keep vibing other slices.
2. Mark the slice `blocked: needs spec` in `TASKS.md`.
3. Write what is known to `CONTEXT.md`.
4. Load `spec-driven-development` for that slice.
5. Produce the spec, then return to vibe mode for implementation.

The session does not end. Only the risky slice pauses.

**Return contract — what the spec must contain for clean re-entry.** The escalation exit is well defined; a spec that returns underspecified only moves the same ambiguity one skill later. Before returning to the build loop, the spec must give this slice the same things the `idea-detailer` brief gave Phase 0 through Phase 3, so it lands as a new milestone in the existing `TASKS.md` order instead of restarting discovery:

| Spec must contain | Lands as | Reopen discovery only if |
|---|---|---|
| Interface contract: input, output, and boundary of this slice | Slice entry in `ARCHITECTURE.md` or `contracts/openapi.yaml` | Contract conflicts with a route or schema already built |
| One acceptance criterion per requirement, in the form "Accept: do X, see Y" same as other milestones | New milestone appended to the existing order, not a new Phase 3 | Never — a requirement without acceptance criterion is not yet a spec, return it |
| Any data model or schema change, with Data integrity floor already applied (constraint, migration plan) | Migration plus ADR, written when the spec is accepted, not deferred | Change conflicts with data already in a deployed environment |
| Explicit non-goal for the slice | Slice-owned "Not building" line, same as Rule 0 | Never |

A spec missing one line above is not ready to leave `spec-driven-development` — that is a defect in escalation, not a reason to build against ambiguity.

---
