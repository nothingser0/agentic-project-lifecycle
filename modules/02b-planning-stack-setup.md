# Module 02b — Planning: Stack, Design & Setup Phases

**Contains:** Phase 3 (Tech Stack), Phase 4 (Design), Phase 5 (Deep-Dive), Phase 6 (Build Setup), Phase 7 (Post-Project Closure).

**Used by:**
- **Lightweight:** Phase 3 (Tech Stack) and Phase 6 (Build Setup)
- **Standard:** Phase 3, Phase 5 (relevant probes), Phase 6
- **Standard (Regulated-MVP):** Phase 3, Phase 5 (Security Q34–Q39b & Compliance COMP1–COMP2), Phase 6
- **Full:** All phases

See `02-planning-router.md` for routing details.

---

### Phase 3: Tech Stack (Q15 domain classifier + 7 stack questions + 5 conditional probes, ~45 min)

**Q15 — Domain Classifier (run FIRST, before any other Phase 3 question):**
> "What is the primary domain of this project?"

Options (multi-select if hybrid): eCommerce / ERP / CRM / HRIS / Inventory / Booking & Reservation / Hotel Management / Financial & Fintech / GIS & Map / Real-time Web / CMS / Dashboard & Analytics / AI-Powered Web / SaaS Multi-tenant / Web Scraping & Data Pipeline / Portfolio & Interactive / General Web App

**Routing rule:**
- If domain matches any specific category → read the relevant section in `references/backend/DOMAIN_STACK_GUIDE.md` **before** asking Q16–Q22. The domain guide provides a pre-validated stack recommendation. Q16–Q22 below are used to confirm or override individual choices.
- If domain = "General Web App" or no match → skip domain guide, proceed directly to Q16–Q22 using `references/backend/TECH_STACK_EXAMPLES.md`.
- If hybrid (e.g. "eCommerce + AI-Powered") → read both relevant domain sections, note where stacks conflict, surface the conflict to the user for resolution.

**Main questions (7):**
16. Backend Framework (TOP 10, filtered by Phase 1+2 + domain guide recommendation)
17. Frontend Framework (TOP 10, filtered by Phase 1+2 + domain guide recommendation)
18. Database (TOP 10, filtered by scale + budget + domain guide recommendation)
19. Backend Architecture (TOP 10, filtered by team + scale)
20. API Style (REST / GraphQL / tRPC / gRPC / Hybrid)
21. Authentication (Clerk / Auth.js / Supabase / WorkOS / Better-Auth, filtered by budget)
22. Deployment Platform (Vercel / Railway / Fly.io / Render / Coolify / AWS / GCP, filtered by budget)

**Sub-questions (6):**
- Q16a: Node.js Framework? (Express / Fastify / NestJS / Hono / tRPC / Next.js API, if Node.js)
- Q16b: Runtime? (Node.js / Bun / Deno, if Node.js/TS)
- Q17a: Rendering Strategy? (CSR / SSR / SSG / ISR / Hybrid, if SSR-capable)
- Q18a: Data Model? (Relational / Document / Key-Value / Graph / Time-series / Not sure)
- Q18b: Additional Infrastructure? (Cache / Search / Analytics DB / File storage / Queue, multi-select)
- Q22a: Statutory BAA & Vendor Plan Clearance? (if handling HIPAA PHI, PCI-DSS, or regulated data): Verify whether chosen deployment and database vendors execute Business Associate Agreements (BAAs) on the planned subscription tier. Standard self-serve PaaS accounts (Vercel, Railway, Supabase Pro) generally DO NOT execute BAAs without enterprise contracts; hyperscalers (AWS, GCP, Azure) provide click-through BAA execution for all accounts. Never confirm a self-serve PaaS stack for regulated healthcare data without verified BAA contract execution.

### Phase 4: Design (11 core + 3 conditional probes, ~45 min) — SKIPPABLE

**Skip if Q4="Figma ready" → saves 45 min**

