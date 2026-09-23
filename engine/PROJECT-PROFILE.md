# Project Profile — Single Source of Truth

This file is the canonical machine-readable policy for tier-specific scaffold and validation behavior.
Other documents may explain the policy, but must not redefine it differently.

## Tier matrix

| Tier | Planning mode | Planning skip policy | Core scaffold | Multi-agent | Contracts | Formal closure default |
|---|---|---:|---|---|---|---|
| Small | n/a | always (no planning phase) | CONTEXT, VERIFY, README, .gitignore | if multi_agent: true (requires root OWNERSHIP.md) | no | none |
| Medium | Lightweight | ask-once with warning | Small + AGENTS, TASKS, ARCHITECTURE, CONTEXT-MAP, .env.example | if multi_agent: true (requires root OWNERSHIP.md) | no | email |
| Large | Standard | ask-twice with risk confirmation | Medium + OWNERSHIP, contracts/, ADR directory | supported (requires root OWNERSHIP.md) | yes | full |
| Enterprise | Full (or Standard if Regulated-MVP) | block until complete | Large + formal PM/compliance artifacts during planning/closure | supported (requires root OWNERSHIP.md) | yes | legal |

## Planning skip policy (canonical)

**This is the single source of truth for planning skip behavior. All modules reference this policy.**

| Tier | Policy | Behavior when `lifecycle_docs: none` |
|---|---|---|
| Small | Always skip | Proceed directly to BUILD phase with Rule 0. No prompt. |
| Medium | Ask-once with warning | Prompt: *"This is Medium tier — planning (scope + architecture baseline) is recommended. Continue to planning, or skip and build directly?"* <br> If skip: record `lifecycle_skipped: user_decision` in CONTEXT.md, then proceed to BUILD. <br> If plan: proceed to PLANNING phase. |
| Large | Ask-twice with risk confirmation (or Block if Regulated) | **If handling regulated data (`tier_basis: compliance_override` or `regulated_data: true`): Block until complete. No skip option.** <br> Otherwise: Prompt 1: *"This is Large tier (multi-team/contract scope) — skipping planning creates extreme risk of cross-system interface breakage, contract violations, and architecture rework. Continue to planning (recommended), or request skip?"* <br> If user requests skip, Prompt 2: *"Skipping Large planning bypasses the contract and architecture baseline. Please confirm: 'I accept the risk of architecture rework and scope drift' to proceed to BUILD."* <br> If confirmed: record `lifecycle_skipped: user_decision` + `skip_acknowledged_risk: confirmed_architecture_rework_scope_drift` in CONTEXT.md. |
| Enterprise | Block until complete | Do not ask. State: *"Enterprise tier requires planning (governance + compliance artifacts). Proceeding to PLANNING phase."* No skip option. |

## Canonical lifecycle phases

`IDEATION`, `PLANNING`, `BUILD`, `MAINTAIN`, `CLOSURE`, `CLOSED`

`NEW` may be used conceptually in diagrams but is not a valid `lifecycle_phase` value in CONTEXT.md.

## Closure evidence

The closure formality is recorded in CONTEXT.md as:

```text
handover_formality: none | email | full | legal
```

Required closure evidence:

| Formality | Required evidence in CONTEXT.md |
|---|---|
| none | `closure_date`, `access_revoked: true` |
| email | `closure_date`, `handover_confirmed_by`, `access_revoked: true` |
| full | `closure_date`, `bast_signed_by`, `access_revoked: true` |
| legal | `closure_date`, `bast_signed_by`, `legal_reviewed_by` (or provisional legal waiver per `04-closure.md`), `access_revoked: true` |

The validator must never require `bast_signed_by` for `none` or `email`.

## Core build artifacts

For `BUILD`, `MAINTAIN`, or `CLOSURE`:

- All tiers: `CONTEXT.md`, `VERIFY.md`, `README.md`.
- Medium+: `AGENTS.md`, `TASKS.md`, `ARCHITECTURE.md`, `docs/dev-docs/CONTEXT-MAP.md`.
- Any tier with `multi_agent: true`: `OWNERSHIP.md` in root is mandatory per SKILL.md Rule 6 before parallel writes start.
- Large+: `OWNERSHIP.md`, contracts/, and ADR directories are scaffolded for those tiers.

## Consistency rule

If another document conflicts with this matrix, update that document rather than introducing a second tier policy.
