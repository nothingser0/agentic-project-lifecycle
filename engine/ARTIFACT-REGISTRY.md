# Artifact Registry

> Canonical tier/scaffold/closure policy: `engine/PROJECT-PROFILE.md`. This registry defines artifact applicability; it must not contradict the profile.

This registry prevents the interview from producing documents that have no decisions behind them.
Every artifact must have a source phase, owner, and status.

## Tier Scope Rule

- **Tier Small:** Skips planning entirely. Core build artifacts are `CONTEXT.md`, `VERIFY.md`, `.gitignore`, and `README.md`. Closure adds only the evidence required by `handover_formality`.
- **Tier Medium:** Lightweight planning. Core planning artifacts apply.
- **Tier Large:** Standard planning. Multi-agent and contract artifacts apply.
- **Tier Enterprise:** Full governance. All compliance, legal, and formal closure artifacts apply.

## Artifact Status

`REQUIRED` = mandatory for the selected project profile/capability within planning.
`CONDITIONAL` = generated only when the capability is active.
`OPTIONAL` = useful but not mandatory.
`DRAFT` = dependencies not yet resolved.
`FINAL` = all required inputs and gate conditions are met.

## Core mappings (Planning Phases 0–7)

| Artifact | Source | Status rule | Applicable Tiers |
|---|---|---|---|
| BUSINESS-CASE.md | Q0a-b, Q0i | REQUIRED; scale formality | Medium, Large, Enterprise |
| BUDGET.md | Q0i, Phase 0 | REQUIRED for Large, Enterprise; OPTIONAL for Medium | Large, Enterprise |
| STATUS-REPORT.md | Rule 10a, Weekly | REQUIRED weekly during BUILD | Medium, Large, Enterprise |
| PROJECT-CHARTER.md | Q0c, Q0f-h, Q0j | REQUIRED for Enterprise; OPTIONAL for Medium | Large, Enterprise |
| LEGAL-REGISTER.md | Q0e | CONDITIONAL by legal context | Enterprise (or client projects) |
| STAKEHOLDERS.md | Q0d + Q65c | REQUIRED; minimal for solo | Medium, Large, Enterprise |
| PRD.md / FSD.md | QR1-QR7 | REQUIRED for product scope | Medium, Large, Enterprise |
| SCOPE-STATEMENT.md | QR4 | REQUIRED | Medium, Large, Enterprise |
| TRACEABILITY-MATRIX.md | QR2/QR3/QR5 | REQUIRED when requirements exist | Large, Enterprise |
| REQUIREMENTS-SIGNOFF.md | QR8 | REQUIRED; approval state may be pending | Medium, Large, Enterprise |
| TIMELINE.md | QT1-QT8 | REQUIRED | Medium, Large, Enterprise |
| MILESTONE-REGISTER.md | QT3-QT8 | REQUIRED | Medium, Large, Enterprise |
| TECH-STACK.md | Phase 3 | REQUIRED | Medium, Large, Enterprise |
| DESIGN/SYSTEM.md | Phase 4 | CONDITIONAL when design work is needed | All UI projects |
| ARCHITECTURE.md | Phase 3 + QD4 | REQUIRED for agent-ready build | Medium, Large, Enterprise |
| ONBOARDING.md | QD2, Phase 6 | REQUIRED for team handoff / agentic build | Medium, Large, Enterprise |
| OPENAPI.json / API-DOCS | Phase 5 API | REQUIRED for projects with public/consumed APIs | Medium, Large, Enterprise |
| VERIFY.md | QD2 | REQUIRED for all builds | All tiers |
| OWNERSHIP.md | QD5 | REQUIRED if multi_agent: true | Large, Enterprise |
| CONTEXT-MAP.md | QD6 | REQUIRED for agentic build | Medium, Large, Enterprise |
| AGENT-PROMPTS.md | QD5 | CONDITIONAL for agentic build | Medium, Large, Enterprise |
| BAST.md | QC2-QC3 | CONDITIONAL by handover formality | Enterprise (or client projects) |
| PROJECT-CLOSURE-REPORT.md | QC4-QC6 | REQUIRED at closure | Medium, Large, Enterprise |
| RETROSPECTIVE.md | QC7 | REQUIRED at closure, scaled | Medium, Large, Enterprise |
| HANDOVER.md | QC8 | CONDITIONAL by ongoing ownership | Medium, Large, Enterprise |

## Capability mappings

- AI → `docs/ai/*` only when AI capability is active.
- Mobile → `docs/mobile/*` only when mobile scope is active.
- Data → `docs/data/*` only when data-heavy scope is active.
- Edge → `docs/edge/*` only when edge capability is justified.
- Enterprise → `docs/enterprise/*` only for enterprise-scale team/governance.
- Design scale → `docs/design-scale/*` only when multi-team design governance is needed.
- Compliance → `docs/compliance/*` only when a compliance regime is in scope.
- Payments → `docs/payments/*` only when payments are in scope.
- Email → `docs/email/*` only when email is in scope.
- CMS → `docs/cms/*` only when CMS is in scope.