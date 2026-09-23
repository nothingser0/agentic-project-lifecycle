# Module 00 — Classifier

**This is the only place where complexity tiers are defined.** The other modules do not redefine them — they only refer to the tiers already defined here.

Run this classifier every time:

- A new session is started
- There is a significant scope addition
- The user is unsure whether planning is needed or to directly build

---

## Step 1 — Check existing state

Before asking anything, check if there is:

1. `CONTEXT.md` in the project folder → read `complexity_tier` and `lifecycle_phase` → skip to Step 3
2. Brief file `idea-[slug].md` from ideation → read field `Complexity read` → skip to Step 3
3. Lifecycle docs (`docs/pm/OVERVIEW.md` or `ARCHITECTURE.md`) → tier already set from planning → skip to Step 3

If none of them exist → proceed to Step 2.

---

## Step 2 — Ask minimum for classification

Ask one question:

> "Tell me briefly: this project is for whom, what are the main features, and is there any other user besides yourself?"

**Regulated-data follow-up (always ask, even for a small-sounding project):**

> "Will this handle health records, payment/financial data, government data, or anyone else's personal data under a legal/contractual obligation (e.g. HIPAA, PCI-DSS, GDPR, a client contract with a compliance clause)?"

A "yes" here is a **product criterion**, not a team-size criterion — see the tier table below. Team size never overrides it. Do not skip this follow-up because the project "sounds small" (e.g. "just a booking tool for my clinic," "an app for my accountant") — those are exactly the cases the follow-up exists to catch, and the classifier's normal single-question flow (Step 2's first question) will not surface them on its own.

**Borderline cases — how to judge when the user's answer isn't a clean yes/no:**

| Situation | Verdict | Why |
|---|---|---|
| Email marketing list (name + email only, no health/financial/government data) | **No** (unless GDPR/CCPA applies due to EU/CA users — ask "do you have users in the EU or California?" if unsure) | Personal data exists but carries no domain-specific compliance regime by default |
| Healthcare appointment scheduling or clinic intake (patient name + doctor/clinic/date, even without clinical notes or EHR records) | **Yes** (HIPAA / health data override) | Under HIPAA and international health privacy laws, linking an identifiable individual to a healthcare provider, specialty, or clinic appointment is legally Protected Health Information (PHI). Scheduling cannot be downgraded to non-regulated. |
| Site analytics / browsing history tied to a user ID | **No** by default, **Yes** if the product's own privacy policy or a client contract commits to a specific data-protection standard | The data type alone doesn't trigger regulation; a stated obligation does |
| Internal HR system storing employee salary/SSN/tax ID | **Yes** | Employee PII with financial/government identifiers is regulated data even for an internal, non-client-facing tool |
| A freelancer's own invoicing tool storing their clients' payment details | **Yes** if card/bank details are stored directly; **No** if payment is fully delegated to a processor (Stripe, PayPal) and never touches this system's database | The determining fact is whether *this system* handles/stores the regulated data, not just facilitates a transaction |
| Early-stage MVP, prototype, or "proof-of-concept" handling healthcare, patient, or financial entities ("we'll add compliance later") | **Yes** (Compliance override applies immediately) | Prototype status never exempts a project from compliance classification if schemas or data pipelines touch regulated data. Deferring compliance until post-build creates untracked liability. Lean teams must use the **Regulated MVP Fast-Track Profile** (Step 3), not downgrade to Small/Medium or skip planning. |
| Non-healthcare product saying "We might add health/regulated data later, not now" (e.g. general calendar tool considering healthcare clients in v2) | **No** for the current build, but record `regulated_data_planned: true` in `CONTEXT.md` and re-ask this question at the Step 8 scope re-check trigger for new entities | Don't pre-classify for a feature that doesn't exist yet — but don't lose the fact that it was flagged |

If a case genuinely doesn't match any row above, default to asking the user directly whether a named regulation, audit, or contract clause applies — do not guess silently in either direction.

From both answers, classify based on the table below. Do not ask more than these two questions at this stage — if still ambiguous, round up to the next tier.

---

## Complexity Tier — Single Source of Truth

**How to read this table — product criteria decide the tier; team size is a secondary signal, not a requirement.** Every tier from Medium up is defined as "**one of** the listed product criteria." If the product criteria alone match a tier, assign that tier even if the team is smaller than the tier's typical team-size range — team size never downgrades a tier that the product criteria already earned. Team size can only ever push you *up* (see anti-downgrade rules), never pull you down.

