# References Directory — Master Catalog & Index

The reference guides in this skill are organized into 8 domain-specific subdirectories:

---

## 1. Project Management & Lifecycle Governance (`references/pm/`)

| Guide Path | Scope / Purpose |
|---|---|
| `references/pm/QUICKSTART_BY_TIER.md` | Single entry point: exact module and file requirements per complexity tier |
| `references/pm/PM_FUNDAMENTALS_GUIDE.md` | Core PM fundamentals for AI agents (scope, schedule, budget, quality) |
| `references/pm/PRODUCT_ROADMAP_GUIDE.md` | Now-Next-Later and Quarterly Gantt roadmaps with commitment-level rules |
| `references/pm/RISK_MANAGEMENT_GUIDE.md` | Scored risk register template, triggers, and contingency plans |
| `references/pm/SCHEDULE_HEALTH_GUIDE.md` | Milestone slippage detection, health thresholds (🟢/🟡/🔴), and CR triggers |
| `references/pm/RESOURCE_LEVELING_GUIDE.md` | Resolving resource bottlenecks and milestone collisions systematically |
| `references/pm/CONFLICT_RESOLUTION_GUIDE.md` | Decision escalation ladder and RACI matrix governance |
| `references/pm/VENDOR_MANAGEMENT_GUIDE.md` | SOW, IP ownership, SLA, and vendor scorecard management |
| `references/pm/DETAILED_TIMELINE_GUIDE.md` | Work breakdown structure (WBS) and critical path scheduling |
| `references/pm/PRE_PROJECT_GUIDE.md` | Pre-project discovery, viability, and sponsor alignment |
| `references/pm/POST_PROJECT_CLOSURE_GUIDE.md` | Closure ceremonies, handover formalities, and lessons learned |
| `references/pm/LIFECYCLE_MAPPING.md` | Mapping this skill to PMI/PMBOK, CMMI, and Agile lifecycles |
| `references/pm/REQUIREMENT_GATHERING_GUIDE.md` | Elicitation techniques, user story mapping, and acceptance criteria |
| `references/pm/ADOPTION_GUIDE.md` | How to adopt this lifecycle skill in brownfield and legacy projects |
| `references/pm/SOLO_DEVELOPER_GUIDE.md` | Lean lifecycle scaling for solo engineers (minimal overhead) |
| `references/pm/PITFALLS.md` | Common failure modes in agentic software development and their mitigations |

---

## 2. Backend & Data Architecture (`references/backend/`)

| Guide Path | Scope / Purpose |
|---|---|
| `references/backend/API_VERSIONING_STRATEGY.md` | URI path versioning, RFC 8594 Sunset/Deprecation headers, and compatibility rules |
| `references/backend/API_RATE_LIMITING_STRATEGY.md` | Tiered rate limiting, token buckets, Upstash/Redis, and credential stuffing mitigations |
| `references/backend/DATABASE_STRATEGY_GUIDE.md` | Migration safety rules, two-phase expand-contract, SSL/TLS, and connection pooling |
| `references/backend/DATABASE_INDEXING_STRATEGY.md` | B-tree, GIN, composite indexing, and EXPLAIN ANALYZE query optimization |
| `references/backend/TECH_STACK_EXAMPLES.md` | Tested, modern stack blueprints across frameworks |
| `references/backend/DOMAIN_STACK_GUIDE.md` | Matching technology selections to business domains |

---

## 3. Frontend & UI/UX Engineering (`references/frontend/`)

| Guide Path | Scope / Purpose |
|---|---|
| `references/frontend/STATE_MANAGEMENT_GUIDE.md` | 5-category state taxonomy: TanStack Query v5, Zustand, URL state, Zod forms |
| `references/frontend/DESIGN_VALIDATION_GUIDE.md` | Visual QA, anti-confirmation-bias research, and fallback proxy testing |
| `references/frontend/DESIGN_HANDOFF_CHECKLIST.md` | Figma-to-code checklist and agentic token bridge enforcement rules |
| `references/frontend/DESIGN_SYSTEM_GOVERNANCE.md` | Design token versioning, component lifecycles, and DESIGN_CHANGELOG.md |
| `references/frontend/INFORMATION_ARCHITECTURE_GUIDE.md` | Navigation hierarchy, sitemaps, and enterprise domain depth exceptions |
| `references/frontend/ACCESSIBILITY_WCAG_GUIDE.md` | Comprehensive WCAG 2.1 Level AA compliance, contrast ratios, and screen readers |
| `references/frontend/ACCESSIBILITY_MINIMUM_GATE.md` | Non-negotiable accessibility floor before production release |
| `references/frontend/FRONTEND_PERFORMANCE_BUDGET.md` | Gzipped transfer budgets (<300KB), Web Vitals (INP <200ms, LCP <2.5s) |
| `references/frontend/PERFORMANCE_BUDGET_GUIDE.md` | Lighthouse CI thresholds, bundle analysis, and performance regression gates |
| `references/frontend/I18N_LOCALIZATION_GUIDE.md` | Internationalization with next-intl, vue-i18n, RTL support, and locale routing |
| `references/frontend/anti-slop-core.md` | Core anti-slop rules for distinctive, high-craft user interfaces |

---

## 4. QA & Reliability Engineering (`references/qa/`)

