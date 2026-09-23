# Templates Directory — Master Catalog & Usage Guide

Templates in this skill are organized into 4 logical subdirectories:
- `templates/pm/`: Project management, governance, timeline, budget, and stakeholder templates.
- `templates/specs/`: Requirements, architecture, design, and technical specification templates.
- `templates/dev/`: Developer setup, verification, tasks, and agent prompts templates.
- `templates/closure/`: Project closure, BAST, retrospective, and handover templates.

---

## 1. Scaffold Templates (Copied During Initial Project Setup)

These templates are copied into the project during the "Scaffolding a project" step in `SKILL.md`:

| Template Path | Complexity Tier | Output Project Path | Purpose |
|---|---|---|---|
| `templates/dev/PROJECT_README_TEMPLATE.md` | All Tiers | `README.md` | Standard project readme |
| `templates/dev/VERIFY_TEMPLATE.md` | All Tiers | `VERIFY.md` | Local build and test verification commands |
| `templates/dev/DEVELOPMENT_KANBAN_TEMPLATE.md` | Medium+ | `TASKS.md` | Sprint task tracking kanban |
| `templates/specs/ARCHITECTURE_TEMPLATE.md` | Medium+ | `ARCHITECTURE.md` | System architecture documentation |
| `templates/specs/CONTEXT_MAP_TEMPLATE.md` | Medium+ | `docs/dev-docs/CONTEXT-MAP.md` | Bounded contexts and domain boundaries |
| `templates/dev/OWNERSHIP_TEMPLATE.md` | Large+ | `OWNERSHIP.md` | File and path ownership matrix for multi-agent workflows |

---

## 2. Planning & Governance Templates (`templates/pm/`)

Used during the planning interview and project lifecycle governance:

| Template Path | Phase / Timing | Purpose |
|---|---|---|
| `templates/pm/BUSINESS_CASE_TEMPLATE.md` | Phase 0 (Q0a-b) | Business justification and ROI analysis |
| `templates/pm/PROJECT_CHARTER_TEMPLATE.md` | Phase 0 (Q0c-h) | Formal project charter and executive authority |
| `templates/pm/KICKOFF_AGENDA_TEMPLATE.md` | Phase 0 (Q0g) | Structured kickoff meeting agenda |
| `templates/pm/RACI_MATRIX_TEMPLATE.md` | Phase 0 (Q0d) | RACI matrix with veto notation (`docs/pm/RACI.md`) |
| `templates/pm/BUDGET_TRACKING_TEMPLATE.md` | Phase 0 / Build | Planned vs actual cost tracking and burn rate (`docs/pm/BUDGET.md`) |
| `templates/pm/STATUS_REPORT_TEMPLATE.md` | Weekly during Build | Stakeholder status report with schedule health traffic light |
| `templates/pm/SCOPE_STATEMENT_TEMPLATE.md` | Phase 1a (QR4) | Formal scope baseline and exclusions |
| `templates/pm/DETAILED_TIMELINE_TEMPLATE.md` | Phase 2a (QT1-QT8) | Milestone timeline, critical path, and dependencies |
| `templates/pm/CHANGE_REQUEST_TEMPLATE.md` | On-demand (Rule 10b) | Scope or schedule change control request |

---

## 3. Product & Technical Specification Templates (`templates/specs/`)

| Template Path | Phase / Timing | Purpose |
|---|---|---|
| `templates/specs/PRD_TEMPLATE.md` | Phase 1a (QR1-QR7) | Product Requirements Document |
| `templates/specs/FSD_TEMPLATE.md` | Phase 1a (QR1-QR7) | Functional Specification Document |
| `templates/specs/IA_DOCUMENT_TEMPLATE.md` | Phase 4 (Rule 13) | Information Architecture & sitemap document |
| `templates/specs/REQUIREMENT_TRACEABILITY_MATRIX_TEMPLATE.md` | Phase 1a (QR2-QR5) | Requirements traceability matrix |
| `templates/specs/REQUIREMENT_SIGNOFF_LOG_TEMPLATE.md` | Phase 1a (QR8) | Stakeholder requirement signoff log |
| `templates/specs/DESIGN_TEMPLATE.md` | Phase 4 | UI/UX design specification and token bridge |
| `templates/specs/brand-questionnaire.md` | Phase 4 | Brand identity and visual direction questionnaire |
| `templates/specs/INTEGRATION_CONTRACT_TEMPLATE.md` | Phase 5 | External integration agreements and payload specs |
| `templates/specs/ADR_TEMPLATE.md` | On-demand | Architecture Decision Record with options and trade-offs |

---

## 4. Development & Execution Templates (`templates/dev/`)

| Template Path | Phase / Timing | Purpose |
|---|---|---|
| `templates/dev/DEVELOPER_ONBOARDING_TEMPLATE.md` | Phase 6 (QD2) | 10-minute developer onboarding runbook (`docs/dev-docs/ONBOARDING.md`) |
| `templates/dev/RUNBOOK_LOCAL_TEMPLATE.md` | Phase 6 | Local development runbook and troubleshooting |
| `templates/dev/AGENT_PROMPTS_TEMPLATE.md` | Phase 6 | Multi-agent execution prompt definitions |
| `templates/dev/DELIVERY_GATE_TEMPLATE.md` | Phase 6 | Gate verification checklist and evidence record |

---

## 5. Closure & Handover Templates (`templates/closure/`)

| Template Path | Phase / Timing | Purpose |
|---|---|---|
| `templates/closure/BAST_TEMPLATE.md` | Phase 7 (QC3) | Formal handover acceptance document (Berita Acara Serah Terima) |
| `templates/closure/CLOSURE_REPORT_TEMPLATE.md` | Phase 7 (QC4) | Project closure summary report |
| `templates/closure/POST_MORTEM_TEMPLATE.md` | Phase 7 (QC5) / Incidents | Blameless post-mortem and retrospective analysis |
| `templates/closure/HANDOVER_TEMPLATE.md` | Phase 7 (QC6) | Operations and maintenance handover document |
