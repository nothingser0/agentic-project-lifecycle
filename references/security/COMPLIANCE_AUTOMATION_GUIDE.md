# Compliance Automation Guide — GDPR, HIPAA, SOC 2

> ⚠️ **LEGAL DISCLAIMER & MANDATORY HUMAN REVIEW NOTICE:**
> This document and all generated compliance checklists provide technical engineering guidance only and **DO NOT constitute legal advice, statutory interpretation, or regulatory certification**.
> Passing automated technical checks or completing these engineering checklists does not grant legal compliance with GDPR, HIPAA, SOC 2, PCI-DSS, or other statutory regimes.
> Under `engine/DECISION-RULES.md:48-55` and `engine/GATE-REGISTRY.md:23`, an AI agent is strictly forbidden from self-certifying compliance. Formal legal sign-off by a qualified attorney, compliance officer, or certified auditor is mandatory before processing live regulated data or passing Gate C (`legal_reviewed_by`).

**Purpose:** Auto-generate compliance checklists, data mapping, audit logs when legal/compliance requirements selected.

**When to use:** Phase 1 (Planning) when compliance requirement detected (GDPR, HIPAA, SOC 2, CCPA, PCI-DSS).

---

## Compliance Requirements by Regulation

| Regulation | Applies To | Key Requirements |
|------------|-----------|------------------|
| **GDPR** | EU users' personal data | Consent, data export, right to erasure, breach notification (72h) |
| **CCPA** | California residents | Data disclosure, opt-out of sale, deletion rights |
| **HIPAA** | US healthcare data (PHI) | Encryption at rest/transit, access logs, BAA with vendors |
| **SOC 2 Type II** | SaaS vendors (trust) | Security, availability, confidentiality controls (audited) |
| **PCI-DSS** | Payment card data | Tokenization, no storing CVV, quarterly scans |
| **ISO 27001** | Enterprise security | ISMS, risk assessment, incident response |

---

## Automation Workflow

### Trigger: Compliance Selected

**During Phase 1a (PRD), detect compliance keywords:**

```typescript
// engine/compliance-detector.ts

const prd = readFile('docs/PRD.md')
const keywords = {
  GDPR: ['EU', 'European', 'GDPR', 'personal data', 'privacy'],
  HIPAA: ['health', 'medical', 'PHI', 'patient', 'HIPAA'],
  SOC2: ['enterprise', 'audit', 'SOC 2', 'compliance', 'trust report'],
  PCIDSS: ['payment', 'credit card', 'PCI', 'card data'],
}

const detected = []
for (const [regulation, terms] of Object.entries(keywords)) {
  if (terms.some(term => prd.toLowerCase().includes(term.toLowerCase()))) {
    detected.push(regulation)
  }
}

if (detected.length > 0) {
  console.log(`🔒 Compliance requirements detected: ${detected.join(', ')}`)
  console.log('Generating compliance checklists...')
  
  for (const reg of detected) {
    await generateComplianceChecklist(reg)
  }
}
```

**Output:**

```
🔒 Compliance requirements detected: GDPR, SOC 2
Generating compliance checklists...
✅ Created docs/compliance/GDPR_CHECKLIST.md
✅ Created docs/compliance/SOC2_CHECKLIST.md
✅ Created docs/compliance/DATA_MAPPING.md
✅ Added audit logging to security requirements
```

---

## GDPR Checklist Template

**Auto-generated at:** `docs/compliance/GDPR_CHECKLIST.md`

