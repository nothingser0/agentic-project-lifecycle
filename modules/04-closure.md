# Module 04 — Closure

**When to read this module:** after UAT sign-off and the project is already live. No part of this module may be executed before UAT confirmation and build completion.

This module combines two closure workflows:
- **Build closure** (from vibe-coding): light ceremony, session artifact, short retrospective
- **Project closure** (Phase 7): BAST, handover, closure report, access revoked

Scale to project complexity. Small projects need only build closure. Medium to above need both.

---

## Gate before starting

Check three things before opening this module:

1. Is there SIT completion? (for Medium+: `docs/testing/SIT-REPORT.md` exists with all critical integrations PASS — see `03d-build-docs-deploy.md` SIT section). Solo/personal projects without external integrations: skip.
2. Is there UAT sign-off? (for Medium+: user/client signature in UAT scenario tracker)
3. Is release already in production? (not staging)

If either is not: return to `03-build-router.md`. Do not run closure on a project that is not released.

Read `references/pm/POST_PROJECT_CLOSURE_GUIDE.md` before generating any artifact here.

---

## A. Build Closure (all tiers)

### Closing Ceremony

**Small:** cleanup (console.logs, dead code), verify it runs, one line handoff: "Built [X]. Run: [command]. Extend by [hint]."

**Medium:** Medium docs complete and final, deployment live or documented blocker, TASKS.md review (done/queued/blocked/bug/needs-spec), structured handoff: feature list with status, what is running now, what is deferred and why, what needs spec, known limitations, suggested scope for next session.

**Large:** Medium set + integration points verified, full TASKS.md review, deployment status or blocker, structured handoff + short closure report.

### User Acceptance Pass (Medium+)

Before handoff, list all acceptance criteria from every milestone as a numbered checklist that the user can run themselves, in their own environment, with their own data. Do not close based on your verification alone. Anything user reports as failing → Bug entry, not note in chat.

### Session Retrospective (Medium+)

Two questions, asked once, not chased if not answered:
1. "Is there anything you think should have been built differently?"
2. "Is there anything you want to remember for the next session?"

Append answers to `MEMORY.md` under Current Preferences or Avoid. Silence is a complete answer.

### Sunset

If project is stopped before completion:
- Document what has run, what has not, why stopped
- Commit final state
- Write `SUNSET.md`: why stopped, last state, how to restart if wanted

---

## B. Project Closure / Phase 7 (Medium to above)

**Read `references/pm/POST_PROJECT_CLOSURE_GUIDE.md` before proceeding.**

Sequence that cannot be reversed:
```
SIT (staging, all integrations) → Release → UAT confirmed → Deliverables reviewed → BAST → 
Closure Report → Retrospective → Handover → Access revoked → Closed
```

### Phase 7 Gates

| Gate | Trigger | Blocker |
|------|---------|---------|
| **Gate SIT** | Before release to production | UAT cannot be scheduled before SIT PASS on critical integrations; skip for projects with no external integrations |
| **Gate UAT** | Before BAST | BAST cannot be signed before production stable |
| **Gate C: Project Closed** | After all documents done | Access cannot be revoked before BAST signed and handover delivered |

### Phase 7 Questions (9 core + conditional)

**QC1 — UAT Confirmation**
> "Has UAT been completed and results documented? Who signed the acceptance?"

**QC2 — Review Deliverables**
> "Are all these documents final and in place: Project Charter, PRD/FSD, Wireframe, ERD, ARCHITECTURE.md, VERIFY.md?"

**QC3 — BAST**
> "Who signed BAST from client/user side? Is there any outstanding issue record that needs to be included before signature?"

Fill `templates/closure/BAST_TEMPLATE.md`. BAST cannot contain credentials or sensitive data.

**Handover formality enforcement — check `handover_formality` in CONTEXT.md before Gate C passes:**