| Guide Path | Scope / Purpose |
|---|---|
| `references/qa/TESTING_STRATEGY_DETAIL.md` | Testing pyramid (70/20/10), Vitest CI exit-code coverage gates, and Playwright E2E |
| `references/qa/CONTRACT_TESTING_GUIDE.md` | Consumer-driven contract testing with Pact and GraphQL schema breaking checks |
| `references/qa/FLAKY_TEST_POLICY.md` | 3-strike quarantine policy with strict coverage preservation rules |
| `references/qa/STACK_SPECIFIC_TESTING.md` | Concrete test recipes for Next.js, Server Actions, Supabase, and Prisma |
| `references/qa/TEST_DATA_STRATEGY.md` | Test factories, database seeding, isolation, and teardown |
| `references/qa/TEST_ENVIRONMENT_GUIDE.md` | Managing dev, staging, and production parity |
| `references/qa/LOAD_TESTING_GUIDE.md` | High-load stress and soak testing using k6 and Artillery |
| `references/qa/CHAOS_ENGINEERING_GUIDE.md` | Failure injection (database drops, network latency, resource exhaustion) |
| `references/qa/CODE_REVIEW_CHECKLIST.md` | Comprehensive checklist for functionality, security, performance, and types |
| `references/qa/BUG_PRIORITY_MATRIX.md` | P0-P3 severity definitions, decision tree, response SLAs, and hotfix workflows |

---

## 5. DevOps & Cloud Infrastructure (`references/devops/`)

| Guide Path | Scope / Purpose |
|---|---|
| `references/devops/DEVOPS_DEPLOYMENT_GUIDE.md` | Environments, IaC, Trivy container scanning, OIDC cloud auth, and deployment pipelines |
| `references/devops/ROLLBACK_DEPLOYMENT_GUIDE.md` | Blue-green, canary, rolling deploy SOPs, and stateless vs stateful RTO caveats |
| `references/devops/INFRASTRUCTURE_AS_CODE_GUIDE.md` | Terraform and Pulumi patterns with remote state locking and data residency |
| `references/devops/KUBERNETES_DEPLOYMENT_GUIDE.md` | K8s deployments, HPA, ingress, health probes, and ArgoCD GitOps |
| `references/devops/DISASTER_RECOVERY_GUIDE.md` | RTO/RPO targets, cross-region failover, and disaster recovery drills |
| `references/devops/DEVELOPMENT_STAGE_GUIDE.md` | Transitioning through development milestones and build discipline |
| `references/devops/OBSERVABILITY_GUIDE.md` | Golden signals, Prometheus, Grafana, OpenTelemetry, and Meta-Monitoring |
| `references/devops/MONITORING_OBSERVABILITY.md` | Production metric collection, logging pipelines, and alert routing |
| `references/devops/MONITORING_MANDATORY_GATE.md` | Hard gate: mandatory observability artifacts before launch |
| `references/devops/INCIDENT_RESPONSE_RUNBOOK.md` | Incident Commander roles, sustainable 4-5 person on-call rotation, and escalation ladders |
| `references/devops/PERFORMANCE_ENGINEERING_GUIDE.md` | Backend profiling, database query optimization, and latency tuning |
| `references/devops/TECH_DEBT_HOTFIX_GUIDE.md` | Tech debt register tracking and expedited P0 hotfix procedures |
| `references/devops/TOOLING_REFERENCE.md` | Concrete CLI commands and tooling reference index |

---

## 6. Security & Compliance (`references/security/`)

| Guide Path | Scope / Purpose |
|---|---|
| `references/security/SECURITY_HARDENING_GUIDE.md` | Tiered security levels, STRIDE threat modeling, MFA, and Semgrep SAST |
| `references/security/SECURITY_GATE_GUIDE.md` | Quality gates for SAST, dependency auditing, and supply chain verification |
| `references/security/CSP_CONFIGURATION_GUIDE.md` | Content Security Policy directives, dynamic nonces, and Report-Only rollout |
| `references/security/SECRET_ROTATION_RUNBOOK.md` | 90-day secret rotation workflows for cloud keys, database passwords, and API tokens |
| `references/security/PRE_COMMIT_SECRET_SCAN_SETUP.md` | Gitleaks and pre-commit hooks to block credential leaks before commit |
| `references/security/COMPLIANCE_AUTOMATION_GUIDE.md` | GDPR, HIPAA, SOC 2, and PCI-DSS compliance verification and evidence |

---

## 7. Documentation & Versioning Standards (`references/docs/`)

| Guide Path | Scope / Purpose |
|---|---|
| `references/docs/API_DOCUMENTATION_GUIDE.md` | Code-first OpenAPI 3.1 generation via Zod, Scalar UI, Spectral linting, and Bruno |
| `references/docs/CHANGELOG_GUIDE.md` | Keep a Changelog standard, SemVer, and automated release tooling (Changesets) |

---

## 8. AI & Agent Orchestration (`references/ai/`)

| Guide Path | Scope / Purpose |
|---|---|
| `references/ai/AI_INTEGRATION_GUIDE.md` | LLM integration patterns, vector search, safety boundaries, and cost tracking |
| `references/ai/AGENT_ORCHESTRATION_GUIDE.md` | Multi-agent coordination, subagent handoffs, and path ownership matrix rules |