| Tier | Product criteria (any ONE is sufficient) | Typical team (informational only — does not gate the tier) | Example |
|------|------------------|------|---------|
| **Small** | 1 user-visible feature, 1 entity, no auth, no external service, no deploy, single-script file ETL | Solo, personal | CLI tool, automation script, personal widget |
| **Medium** | One of: 3+ features, 2+ related entities, has auth, has external call, has deploy target, has export/reporting, multi-table batch ETL or API ingestion | 1–5 people | Internal SaaS, booking system, scheduled data pipeline |
| **Large** | One of: multi-role auth, payments, **regulated data** (see Step 2 follow-up), public API contract, concurrent multi-user, analytical data warehouse, custom ML model integration | 5–20 people | Public platform, marketplace, AI analytics platform |
| **Enterprise** | One of: 21+ devs, **formal compliance obligation** (healthcare/fintech/gov — HIPAA, PCI-DSS, SOC 2, government data-handling requirement), **safety-critical / embedded / medical device / robotics systems** (life-safety hazard analysis required), contract SLA, multi-team delivery, client-facing contract, distributed data platform / critical AI pipeline | 20+ people | Core banking, hospital system, enterprise ML platform, medical device controller |

**Data & ML Engineering Deliverable Profile:**
If the primary deliverable is a Data Pipeline / Analytical Store / ML Model (rather than a CRUD web app), the product criteria apply identically: single-script file ETL is Small; multi-table batch ETL or API ingestion is Medium (`references/data/DATA_PIPELINE_GUIDE.md`); analytical warehouse with dbt quality gates or custom ML eval harness is Large (`references/ai/MODEL_EVALUATION_GUIDE.md`). Record `deliverable_type: [web_app | api_service | data_pipeline | ml_model]` in `CONTEXT.md`.

