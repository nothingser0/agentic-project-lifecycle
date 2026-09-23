# Security Hardening Guide — Phase 5

**Purpose:** Turn the Phase 5 Security answers (Q34-Q39b) into concrete content for `docs/security/REQUIREMENTS.md`, `CHECKLIST.md`, `THREAT-MODEL.md`, and `COMPLIANCE.md` — and give the coding agent real hardening rules to follow via AGENTS.md, not just a checkbox list.

Read this when: Phase 5 Security questions come up, or when generating any file under `docs/security/`.

## Contents

- [Why security gets its own guide](#why-security-gets-its-own-guide)
- [Q34 — Security Level](#q34-security-level)
- [Q35 — Hardening Checklist](#q35-hardening-checklist)
- [Q36 — Secrets Management](#q36-secrets-management)
- [Q37 — CORS Strategy](#q37-cors-strategy)
- [Q38 — Rate Limiting](#q38-rate-limiting)
- [Q39 — Audit Logging](#q39-audit-logging)
- [Q39a — DDoS Protection](#q39a-ddos-protection)
- [Q39b — API Security](#q39b-api-security)
- [Writing THREAT-MODEL.md](#writing-threat-modelmd)
- [Writing COMPLIANCE.md](#writing-compliancemd)

## Why security gets its own guide

Every other Phase 5 category (Testing, Monitoring, AI) has a reference file with real depth. Security was historically just a bare list of topic names with no options and no guidance — the single biggest content gap in this skill, because `docs/security/` generates 7 files including a threat model and a pentest checklist that an agent cannot write well from a one-line prompt. This file exists to close that gap.

## Q34 — Security Level

Pick the floor, not the ceiling — a "Standard" project can still add specific Hardened-tier controls if the threat model calls for it.

- **Basic** — auth (password hashing, session/JWT expiry) + HTTPS everywhere. Fine for internal tools, prototypes, no PII.
- **Standard** — Basic + OWASP Top 10 mitigations applied deliberately (not just "we used a framework so we're fine"). Default recommendation for anything with real users.
- **Hardened** — Standard + dependency scanning in CI, secrets rotation, rate limiting, audit logging. Recommend when the project handles payments, health data, or is a B2B SaaS a customer will security-review.
- **Compliance-grade** — Hardened + encryption at rest, immutable audit trail, documented data flows, access reviews. Required whenever Q94 (Compliance) names GDPR/HIPAA/PCI-DSS/SOC 2/FedRAMP — don't let a team pick "Basic" here and also answer "yes" to HIPAA; flag the contradiction back to the user.

## Q35 — Hardening Checklist

These four map directly to OWASP's most exploited categories and should be non-negotiable defaults regardless of level:

1. **Input validation & sanitization** — validate on the server, not just the client. Reject unexpected shapes rather than trying to "clean" them.
2. **SQL injection prevention** — parameterized queries or an ORM (Prisma, Drizzle, ActiveRecord) that does this by default. Flag any raw string-concatenated SQL in code review.
3. **XSS protection** — Content-Security-Policy header (see `references/security/CSP_CONFIGURATION_GUIDE.md`), and treat every framework's "auto-escaping" as a default that must not be bypassed with `dangerouslySetInnerHTML` / `v-html` / `{!! !!}` without a specific reason.
4. **Dependency & static code scanning** — `npm audit` / `pip-audit` plus SAST scanning (Semgrep) in CI at minimum; Snyk or Dependabot for automated PRs on Standard+ projects.

## Q36 — Secrets Management

Filtered by Q15 budget, same tiers used elsewhere in the skill:

| Budget | Recommendation | Why |
|---|---|---|
| $0, solo | `.env` + `.gitignore`, never commit real secrets | Simplest thing that can't leak via git history if done right |
| $5-50 | GitHub Actions encrypted secrets | Free, integrates with existing CI |
| $50-500 | Doppler or Infisical | Central secret store, per-environment values, audit log of who read what |
| Enterprise | HashiCorp Vault or cloud KMS (AWS Secrets Manager / GCP Secret Manager) | Dynamic secrets, automatic rotation, fine-grained IAM |

Whatever tier: secrets never go in the repo, never in client-side bundles, and the `.env.example` file lists variable *names* only.

## Q37 — CORS Strategy

Default to **explicit origin allowlist** — never `Access-Control-Allow-Origin: *` in production, and especially never combined with `Access-Control-Allow-Credentials: true` (that combination is a real vulnerability, not a style preference). If the frontend and API share a domain, same-origin requests need no CORS config at all — check that before adding one.

## Q38 — Rate Limiting

Pick based on what's being protected, not just budget:

- **None** — acceptable only for auth-gated internal tools with no public endpoints.
- **IP-based, fixed window** (Upstash Ratelimit, Vercel Edge Config, or a Redis `INCR`+`EXPIRE` pair) — good default for public APIs and login endpoints specifically (prevents brute force).
- **Token bucket, per-user** — for API products where you want to allow bursts but cap sustained usage (ties into a pricing/tier model).
- **Distributed rate limiting** — needed once the app runs on more than one instance/edge location and in-memory counters would undercount.

Always rate-limit the login and password-reset endpoints specifically, even at "Basic" security level — credential stuffing is the most common low-effort attack any public app will see.

## Q39 — Audit Logging

- **None** — fine for Basic-level internal tools.
- **App-level events** — log authentication, permission changes, and destructive actions (delete, bulk export) with actor + timestamp. This is the right default for Standard level.
- **Full request/response logging** — needed for compliance-grade projects where "what did the system do" must be reconstructable; be explicit that this must exclude secrets/PII from log bodies.
- **Immutable audit log** (append-only table, or WORM storage like S3 Object Lock) — required for regulated industries where logs themselves must not be alterable, including by admins.

## Q39a — DDoS Protection

- **None** — internal tools behind auth, not worth the setup cost.
- **Platform-provided** — Vercel, Cloudflare Pages, and most modern PaaS include basic DDoS mitigation for free; this covers most MVP/small-team needs.
- **Cloudflare in front of origin** — free tier, worth adding once the app is public-facing and self-hosted (VPS, custom server) rather than on a platform that already includes it.
- **AWS Shield Advanced / Cloudflare Enterprise** — only justify this for high-value targets (fintech, anything that's been targeted before, or contractually required by an enterprise customer).

## Q39b — API Security

Filtered by Q20 (API style):

- **API keys only** — simplest, fine for server-to-server or low-stakes public APIs. Rotate-able, but no per-request user identity.
- **OAuth 2.0 scopes** — when third parties need delegated, limited access on a user's behalf (the standard choice for public APIs with an app ecosystem).
- **JWT with short expiry + refresh rotation** — the default for first-party web/mobile clients talking to your own backend; keep access tokens short-lived (minutes) and refresh tokens rotating.
- **mTLS** — service-to-service only, when both ends are infrastructure you control (microservices, internal mesh) — not appropriate for end-user-facing auth.

## Penetration Testing Workflow

**When to run:** Before production launch (Medium+), quarterly (Large+), after major security changes.

### Penetration Testing Tiers

| Tier | Frequency | Scope | Method | Cost |
|------|-----------|-------|--------|------|
| **Small** | Not required | N/A | N/A | $0 |
| **Medium** | Before launch | Self-assessment (OWASP ZAP) | Automated | $0 |
| **Large** | Quarterly | Automated + manual checklist | Internal security team | $0-500 |
| **Enterprise** | Quarterly + after major changes | Professional pentest | External firm | $5k-15k |

### Self-Assessment Pentest (Medium Projects)

**Tools (Free):**
- **OWASP ZAP** (Zed Attack Proxy) — automated web app scanner
- **Burp Suite Community** — manual testing + intercepting proxy
- **Nikto** — web server scanner
- **SQLMap** — SQL injection scanner

**Setup OWASP ZAP:**

```bash
# Install
brew install --cask owasp-zap  # macOS
# or download from https://www.zaproxy.org/download/

# Run automated scan
zap-cli quick-scan --self-contained \
  --start-options '-config api.disablekey=true' \
  https://staging.example.com

# Output: alerts.json (vulnerabilities found)
```

**Static Application Security Testing (SAST — Code Analysis in CI):**

While DAST (ZAP) scans running HTTP endpoints, SAST inspects source code for security flaws before code merges:

```bash
# Run Semgrep with OWASP Top 10 rules
npx semgrep --config=p/owasp-top-ten --error
```

**Manual checklist (OWASP Top 10 2021):**

```markdown
# Penetration Test Checklist — [Project Name]

**Date:** 2026-09-22
**Tester:** [contributor]
**Target:** https://staging.example.com
**Duration:** 2 hours

## A01: Broken Access Control
- [ ] Test horizontal privilege escalation (user A access user B's data)
  - Method: Change `userId` param in API call
  - Result: ✅ Blocked (403 Forbidden)
- [ ] Test vertical privilege escalation (user → admin)
  - Method: Change `role` cookie value
  - Result: ✅ Blocked (role verified server-side)
- [ ] Test IDOR (Insecure Direct Object Reference)
  - Method: Enumerate `/api/employees/{id}` with sequential IDs
  - Result: ⚠️ Exposed (returns 200 for all IDs) → **FIX REQUIRED**

## A02: Cryptographic Failures
- [ ] HTTPS enforced (no HTTP fallback)
  - Result: ✅ HSTS header present
- [ ] Sensitive data encrypted at rest (database)
  - Result: ✅ Database encryption enabled (Supabase)
- [ ] Passwords hashed with strong algorithm
  - Result: ✅ bcrypt (cost factor 10)

## A03: Injection
- [ ] SQL injection test
  - Method: Input `' OR '1'='1` in login form
  - Result: ✅ Blocked (parameterized queries)
- [ ] XSS (Cross-Site Scripting) test
  - Method: Input `<script>alert('XSS')</script>` in name field
  - Result: ✅ Escaped (React auto-escaping)
- [ ] Command injection test
  - Method: Input `; ls -la` in file upload name
  - Result: ✅ Blocked (filename sanitized)

## A04: Insecure Design
- [ ] Rate limiting on login
  - Method: Attempt 100 login requests in 1 minute
  - Result: ✅ Blocked after 5 attempts (429 Too Many Requests)
- [ ] CAPTCHA on public forms
  - Result: ❌ Not implemented → **NICE-TO-HAVE** (low priority)

## A05: Security Misconfiguration
- [ ] Error messages don't leak stack traces
  - Method: Trigger 500 error (invalid DB query)
  - Result: ✅ Generic error message (no stack trace)
- [ ] Security headers present
  - CSP (Content-Security-Policy): ✅ Present
  - X-Frame-Options: ✅ DENY
  - X-Content-Type-Options: ✅ nosniff
  - Strict-Transport-Security: ✅ Present

## A06: Vulnerable & Outdated Components
- [ ] Dependency scan
  - Tool: `npm audit`
  - Result: ⚠️ 2 moderate vulnerabilities → **FIX REQUIRED**
  - Action: `npm audit fix`

## A07: Identification & Authentication Failures
- [ ] Password policy enforced (min 8 chars, complexity)
  - Result: ✅ Enforced client + server side
- [ ] Session timeout enforced
  - Result: ✅ 30 minutes idle timeout
- [ ] Multi-factor authentication (MFA)
  - Result: ⚠️ Enforced for admin accounts; optional for general users → **RECOMMENDED for Standard, MANDATORY for Hardened/Compliance**

## A08: Software & Data Integrity Failures
- [ ] Unsigned packages rejected
  - Result: ✅ npm/yarn integrity checks enabled
- [ ] CI/CD pipeline signed commits
  - Result: ❌ Not enforced → **BACKLOG**

## A09: Security Logging & Monitoring Failures
- [ ] Failed login attempts logged
  - Result: ✅ Logged with IP + timestamp
- [ ] Admin actions logged
  - Result: ✅ Audit log table (user_id, action, timestamp)

## A10: Server-Side Request Forgery (SSRF)
- [ ] URL validation on external API calls
  - Method: Input `http://localhost:5432` in webhook URL field
  - Result: ✅ Blocked (allowlist of external domains)

---

## Summary

**Critical issues:** 1 (IDOR vulnerability)
**High issues:** 1 (outdated dependencies)
**Medium issues:** 0
**Low issues:** 2 (no CAPTCHA, no signed commits)

**Action items:**
1. **CRITICAL:** Fix IDOR in `/api/employees/{id}` (add auth check)
2. **HIGH:** Update dependencies (`npm audit fix`)
3. **BACKLOG:** Add CAPTCHA on public forms
4. **BACKLOG:** Enforce signed commits in CI

**Next pentest:** 2026-12-22 (3 months)
```

### Professional Pentest (Enterprise)

**When to hire:**
- Handling payments (PCI-DSS requirement)
- Healthcare data (HIPAA requirement)
- Enterprise sales require it (security questionnaire)
- After major security incident

**Providers:**
- **Cobalt** ($5k-10k, continuous pentesting platform)
- **Synack** ($10k-15k, crowdsourced pentesters)
- **Bishop Fox** ($15k-50k, boutique firm)
- **HackerOne** (bug bounty program, ongoing)

**Deliverables:**
- Detailed report (vulnerabilities + severity + remediation)
- Executive summary (non-technical)
- Retest after fixes (included in price)
- Compliance letter (for PCI-DSS, SOC 2)

**Timeline:**
- Week 1: Kick-off + scoping
- Week 2-3: Testing (automated + manual)
- Week 4: Report delivery
- Week 5-6: Remediation
- Week 7: Retest

---

## Writing THREAT-MODEL.md

Don't write a generic "we considered security" paragraph. Use STRIDE at minimum: for each major component (auth, API, database, file storage, third-party integrations), name one plausible threat per category (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) and the mitigation already chosen from Q34-Q39b above. A threat model that doesn't reference the project's actual architecture is boilerplate and should be rewritten.

**Concrete boilerplate check (apply this before considering THREAT-MODEL.md done):**
for each of the ~30 STRIDE entries (6 categories × ~5 components), the threat
description must name a **specific element from this project's own
`ARCHITECTURE.md`** — an actual table name, endpoint path, service name, or data flow
arrow — not a category-level generality. "Tampering: an attacker could tamper with
data" is boilerplate regardless of which component it's filed under. "Tampering: a
user without the `admin` role could modify the `payroll_runs.status` column directly
via a mass-assignment vulnerability in `PATCH /api/payroll/:id` if the API doesn't
allowlist updatable fields" is specific and checkable — a reviewer can verify it
either does or doesn't apply to the actual code. If an entry can be copy-pasted into
an unrelated project's threat model without changing a single noun, it fails this
check and must be rewritten with the project's actual component names before the
security gate can pass.

## Writing COMPLIANCE.md

Only generate real content here if Q94/Q95 named an actual regime (GDPR/CCPA/HIPAA/PCI-DSS/SOC 2/ISO 27001/FedRAMP). If none apply, say so explicitly rather than inventing generic "we take compliance seriously" language — an empty-but-honest file is more useful than padded boilerplate a reviewer will discount.

---

**Version:** 1.0.0
**Part of:** Phase 5 (Security)
