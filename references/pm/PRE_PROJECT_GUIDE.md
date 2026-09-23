# Pre-Project Guide — Pra Proyek (Initiation & Planning)

**Purpose:** Turn Phase 0 answers (Q0a–Q0j) into real, enterprise-grade initiation artifacts:
`docs/pm/BUSINESS-CASE.md`, `docs/pm/PROJECT-CHARTER.md`, `docs/pm/STAKEHOLDERS.md`,
`docs/pm/LEGAL-REGISTER.md`, and `docs/pm/KICKOFF-AGENDA.md` — instead of generic boilerplate.

Read this when: Phase 0 questions come up, or when generating any file under `docs/pm/` for
the initiation phase. This guide is distinct from `PM_FUNDAMENTALS_GUIDE.md`, which covers
the planning sub-phases (risks, communication cadence, change control). This guide covers
everything that happens *before* planning starts.

---

## Contents

- [Why a Phase 0 exists](#why-a-phase-0-exists)
- [How Phase 0 maps to PMBOK/PRINCE2 Initiation](#how-phase-0-maps-to-pmbokprince2-initiation)
- [Gate 0: Business Case approved](#gate-0-business-case-approved)
- [Gate 1: Legal sign-off](#gate-1-legal-sign-off)
- [Gate 2: Charter signed → Kick-off cleared](#gate-2-charter-signed--kick-off-cleared)
- [Q0a — Business Case & Feasibility](#q0a--business-case--feasibility)
- [Q0b — Strategic Alignment](#q0b--strategic-alignment)
- [Q0c — Project Sponsor & Authority](#q0c--project-sponsor--authority)
- [Q0d — Stakeholder Register](#q0d--stakeholder-register)
- [Q0e — Legal & Contract Type](#q0e--legal--contract-type)
- [Q0f — Project Charter Sign-off](#q0f--project-charter-sign-off)
- [Q0g — Kick-off Meeting Format](#q0g--kick-off-meeting-format)
- [Q0h — Definition of Done (Business Level)](#q0h--definition-of-done-business-level)
- [Q0i — Go/No-Go Criteria](#q0i--gono-go-criteria)
- [Q0j — Project Constraints & Assumptions](#q0j--project-constraints--assumptions)
- [Don't over-formalize a solo or internal project](#dont-over-formalize-a-solo-or-internal-project)
- [Output files and what goes in each](#output-files-and-what-goes-in-each)

---

## Why a Phase 0 exists

Previously, the skill started at Phase 1 (Discovery) — it asked about features, users, and tech stack
before ever asking whether the project was actually approved, who owned the budget, or whether a
legal agreement existed. That meant a PM could generate 100+ planning files for a project that
hadn't been authorized yet, or for a client project with no signed contract.

Phase 0 fixes this by front-loading the four questions every enterprise PM must answer before
planning starts:

1. **Is there a business case?** (Why are we doing this, and is it worth it?)
2. **Who has authority?** (Who can approve scope changes, kill the project, or sign the contract?)
3. **Is the legal paperwork signed?** (No planning work should start before Gate 1.)
4. **Has everyone who needs to be in the room been identified?** (Stakeholders, not just users.)

If the project is internal/solo, most of these collapse to "it's just me" — the guide handles that
explicitly so the files stay honest rather than padding with fake RACI matrices.

---

## How Phase 0 maps to PMBOK/PRINCE2 Initiation

| Standard artifact       | PMBOK process group | Where produced                    |
|-------------------------|---------------------|-------------------------------------|
| Business Case           | Initiating          | `docs/pm/BUSINESS-CASE.md` (Q0a–b) |
| Project Charter         | Initiating          | `docs/pm/PROJECT-CHARTER.md` (Q0c, Q0f–h) |
| Stakeholder Register    | Initiating          | `docs/pm/STAKEHOLDERS.md` (Q0d)    |
| Legal / Contract log    | Initiating          | `docs/pm/LEGAL-REGISTER.md` (Q0e)  |
| Kick-off MoM template   | Planning (start)    | `docs/pm/KICKOFF-AGENDA.md` (Q0g)  |

PRINCE2 equivalent: Starting Up a Project (SU) + Initiating a Project (IP) stages.
ISO 21500 equivalent: Initiating process group (processes 4.3.2–4.3.4).

---

## Gate 0: Business Case approved

**Trigger:** After Q0a–b answers are collected.
**Blocker:** Do not proceed to Phase 1 (Discovery) until Gate 0 passes.

Gate 0 checklist (agent verifies, asks user to confirm each):
- [ ] Business case has been articulated (problem, expected benefit, rough ROI or strategic value)
- [ ] Budget source is identified (even if amount is TBD)
- [ ] At least one sponsor or approver has been named
- [ ] Go/No-Go criteria are defined (what would make this project not worth starting)

**If Gate 0 fails:** The agent should surface the gap explicitly. Example:
> "Before we plan the technical details, the business case needs a named sponsor and at least one
> success metric. Without these, the charter can't be signed and planning is premature. Want me to
> help draft a one-page business case you can take to your sponsor?"

**Solo/internal exception:** If Q0c = "I am the sponsor" and Q12 = Solo, Gate 0 collapses to:
confirm the user has made a conscious decision to start (vs. starting out of habit), and record it
in `BUSINESS-CASE.md` as a one-paragraph rationale. This is still valuable — it gives future-you
a record of why this project was started.

---

## Gate 1: Legal sign-off

**Trigger:** After Q0e answers are collected.
**Blocker:** Do not proceed to Phase 2 (Resources) until Gate 1 passes. This is the hardest gate.

Gate 1 checklist:
- [ ] Contract type has been identified (internal/no contract / NDA / SoW / MSA+SoW / Fixed-price / T&M)
- [ ] For client/external projects: document status confirmed (draft / sent / **signed**)
- [ ] For regulated projects: compliance requirements noted (GDPR data processing agreement, HIPAA BAA, etc.)
- [ ] Both parties have signed (or explicit agreement that work starts at own risk before signature)

**Why this gate is hard:** The most common real-world failure mode is a PM who generates 80 files
of detailed planning and the client never signs, or signs something different. Gate 1 forces an
explicit "yes the legal side is handled" confirmation rather than assuming it.

**Internal projects:** Gate 1 = confirm internal approval exists (email from manager, budget
code issued, internal ticket opened). Write this into `LEGAL-REGISTER.md` as "internal
authorization" rather than leaving the file blank.

---

## Gate 2: Charter signed → Kick-off cleared

**Trigger:** After Q0f answers are collected.
**Blocker:** Kick-off meeting should not happen until the charter is signed by sponsor.

Gate 2 checklist:
- [ ] Project charter drafted and reviewed
- [ ] Sponsor has signed (or confirmed verbal approval for informal projects)
- [ ] Stakeholder list finalized (know who attends kick-off)
- [ ] Kick-off agenda prepared

After Gate 2, Phase 1 Discovery begins and the rest of the interview proceeds normally.

---

## Q0a — Business Case & Feasibility

**What to ask:**
> "Before we get into features and tech stack, let's confirm the business case. What problem does
> this project solve, and why is it worth solving now rather than later?"

Then probe for feasibility dimensions if the project is non-trivial:

- **Technical feasibility:** Is the core technology proven, or is this a bet on something new?
  (An unproven tech stack is a risk to log at Q65d, not a blocker, but name it now.)
- **Financial feasibility:** Is there a rough sense of cost vs. expected benefit? For commercial
  projects, a back-of-envelope ROI beats no ROI. For internal tools, "saves N hours/week" is
  enough.
- **Operational feasibility:** Does the team exist to build and run this? (Ties to Phase 2 Q12
  team size — but surfacing it early prevents the "we'll figure out the team later" trap.)
- **Scheduling feasibility:** Is the timeline realistic given the scope? (Defer the precise answer
  to Phase 2 Q11, but flag if the user says "we need this in 2 weeks" and Q7 implies 6 months of
  work.)

**What goes in `BUSINESS-CASE.md`:**
- Problem statement (1–3 sentences: who has the problem, what is it, what does it cost them now)
- Proposed solution (what this project will do, at a high level)
- Expected benefit (quantified where possible: revenue, cost saving, time saving, risk reduction)
- Rough cost (budget range from Q15 + team cost estimate from Q12)
- Strategic alignment (Q0b)
- Go/No-Go criteria (Q0i)
- Sponsor sign-off line

Do NOT generate `BUSINESS-CASE.md` with placeholder values like "[Expected ROI: TBD]" — that is
worse than a short honest document. If the user hasn't thought through the ROI, help them derive
a rough estimate from first principles, or write "ROI not quantified; project approved on
strategic grounds" and move on.

---

## Q0b — Strategic Alignment

**What to ask:**
> "Which company/personal goal does this project directly support? E.g. 'reduce customer churn',
> 'enter the SMB market', 'replace the legacy billing system', or 'personal learning project'."

**Why this matters:** A project that can't be linked to a strategic goal is at high risk of being
deprioritized or cancelled mid-build. Capturing alignment now also makes the project charter
stronger — sponsors approve work more readily when they can see it connects to their OKRs.

**Acceptable answers for solo/personal projects:** "Learning project — deepen TypeScript skills"
or "Side project — validate market hypothesis" are legitimate strategic goals. Write them honestly.

---

## Q0c — Project Sponsor & Authority

**What to ask:**
> "Who is the project sponsor — the person with budget authority and the ability to make final
> decisions on scope, timeline, and staffing?"

Then clarify decision rights:

- **Who can approve scope changes?** (This person's name goes in the charter and feeds Q65g.)
- **Who can stop the project?** (Escalation path for blockers.)
- **For client work:** Who on the client side has sign-off authority? (Not just the day-to-day
  contact, but the actual decision-maker.)

**What goes in `PROJECT-CHARTER.md`:**
- Sponsor name and role
- Decision authority matrix (what they can approve vs. what escalates)
- PM name and responsibilities
- Project authority statement ("The PM is authorized to…")

**Solo projects:** "I am the sponsor and the PM" is a valid answer. Write it in one line. Don't
generate a fake authority matrix.

---

## Q0d — Stakeholder Register

**What to ask:**
> "Beyond your end users, who else has a stake in this project's success or failure?"

Use these prompt categories to help the user think beyond the obvious:

- **Internal stakeholders:** Which other teams will be affected? (Support will get tickets,
  finance will track budget, legal may need to review data handling, sales may need to demo it.)
- **External stakeholders:** Client, regulator, integration partner, vendor.
- **Hidden stakeholders:** People who will be impacted but aren't in the room. (The warehouse
  team whose process is being automated. The customer support team whose manual workaround
  disappears when this ships.)

For each stakeholder, capture:
1. Name / role
2. Interest (what do they care about regarding this project?)
3. Influence (high / medium / low — their ability to affect the project's direction)
4. Power (high / medium / low — their formal authority over the project)
5. Required involvement (RACI: Responsible / Accountable / Consulted / Informed)
6. Communication preference (feeds Q65f)

**Power/Interest grid (enterprise standard):**
Plot each stakeholder on a 2×2:

```
High power  │ Manage closely  │  Keep satisfied
            │ (key players)   │  (meet their needs)
────────────┼─────────────────┼──────────────────
Low power   │ Monitor         │  Keep informed
            │ (low priority)  │  (show progress)
            └─────────────────┴──────────────────
              Low interest       High interest
```

The agent should populate this grid from Q0d answers and write the quadrant assignments into
`docs/pm/STAKEHOLDERS.md`. It's a template, but the names inside it should be real.

**Solo projects:** "No stakeholders beyond myself" is a valid, one-line entry. Do not invent
stakeholders or produce an empty RACI table.

---

## Q0e — Legal & Contract Type

**What to ask:**
> "What is the legal relationship for this project? Choose the closest match:"

Options (filter by whether it's client-facing or internal):

**Client-facing:**
- **NDA only** — early discussion phase, no work started yet
- **Statement of Work (SoW)** — fixed deliverables, fixed price or T&M
- **Master Service Agreement + SoW (MSA+SoW)** — ongoing client relationship with per-project SoWs
- **Fixed-price contract** — price locked at signature; scope changes require formal amendment
- **Time & Materials (T&M)** — billed by hour/day; scope can flex but budget can creep

**Internal:**
- **Internal project approval** — budget code issued, manager approved via email/ticket
- **No formal approval needed** — personal side project or hackathon

**Sub-questions after selection:**
- Q0e-i: Document status? (Not started / Draft in progress / Sent to client / **Signed** ✓)
- Q0e-ii: Any regulated data involved requiring additional agreements?
  (GDPR data processing agreement / HIPAA BAA / PCI-DSS attestation / none)
- Q0e-iii: Intellectual property ownership? (Work-for-hire (client owns) / License model /
  Open source / Retained IP (vendor keeps))

**What goes in `LEGAL-REGISTER.md`:**
- Contract type and reference number (if any)
- Parties (vendor/agency + client, or internal team + sponsor)
- Document status and date signed
- Key terms: payment terms, IP ownership, liability cap, termination clause summary
- Regulated data handling agreements
- Renewal/expiry date if applicable

**Agent behavior:** If Q0e-i ≠ "Signed" and Q0e ≠ "Internal approval" or "No formal approval
needed", surface Gate 1 explicitly:
> "Planning can begin, but the legal agreement should be signed before the client is shown any
> planning documents or before development starts. I'll note this as a Gate 1 blocker in
> `LEGAL-REGISTER.md`."

---

## Q0f — Project Charter Sign-off

**What to ask:**
> "Has the project charter been reviewed and approved by the sponsor? How will sign-off happen?"

Options:
- **Digital signature** (DocuSign, Adobe Sign — recommended for client projects)
- **Email confirmation** (forwarded email with explicit approval — acceptable for most projects)
- **Verbal + documented in MoM** (kick-off meeting minutes as the record — acceptable for internal)
- **Not yet — need to draft the charter first** (agent generates draft, user takes it to sponsor)

**What the agent does:** If the user selects "Not yet", generate a complete
`docs/pm/PROJECT-CHARTER.md` draft from the Phase 0 answers collected so far, with a clear
note that it requires sponsor review before proceeding.

**Charter components (enterprise standard):**
1. Project title, version, date
2. Project purpose / problem statement (from Q0a)
3. High-level scope (what's in, what's explicitly out — scope boundary)
4. Project objectives and success criteria (from Q0h)
5. Deliverables list (high-level, not feature list)
6. Milestones and key dates (high-level, from Phase 2 Q11)
7. Budget authorization (range from Q15)
8. Team and roles (from Q12–13, Phase 2)
9. Sponsor authority and decision rights (from Q0c)
10. Assumptions and constraints (from Q0j)
11. Sign-off block: Sponsor, PM, Client (if external)

---

## Q0g — Kick-off Meeting Format

**What to ask:**
> "How will the kick-off meeting be structured? This sets expectations before development starts."

Options:
- **Async kick-off** — recorded Loom video + shared doc for comments (solo or small team)
- **Internal kick-off only** — team only, client not present (internal projects)
- **Client kick-off** — formal meeting: PM + system analyst + dev lead + client stakeholders
- **Full program kick-off** — multiple workstreams, separate breakout sessions (enterprise/multi-team)

**Sub-questions:**
- Q0g-i: Who attends? (Agent suggests based on Q0d stakeholder list)
- Q0g-ii: Agenda items to include? (Multi-select: charter walkthrough / team introductions /
  scope clarification Q&A / working agreement / tools & communication channels / next steps)
- Q0g-iii: Will a Minutes of Meeting (MoM) be recorded? (Yes / No)

**What goes in `KICKOFF-AGENDA.md`:**

```markdown
# Kick-off Meeting — [Project Name]

**Date:** [TBD]
**Format:** [In-person / Video call / Async]
**Facilitator:** [PM name]
**Attendees:** [List from Q0d stakeholder register]

## Agenda

| Time  | Item                          | Owner  |
|-------|-------------------------------|--------|
| 0:00  | Welcome & introductions       | PM     |
| 0:10  | Project charter walkthrough   | PM     |
| 0:25  | Scope clarification Q&A       | All    |
| 0:45  | Team roles & responsibilities | PM     |
| 0:55  | Tools, channels, cadence      | PM     |
| 1:05  | Working agreements            | All    |
| 1:15  | Next steps & action items     | PM     |
| 1:25  | Q&A open floor                | All    |
| 1:30  | Close                         | PM     |

## Minutes of Meeting

**Decisions made:**
- [Record here during/after meeting]

**Action items:**

| #  | Action           | Owner  | Due date |
|----|------------------|--------|----------|
| 1  | [Action item]    | [Name] | [Date]   |

**Open questions / parking lot:**
- [Items deferred for later]

**Next meeting:** [Date and format]
```

---

## Q0h — Definition of Done (Business Level)

**What to ask:**
> "What does 'this project is done' mean at the business level — not the feature list, but the
> outcome that signals success?"

This is different from Q65e (which captures measurable success criteria in the planning phase).
Q0h captures the *business-level acceptance condition* that the sponsor will sign off on.

Good answers look like:
- "The new billing system is live and processing 100% of transactions without the legacy system"
- "The client has accepted the delivered product and issued final payment"
- "The app is in the App Store and has been used by at least 100 people"
- "I've learned enough about React to build my next project without a tutorial"

Weak answers that need to be pushed past:
- "When all the features are built" — that's a scope statement, not a completion condition
- "When the client is happy" — unmeasurable; push for what "happy" looks like concretely

**What goes in `PROJECT-CHARTER.md`:** The Definition of Done becomes the acceptance criteria
section and is the primary measure in `MILESTONES.md` and (eventually) `RETROSPECTIVE.md`.

---

## Q0i — Go/No-Go Criteria

**What to ask:**
> "What conditions would make you decide NOT to start this project — or to stop it mid-way?"

**Why this matters:** Go/No-Go criteria are the decision framework that prevents sunk-cost
fallacy. If the user can't name conditions under which they'd stop, they have no circuit breaker.

Common Go/No-Go examples:
- **Go trigger:** "Contract signed + budget approved + core team staffed"
- **No-Go trigger (pre-start):** "Client won't sign SoW by [date]" / "Budget cut by >30%"
- **Kill switch (mid-project):** "Core technical assumption disproved in spike" /
  "Key team member leaves with no replacement available" / "Client scope expands >50% without
  budget increase"

**What goes in `BUSINESS-CASE.md`:** Go/No-Go criteria appear as a decision table at the end of
the document. This is the gate the sponsor reviews when approving the business case.

---

## Q0j — Project Constraints & Assumptions

**What to ask:**
> "What is this project explicitly constrained by, and what are you assuming to be true that
> you haven't verified?"

**Constraints** (limits that cannot be changed):
- Fixed deadline ("must launch before [date]")
- Fixed budget ("cannot exceed [amount]")
- Technology mandate ("must use our existing AWS infrastructure")
- Regulatory ("must be GDPR compliant from day one")
- Team ("cannot add headcount — must be done with existing 3 people")

**Assumptions** (things believed to be true but not confirmed):
- "The client's API will be available and documented"
- "The design Figma files will be delivered by Week 2"
- "The existing database schema won't need a breaking migration"
- "The target users have smartphones with iOS 15+"

**What goes in `PROJECT-CHARTER.md`:** Constraints and assumptions have their own section.
This is the most underused part of a charter — surfacing assumptions early is the single best
way to prevent the "but we assumed X" argument later. The agent should push for at least 3
assumptions even if the user initially says "none."

---

## Don't over-formalize a solo or internal project

The most common failure mode for Phase 0 is generating enterprise-weight initiation documents
for a one-person weekend project. Scale the formality to the project:

| Project type          | Gate 0              | Gate 1            | Charter          | Stakeholders     |
|-----------------------|---------------------|-------------------|------------------|------------------|
| Solo personal project | 1-para rationale    | Skip              | 1-page informal  | Just yourself    |
| Internal tool         | Email approval      | Internal ticket   | 1-page + sponsor | Your team + mgr  |
| Client project (<$50K)| Business case doc   | SoW signed        | Full charter     | RACI matrix      |
| Enterprise program    | Full feasibility    | MSA+SoW signed    | Full charter     | Power/interest grid |

The PM_FUNDAMENTALS_GUIDE.md has a similar "don't over-formalize" section for the planning
sub-phases — the same logic applies here. A one-paragraph `BUSINESS-CASE.md` that says "solo
project, no external funding, building to learn Rust" is more useful than a fake ROI spreadsheet.

---

## Output files and what goes in each

| File | Triggered by | Content |
|------|-------------|---------|
| `docs/pm/BUSINESS-CASE.md` | Q0a, Q0b, Q0i | Problem, solution, benefit, cost, strategic alignment, Go/No-Go |
| `docs/pm/PROJECT-CHARTER.md` | Q0c, Q0f, Q0h, Q0j | Authority, scope boundary, DoD, constraints, assumptions, sign-off block |
| `docs/pm/STAKEHOLDERS.md` | Q0d + Q65c | Register with power/interest grid, RACI, communication prefs |
| `docs/pm/LEGAL-REGISTER.md` | Q0e | Contract type, status, parties, key terms, regulated data |
| `docs/pm/KICKOFF-AGENDA.md` | Q0g | Agenda, attendees, MoM template, action items table |

All five files are always generated for non-solo projects. For solo/personal projects, reduce to:
`BUSINESS-CASE.md` (1 para) + `PROJECT-CHARTER.md` (1 page) + skip `LEGAL-REGISTER.md` and
`STAKEHOLDERS.md` or write them in one line each.

---

**Version:** 1.0.0
**Part of:** Phase 0 (Pre-Project / Initiation)
**Pairs with:** `PM_FUNDAMENTALS_GUIDE.md` (Phase 5 planning sub-phases)
