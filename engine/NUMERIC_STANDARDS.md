# Numeric Standards Registry — Single Source of Truth

All numeric thresholds, error rates, coverage percentages, and performance budgets across the skill reference this canonical file. If any module, template, or guide contains a differing number, `engine/NUMERIC_STANDARDS.md` takes precedence.

---

## 1. Test Coverage Thresholds

| Scope | Lines | Functions | Branches | Statements | Enforcement |
|---|---|---|---|---|---|
| **Global / General Code** | ≥ 80% | ≥ 80% | ≥ 75% | ≥ 80% | Mandatory CI gate |
| **Critical Paths (Auth, Payment, Data-Write)** | 100% | 100% | 100% | 100% | Mandatory blocking gate |
| **New Code Delta (PR floor)** | ≥ 80% | ≥ 80% | ≥ 75% | ≥ 80% | Blocks PR merge |

*References:* `SKILL.md` Rule 9, `references/qa/TESTING_STRATEGY_DETAIL.md`, `references/qa/CODE_REVIEW_CHECKLIST.md`.

---

## 2. Incident & Defect Priority Error Rates

| Priority | Level | Response SLA | Mitigation SLA | Fix SLA | Error Rate / Severity Definition |
|---|---|---|---|---|---|
| **P0** | Critical | ≤ 15 min | ≤ 1 hour | ≤ 4 hours | Site down, total auth failure, data loss/corruption, active exploit, or any CVSS ≥ 7.0 vulnerability |
| **P1** | High | ≤ 1 hour | ≤ 4 hours | ≤ 24 hours | Core feature broken, login/checkout severely degraded, **systemic error rate > 5%** |
| **P2** | Medium | ≤ 4 hours | ≤ 1 business day | ≤ 1 week | Non-core feature broken, partial functionality impaired, **degraded error rate 1–5%** |
| **P3** | Low | ≤ 1 business day | Next sprint | ≤ 2 weeks | Minor cosmetic issues, edge-case bugs, **error rate < 1%** |

*Rationale:* > 5% represents systemic failure (1 in 20 requests failing). 1–5% indicates degraded but operational subsystem. < 1% is non-systemic anomaly.  
*Security Override:* Any reported CVE with CVSS ≥ 7.0 OR any unauthorized data/auth/payment exposure is **automatically P0**, regardless of traffic volume or affected user count.

*References:* `references/qa/BUG_PRIORITY_MATRIX.md`, `references/devops/INCIDENT_RESPONSE_RUNBOOK.md`, `references/devops/TECH_DEBT_HOTFIX_GUIDE.md`.

---

## 3. Rollback & Recovery SLAs

| Metric | Stateless Service | Stateful DB / Point-in-Time Recovery (PITR) |
|---|---|---|
| **P0 Rollback Execution (RTO)** | ≤ 5 minutes | 15–30 minutes |
| **Recovery Point Objective (RPO)** | 0 data loss (blue/green canary) | ≤ 5 minutes (WAL archive interval) |

*References:* `references/devops/ROLLBACK_DEPLOYMENT_GUIDE.md`, `references/devops/INCIDENT_RESPONSE_RUNBOOK.md`.

---

## 4. Frontend Performance Budgets & Web Vitals

### Initial JS Bundle Size (Wire / Gzipped)
- **Small Tier:** < 500 KB
- **Medium Tier:** < 300 KB (PR blocked if bundle increases > 20% without authorization)
- **Large / Enterprise:** < 200 KB

### Lighthouse Score Floors
| Category | Small | Medium | Large / Enterprise |
|---|---|---|---|
| **Performance** | ≥ 70 | ≥ 85 | ≥ 90 |
| **Accessibility (WCAG 2.1 AA)** | ≥ 70 (advisory) | ≥ 85 (enforced CI gate) | ≥ 90 (enforced CI gate) |
| **Best Practices** | ≥ 80 | ≥ 85 | ≥ 90 |
| **SEO** | ≥ 80 | ≥ 85 | ≥ 90 |

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint):** < 2.5s (Medium), < 2.0s (Large)
- **INP (Interaction to Next Paint):** < 200ms (Medium), < 150ms (Large)
- **CLS (Cumulative Layout Shift):** < 0.1 (All tiers)
- **TBT (Total Blocking Time):** < 300ms (Medium), < 200ms (Large)

*References:* `references/frontend/FRONTEND_PERFORMANCE_BUDGET.md`, `references/frontend/ACCESSIBILITY_MINIMUM_GATE.md`.

---

## 5. Usability Testing & Design Validation Thresholds

- **Task Completion Rate Floor:** ≥ 80% required for sprint demo / deployment pass.
- **Task Completion Blocker (< 80%):** If task completion is < 80%, the flow is blocked.
  - *Mandatory Remediation Loop:* Identify friction step → fix UI/flow → retest with 3+ new users → achieve ≥ 80% before Gate D / Sprint Demo sign-off.
- **System Usability Scale (SUS):** ≥ 68 minimum acceptable score (target: ≥ 80).

*References:* `references/frontend/DESIGN_VALIDATION_GUIDE.md`.

---

## 6. Rate Limiting Tiers (Sliding 15-Minute Window)

| Tier / Endpoint Type | Rate Limit | Scope | Header / Action |
|---|---|---|---|
| **Public / Unauthenticated** | 100 req / 15 min | Per IP | HTTP 429, Retry-After: 900s |
| **Authenticated User** | 1,000 req / 15 min | Per User ID | HTTP 429, standard user quota |
| **Auth Endpoints (Login/Signup)** | 5 req / 15 min | Per IP | HTTP 429 + CAPTCHA after 3 failures |
| **Sensitive (Password Reset, OTP)** | 3 req / 15 min | Per IP + User ID | HTTP 429, strict anti-brute-force |
| **Admin Endpoints** | 10,000 req / 15 min | Per User ID | Privileged operations quota |

*References:* `references/backend/API_RATE_LIMITING_STRATEGY.md`, `references/security/SECURITY_HARDENING_GUIDE.md`.

---

## 7. Legal & Regulatory Disclaimers

> ⚠️ **Framework Disclaimer:** This framework provides engineering best practices and operational lifecycle templates. It does **NOT** constitute formal legal, regulatory, or certified compliance advice. Projects with statutory compliance obligations (e.g. HIPAA, PCI-DSS, GDPR, SOC 2) or contractual liability sign-offs (`handover_formality: legal`) require verified review by a qualified human legal counsel or certified compliance auditor before public general availability.

---

**Last Updated:** 2026-09-23  
**Version:** 1.0.0