```markdown
# GDPR Compliance Checklist

**Regulation:** General Data Protection Regulation (EU 2016/679)  
**Applies to:** Any app processing EU residents' personal data

**Last updated:** 2026-09-22  
**Compliance status:** ❌ Not started

---

## Article 6: Lawful Basis for Processing

- [ ] **Consent mechanism implemented**
  - [ ] Clear, affirmative action (not pre-ticked checkboxes)
  - [ ] Separate consent for each purpose (marketing, analytics, etc.)
  - [ ] Withdrawal as easy as giving consent
  - [ ] Record of consent stored (timestamp, IP, consent text)
  
  **Implementation:**
  - File: `app/auth/consent-banner.tsx`
  - Database: `consent_logs` table (user_id, purpose, granted_at, ip)

- [ ] **Legitimate interest assessment documented (if applicable)**
  - File: `docs/compliance/LEGITIMATE_INTEREST_ASSESSMENT.md`

---

## Article 13-14: Privacy Notice

- [ ] **Privacy Policy published** (URL: /privacy)
  - [ ] Identity of data controller (company name, contact)
  - [ ] Purposes of processing
  - [ ] Legal basis (consent, contract, legitimate interest)
  - [ ] Data retention periods
  - [ ] User rights (access, rectification, erasure, portability, objection)
  - [ ] Right to lodge complaint with supervisory authority
  
  **File:** `app/privacy/page.tsx`
  
- [ ] **Privacy notice shown before/at data collection**
  - Signup form links to Privacy Policy
  - Consent banner on first visit

---

## Article 15: Right of Access

- [ ] **Data export endpoint implemented** (`/api/me/export`)
  - [ ] Returns all personal data in machine-readable format (JSON)
  - [ ] Includes: account data, posts, comments, orders, analytics events
  - [ ] Authenticated users only (verify identity)
  - [ ] Rate limited (1 request per 24h to prevent abuse)
  
  **File:** `app/api/me/export/route.ts`
  
  **Test:**
  ```bash
  curl -H "Authorization: Bearer $TOKEN" https://myapp.com/api/me/export
  # Should return JSON with all user data
  ```

---

## Article 16: Right to Rectification

- [ ] **Account settings page allows editing personal data**
  - [ ] Email, name, phone, address editable
  - [ ] Changes logged (audit trail)
  
  **File:** `app/settings/page.tsx`

---

## Article 17: Right to Erasure

- [ ] **Account deletion endpoint implemented** (`/api/me/delete`)
  - [ ] Hard delete user-generated content (posts, comments)
  - [ ] Anonymize data with legal retention (orders: 7 years)
  - [ ] Record deletion tombstone in `gdpr_erasure_tombstones` table
  - [ ] Delete from active backups after snapshot retention period
  - [ ] Confirmation required (type "DELETE" to confirm)
  - [ ] Email confirmation sent after deletion
  
  **File:** `app/api/me/delete/route.ts`
  
  **Test:**
  ```bash
  curl -X DELETE -H "Authorization: Bearer $TOKEN" https://myapp.com/api/me/delete
  # User account should be deleted, data anonymized
  ```

### Erasure Tombstone & Backup Replay Pattern (Non-Negotiable)

**The Conflict:** GDPR Article 17 mandates prompt erasure of user personal data, but disaster-recovery database backups are retained for 30–90 days as immutable snapshots. If a database is restored from a backup following a disaster or ransomware event, previously purged personal data is silently resurrected, committing a severe GDPR violation.

**The Solution:**
1. **Erasure Tombstone Log:** When `/api/me/delete` executes, write an append-only tombstone record containing:
   - `user_id_hash`: SHA-256 hash of user ID / email
   - `erased_at`: ISO 8601 UTC timestamp
   - `request_id`: Audit confirmation identifier
2. **Dedicated Out-of-Band Storage:** Store the tombstone log in a resilient, independently backed up store (e.g. S3 Object Lock in compliance mode, or dedicated audit database).
3. **Mandatory Disaster Recovery Replay:** Integrate post-restore tombstone replay into `docs/operations/BACKUP-RESTORE.md` and `references/devops/DISASTER_RECOVERY_GUIDE.md`:
   ```bash
   # /opt/scripts/post-restore-gdpr-replay.sh
   # Executed immediately after any database backup restoration before opening traffic
   echo "Replaying GDPR erasure tombstones against restored database..."
   psql $DATABASE_URL << 'EOF'
   DELETE FROM users WHERE id IN (
     SELECT user_id FROM gdpr_erasure_tombstones WHERE erased_at <= NOW()
   );
   EOF
   echo "Restored database sanitized of erased accounts."
   ```
4. **Traffic Gate:** Production health checks must block external traffic after a restore until `post-restore-gdpr-replay.sh` exits with code 0.

- [ ] **Data retention policy documented**
  - File: `docs/compliance/DATA_RETENTION_POLICY.md`
  
  **Retention periods:**
  - User accounts: Active + 3 years inactive
  - Audit logs: 1 year
  - Payment records: 7 years (legal requirement)

---

## Article 20: Right to Data Portability

- [ ] **Data export in portable format (JSON, CSV)**
  - Same endpoint as Article 15 (`/api/me/export`)
  - Format: JSON (machine-readable, structured)

---

## Article 25: Data Protection by Design & Default

- [ ] **Minimal data collection**
  - [ ] Don't collect data you don't need (e.g., no "mother's maiden name" if not used)
  - [ ] Forms have only required fields, optional fields clearly marked
  
- [ ] **Pseudonymization / anonymization where possible**
  - [ ] Analytics use hashed user IDs (not raw emails)
  - [ ] Logs don't contain PII (use user_id, not email)

- [ ] **Privacy settings default to most restrictive**
  - [ ] Marketing emails opt-in (not opt-out)
  - [ ] Profile visibility default to "private"

---

## Article 32: Security of Processing

- [ ] **Encryption at rest**
  - [ ] Database credentials encrypted (env vars, secrets manager)
  - [ ] Backups encrypted (S3 server-side encryption)
  - [ ] Sensitive fields hashed (passwords: bcrypt/argon2)
  
- [ ] **Encryption in transit**
  - [ ] HTTPS enforced (HSTS header)
  - [ ] Database connections use TLS
  - [ ] API calls to third parties use HTTPS

- [ ] **Access control**
  - [ ] Role-based access (admin, user, guest)
  - [ ] Principle of least privilege
  - [ ] MFA for admin accounts

- [ ] **Audit logging**
  - [ ] Log access to personal data (who, what, when)
  - [ ] Logs stored for 1 year
  - [ ] File: `database/audit_logs` table

---

## Article 33: Breach Notification

- [ ] **Breach detection monitoring**
  - [ ] Failed login alerts (> 10 failures in 1 hour)
  - [ ] Unusual data export volume alerts
  - [ ] Database access from unknown IPs

- [ ] **Breach response plan documented**
  - File: `docs/operations/BREACH_RESPONSE_PLAN.md`
  
  **Timeline:**
  - T+0: Detect breach (monitoring alert)
  - T+1h: Contain breach (revoke credentials, block IP)
  - T+24h: Assess impact (how many users affected?)
  - T+72h: Notify supervisory authority (DPA) if high risk
  - T+72h: Notify affected users if high risk to rights/freedoms

- [ ] **Breach notification template prepared**
  - Email template: `templates/email/breach-notification.html`

---

## Article 35: Data Protection Impact Assessment (DPIA)

**Required when:** High risk to user rights (large-scale processing, sensitive data, automated decisions)

- [ ] **DPIA completed (if applicable)**
  - File: `docs/compliance/DPIA.md`
  
  **Triggers:**
  - Processing health data (HIPAA + GDPR)
  - Automated credit scoring
  - Large-scale monitoring (> 100k users)

---

## Records of Processing Activities (Article 30)

- [ ] **Data inventory maintained**
  - File: `docs/compliance/DATA_MAPPING.md`
  
  **Required info:**
  - What data is collected (email, name, IP, etc.)
  - Why (purpose: account creation, analytics, marketing)
  - Where stored (database, S3, third-party services)
  - Who has access (engineers, support, marketing)
  - Retention period (3 years, 7 years, etc.)
  - Cross-border transfers (EU → US via SCCs)

---

## Third-Party Processors (Article 28)

- [ ] **Data Processing Agreements (DPAs) signed**
  - [ ] AWS / GCP / Azure (cloud hosting)
  - [ ] Stripe / PayPal (payment processing)
  - [ ] SendGrid / Postmark (email)
  - [ ] Sentry / LogRocket (error tracking)
  - [ ] Google Analytics / Mixpanel (analytics)

**DPA checklist per vendor:**
- [ ] Vendor is GDPR-compliant (check their website)
- [ ] DPA signed (usually auto-signed on signup)
- [ ] Sub-processors disclosed (vendor's sub-vendors)
- [ ] Data location known (EU vs US vs multi-region)
- [ ] Standard Contractual Clauses (SCCs) in place (if non-EU vendor)

**File:** `docs/compliance/DPA_REGISTER.md`

---

## Compliance Verification

**Manual tests (before production launch):**

1. **Consent test:**
   - [ ] Open site in incognito
   - [ ] Consent banner appears before any tracking
   - [ ] Clicking "Reject all" disables analytics/marketing cookies

2. **Data export test:**
   - [ ] Create test account
   - [ ] Add data (posts, comments, orders)
   - [ ] Request data export
   - [ ] Verify JSON contains all data

3. **Data deletion test:**
   - [ ] Create test account
   - [ ] Delete account via `/api/me/delete`
   - [ ] Verify user record deleted from database
   - [ ] Verify posts/comments deleted
   - [ ] Verify orders anonymized (not deleted)

4. **Privacy Policy test:**
   - [ ] Privacy Policy accessible at `/privacy`
   - [ ] Contains all Article 13 disclosures
   - [ ] Updated within last 12 months

---

## Ongoing Compliance (Post-Launch)

**Quarterly:**
- [ ] Review data retention policy (delete expired data)
- [ ] Audit third-party processors (any new vendors?)
- [ ] Check for data breaches (review logs)

**Annually:**
- [ ] Update Privacy Policy (if data practices changed)
- [ ] Review DPAs (any expired?)
- [ ] DPIA refresh (if high-risk processing)
- [ ] Employee training (GDPR awareness)

---

## Resources

**Official:**
- [GDPR Full Text](https://gdpr-info.eu/)
- [ICO Guidance (UK DPA)](https://ico.org.uk/for-organisations/guide-to-data-protection/)
- [CNIL Guidance (French DPA)](https://www.cnil.fr/en/home)

**Tools:**
- [iubenda Privacy Policy Generator](https://www.iubenda.com/)
- [OneTrust Cookie Consent](https://www.onetrust.com/)
- [Osano Consent Manager](https://www.osano.com/)

**DPA Templates:**
- [AWS Data Processing Addendum](https://aws.amazon.com/compliance/gdpr-center/)
- [Stripe DPA](https://stripe.com/privacy-center/legal#data-processing-agreement)

---

**Compliance status:** Update this checklist as you implement each requirement.

**Last review:** 2026-09-22  
**Next review:** 2026-12-22 (quarterly)
```