**Regulated-data, Safety-critical & Compliance override (reads together with Step 2's follow-up question):**
- Domain criteria take absolute precedence over delivery format: a single-script file or CLI script that touches health records or financial entities is Large or Enterprise, never Small.
- Any software controlling physical hardware, medical devices, robotics, or life-safety critical operations is strictly **Enterprise** regardless of team size.
- Any "yes" to the Step 2 regulated-data follow-up means the product criteria for **at least Large** are already met ("regulated data"), regardless of team size — a solo developer building a HIPAA-scoped clinic tool is Large, not Small/Medium.
- If the regulated data carries a **formal compliance obligation** (a named regulation, an audit requirement, or a contractual compliance clause — not just "this data is sensitive"), the product criteria for **Enterprise** are met ("compliance (healthcare/fintech/gov)"), regardless of team size — a 2-person team building a HIPAA-audited system is Enterprise for gating purposes (Full planning mode, all compliance/security gates), even though the "20+ people" team example does not apply to them.
- **Regulated Data Planning Policy:** Any project assigned Large or Enterprise due to regulated data, statutory compliance, or safety-critical scope (`tier_basis: compliance_override` or handling PHI/PII/PCI) **cannot skip planning**. The skip policy in `engine/PROJECT-PROFILE.md` is strictly `block until complete` for all regulated data workloads.
- Record which override applied in `CONTEXT.md` as `tier_basis: [team_size | product_criteria | compliance_override]` (see Step 7) so later sessions know *why* the tier was assigned, not just what it is.

**Anti-downgrade rules — cannot downgrade tier due to implementation choice:**
- localStorage, JSON file, in-memory state → still counted according to feature count
- Mock external service → still counted as external service
- "Later deploy not yet now" → if it is planned to deploy, still Medium+
- If on the border between two tiers → **always round up**
- **Catch-all:** the four rules above are named examples, not an exhaustive list. The general principle they all express is: **classify by what the product criteria describe once built, not by the specific technology or wording used to describe it now.** If a description substitutes a lightweight implementation detail for a tier-defining product criterion (e.g. "it just checks a hardcoded password" instead of "has auth," "it calls a webhook" instead of "has an external call," "there's a spreadsheet of who can see what" instead of "multi-role auth"), classify by the underlying criterion the implementation detail is standing in for, not by the softer-sounding phrasing. When in doubt whether a description is minimizing a real criterion, ask directly rather than classify down: "does this feature let more than one type of user do different things?" resolves an auth-tier question faster than trying to infer it from vague language.

**Periodic tier-sanity check — independent of user-initiated disputes:**
At every gate transition (not only at the Step 8 re-check triggers, and not only when the user raises a `tier_dispute`), briefly re-confirm that the current scope still matches the tier recorded in `CONTEXT.md`: does the project, as it stands right now, still satisfy only the recorded tier's product criteria and none of the next tier's? This is a silent check — it does not require asking the user anything when the answer is clearly "still consistent," and should not be turned into a repeated interruption. Record it only when it changes something: if the check finds the scope has quietly grown past the recorded tier without a `scope_recheck` trigger having fired (Step 8) and without the user ever raising a dispute, treat this as a **missed re-check**, not a dispute, and record it as `tier_drift_detected: { date, tier_before, tier_after, evidence }` in `CONTEXT.md`, then run Step 8's re-check flow. This closes the gap where a project under-classifies not because anyone disputed the tier, but because nobody — including the classifier itself — noticed the scope had already outgrown it.

**Tier disputes:** If the user insists on a lower tier than the product criteria indicate (e.g., "it's just a small tool" for a project that handles regulated data), do not silently comply and do not silently override them. State the specific criterion that triggered the higher tier, explain what that tier unlocks (e.g., "Enterprise tier requires the compliance gate — without it, this project has no documented HIPAA safeguards"), and record the outcome in `CONTEXT.md` as `tier_dispute: { requested_tier: [tier], assigned_tier: [tier], resolution: [user_overrode | classifier_tier_kept], reason: [one line] }`. If the user overrides after being told what it unlocks, respect their decision but keep the record — this is a disclosed risk, not a silent gap.

**Downstream visibility — this is not just a classifier-internal note.** Any module or gate that reads `complexity_tier` from `CONTEXT.md` (planning, build, closure, and every quality gate in SKILL.md's cross-phase rules) must also check for a `tier_dispute` block before treating the tier as settled. If `resolution: user_overrode` is present, the module must re-surface the specific disclosed risk at the next relevant gate rather than assuming it was handled once and can be forgotten — e.g. `04-closure.md` must mention an unresolved `tier_dispute` in the closure report rather than closing silently on a tier the user talked down from its product-criteria-indicated level.

---

## Step 3 — Determine planning mode

Planning mode is only relevant if tier is Medium or above (used in `02-planning-router.md`).

**Planning skip policy is defined in `engine/PROJECT-PROFILE.md`. Reference that file for canonical behavior.**

| Tier | Default planning mode | Phase executed |
|------|------------------------|----------------|
| Small | n/a (always skip planning) | Directly to BUILD |
| Medium | **Lightweight** | Short Phase 0 + Phase 1a + Phase 2a + Phase 3 (Tech Stack) + Phase 6 (Build Setup) |
| Large | **Standard** | Phase 0 → 1a → 1 → 2 → 2a → 3 → 5 (relevant probe) → 6 |
| Enterprise | **Full** | All phases, all gates, all capability folders |

**Regulated MVP Fast-Track Profile (Startups & Rapid Delivery):**
If a project is classified as Enterprise *solely* due to a statutory compliance override (e.g. HIPAA patient data, PCI payment flow) by a lean team (≤10 people) launching an MVP in <8 weeks:
- The team may select **Standard (Regulated-MVP)** planning mode instead of 100+ document Full Enterprise planning.
- **Non-negotiable compliance floor preserved:** All Phase 5 Security (Q34–Q39b) and Compliance (COMP1–COMP2) deep-dives, encryption, audit logging, BAA tracking, and ownership negative tests remain **blocking**.
- **Pruned overhead:** Multi-team corporate governance (enterprise RACI, departmental budget tracking, steering committee agendas) is reduced to startup equivalents (`STAKEHOLDERS.md`, single-tier charter).
- Record in `CONTEXT.md`: `planning_mode: Standard`, `regulated_mvp_track: true`.

**Scope vs. Timeline Feasibility Guardrail:**
If a project is assigned Large or Enterprise, has a team size $\le 6$ developers, and a requested timeline $<8$ weeks (e.g. "6-week MVP for healthcare app"):
- The agent **must proactively surface the feasibility conflict** before starting planning:
  > *"Notice: You have requested an MVP in [X] weeks that qualifies as [Large/Enterprise] due to [regulated data/compliance/scale]. Full enterprise scope cannot be delivered in this timeframe without severe compromise. We must select one trade-off: (1) Use the Regulated MVP Fast-Track Profile to preserve security/compliance gates while pruning governance, (2) Cut scope to non-regulated mock data for v1, or (3) Extend the target delivery timeline."*

User can request upgrade mode (e.g. Medium but wants Full planning) — record as `planning_mode_override: user_requested`.

---

## Step 4 — Determine active phase and modules to read

After tier and mode are known:

| Condition | Active phase | Next module to read |
|-----------|--------------|---------------------|
| Idea not yet named | IDEATION | `01-ideation.md` |
| Idea exists, Small | BUILD | `03-build-router.md` (skip planning per PROJECT-PROFILE.md) |
| Idea exists, Medium+ without user preference | PLANNING | `02-planning-router.md` (default, but user can skip per PROJECT-PROFILE.md) |
| Planning complete (Gate D passed) | BUILD | `03-build-router.md` |
| Build complete (UAT passed) | CLOSURE | `04-closure.md` |

---

## Step 5 — Infra check (if user has existing infra)

Before writing to CONTEXT.md, ask **one question** if detected that user has pipeline or existing infra:

> "Is this extending an existing pipeline/workspace, or a new project that stands alone?"

If extending:
- Ask: which pipeline is being extended?
- Ask: resource check — approximately how much additional RAM and CPU? (for self-hosted infra)
- Record in `infra_context` in CONTEXT.md

If new and standalone: skip, proceed to Step 6.

Do not ask this if context is clear from conversation (user said "build tool new from scratch").

---

## Step 6 — Multi-agent check

Ask **one question** if unclear:

> "Will this be worked on by one agent alone or multiple agents in parallel (e.g. OpenCode + OhmyOpenAgent)?"

If multi-agent:
- Set `multi_agent: true` in CONTEXT.md
- OWNERSHIP.md becomes **REQUIRED** before build starts
- Create `OWNERSHIP.md` now from `templates/dev/OWNERSHIP_TEMPLATE.md` if it does not yet exist — fill in every path the project currently has (even a rough first pass), not a blank template. Default every unlisted path to "unowned = write denied" per SKILL.md Rule 6.

If single agent: set `multi_agent: false`, proceed.

---

## Step 7 — Write to CONTEXT.md

```
lifecycle_phase: [phase from Step 4]
complexity_tier: [tier from Step 3]
tier_basis: [team_size | product_criteria | compliance_override]  # see Complexity Tier table above
planning_mode: [mode from Step 3, or "n/a" if Small]
lifecycle_docs: none
multi_agent: [true | false from Step 6]
handover_formality: [none | email | full | legal]
classifier_source: [new_session | idea_brief | lifecycle_docs | context_file]
last_milestone:
next_action: [concrete instruction — not "lanjut" or "continue"]

# Optional — only if the user disputed the assigned tier (see Tier disputes above)
# tier_dispute:
#   requested_tier: [tier the user wanted]
#   assigned_tier: [tier actually assigned]
#   resolution: [user_overrode | classifier_tier_kept]
#   reason: [one line — what was disclosed to the user before resolving]
```

**`next_action` self-check — run this before writing the field, do not skip it:**
1. Does it start with an action verb (Write, Run, Implement, Fix, Ask, Create — not "Continue" or "Proceed")?
2. Does it name a concrete object (a specific file path, function, endpoint, or question to ask — not "the feature" or "the next part")?
3. Could a different agent, with no memory of this session, execute it correctly on the first try?

If any answer is "no," rewrite the instruction before saving — do not save a `next_action` that fails this check, even under time pressure. Example: ❌ "Continue building the auth flow" → ✅ "Implement `POST /api/auth/login` in `app/api/auth/login/route.ts` per the contract in `docs/pm/FSD.md#auth`; tests for it do not exist yet."

After writing CONTEXT.md, scaffold the rest of the tier's required files directly — see SKILL.md's "Scaffolding a project (markdown-only — no scripts required)" for the full procedure. In short:

1. Open `references/pm/QUICKSTART_BY_TIER.md`, find the required-file list for `[tier]` and `[lifecycle_phase]`.
2. For each required file not already present, copy the matching template from `templates/` into the project and fill it in — do not leave placeholder text.
3. `CONTEXT.md` is already written in this step and is never overwritten by this process — if it already exists, leave it exactly as this classifier wrote it and only create the *other* required files.

This is a manual, markdown-only process by design (this skill ships no executable scripts) — it always produces the full tier-appropriate file set and never silently fails the way a missing or unresolvable script path would, and it works identically regardless of the agent, OS, or tool invoking this skill.

---

## Step 8 — Scope re-check triggers

Re-run this classifier (starting from Step 1) whenever **any** of the following happens mid-project — do not wait for the user to ask "should we re-check the tier":

- A new external service/integration is added that wasn't in the original brief (payment processor, third-party auth, external API).
- A new user role or auth requirement is added (e.g. "actually we also need an admin view").
- A new entity/data model is added that stores personal, financial, or health data not covered by the original regulated-data answer.
- The team size doubles, or a contractor/external vendor joins the project.
- A deploy target is added where none existed, or the deploy target changes from internal-only to public-facing.
- The user says a phrase that implies scope growth ("while we're at it," "can we also," "one more thing") attached to a feature, not a bug fix.

Record every re-check in `CONTEXT.md` as a `scope_recheck` entry (`date`, `trigger`, `tier_before`, `tier_after`) even when the tier doesn't change — a re-check that confirms "still Medium" is still evidence the check happened, and the next session needs to see that the trigger was caught rather than missed.

Then load the relevant module and continue.