| `handover_formality` | BAST requirement | Gate C blocker if missing |
|---|---|---|
| `none` | Skip BAST entirely | — |
| `email` | Email/ticket confirmation from receiver | Email not received |
| `full` | Written BAST + `bast_signed_by` named in CONTEXT.md | Signature missing |
| `legal` | Written BAST + `bast_signed_by` named + **`legal_reviewed_by` named by a human with legal/procurement authority** + `legal_review_date` recorded | **Either** signature **or** legal review missing → Gate C is blocked |

For `handover_formality: legal`: the agent may draft the BAST, but it **cannot** self-certify legal review. A human with legal or procurement authority must sign off on the BAST itself — not only on `COMPLIANCE.md`. Record the reviewer in CONTEXT.md as `legal_reviewed_by: [name, role, date]`. Gate C will not pass without this field populated by a real person's name.

**QC4 — Closure Report**
> "Compare actual vs planned: how many percent did timeline slip? Actual budget vs estimate? Scope dropped vs added?"

Fill `templates/closure/CLOSURE_REPORT_TEMPLATE.md`.

**QC5 — Retrospective**
> "Three things: (1) What worked well and should be retained? (2) What didn't work and needs to be changed? (3) One experiment you want to try in next project?"

For teams >5 people: retrospective needs anonymity. Do not collect answers directly in front of entire team.

**QC6 — Handover**
> "Who will receive handover? Do they already have access to: repo, docs, credential vault, monitoring dashboard, local runbook?"

Fill `templates/closure/HANDOVER_TEMPLATE.md`.

**QC7 — Access Revocation**
> "List all accesses that need to be revoked: contractor accounts, staging credentials, CI/CD tokens from developers no longer involved, shared passwords used during project."

Revoke after BAST signed and handover delivered. Do not revoke before BAST.

**QC8 — Post-Project Security Review**
> "Is there: API key in repo history? Secret in environment variable not yet rotated? Test account still active in production?"

**QC9 — Close the Loop**
> "Back to Q0h/Q65e success criteria from initial planning: have the targets set at the beginning been achieved? If not, what caused the gap?"

### Phase 7 Output Files

| File | Small | Medium | Large | Enterprise |
|------|-------|----------|-------|------------|
| `SUNSET.md` or `docs/pm/BAST.md` | SUNSET.md | BAST.md | BAST.md | BAST.md |
| `docs/pm/PROJECT-CLOSURE-REPORT.md` | Skip | Yes | Yes | Yes |
| `docs/pm/RETROSPECTIVE.md` | 1 paragraph | Yes | Yes | Full 360 |
| `docs/dev-docs/HANDOVER.md` | 1 line | Yes | Yes | Yes |

Templates: `templates/closure/BAST_TEMPLATE.md`, `templates/closure/CLOSURE_REPORT_TEMPLATE.md`, `templates/closure/POST_MORTEM_TEMPLATE.md`, `templates/closure/HANDOVER_TEMPLATE.md`

---

## Update CONTEXT.md after closure. Do not force BAST fields for every project; use the selected handover formality.

```
lifecycle_phase: CLOSED
closure_date: [date]
handover_formality: [none | email | full | legal]
access_revoked: true

# If handover_formality: email
handover_confirmed_by: [name]

# If handover_formality: full
bast_signed_by: [name]

# If handover_formality: legal
bast_signed_by: [name]
legal_reviewed_by: [name, role, organization]
legal_review_date: [YYYY-MM-DD]
# Gate C is blocked until both bast_signed_by and legal_reviewed_by are populated.
```

Project lifecycle complete.

---

## C. After Released — Choose path

Before closing the session, confirm with user:

> "Project is live. Want to go directly to formal Closure, or enter Maintenance Mode first (bug fix, dependency update, monitoring — without new features)?"

| Answer | Action |
|--------|--------|
| Formal Closure | Run Section B above |
| Maintenance Mode | Set `lifecycle_phase: MAINTAIN` in CONTEXT.md, setup kanban columns: Bug Fix / Dep Update / Security Patch / Alert |
| Not sure | Default to MAINTAIN — safer than closing a project that still needs attention |

In MAINTAIN, if a feature request comes in: record as backlog and ask user if they want to open a new BUILD session. Do not execute feature in maintenance mode without explicit confirmation.