---

## SOC 2 Type II Checklist Template

**Auto-generated at:** `docs/compliance/SOC2_CHECKLIST.md`

```markdown
# SOC 2 Type II Compliance Checklist

**Framework:** AICPA Trust Services Criteria (TSC)  
**Applies to:** SaaS vendors storing customer data

**Audit scope:** Security, Availability, Confidentiality  
**Audit period:** 12 months (rolling)

**Last updated:** 2026-09-22  
**Compliance status:** ❌ Not started (requires 6-12 months preparation)

---

## Overview

**SOC 2 Type II** = Independent audit of security controls over 12 months.

**Cost:** $15k-50k (audit fees)  
**Timeline:** 6-12 months preparation + 3-6 months audit

**When to pursue:** Enterprise sales require it (security questionnaires)

---

## Trust Services Criteria (TSC)

### CC1: Control Environment

**Leadership commitment to security:**

- [ ] Security policy documented (`docs/security/SECURITY_POLICY.md`)
- [ ] Executive sponsor assigned (CTO, CISO)
- [ ] Security training for all employees (annual)
- [ ] Background checks for employees with data access
- [ ] Code of conduct signed by all employees

---

### CC2: Communication & Information

**Security responsibilities communicated:**

- [ ] Employee handbook includes security section
- [ ] Onboarding includes security training
- [ ] Incident response contacts documented
- [ ] Vendor security requirements documented

---

### CC3: Risk Assessment

**Risk identification & mitigation:**

- [ ] Annual risk assessment completed (`docs/security/RISK_ASSESSMENT.md`)
- [ ] Identified risks: SQL injection, XSS, credential leaks, DDoS, insider threats
- [ ] Mitigation controls documented (WAF, input validation, MFA, rate limiting)

---

### CC4: Monitoring Activities

**Control effectiveness monitored:**

- [ ] Quarterly security reviews (pen test, vulnerability scan)
- [ ] Failed login monitoring (alert on > 10 failures/hour)
- [ ] Database access logs reviewed weekly
- [ ] Code review checklist enforced on all PRs

---

### CC5: Control Activities

**Technical controls implemented:**

- [ ] MFA enforced for admin accounts
- [ ] Least privilege access (role-based)
- [ ] Encryption at rest (database, backups)
- [ ] Encryption in transit (HTTPS, TLS)
- [ ] Vulnerability scanning (Snyk, Dependabot)
- [ ] Web Application Firewall (Cloudflare, AWS WAF)
- [ ] Rate limiting on API endpoints
- [ ] Input validation (Zod schemas)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (CSP headers, sanitized output)

---

### CC6: Logical & Physical Access

**Access restricted to authorized users:**

- [ ] Production access requires MFA
- [ ] SSH keys rotated every 90 days
- [ ] Database access logs retained 1 year
- [ ] Offboarding checklist (revoke all access within 24h)
- [ ] Physical access (if self-hosted): badge system, visitor logs

---

### CC7: System Operations

**System changes controlled:**

- [ ] Change management policy (`docs/operations/CHANGE_MANAGEMENT.md`)
- [ ] All production changes via PR (no cowboy deploys)
- [ ] PR requires 1 approval + CI pass
- [ ] Rollback plan documented for breaking changes
- [ ] Deployment log retained (who, what, when)

---

### CC8: Change Management

**System changes tested before production:**

- [ ] Staging environment mirrors production
- [ ] Changes tested in staging first
- [ ] Automated tests run on every PR
- [ ] Load testing for high-impact changes

---

### CC9: Risk Mitigation

**Additional security controls:**

- [ ] Intrusion detection (Crowdsec, Fail2ban)
- [ ] DDoS protection (Cloudflare)
- [ ] Backup encryption (S3 server-side)
- [ ] Disaster recovery plan tested quarterly

---

## Additional Controls (Availability, Confidentiality)

### A1: Availability

**System uptime monitored:**

- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] SLA target: 99.9% uptime
- [ ] Incident response time: < 1 hour
- [ ] Status page published (status.myapp.com)

---

### C1: Confidentiality

**Sensitive data protected:**

- [ ] NDA signed by all employees
- [ ] Customer data segregated (multi-tenancy)
- [ ] Data access logs (who accessed what customer's data)
- [ ] No production data in development/staging

---

## Audit Evidence Requirements

**Auditor will request samples:**

- [ ] 25 random PRs (check: code review, CI passed, approval)
- [ ] 10 random employees (check: background check, training completed)
- [ ] Incident response logs (last 12 months)
- [ ] Vulnerability scan reports (quarterly)
- [ ] Backup restore drill logs (quarterly)
- [ ] Access logs (database, admin panel)

**Preparation:**
- Save evidence as you go (don't scramble at audit time)
- Use tools: GitHub audit log, Vanta, Drata, Secureframe (automate evidence collection)

---

## SOC 2 Automation Tools

**Compliance automation platforms** (reduce manual work):

| Tool | Price | Features |
|------|-------|----------|
| **Vanta** | $3k-10k/year | Auto-collects evidence (GitHub, AWS, Google Workspace) |
| **Drata** | $3k-10k/year | Similar to Vanta, broader integrations |
| **Secureframe** | $3k-10k/year | SOC 2, ISO 27001, HIPAA automation |
| **Tugboat Logic** | $5k-15k/year | Enterprise-focused |

**Recommendation:** Use automation tool if pursuing SOC 2 (saves 50+ hours manual evidence collection).

---

## Timeline

**Month 1-3:** Gap assessment (what controls are missing?)  
**Month 4-6:** Implement missing controls (MFA, monitoring, policies)  
**Month 7-12:** Evidence collection period (auditor observes controls working)  
**Month 13-15:** Audit fieldwork (auditor reviews evidence)  
**Month 16:** Report issued

---

## Cost

**Audit fees:** $15k-50k (depends on company size, complexity)  
**Automation tool:** $3k-10k/year  
**Pen test (required):** $5k-15k  
**Total Year 1:** $25k-75k

---

**Compliance status:** ❌ Not started (SOC 2 requires 6-12 months prep)  
**Recommendation:** Only pursue if enterprise sales require it.
```

