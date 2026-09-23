# Agentic Project Lifecycle

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![AI Agent Ready](https://img.shields.io/badge/Agent-Ready-brightgreen.svg)](#)
[![Standards](https://img.shields.io/badge/SDLC-Small_to_Enterprise-orange.svg)](#)
[![Quality Gates](https://img.shields.io/badge/Gates-Evidence--Based-purple.svg)](#)

A deterministic, production-grade Software Development Life Cycle (SDLC) framework and skill designed specifically for **autonomous AI coding agents** (Claude Code, OpenCode, Codex, Cursor, etc.). 

It guides agents from a raw idea to planning, scaffold, quality-gated building, and formal project closure without hallucinations, fake metrics, or unverified claims.

---

## 🌟 Why This Exists

AI coding agents excel at writing code in small slices, but fail at long-horizon project management. Common agent failure modes include:
- **Inventing completeness:** Fabricating approvals, fake user test results, or imaginary test coverage.
- **Over-engineering small tools:** Forcing 15 formal documents on a 1-day CLI script.
- **Under-engineering enterprise systems:** Skipping architecture baselines, security reviews, and budget tracking on multi-team projects.
- **Silent scope drift:** Silently absorbing extra features during build without change control.

**Agentic Project Lifecycle** eliminates these failures with a strict state machine, evidence-based quality gates, and ceremony scaled strictly by complexity tier.

---

## 🏗️ The 4 Complexity Tiers

| Tier | Characteristics | Planning Mode | Core Scaffold | Quality & Closure Formality |
|---|---|---|---|---|
| **Small** | 1 feature, 1 entity, solo dev, <1 mo | **Always Skip** | `CONTEXT.md`, `VERIFY.md`, `README.md`, `.gitignore` | Direct build, mental tracking, 1-line handoff |
| **Medium** | 2–5 devs, auth, database, APIs, 1–3 mo | **Lightweight** | Small + `AGENTS.md`, `TASKS.md`, `ARCHITECTURE.md`, `CONTEXT-MAP.md` | CI gates (80% coverage, SAST, Lighthouse ≥85), email signoff |
| **Large** | 5–20 devs, payments, multi-team, 3–12 mo | **Standard** | Medium + `OWNERSHIP.md`, `contracts/`, `docs/decisions/` | Double-confirmation skip, Pact contract tests, formal closure report |
| **Enterprise** | 20+ devs, compliance, legal, 12+ mo | **Full (Blocking)** | Large + PM & compliance artifacts (`BUDGET.md`, `COMPLIANCE.md`, etc.) | Hard gates, BAST legal sign-off, human-in-the-loop review |

---

## 🚀 Lifecycle Pipeline

```text
SPARK / RAW IDEA
       │
       ▼
MODULE 01 — IDEATION ────────► Produces a concrete brief (pitch, core loop, first slice)
       │
       ├─ Small ─────────────► MODULE 03 — BUILD (Zero planning overhead)
       │
       └─ Medium / Large ────► MODULE 02 — PLANNING (Scope, Timeline, Stack, Budget)
                                       │
                                       ▼
                               MODULE 03 — BUILD (Vibe coding, quality gates, test coverage)
                                       │
                                       ▼
                               MODULE 04 — CLOSURE (BAST, handover, retrospective)
                                       │
                                       ▼
                               MAINTENANCE (Bug fixes, security patches, SLA monitoring)
```

---

## 📁 Repository Structure

The framework is completely markdown-based (portable across macOS, Linux, and Windows with zero interpreter dependencies):

```
.
├── SKILL.md                 # Primary agent orchestrator entrypoint & cross-phase rules
├── README.md                # Project documentation & GitHub overview
├── LICENSE                  # MIT License
│
├── engine/                  # Core state machine, validation, and rules
│   ├── STATE-MACHINE.md     # Finite State Machine & pre-transition checklist
│   ├── GATE-REGISTRY.md     # Quality gates (Gate 0 to Gate C)
│   ├── PROJECT-PROFILE.md   # Single Source of Truth for tier policies
│   ├── DECISION-RULES.md    # Anti-hallucination rules (never invent data)
│   ├── QUESTION-REGISTRY.md # Planning interview questions & capability probes
│   └── ARTIFACT-REGISTRY.md # Document lifecycle mappings
│
├── modules/                 # Step-by-step phase execution workflows
│   ├── 00-classifier.md     # Complexity tier classifier
│   ├── 01-ideation.md       # Idea-to-brief engine
│   ├── 02-planning-*.md     # Planning routers (Core, Stack, Capabilities)
│   ├── 03-build-*.md        # Build loop, foundations, quality gates, deploy
│   └── 04-closure.md        # Handover and project closure
│
├── templates/               # Standardized templates for generated projects
│   ├── README.md            # Template catalog and usage index
│   ├── pm/                  # Charters, Business Cases, RACI, Budget, Status Reports
│   ├── specs/               # PRD, FSD, Architecture, ADR, Context Map, IA
│   ├── dev/                 # Readme, Verify, Tasks Kanban, Onboarding runbooks
│   └── closure/             # BAST, Closure Report, Post-Mortem, Handover
│
├── references/              # Deep domain-specific engineering guides
│   ├── README.md            # References master catalog and domain index
│   ├── pm/                  # Roadmaps, Risk Registers, Resource Leveling, WBS
│   ├── backend/             # RFC 8594 API Versioning, Database Safety, Rate Limiting
│   ├── frontend/            # State Management (TanStack Query), WCAG AA, Core Web Vitals
│   ├── qa/                  # Testing Pyramid, Pact Contract Testing, Chaos Testing
│   ├── devops/              # Kubernetes, Blue-Green Rollback, OpenTelemetry, SRE Runbooks
│   ├── security/            # STRIDE Threat Modeling, Content Security Policy, Semgrep SAST
│   ├── docs/                # OpenAPI 3.1 Code-First Docs, Changesets SemVer
│   └── ai/                  # Multi-agent coordination and LLM integration
│
└── examples/                # Few-shot sample projects across all 4 tiers
    ├── small/               # CLI receipt scanner prototype
    ├── medium/              # Fullstack web SaaS
    ├── large/               # Multi-service monorepo
    └── enterprise/          # Regulated enterprise core platform
```

---

## ⚡ How to Use with AI Agents

### Option 1: As an Agent Skill (Claude Code / OpenCode / Codex)
Add this repository to your agent's skills directory:

```bash
# Clone to your local agent skills folder
git clone https://github.com/your-username/agentic-project-lifecycle.git ~/.agents/skills/project-lifecycle
```

Prompt your agent:
> *"I have an idea for a multi-tenant expense tracker. Use the project-lifecycle skill to guide us from classification to deployment."*

### Option 2: Direct Repository Integration
Copy `SKILL.md`, `engine/`, `modules/`, `templates/`, and `references/` into your project repository under `.agents/skills/project-lifecycle/`.

---

## 🛡️ Non-Negotiable Core Rules

1. **Evidence Over Affirmation:** A gate does not pass because an agent claims it passed. CI exit code 0, coverage reports meeting thresholds, and verifiable test artifacts are required.
2. **Never Invent Data:** Agents are strictly forbidden from fabricating stakeholder signoffs, user research data, performance metrics, or test coverage. Unknowns must remain explicitly marked as `UNKNOWN`.
3. **Change Control Over Silent Acceptance:** Mid-build scope additions require a formal Change Request and explicit user confirmation before code is written.
4. **Clean Handoff:** Every project ends with a verified `VERIFY.md`, an updated `README.md`, and clean git history.

---

## 📄 License

Distributed under the [MIT License](LICENSE). Free for personal, commercial, and enterprise use.