**Main questions (11):**
23. Design Personality (Professional / Playful / Minimalist / Bold / Custom)
24. Design Inspiration (TOP 10 real clones: Apple / Jira / Linear / Stripe / Figma / Adobe / Notion / Vercel / Brutalist / 3D)
25. Design Trend (Calm Interfaces / Tactile Brutalism / Bento Grid / Glassmorphism 2.0 / Dark Mode First — treat this list as a starting point, not the current state of the art; run a quick web search for "UI design trends [current year]" before presenting options, since this changes yearly and the list will go stale)
26. Animation Level (None / Subtle / Moderate / Heavy / Experimental)
27. Animation Library (Framer Motion / GSAP / Three.js / R3F / Lottie / CSS-only)
28. Scroll Experience (Standard / Smooth / Scroll-video / Parallax / Custom)
29. UI Component Library (shadcn / Aceternity / Magic UI / Radix / DaisyUI / Mantine / Chakra / Ant / MUI / Custom)
30. Special Effects (Glassmorphism / Gradients / Bento / Particles / None, multi-select)
31. Typography (System / Google Fonts / Custom / Variable)
32. Color Mode (Light / Dark / Toggle / System / Auto-time)
33. Logo Style (Text / Tailwind+Heroicons / Custom SVG / Defer v2.0)

**Sub-questions (3):**
- Q33a: Spacing System (Tailwind / 4px base / 8px base / Custom)
- Q33b: Breakpoints (Tailwind / Mobile-first / Desktop-first / Let framework decide)
- Q33c: Icon Library (Heroicons / Lucide / Phosphor / Font Awesome / Custom)

### Phase 5: Deep-Dive (38 core + 67 capability prompts at full activation; 1-2 hours) — ADAPTIVE

#### Core Prompt Set (38 prompt units)

**Security (8 Q):**
- Q34: Security Level (Basic — auth + HTTPS only / Standard — OWASP Top 10 hardening / Hardened — pen-test ready / Compliance-grade — audit trail + encryption at rest, filtered by Q13 team type and COMP1–COMP2 compliance needs)
- Q35: Hardening Checklist (Input validation & sanitization / SQL injection prevention via ORM+parameterized queries / XSS protection via CSP headers / Dependency scanning — npm audit, Snyk, Dependabot / all of the above)
- Q36: Secrets Management (`.env` + gitignore — solo/$0 / GitHub Actions secrets — small team / Doppler or Infisical — $50-500 / HashiCorp Vault or AWS Secrets Manager — enterprise, filtered by budget)
- Q37: CORS Strategy (Allow specific origins only — recommended default / Allow all `*` — dev/prototype only, never production / Credentialed requests with strict origin allowlist — if cookies/sessions used)
- Q38: Rate Limiting (None — internal tools only / IP-based, fixed window — Upstash Ratelimit, Vercel / Token bucket per-user — API products / Distributed rate limiting — Redis-backed, multi-instance)
- Q39: Audit Logging (None / App-level events only — login, permission changes / Full request/response logging — compliance-grade / Immutable audit log — WORM storage, for regulated industries)
- Q39a: DDoS Protection (None — internal tools / Platform-provided — Vercel/Cloudflare Pages built-in / Cloudflare in front of origin — free tier / AWS Shield or Cloudflare Enterprise — high-value targets)
- Q39b: API Security (API keys only / OAuth 2.0 scopes / JWT with short expiry + refresh rotation / mTLS for service-to-service, filtered by Q20 API style)

See `references/security/SECURITY_HARDENING_GUIDE.md` for the reasoning behind each recommendation and how to translate answers into `docs/security/THREAT-MODEL.md`, `CHECKLIST.md`, and `COMPLIANCE.md`.

**Testing (6 Q):**
- Q40-Q44: Level, Framework, Coverage, Observability, Monitoring Tools
- Q44a: Load Testing

**DevOps (9 Q):**
- Q45: CI/CD (None — manual deploy / GitHub Actions — free for public+generous for private / GitLab CI / CircleCI — enterprise teams, filtered by Q12 team size and where the repo lives)
- Q46: Environments (Prod only — solo/MVP / Dev + Prod / Dev + Staging + Prod — recommended for teams / Dev + Staging + Prod + DR — compliance-grade)
- Q47: Infrastructure Approach (Manual/ClickOps — solo, $0 / Platform-managed — Vercel/Railway, no IaC needed / Terraform or Pulumi — multi-environment consistency / Terraform + GitOps — enterprise, filtered by team size)
- Q48: Container Registry (None — not using containers / Docker Hub — free public / GHCR — free with GitHub / ECR or GCR — cloud-native enterprise)
- Q49: Deploy-Time Secrets (Platform env vars — Vercel/Railway dashboard / GitHub Actions secrets / Doppler or Infisical sync / Vault with dynamic secrets, consistent with Q36)
- Q50: Rollback Strategy (Redeploy previous build — platform-native / Blue-green swap / Feature flags to disable — no redeploy needed / Automated rollback on health-check failure)
- Q50a: DB Migration Strategy (Manual — solo/MVP / Framework migrations — Prisma/Laravel/Rails, run on deploy / Expand-contract pattern — zero-downtime schema changes / Managed migration tool — Flyway/Liquibase, enterprise)
- Q50b: Zero-Downtime Deploys (Not needed — acceptable downtime / Rolling deploy — platform default / Blue-green / Canary — gradual traffic shift, high-risk-of-regression apps)
- Q50c: Backup Strategy (Managed DB automatic backups only — Supabase/RDS default / + Point-in-time recovery / + Cross-region replica / + Regular restore drills — compliance-grade, "backup that's never been restored isn't a backup")

