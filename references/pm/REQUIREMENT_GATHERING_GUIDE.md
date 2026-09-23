# Requirement Gathering Guide — Elisitasi & Baseline Requirement

**Purpose:** Turn Phase 1a answers (QR1–QR8) into real, enterprise-grade requirement artifacts:
`docs/planning/FSD.md`, `docs/planning/SCOPE-STATEMENT.md`, `docs/planning/TRACEABILITY-MATRIX.md`,
and `docs/planning/REQUIREMENTS-SIGNOFF.md` — instead of letting `PRD.md` alone carry the entire
requirement burden.

Read this when: Phase 1a questions come up, or when generating any of the four files above.
This guide sits between `PRE_PROJECT_GUIDE.md` (Phase 0 — is this project authorized?) and
Phase 1b's product-discovery questions (Q1–Q10 — what are we actually building?). Phase 0 asks
*should we do this*; Phase 1a asks *what exactly does "this" mean, and who says so*; Phase 1b
asks *what features/tech does it need*.

---

## Contents

- [Why Phase 1a exists](#why-phase-1a-exists)
- [How Phase 1a maps to BABOK / PMBOK](#how-phase-1a-maps-to-babok--pmbok)
- [Gate R: Requirements Baseline Approved](#gate-r-requirements-baseline-approved)
- [QR1 — Elicitation Technique Selection](#qr1--elicitation-technique-selection)
- [QR2 — Requirement Source Mapping](#qr2--requirement-source-mapping)
- [QR3 — Requirement Classification](#qr3--requirement-classification)
- [QR4 — Scope Statement (In/Out)](#qr4--scope-statement-inout)
- [QR5 — Dependency & Constraint Capture](#qr5--dependency--constraint-capture)
- [QR6 — Draft Acceptance Criteria (Shift-Left)](#qr6--draft-acceptance-criteria-shift-left)
- [QR7 — Verification & Validation Checklist](#qr7--verification--validation-checklist)
- [QR8 — Requirement Sign-off](#qr8--requirement-sign-off)
- [PRD vs FSD — they are not the same document](#prd-vs-fsd--they-are-not-the-same-document)
- [Don't over-formalize a solo project](#dont-over-formalize-a-solo-project)
- [Output files and what goes in each](#output-files-and-what-goes-in-each)

---

## Why Phase 1a exists

Previously, the skill went straight from Phase 0 (is the project authorized?) into Phase 1's product
questions (Q1–Q10: name, type, users, features). That produces a decent `PRD.md`, but it skips
the actual discipline of *requirement gathering* — the thing PMs, BAs, and system analysts are
trained to do before anyone writes a feature list:

1. **How will requirements actually be collected?** (Interview? Workshop? Reading an existing
   SOP? Or — for a solo project — just the founder's own head?)
2. **Who said what?** Every requirement should trace back to a source, not float free.
3. **What kind of requirement is this?** A business goal, a stakeholder need, and a system
   behavior are three different things and get confused constantly.
4. **What's explicitly out?** Scope boundary at the requirement level, not just the charter level.
5. **Is it actually verifiable?** Consistent, measurable, realistic, relevant — or it's a wish,
   not a requirement.
6. **Who approved the final version, and when?** Without this, "but I never asked for that" is
   undebatable later — for a client project this is a contractual argument, for a solo project
   it's just you re-litigating your own decisions three months from now.

Without Phase 1a, `PRD.md` ends up doing five jobs at once (business context + functional spec +
scope statement + acceptance criteria + approval record), which is exactly the kind of blur that
causes scope creep and "we never agreed to that" disputes downstream.

---

## How Phase 1a maps to BABOK / PMBOK

| Standard artifact | BABOK v3 knowledge area | PMBOK process | Where produced |
|---|---|---|---|
| Elicitation plan | Elicitation & Collaboration | Collect Requirements | Captured inline via QR1–QR2, not a separate file |
| Requirements classification (Business/Stakeholder/Solution/Transition) | Requirements Analysis & Design Definition | Collect Requirements | `docs/planning/FSD.md` §2 |
| Scope statement | Requirements Life Cycle Management | Define Scope | `docs/planning/SCOPE-STATEMENT.md` |
| Functional Specification Document | Requirements Analysis & Design Definition | — (SDLC artifact, not PMBOK-native) | `docs/planning/FSD.md` |
| Requirements Traceability Matrix | Requirements Life Cycle Management | Control Scope | `docs/planning/TRACEABILITY-MATRIX.md` |
| Requirement verification & validation | Requirements Analysis & Design Definition (Verify/Validate) | Validate Scope | QR7 checklist, logged in `FSD.md` §6 |
| Requirement sign-off / baseline | Requirements Life Cycle Management | Validate Scope | `docs/planning/REQUIREMENTS-SIGNOFF.md` |

This is the same "map it to a named standard" pattern `PRE_PROJECT_GUIDE.md` uses for Phase 0 —
the goal isn't ceremony, it's giving the user a vocabulary that transfers to any client, auditor,
or teammate who already thinks in these terms.

---

## Gate R: Requirements Baseline Approved

**Trigger:** After QR7–QR8 answers are collected.
**Blocker:** For client-facing or enterprise projects, Phase 4 (Design) and the heavier parts of
Phase 5 (Deep-Dive) should not be treated as final until Gate R passes — tech and design decisions
built on unverified requirements get rebuilt when the requirement turns out to be wrong. For
solo/internal projects this is advisory, not a hard stop (see "Don't over-formalize" below).

Gate R checklist (agent verifies, asks user to confirm each):
- [ ] Every must-have requirement traces to a named source (stakeholder, document, or "self")
- [ ] Every must-have requirement is classified (Business / Stakeholder / Functional /
      Non-Functional / Transition)
- [ ] Scope boundary is explicit — in-scope and out-of-scope are both written down, not just implied
- [ ] Each must-have requirement passed the QR7 verification checklist (consistent, measurable,
      realistic, relevant)
- [ ] A sign-off method has been agreed and, where applicable, executed

**If Gate R fails on a client project:** Surface it explicitly, same tone as Gate 1 in Phase 0:
> "A couple of must-have requirements don't have a named source yet, and there's no scope boundary
> written down. Design and tech-stack choices made now might get rebuilt if these turn out
> different than assumed. Want to lock the scope statement first, or proceed at your own risk?"

**Solo/internal exception:** Gate R collapses to: confirm the founder has actually written down
in-scope/out-of-scope somewhere (even one paragraph) and has looked at the must-have list once
with fresh eyes (the QR7 checklist) before moving to design/tech questions. Skipping Gate R
entirely for solo projects reproduces the exact failure mode Phase 0's Pitfall 2 warns against —
not fabricating ceremony, but pretending the discipline doesn't apply just because it's one person.

---

## QR1 — Elicitation Technique Selection

**What to ask:**
> "How will you actually collect the requirements for this project — not what they are yet, just
> how you'll find out?"

Options (multi-select — most real projects combine 2–3):
- **1:1 interview** — best for depth with a small number of key stakeholders
- **Workshop / FGD (focus group discussion)** — best when requirements conflict across
  departments and need to be negotiated in the room
- **Survey / questionnaire** — best for broad input from many end users who can't all be
  interviewed
- **Observation / shadowing** — best for brownfield projects where the real process differs from
  the documented one ("watch how the finance team actually closes the books")
- **Document analysis** — best for brownfield/migration: existing SOPs, old tickets, legacy
  system behavior, prior RFP/contract
- **Prototyping / mockup review** — best when stakeholders can't articulate needs abstractly but
  react well to something concrete ("show me a screen, I'll tell you what's wrong with it")
- **Solo self-elicitation** — for a founder/solo dev building for themselves: writing down your
  own needs is still elicitation, and still benefits from the same rigor (see below)

**Why this matters:** Picking the technique before collecting requirements — rather than
defaulting to "PM asks questions in a chat window" — is what turns generic feature requests into
requirements grounded in how people actually work. A workshop surfaces conflicting needs that a
1:1 interview would miss entirely (department A assumes a workflow that department B has already
worked around).

**What goes in `FSD.md` §1:** A one-line note per major requirement area: how it was elicited and
from whom.

---

## QR2 — Requirement Source Mapping

**What to ask:**
> "For each major requirement or feature area, who is the source? Not 'the client' generically —
> which named stakeholder or document."

Ties directly to Phase 0's `docs/pm/STAKEHOLDERS.md` (Q0d) — reuse that register rather than
re-collecting names. For solo projects, the source is legitimately "self, based on [pain point /
prior experience / competitor gap]" — write that plainly rather than inventing a fictional
stakeholder.

**Why this matters:** When a requirement is challenged later ("why does this even need to do
X?"), the answer should be a lookup, not a memory exercise.

**What goes in `FSD.md` and `TRACEABILITY-MATRIX.md`:** Every row has a Source column.

---

## QR3 — Requirement Classification

**What to ask:**
> "For each requirement collected, what kind of requirement is it?"

Use the four BABOK-style buckets — this is the single highest-leverage habit in this whole
sub-phase, because it prevents the most common confusion in informal requirement gathering
(treating "the app should feel fast" and "the checkout API must respond in <200ms" as the same
kind of statement):

- **Business Requirement** — why the organization needs this at all (ties back to Q0a/Q0b)
- **Stakeholder Requirement** — what a specific stakeholder or user group needs from the solution
- **Solution Requirement — Functional** — what the system must *do* (a specific behavior,
  input/output, business rule)
- **Solution Requirement — Non-Functional** — how the system must *behave* (performance,
  security, usability, availability — these often get silently dropped when requirement
  gathering is purely feature-list-driven)
- **Transition Requirement** — what's needed to move from current state to future state (data
  migration, user training, parallel-run period, cutover plan) — frequently forgotten on
  brownfield/migration projects, then discovered as a crisis two weeks before go-live

**Common failure this catches:** A requirement gathered as "must integrate with the existing
warehouse system" is a Business Requirement (why) wearing a Functional Requirement's clothes
(what). Classifying forces the follow-up question: *what, specifically, must the integration do?*

**What goes in `FSD.md` §2:** Requirements grouped under these four headings rather than one flat
list.

---

## QR4 — Scope Statement (In/Out)

**What to ask:**
> "What is explicitly in scope for this release, and — just as important — what is explicitly out
> of scope? If a stakeholder might reasonably assume something is included, and it isn't, say so
> here."

This is the requirement-level counterpart to the Charter's scope boundary (Phase 0, Charter §3) —
that one is a paragraph for the sponsor; this one is granular, per feature/module, for the people
building and testing.

**Push for specificity.** Weak: "basic reporting is out of scope." Strong: "custom report builder
is out of scope for v1 — only the 4 pre-built reports listed in FSD §2.3 ship at launch; a user
cannot create arbitrary report queries."

**What goes in `SCOPE-STATEMENT.md`:**
- In-scope list (grouped by module/feature area, referencing FSD requirement IDs)
- Out-of-scope list, with the reason (deferred to v2 / explicitly rejected / out of contract)
- Boundary statement — the one-sentence hard line, same style as the Charter's

---

## QR5 — Dependency & Constraint Capture

**What to ask:**
> "Are there dependencies between requirements, or on something outside this project's control —
> another system, another team, a third party, a regulatory approval?"

Examples: "the payment feature depends on the bank's merchant approval, which is outside our
control and has no fixed timeline" / "the reporting module depends on the legacy data migration
(Transition Requirement TR-03) completing first" / "the mobile app depends on the backend API
team shipping the v2 auth endpoint."

This is distinct from Q0j (project-level constraints/assumptions from Phase 0) and from the
architecture-level dependencies surfaced later in Phase 3 — this is specifically *requirement-to-
requirement* and *requirement-to-external-party* dependency, captured while the requirement is
still fresh, before it gets buried in a feature list.

**What goes in `TRACEABILITY-MATRIX.md`:** A Dependencies column per requirement row, and a short
"blocking chain" note for any requirement with more than one upstream dependency.

---

## QR6 — Draft Acceptance Criteria (Shift-Left)

**What to ask:**
> "For each must-have requirement, what would prove it's actually done? Try to phrase it as
> Given / When / Then."

This deliberately pulls acceptance-criteria drafting *forward*, into requirement gathering,
instead of leaving it until sprint grooming (the traditional point, and the point the original
On-Going Project playbook this skill was checked against also places it). Waiting until grooming
to write AC means the requirement has already been "final" for weeks by the time someone asks
"wait, how would we actually test this?" — often revealing the requirement was ambiguous all
along.

Example:
> **Requirement:** User can reset password via email link.
> **Draft AC:** Given a registered user requests a password reset, when they submit a valid
> email, then a reset link is sent within 60 seconds and expires after 24 hours.

This is a *draft*, not a final test case — QA will still refine it at grooming (Development
stage). The point is catching ambiguity two weeks earlier, when the cost of a clarifying question
is one Slack message instead of a mid-sprint scope argument.

**Solo projects:** Still worth doing — write the AC as if a QA hat is on, even briefly. It's the
cheapest way to catch "I actually don't know when this feature would count as working."

**What goes in `FSD.md` §3 and eventually `USER-STORIES.md`:** Draft AC attached to each
functional requirement, explicitly marked "draft — refine at grooming."

---

## QR7 — Verification & Validation Checklist

**What to ask (run this against every must-have requirement, not just once for the whole set):**
> "Is this requirement consistent, measurable, realistic, and relevant?"

- **Consistent** — does it contradict another requirement already captured? (Classic clash:
  "system must work fully offline" + "system must show real-time inventory across branches.")
- **Measurable / testable** — can someone unambiguously say yes or no once it's built? ("the app
  should feel fast" fails this; "checkout completes in <2s at p95" passes)
- **Realistic** — is it achievable within the stated constraints (budget, timeline, team, tech)?
  Flag anything that isn't — don't silently accept it and let Phase 2/3 discover the conflict.
- **Relevant** — does it actually serve the business objective from Q0a/Q0b, or has scope drifted
  toward a feature that's interesting but not needed?

**Any requirement that fails a check gets flagged back to its source (from QR2) for
clarification** — it does not get quietly rewritten by the agent to sound more finished than it
is. A requirement the agent "cleaned up" without the source's input is a guess wearing a
requirement's clothes.

**What goes in `FSD.md` §6:** A short verification log — which requirements were flagged, what
the resolution was.

---

## QR8 — Requirement Sign-off

**What to ask:**
> "How will the requirement document (FSD/PRD) be approved before development starts, and by
> whom?"

Options:
- **Formal sign-off** — named key user(s) + client PIC approve a specific version (digital
  signature, email confirmation, or signed minutes) — standard for client-facing/enterprise work
- **Product Owner approval** — internal PO approves before dev starts (internal/product teams)
- **Steering committee review** — for large programs with multiple workstreams
- **Self-approval** — for solo projects: the founder reviews their own FSD once, dates it, and
  treats that date as the baseline — informal, but still a deliberate checkpoint rather than
  requirements drifting continuously with no fixed point of reference

**Why a fixed baseline matters even solo:** Without a dated sign-off — even a self-sign-off —
there's no way to distinguish "the original plan" from "what I've drifted into building," which
makes it impossible to notice scope creep in your own project.

**What goes in `REQUIREMENTS-SIGNOFF.md`:** Version number, date, who approved, what was approved
(reference to FSD version), and a re-sign-off row for every subsequent material change (ties into
`docs/pm/CHANGE-LOG.md`'s change-control process from `PM_FUNDAMENTALS_GUIDE.md`).

---

## PRD vs FSD — they are not the same document

This confusion is common enough to call out explicitly (it's the sibling of Phase 0's "PRD ≠
Charter" pitfall):

| | `docs/planning/PRD.md` | `docs/planning/FSD.md` |
|---|---|---|
| Audience | Product/business stakeholders, dev team (context) | Developers, QA, system analysts (implementation) |
| Answers | *What are we building and why?* | *Exactly how must the system behave?* |
| Contains | Problem, users, must-have features, success criteria | Business rules per module, functional flows, exception handling, requirement classification, draft AC |
| Source | Phase 1b (Q1–Q10) | Phase 1a (QR1–QR8) |
| Granularity | Feature-level | Rule/behavior-level |

Don't merge them into one file. A developer implementing an edge case needs the FSD's business
rules; a stakeholder confirming direction needs the PRD's feature list — mixing them makes both
audiences wade through content meant for the other.

---

## Don't over-formalize a solo project

Same principle as `PRE_PROJECT_GUIDE.md`'s equivalent section — scale the artifacts, not the
discipline:

| Project type | Elicitation | Classification | Scope statement | Sign-off |
|---|---|---|---|---|
| Solo personal project | Self-elicitation, one sitting | Quick tags, no formal table | One paragraph, in your own words | Self-dated review |
| Internal tool | Interview 2–3 users + doc review | Table, informal | Half page | PO/manager confirms |
| Client project (<$50K) | Interview + workshop | Full table per requirement | Full `SCOPE-STATEMENT.md` | Client PIC + key user sign-off |
| Enterprise program | Multiple techniques, phased | Full table, linked to `TRACEABILITY-MATRIX.md` | Full document, per-module | Steering committee sign-off |

A one-paragraph `SCOPE-STATEMENT.md` that honestly says "solo project, scope is whatever I decide,
revisited monthly" is more useful than a fabricated multi-page document with invented
stakeholders.

---

## Output files and what goes in each

| File | Triggered by | Content |
|---|---|---|
| `docs/planning/FSD.md` | QR1–QR3, QR6, QR7 | Elicitation notes, requirements grouped by type (Business/Stakeholder/Functional/Non-Functional/Transition), business rules, draft acceptance criteria, verification log |
| `docs/planning/SCOPE-STATEMENT.md` | QR4 | In-scope, out-of-scope, boundary statement, per module |
| `docs/planning/TRACEABILITY-MATRIX.md` | QR2, QR3, QR5 | ID / Requirement / Source / Type / Priority (MoSCoW) / Dependencies / Related User Story / Test Case ID / Status |
| `docs/planning/REQUIREMENTS-SIGNOFF.md` | QR8 | Version, date, approver(s), scope of approval, re-approval log |

All four files are always generated. For solo/personal projects, reduce each to the shortest
honest version in the table above rather than skipping them — skipping Phase 1a reproduces the
exact "PRD does five jobs at once" problem this guide exists to fix.

---

**Version:** 1.0.0
**Part of:** Phase 1a (Requirement Gathering & Elicitation)
**Pairs with:** `PRE_PROJECT_GUIDE.md` (Phase 0 — before this), Phase 1b's Q1–Q10 (after this)