---

## Data Mapping Template

**Auto-generated at:** `docs/compliance/DATA_MAPPING.md`

```markdown
# Data Mapping — Personal Data Inventory

**Purpose:** Document what personal data is collected, why, where stored, and retention period (GDPR Article 30 requirement).

**Last updated:** 2026-09-22

---

## Personal Data Collected

| Data Field | Purpose | Legal Basis | Retention | Location | Access |
|------------|---------|-------------|-----------|----------|---------|
| **Email** | Account creation, login | Contract | Active + 3 years | PostgreSQL `users.email` | Engineers, Support |
| **Name** | Personalization | Contract | Active + 3 years | PostgreSQL `users.name` | Engineers, Support |
| **Password (hashed)** | Authentication | Contract | Active + 3 years | PostgreSQL `users.password_hash` | Engineers only |
| **IP address** | Fraud prevention | Legitimate interest | 90 days | PostgreSQL `audit_logs.ip` | Engineers, Security |
| **Payment details** | Transaction processing | Contract | 7 years (legal) | Stripe (tokenized) | Stripe only |
| **Usage analytics** | Product improvement | Consent | 90 days | Mixpanel | Engineers, Product |
| **Error logs** | Debugging | Legitimate interest | 30 days | Sentry | Engineers |

---

## Third-Party Data Processors

| Vendor | Data Shared | Purpose | DPA Signed | Location |
|--------|-------------|---------|------------|----------|
| **AWS** | All data (hosting) | Infrastructure | ✅ Yes | US-East (N. Virginia) |
| **Stripe** | Payment details | Payment processing | ✅ Yes | US / EU (regional) |
| **SendGrid** | Email, name | Transactional emails | ✅ Yes | US |
| **Mixpanel** | User ID (hashed), events | Analytics | ✅ Yes | US |
| **Sentry** | User ID, error context | Error tracking | ✅ Yes | US |

---

## Cross-Border Transfers

**EU → US transfers:**

- **Mechanism:** Standard Contractual Clauses (SCCs)
- **Vendors covered:** AWS, Stripe, SendGrid, Mixpanel, Sentry
- **DPA includes SCCs:** ✅ Yes (all vendors EU-certified)

---

## Data Retention Policy

| Data Type | Retention Period | Deletion Method |
|-----------|------------------|------------------|
| User accounts | Active + 3 years inactive | Hard delete (GDPR Article 17) |
| Audit logs | 1 year | Automated deletion (cron job) |
| Payment records | 7 years (legal requirement) | Anonymize after user deletion |
| Analytics events | 90 days | Roll up to aggregates, delete raw |
| Error logs | 30 days | Automated deletion (Sentry retention) |

**Automated deletion script:**

```bash
# /opt/scripts/data-retention.sh
# Run monthly via cron