See `references/devops/DEVOPS_DEPLOYMENT_GUIDE.md` for how these map to `docs/deployment/CI-CD.md`, `ENVIRONMENTS.md`, and `docs/operations/BACKUP-RESTORE.md`.

**Cross-Cutting (5 Q):**
- Q61-Q63: i18n, Performance Budget, Accessibility
- Q63a: SEO Strategy
- Q63b: Analytics

**Project Management (4 Q):**
- Q64-Q65: Methodology, Sprint Length
- Q65a: Project Tracking Tool
- Q65b: Documentation Tool

**PM Fundamentals (6 Q) — drives docs/pm/, currently the most skipped category:**
- Q65c: Stakeholders Beyond End-Users (Sponsor/budget owner / Other teams affected — legal, sales, support / External partner or client / None beyond the build team — list name + what decision authority each has, for `STAKEHOLDERS.md`)
- Q65d: Top 3 Risks (open text, prompt with categories: Technical — e.g. "unproven integration" / Resource — e.g. "single point of failure if solo dev is unavailable" / Market — e.g. "competitor ships first" / Scope — e.g. "stakeholder adds requirements mid-build"; ask for one likely-impact rating each — Low/Med/High — for `RISKS.md`)
- Q65e: Success Criteria (What does "done" look like beyond the feature list? — a measurable target: user count, revenue, task completion time, or "ships and I personally use it daily" for a solo project — for `docs/planning/PRD.md` and `MILESTONES.md`)
- Q65f: Communication Cadence (None — solo project / Async updates — Slack/email, as-needed / Weekly status update / Daily standup, filtered by Q12 team size — for `COMMUNICATION-PLAN.md`)
- Q65g: Change Control (None — solo, change freely / Product owner approves scope changes / Formal change request + impact assessment — for teams past ~5 people or client work — for `CHANGE-LOG.md`'s process section, not just its entry log)
- Q65h: Decision Log Needed? (No — decisions live in commit messages / Yes — track major technical/product decisions separately, for teams where "why did we choose X" gets asked repeatedly — feeds `docs/dev-docs/DECISIONS.md`)

See `references/pm/PM_FUNDAMENTALS_GUIDE.md` for why these six matter even on a solo $0 project, and how to keep them from turning into filler boilerplate.

#### Capability Prompt Categories (67 prompt units at full activation)

**State & Data (6 prompt units, if frontend):**
- SD1-SD5: State Management, Form Library, Data Fetching, Table, Validation
- SD6: File Upload

**Real-Time (6 prompt units, if real-time features):**
- RT1-RT5: Real-Time Provider, Collaboration, Notifications, Presence, Conflict Resolution
- RT6: WebRTC / Video Calls

**Edge & WebAssembly (10 prompt units, if performance profile = Extreme):**
- EDGE1-EDGE10: Edge Computing, Edge Database, Wasm, Global Routing, Cold Starts, etc.

**Enterprise DevOps (10 prompt units, if Q12=21+ devs):**
- ENT1-ENT10: GitOps, Chaos Engineering, Feature Flags, A/B Testing, Distributed Tracing, Service Mesh, Load Balancer, Autoscaling, Multi-Tenancy, Disaster Recovery

**Design Systems at Scale (8 prompt units, if Q12=6+ devs):**
- DS1-DS8: Design Tokens, Storybook, Visual Regression, Design-to-Code, Multi-Brand, Versioning, Governance, Handoff

**Compliance (2 prompt units, if Q15 matches Financial & Fintech, Booking (Healthcare), or handling regulated data / compliance override, or Q13=Enterprise):**
- COMP1-COMP2: Compliance Required (GDPR/CCPA/HIPAA/PCI-DSS/SOC 2/ISO 27001/FedRAMP), Data Residency

**Mobile (4 prompt units, if Q2=Mobile App):**
- MOB1-MOB4: Push Notifications, Offline Strategy, Native Modules, Distribution

**AI/LLM (6 prompt units, if Q10≠None):**
- AI1-AI6: Provider, Architecture, Vector DB, Safety, Cost Budget, Observability

**Data Pipeline (3 prompt units, if data-heavy):**
- DATA1-DATA3: Pipeline Architecture, Analytics Tools, BI Tools

**Payments (5 prompt units, if payments are in scope) — capability-gated:**
- PAY1: Need Payments?
- PAY2-PAY5: Provider, Payment Model, Payment Methods, Multi-Currency

**Email (4 prompt units, if transactional/marketing email is in scope) — capability-gated:**
- EMAIL1: Need Email?
- EMAIL2-EMAIL4: Provider, Templates, Marketing Tool

**CMS (3 prompt units, if content management is in scope) — capability-gated:**
- CMS1: Need CMS?
- CMS2-CMS3: CMS Type, Provider

---

### Phase 6: Build Setup — Development Stage (6 core + 4 conditional probes, 20-30 min)

**Run this last, after Phase 3 (Tech Stack) and Phase 5.** The gate commands, ownership paths,
and contract formats all depend on the stack chosen in Phase 3 — asking earlier produces
placeholders nobody fills in.

This phase exists because everything before it produces documents *about* the project, and
this phase produces the files a **coding agent actually obeys**. A project can have perfect
planning docs and still produce unusable code, if the agent has no machine-readable contract
to bind to, no boundary telling it which files are its own, and no gate that can fail.

**Read `references/ai/AGENT_ORCHESTRATION_GUIDE.md` before starting Phase 6**, and before
generating `ARCHITECTURE.md`, `VERIFY.md`, `OWNERSHIP.md`, `CONTEXT-MAP.md`, or `AGENT-PROMPTS.md`.

#### Gate D: Agent-Ready

**Trigger:** After QD6. **Blocker:** development should not start until the Tier 0 files exist
and the contracts for sprint 1 are locked. The readiness checklist is at the end of
`AGENT_ORCHESTRATION_GUIDE.md`.

For a solo human developer writing code by hand, Gate D is advisory — `ARCHITECTURE.md` and
`VERIFY.md` are still worth having, but `OWNERSHIP.md` and `AGENT-PROMPTS.md` can be skipped.
For any agentic or multi-developer setup, Gate D is mandatory.

#### Phase 6 Questions (6 main)

**QD1 — Who writes the code?**
> "Who or what will actually write the code for this project?"

Options: Solo human / Human team / Solo human + single AI assistant (Copilot, Cursor, one
Claude session) / Multi-agent orchestrated (opencode, Claude Code subagents, orchestrator
plugin) / Mixed — humans on some modules, agents on others

> This answer determines how much of Phase 6 applies. "Multi-agent orchestrated" makes all six
> questions mandatory; "Solo human" reduces Phase 6 to QD2 and QD4.

**QD2 — Verification commands**
> "What commands can actually prove the code is correct — lint, typecheck, test, build?
> Give the real commands for this stack, not the ones we wish existed."

Build the gate ladder from `templates/dev/VERIFY_TEMPLATE.md`: `gate:fast` → `gate:pr` → `gate:qa`
→ `gate:merge` → `gate:sit` → `gate:release`.

> Only write commands that exist today. A gate command that doesn't run is worse than no gate:
> the agent runs it, it fails, and the agent invents a reason to move on.

Sub-questions:
- QD2-i: Numeric thresholds? (coverage %, bundle size, a11y violations, vuln severity)
- QD2-ii: Which modules are critical enough to need higher coverage?

**QD3 — Contract formats** *(skip if QD1 = Solo human)*
> "Which contracts will be machine-readable, and who owns each one?"

Default set: `contracts/openapi.yaml` (API), `contracts/schema.sql` or `prisma/schema.prisma`
(DB), `contracts/tokens.json` (design), `contracts/errors.catalog.json` (errors),
`acceptance/*.feature` (AC).

> Push back on "we'll just describe the API in markdown." Prose is exactly what two parallel
> agents interpret differently, and the difference surfaces at integration.

**QD4 — Module boundaries and dependency rules**
> "What are the modules, and which module is allowed to import which?"

Fill `templates/specs/ARCHITECTURE_TEMPLATE.md` §3. Ask specifically for the rules that must NOT be
violated, and whether a linter can enforce them (dependency-cruiser, eslint-plugin-boundaries).

**QD5 — Agent roles and write permissions** *(skip if QD1 = Solo human or Human team)*
> "Which agent roles will you run, and which paths does each one own?"

Fill `templates/dev/OWNERSHIP_TEMPLATE.md`. Minimum viable set for an agentic build:
orchestrator, api-designer, frontend, backend, qa, reviewer. Add data, system-integrator,
appsec, sre, release as the project demands (see the role table in
`AGENT_ORCHESTRATION_GUIDE.md`).

Sub-questions:
- QD5-i: Confirm the three non-negotiable separations — code author ≠ test author, QA cannot
  write production code, reviewer runs after QA passes. If the user wants to collapse these
  "to go faster," explain what each one is protecting against before agreeing.
- QD5-ii: Parallel isolation: one `git worktree` per active agent?

**QD6 — Context routing**
> "For each kind of task — new UI, new endpoint, schema change, integration, bug fix, review —
> which documents should the agent open, and which should it never open?"

Fill `templates/specs/CONTEXT_MAP_TEMPLATE.md`. Default Tier 3 (never read by a coding agent):
`docs/pm/BUSINESS-CASE.md`, `PROJECT-CHARTER.md`, `STAKEHOLDERS.md`, `COMMUNICATION-PLAN.md`,
`RETROSPECTIVE.md`.

**→ Phase 6 complete.** Agent summarizes: Tier 0 files written / contracts defined / roles and
ownership set / gate ladder confirmed / Gate D status.

#### Transition to Build

Gate D pass → update CONTEXT.md: `lifecycle_phase: BUILD`, `lifecycle_docs: complete`. Then load `03-build-router.md` — the "Consume Mode" section there explains how the AI agent reads these newly completed docs.

#### Phase 6 Output Files

| File | Solo human | Human team | Solo + 1 AI | Multi-agent |
|---|---|---|---|---|
| `ARCHITECTURE.md` (root) | Yes, short | Yes | Yes | Yes |
| `VERIFY.md` (root) | Yes | Yes | Yes | Yes, full ladder |
| `CONVENTIONS.md` (root) | Yes | Yes | Yes | Yes |
| `OWNERSHIP.md` (root) | Skip | Simplified (CODEOWNERS) | Simplified | Yes, full matrix |
| `docs/dev-docs/CONTEXT-MAP.md` | Skip | Optional | Yes | Yes |
| `docs/dev-docs/AGENT-PROMPTS.md` | Skip | Skip | 1 prompt | Yes, per role |
| `docs/dev-docs/RUNBOOK-LOCAL.md` | Yes | Yes | Yes | Yes |
| `contracts/*` | Optional | Recommended | Recommended | Mandatory |
| `docs/decisions/ADR-*.md` | As needed | Yes | Yes | Yes |
| `docs/misc/INTEGRATIONS.md` | If integrations exist | Yes | Yes | Yes, before any integration code |

Templates: `templates/specs/ARCHITECTURE_TEMPLATE.md`, `templates/dev/VERIFY_TEMPLATE.md`,
`templates/dev/OWNERSHIP_TEMPLATE.md`, `templates/specs/CONTEXT_MAP_TEMPLATE.md`,
`templates/dev/AGENT_PROMPTS_TEMPLATE.md`, `templates/dev/RUNBOOK_LOCAL_TEMPLATE.md`,
`templates/specs/ADR_TEMPLATE.md`, `templates/specs/INTEGRATION_CONTRACT_TEMPLATE.md`

References: `references/ai/AGENT_ORCHESTRATION_GUIDE.md`, `references/devops/DEVELOPMENT_STAGE_GUIDE.md`

---

---

### Phase 7: Post-Project — Closure

**Phase 7 is defined and executed in `04-closure.md`.** This module does not duplicate closure content — read `04-closure.md` when the project reaches closure.

Phase 7 covers: Gate C (Closure Confirmed), QC1–QC9 questions, BAST, closure report, retrospective, handover, and access revocation. All questions, gates, output files, and templates are in `04-closure.md`.

**Planning-phase preparation for closure:** during planning, the only closure-relevant decisions to capture are `handover_formality` (set at classification in `00-classifier.md`) and the success criteria from Q0h/Q65e (which Phase 7 will compare against actual results). No closure artifacts are produced during planning.

---
