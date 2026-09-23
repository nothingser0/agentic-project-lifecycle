# HANDOVER — {PROJECT_NAME}

> **Output file location:** `docs/dev-docs/HANDOVER.md`.
> **Audience:** the person or team who will handle maintenance after this project closes —
> possibly different people from those who built it. Write as if the reader has never spoken
> to you and cannot ask follow-up questions.
> **When to fill:** start from Ready to Deliver, finalize at closure — not written
> hastily on the last day.

---

## System Summary (for someone who has never seen this project)

{3-5 sentences. What it does, who uses it, how critical it is if down.}

Full details: `ARCHITECTURE.md`, `docs/dev-docs/RUNBOOK-LOCAL.md`.

---

## Who Owns What After Handover

| Responsibility | Previously (project team) | After handover |
|---|---|---|
| Code maintenance | {…} | {…} |
| Infrastructure/hosting | {…} | {…} |
| Third-party vendor contacts | {…} | {…} |
| Product decisions/roadmap | {…} | {…} |
| Emergency/on-call | {…} | {…} |

**Emergency contact after handover:** {name, channel — and how long the old team remains
reachable for questions}

---

## How to Run the System

Do not duplicate — reference:
- Local setup: `docs/dev-docs/RUNBOOK-LOCAL.md`
- Production deploy: `docs/deployment/CHECKLIST.md`, `CI-CD.md`
- Rollback: `docs/deployment/CHECKLIST.md` §Rollback

---

## Things Not in Any Other Documentation (tacit knowledge)

This is the most important section of this file — things the original developers know but
did not get around to / did not think to write elsewhere.

```
- {"Endpoint X is sometimes slow during peak hours because of Y — known, not yet optimized"}
- {"If deploying Friday afternoon, there is always an issue with the job scheduler — root cause unknown"}
- {"Client has a specific preference about Z not written in any requirement"}
- {"This module intentionally does not follow the same pattern as other modules due to historical reason A"}
```

> If this section is empty, it is most likely not because there is no tacit knowledge — it
> has not been recalled yet. Sit for a moment and think: "what would I explain if a new person
> sat next to me in their first week?"

---

## Known Issues Not Yet Fixed

Reference `docs/dev-docs/KNOWN-ISSUES.md` for the full list; highlight the most important
ones for the new maintainer here:

| Issue | Impact | Why not yet fixed | Priority for new maintainer |
|---|---|---|---|
| {…} | {…} | {…} | {…} |

---

## Intentional Technical Debt

Reference `docs/dev-docs/TECHNICAL-DEBT.md`. Summarize the most impactful:

| Debt | Why it was taken at the time | When it should be repaid |
|---|---|---|
| {…} | {…} | {…} |

---

## Access & Credentials

**DO NOT write credential values in this file.** Write where credentials are stored and who
needs to be given new access.

| System | Stored in | Who needs new access |
|---|---|---|
| {Git repo} | {GitHub org} | {…} |
| {Hosting/cloud} | {team password manager} | {…} |
| {Production database} | {vault} | {…} |
| {Third-party vendors} | {see docs/misc/INTEGRATIONS.md} | {…} |

```
□ Old access (team leaving the project) has been revoked
□ New access (maintenance holder) has been granted and tested working
□ Credentials previously shared via insecure channels (chat, email) have been rotated
```

---

## Knowledge Transfer Sessions

| Date | Topic | Attendees | Recording/notes |
|---|---|---|---|
| {…} | {…} | {…} | {link, if recorded} |

---

## Frequently Asked Questions (fill over time, not all at once)

| Question | Answer |
|---|---|
| {…} | {…} |

---

**Handover from:** {name/team} → **Handover to:** {name/team}
**Effective date:** {YYYY-MM-DD}
**Status:** {Complete / Partial — see Open Items in PROJECT-CLOSURE-REPORT.md}