# Delete inactive accounts (> 3 years no login)
psql $DATABASE_URL -c "DELETE FROM users WHERE last_login_at < NOW() - INTERVAL '3 years';"

# Delete old audit logs (> 1 year)
psql $DATABASE_URL -c "DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';"

# Delete old analytics events (> 90 days)
curl -X POST https://api.mixpanel.com/engage \
  -d "filter=last_seen < $(date -d '90 days ago' +%Y-%m-%d)" \
  -d "delete=true"
```

---

**Review frequency:** Quarterly  
**Next review:** 2026-12-22
```

---

## Integration with Planning Phase

**Update `modules/02a-planning-core-phases.md` § Phase 1a (PRD):**

```markdown
### Q23 — Compliance Requirements

> "Does this project have legal/compliance requirements?"

**Options:**
- None (internal tool, no sensitive data)
- GDPR (EU users)
- CCPA (California users)
- HIPAA (US healthcare data)
- SOC 2 (enterprise sales requirement)
- PCI-DSS (payment card data)
- ISO 27001 (enterprise security)

**If YES selected:**

**Auto-generate compliance files:**

```bash
# GDPR selected → create checklist
create docs/compliance/GDPR_CHECKLIST.md (see COMPLIANCE_AUTOMATION_GUIDE.md template)
create docs/compliance/DATA_MAPPING.md
create docs/compliance/DATA_RETENTION_POLICY.md

# HIPAA selected → additional files
create docs/compliance/HIPAA_CHECKLIST.md
create docs/compliance/BAA_REGISTER.md (Business Associate Agreements)

# SOC 2 selected → additional files
create docs/compliance/SOC2_CHECKLIST.md
create docs/security/RISK_ASSESSMENT.md
```

**Gate: Compliance Review (before development starts)**

- [ ] Compliance checklists reviewed by legal (if available)
- [ ] Data retention policy approved
- [ ] Third-party processor list complete
- [ ] Budget approved for compliance costs (audits, tools)

**Output:**
- `docs/compliance/COMPLIANCE_ROADMAP.md` (timeline, owners, gates)
```

---

**Last updated:** 2026-09-22  
**Version:** 1.0.0
