# Security Gate Guide — Mandatory Checks Before Merge

**Purpose:** Enforce security review as a delivery gate, not an afterthought.

**When to run:** Every PR before merge to main/production branch.

---

## Gate: Security Review

**Trigger:** `gate:pr` (before merge)

**Pre-requisite:** Pre-commit secret scan hook installed (see `references/security/PRE_COMMIT_SECRET_SCAN_SETUP.md`). If not installed, block PR until added.

**Evidence required in PR description:**

```markdown
## Security Checklist

- [ ] SAST scan passed (no critical/high vulnerabilities)
- [ ] Dependency audit clean (npm audit / pip-audit / cargo audit)
- [ ] Secrets not hardcoded (checked with gitleaks / trufflehog)
- [ ] Auth/authz changes reviewed (if applicable)
- [ ] Input validation added for user-supplied data
- [ ] SQL injection prevented (parameterized queries / ORM)
```

**Automated enforcement (CI/CD):**

```yaml
# .github/workflows/security-gate.yml
name: Security Gate
on:
  pull_request:
    branches: [main, production]

# Principle of least privilege: block token write access by default
permissions:
  contents: read

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      # Supply Chain Hardening: Pin third-party GitHub Actions to immutable full commit SHAs
      - name: Checkout Repository
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
      
      - name: SAST Scan (CodeQL / Semgrep)
        uses: github/codeql-action/analyze@05963f47d870e2cb19a537396c1f668a348c7d8f # v3.24.8
        continue-on-error: false
      
      - name: Dependency Audit
        run: |
          npm audit --audit-level=high
          # or: pip-audit
          # or: cargo audit
      
      - name: Secret Scan (TruffleHog)
        uses: trufflesecurity/trufflehog@b11dd0f81d113426e2e584f29a007f354c4c9f7a # v3.88.2
        with:
          extra_args: --only-verified

  # Container Provenance & Image Signing (for Docker/K8s builds)
  container-signing:
    needs: security
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      id-token: write # Required for Cosign keyless OIDC signing
      packages: write
    steps:
      - name: Install Cosign
        uses: sigstore/cosign-installer@59acb6260d9c0ba8f4a2f9d9b4b1a6772273d4c6 # v3.5.0

      - name: Sign Container Image (Keyless OIDC)
        run: |
          # Sign container image digest to prove provenance and build pipeline integrity
          cosign sign --yes "${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ steps.build-and-push.outputs.digest }}"
```

---

## SAST Tools by Stack

| Stack | Tool | Command |
|-------|------|----------|
| Node.js | ESLint security plugin | `npx eslint --plugin security` |
| Python | Bandit | `bandit -r src/` |
| Go | Gosec | `gosec ./...` |
| Rust | Cargo audit | `cargo audit` |
| PHP | Psalm taint | `psalm --taint-analysis` |
| Ruby | Brakeman | `brakeman -z` |
| Java | SpotBugs | `mvn spotbugs:check` |
| .NET | Security Code Scan | `dotnet build /p:SecurityCodeScan=true` |

**Supply Chain Security:**

- **Dependency pinning:** Lock file committed (package-lock.json, Gemfile.lock, poetry.lock)
- **SBOM generation:** `syft . -o cyclonedx-json > sbom.json` (Medium+ projects)
- **Vulnerability scanning:** `grype sbom.json` or `trivy image myapp:latest`
- **License compliance:** `licensee detect` or `fossa analyze`
- **Code signing:** Sign releases (GPG, Sigstore) for Large+ projects

---

## Threat Modeling (Medium+ projects)

**When:** Phase 2 (Architecture), before Sprint 1 starts

**Method:** STRIDE (Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation)

**Template:**

```markdown
# Threat Model — [Project Name]

## Assets
- User credentials (email, password hash)
- Payment data (card tokens, transaction history)
- PII (name, address, phone)

## Trust Boundaries
- Client ↔ API (internet, untrusted)
- API ↔ Database (internal, trusted)
- API ↔ Payment gateway (external, semi-trusted)

## Threats (STRIDE)

### Spoofing
**T1:** Attacker impersonates user via stolen session token
- **Mitigation:** httpOnly cookies, short expiry (1h), refresh token rotation
- **Residual risk:** Low (industry standard)

### Tampering
**T2:** User modifies price in checkout request
- **Mitigation:** Server-side price lookup from DB, never trust client-sent price
- **Residual risk:** None

### Information Disclosure
**T3:** Logs contain plaintext passwords
- **Mitigation:** Mask sensitive fields in logger (password, token, cardNumber)
- **Residual risk:** None

[Continue for all STRIDE categories]
```

**Review cadence:** Every major feature that touches auth/payments/PII.

---

## Secret Management

**Never commit:**
- API keys, tokens, passwords
- Database credentials
- Private keys, certificates
- OAuth client secrets

**Allowed in repo:**
- `.env.example` (dummy values)
- Public keys
- Non-sensitive config

**Storage:**

| Environment | Storage | Access |
|-------------|---------|--------|
| **Local dev** | `.env` file (gitignored) | Manual copy from team vault |
| **Staging/Prod** | Vercel env vars / AWS Secrets Manager / Vault | CI/CD injects at deploy |

