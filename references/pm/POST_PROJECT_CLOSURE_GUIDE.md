# Post-Project Closure Guide — Phase 7 Authority File

**Purpose:** Transform closure from "the project is live, let's move to the next one"
into a process with evidence: deliverables confirmed as received, lessons recorded before
they are forgotten, access revoked before it becomes a security gap, and project scores recorded to
compare estimates vs reality in the next project.

**Read this before:** running the Phase 7 (Post-Project) interview, and before writing
`docs/pm/BAST.md`, `docs/pm/PROJECT-CLOSURE-REPORT.md`, `docs/pm/RETROSPECTIVE.md`, or
`docs/dev-docs/HANDOVER.md`.

**Pairs with:** `DEVELOPMENT_STAGE_GUIDE.md` §Column 9 (Release — closure starts here),
`PRE_PROJECT_GUIDE.md` (Q0h Definition of Done and Q0e contract type are referenced back at closure),
`PM_FUNDAMENTALS_GUIDE.md` (Q65e Success Criteria are referenced back).

---

## Contents

- [Why closure is most often skipped](#why-closure-is-most-often-skipped)
- [Gate C: Closure Confirmed](#gate-c-closure-confirmed)
- [Order that must not be reversed](#order-that-must-not-be-reversed)
- [Formality scale by project type](#formality-scale-by-project-type)
- [BAST is not empty formality](#bast-is-not-empty-formality)
- [Why 360 reviews need to be anonymous](#why-360-reviews-need-to-be-anonymous)
- [Project score: for patterns, not for punishment](#project-score-for-patterns-not-for-punishment)
- [Post-project access: closure is a security matter, not just administration](#post-project-access-closure-is-a-security-matter-not-just-administration)
- [Closing the loop with Phase 0](#closing-the-loop-with-phase-0)
- [For solo developers](#for-solo-developers)
- [Pitfalls](#pitfalls)

---

## Why closure is most often skipped

Of all phases, Post-Project is the one most often simply skipped — not because it is
considered unimportant, but because the momentum is wrong. Once the application is live and the client
is happy, the natural impulse is to move to the next project, not to sit down and write a retrospective.

Three concrete consequences of skipped closure:

1. **No evidence of handover.** If six months later the client says "this is not what
   we asked for", and there is no BAST or written UAT sign-off, the PM has nothing
   to defend with — not because the work was wrong, but because there is no documentation that
   the client ever approved it.
2. **Lessons lost before they can be used.** Without a written retrospective,
   lessons from this project ("ERP vendor X integration always needs 20% more buffer") only live
   in the head of the person who experienced it — and are lost once that person changes teams or forgets.
3. **Access that is never revoked.** API credentials, server access, temporary contractor
   accounts — everything shared during the project and never revoked after completion
   is a security gap waiting to happen, not a hypothetical risk.

Closure is not an administrative formality. Closure is the only point in the entire project
lifecycle where those three things — evidence, lessons, security — are intentionally checked before
everyone's attention shifts to something else.

---

## Gate C: Closure Confirmed

**Trigger:** after QC9 (the last Phase 7 question).

**Prerequisites before Phase 7 may start:** a written UAT sign-off exists
(`docs/planning/REQUIREMENTS-SIGNOFF.md`), and Release has passed the production smoke test
(`DEVELOPMENT_STAGE_GUIDE.md` §Column 9). If either is missing, **do not start Phase 7** —
return to the Development stage. Closure started before the release is truly stable only
produces documents that will need to be rewritten.

**Blocker (client-facing/enterprise):** the project status must not be marked "Closed" until:
- BAST is signed (or equivalent — confirmation email for less formal cases)
- `docs/pm/RETROSPECTIVE.md` is filled, not an empty template
- Post-project security checklist (§8 in `CLOSURE_REPORT_TEMPLATE.md`) is complete

For solo/internal: Gate C is advisory — closure is still performed (at minimum a brief version),
but it does not block anything because there is no external party awaiting formal approval.

---

## Order that must not be reversed

```
Release passes production smoke test
        ↓
Written UAT sign-off confirmed to exist
        ↓
Deliverables checklist sent (source code, manual, etc. — per Q0e/Q15)
        ↓
BAST signed (if client-facing)
        ↓
PROJECT-CLOSURE-REPORT written (actual timeline, success criteria, project score)
        ↓
RETROSPECTIVE / post-mortem conducted
        ↓
HANDOVER to maintenance holder
        ↓
Access & credentials revoked/rotated
        ↓
Gate C — project officially Closed
```

**Why retrospective comes after BAST, not before:** BAST is a formal statement that
the work has been delivered and accepted — once signed, it cannot be "revoked" just because the
retrospective found something lacking. Writing BAST after the retrospective risks delaying handover
due to internal discussions that should be separate from the agreement with the client.

**Why revoking access comes last, not earlier:** handover and retrospective often still
need access (viewing logs, running final queries for the closure report data). Revoking access
earlier would actually impede closure itself. But do not let "last" mean
"forgotten" — the checklist in §8 of `CLOSURE_REPORT_TEMPLATE.md` exists so this is not missed.

---

## Formality scale by project type

| Element | Solo/personal | Internal | Client-facing | Enterprise |
|---|---|---|---|---|
| BAST | Skip | Confirmation email | Document + signature | + legal review + notarization |
| Closure Report | 1 page | Half page | Full | Full + executive summary for steering committee |
| Retrospective | Self-review journal | Team start/stop/continue session | + client feedback | + anonymous 360 |
| Handover | Brief notes | Handover document | + scheduled training session | + SLA transition document |
| Gate C | Advisory | Advisory | Mandatory | Mandatory + steering committee sign-off |

Do not inflate formality for small projects ("to look professional") — closure that is too heavy for
a solo project only produces boilerplate that is never read again. Do not deflate formality for
client-facing projects ("the client trusts us already") — that is precisely when a written BAST
is most needed, because trust can change after a dispute arises.

---

## BAST is not empty formality

Three most common mistakes regarding BAST:

1. **Signed before the system is truly live and stable.** BAST states the work
   has been delivered and accepted — if signed before the production smoke test passes,
   the document is lying about its own facts.
2. **Credentials written directly in the BAST document.** BAST is often stored long-term and
   shared with many parties (finance, legal, archives). Credentials written there are
   a leak waiting to happen — just write where the credentials are stored.
3. **Open items hidden to make it look "fully complete".** A BAST with open items
   honestly recorded and agreed upon by both parties is far stronger legally and professionally
   than a BAST claiming perfection that turns out to have unfinished items.

**BAST is not a legal document generated by AI.** For high-value projects or those at risk of dispute,
the template produced by this skill is a reasonable starting point — not a substitute for legal
review.

---

## Why 360 reviews need to be anonymous

For teams above ~5 people, feedback given with names on record tends to be overly
polite — especially for criticizing decisions by superiors, senior colleagues, or anyone who will
still be working together on the next project. This is not about people being dishonest; this is about
structural incentives that are the same in nearly every team.

Anonymity is not to avoid individual accountability — 360 review results are clustered by
theme (not by person) before discussion, precisely so the conversation is about patterns and process,
not about blaming one person in front of the group.

For small teams (≤5 people) or solo, anonymity is usually not realistic (too easy to
guess who said what) — open start/stop/continue is usually sufficient, as long as
the facilitator keeps the forum focused on process, not personalities.

---

## Project score: for patterns, not for punishment

The 1-5 scores in `CLOSURE_REPORT_TEMPLATE.md` §6 are useful only when used across multiple
projects to see patterns — for example, "team health" consistently low across three consecutive
projects indicates a problem at the estimation/buffer level, not a specific team's problem.

If scores are used to directly evaluate individual performance, people will start filling in
scores to look good, not to be honest — and the entire value of recording them is lost.
Separate project scores from individual performance reviews, even though both may exist
within the organization.

---

## Post-project access: closure is a security matter, not just administration

This is the section most often truly skipped, because it feels like an IT/admin task, not
a PM task. But responsibility falls at closure because this is the only point where
"who still needs access" is intentionally reviewed.

Minimum checklist (details in `CLOSURE_REPORT_TEMPLATE.md` §8 and `INTEGRATION_CONTRACT_TEMPLATE.md`):

- Third-party API credentials used during development — rotated, not left as-is
- Temporary contractor/vendor/external agent access — revoked, not "just leave it unused"
- Test/dummy accounts in production — deleted or deactivated
- Server/database credentials — transferred if the maintenance holder changes

If the development setup was agentic (see `AGENT_ORCHESTRATION_GUIDE.md`), add: access
granted to external tools/agents during development (API keys used by the orchestrator,
repo access given to third-party CI services) must also be reviewed — not just human access.

---

## Closing the loop with Phase 0

Good closure references back to what was promised at the start, not evaluating the project with
new standards created at the end:

| Asked at | Referenced back at closure |
|---|---|
| Q0h (business Definition of Done) | `CLOSURE_REPORT_TEMPLATE.md` §5 Success Criteria |
| Q0e (contract/legal type) | Determines the level of BAST formality needed |
| Q65e (technical Success Criteria) | `CLOSURE_REPORT_TEMPLATE.md` §5 |
| Q0i (Go/No-Go, kill switch) | If the project was cancelled, this is the basis for a "Cancelled" closure report |

If closure is done without referencing back to Phase 0, the result tends to evaluate the project
with standards that feel fair now — not with what was agreed before the project started.
That is a subtle form of moving the goalposts, even if unintentional.

---

## For solo developers

Solo closure often feels unnecessary — "it's just me, why would I make a BAST for myself."
True, skip BAST and formal sign-off. But two things still have value even alone:

1. **Honest self-review journal** (`POST_MORTEM_TEMPLATE.md` §Solo) — lessons not
   written down will be forgotten within weeks, and the next project will repeat
   the same estimation mistakes.
2. **Post-project access checklist** — API credentials used during development,
   especially for third-party sandbox/trial vendors, still need to be rotated or deleted.
   Solo developers are just as vulnerable to credential leaks as large teams — even more so,
   because there is no one else who might notice.

---

## Pitfalls

1. **Starting closure before the release is truly stable.** BAST and sign-offs signed
   before the production smoke test passes are promises, not evidence.
2. **Rewriting success criteria so they appear achieved.** If the target was 500 signups and
   the result is 320, write 320 — a dishonest closure report loses its entire function
   as a reference for the next project.
3. **Project scores used to evaluate individual performance.** Once that happens, people fill in
   scores to look good, and the data cannot be used for anything anymore.
4. **360 review not clustered by theme before discussion.** Discussing feedback one by one
   with guessable names turns the session into personal judgment, not process improvement.
5. **Credentials written inside the BAST or closure report.** These documents are stored long-term and
   shared widely — credentials in them are a leak waiting to happen.
6. **Access never revoked because "later."** There is no other momentum after closure
   to review who still has access — if skipped here, it will most likely
   never be reviewed until there is an incident.
7. **Retrospective written in overly soft language to appear polite.** "Communication
   could be better" is not actionable. Ask "why" three times until you find the root cause that
   can be concretely improved in the next project.
8. **Handover written last-minute on the final day.** Tacit knowledge — things the developer knows
   but were never written anywhere else — takes time to recall, not something that can be
   listed in the last hour before moving to the next project.

---

**Last updated:** 2026-09-19
**Author:** OmahKene
**Version:** 1.0 (initial — Post-Project Closure authority file: Gate C, BAST reasoning, 360
review anonymity rationale, project score discipline, post-project access/security checklist,
closing the loop back to Phase 0 success criteria)
**Part of:** pairs with `DEVELOPMENT_STAGE_GUIDE.md`, `PRE_PROJECT_GUIDE.md`,
`PM_FUNDAMENTALS_GUIDE.md`, `AGENT_ORCHESTRATION_GUIDE.md`