**Rotation policy:**
- API keys: Every 90 days
- DB passwords: Every 180 days
- OAuth secrets: On staff departure

**Tools:**
- Scan commits: `gitleaks detect --source .`
- Scan live: `trufflehog git file://. --only-verified`

---

## Compliance Checklists

### GDPR (EU users)
- [ ] Privacy policy published
- [ ] Cookie consent banner (if tracking cookies used)
- [ ] User data export endpoint (`/api/me/export`)
- [ ] User data deletion endpoint (`/api/me/delete`)
- [ ] Data processing agreement with third-party services

### SOC 2 (B2B SaaS)
- [ ] Access logs retained 1 year
- [ ] MFA enforced for admin accounts
- [ ] Encryption at rest (DB, backups)
- [ ] Encryption in transit (HTTPS, TLS 1.2+)
- [ ] Incident response plan documented

### PCI-DSS (payment cards)
- [ ] Never store full card number (use tokenization)
- [ ] Never store CVV
- [ ] Use PCI-compliant payment processor (Stripe, PayPal)
- [ ] Annual vulnerability scan

### OWASP Top 10 (2021) Checklist

**A01:2021 – Broken Access Control**
- [ ] Server-side authorization enforced (not client-only)
- [ ] User can only access their own resources (checked per request)
- [ ] Admin endpoints require admin role (middleware enforced)

**A02:2021 – Cryptographic Failures**
- [ ] Passwords hashed with bcrypt/Argon2 (not MD5/SHA1)
- [ ] HTTPS enforced (no mixed content)
- [ ] Secrets stored in env vars or vault (not hardcoded)

**A03:2021 – Injection**
- [ ] Parameterized queries used (no raw SQL with user input)
- [ ] User input validated (type, length, format)
- [ ] Output escaped (prevent XSS)

**A04:2021 – Insecure Design**
- [ ] Threat model documented (STRIDE)
- [ ] Rate limiting on login, API endpoints
- [ ] Security requirements in PRD

**A05:2021 – Security Misconfiguration**
- [ ] Default credentials changed
- [ ] Error messages don't leak stack traces
- [ ] Unnecessary features disabled

**A06:2021 – Vulnerable Components**
- [ ] Dependencies audited (npm audit, pip-audit)
- [ ] Auto-update enabled (Dependabot, Renovate)
- [ ] Deprecated packages removed

**A07:2021 – Authentication Failures**
- [ ] MFA available
- [ ] Password reset uses secure token (not email-in-URL)
- [ ] Session timeout enforced

**A08:2021 – Software and Data Integrity Failures**
- [ ] Code signing for releases
- [ ] CI/CD pipeline secured (no secrets in logs)
- [ ] Webhook signatures verified

**A09:2021 – Logging and Monitoring Failures**
- [ ] Login failures logged
- [ ] Critical errors alerted (PagerDuty, Slack)
- [ ] Logs retained 90+ days

**A10:2021 – Server-Side Request Forgery (SSRF)**
- [ ] URL validation (whitelist allowed domains)
- [ ] Internal IPs blocked (169.254.x.x, 10.x.x.x)
- [ ] User-supplied URLs sanitized

---

## Incident Response Playbook

**Trigger:** Security breach detected (unauthorized access, data leak, compromised credential)

**Steps:**

1. **Contain** (0-1h)
   - Revoke compromised credentials
   - Block attacker IP/account
   - Isolate affected service (if needed)

2. **Assess** (1-4h)
   - Check logs: when did breach start, what data accessed
   - Identify root cause (SQL injection, leaked token, etc.)

3. **Notify** (4-24h)
   - Internal: notify team, management
   - External: notify affected users (if PII exposed)
   - Legal: check breach notification law (GDPR: 72h, CCPA: no delay requirement)

4. **Remediate** (1-7 days)
   - Patch vulnerability
   - Rotate all related secrets
   - Deploy fix

5. **Post-mortem** (1 week after)
   - Document timeline, root cause, lessons learned
   - Update security checklist
   - Run tabletop exercise to improve response time

**Template:** `templates/closure/POST_MORTEM_TEMPLATE.md` (already exists, extend for security incidents)

---

## Security Review Cadence

| Event | Review Type | Lead |
|-------|-------------|----- |
| **Every PR** | Automated SAST + dependency audit | CI/CD |
| **Every Sprint** | Manual code review for auth/payment changes | Senior dev |
| **Every Release** | Penetration test (manual or automated scan) | Security engineer |
| **Quarterly** | Dependency update + vulnerability rescan | DevOps |
| **Annually** | External security audit (if regulated) | Third-party auditor |

---

**Integration with existing gates:**

Update `engine/GATE-REGISTRY.md`:

```markdown
### gate:pr (Pull Request)

**Evidence:**
- All tests passed
- Code review approved (1+ reviewer)
- **Security checklist completed** ← NEW
- OWNERSHIP.md check passed (if multi_agent: true)

**Blocker:** PR cannot merge if security scan fails (critical/high vulnerabilities).
```

---

**Agent Instruction:**

Before merging any PR that touches:
- Auth (login, logout, session, token)
- Payment (checkout, refund, webhook)
- User input (form, API endpoint, file upload)
- Database query (raw SQL, ORM)

Run security checklist. Do not merge without evidence.
