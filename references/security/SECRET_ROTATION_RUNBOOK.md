# Secret Rotation Runbook — Zero-Downtime Procedure

**Purpose:** Rotate production secrets without downtime or service interruption.

**When to use:** 
- Secret leaked (git history, logs, screenshot)
- Quarterly routine rotation (security policy)
- Staff departure (revoke access)
- Suspected compromise (unusual API usage)

---

## General Rotation Workflow

**All secret rotations follow this sequence:**

1. **Generate new secret** (in provider dashboard/API)
2. **Add new secret to env** (Vercel/Railway/K8s, do NOT remove old yet)
3. **Deploy with BOTH secrets active** (app reads new, but old still valid)
4. **Monitor for errors** (15-30 min, watch logs/metrics)
5. **Revoke old secret** (in provider dashboard)
6. **Remove old secret from env** (cleanup)

**Why this order?** Zero-downtime. If you revoke first, app crashes immediately.

---

## 1. Database Password Rotation (PostgreSQL/MySQL)

### Scenario: Rotate production DB password

**Risk:** High (app can't connect → downtime)

**Steps:**

```bash
# 1. Create new password
NEW_PASSWORD=$(openssl rand -base64 32)

# 2. Add new user with same permissions (PostgreSQL)
psql -h $DB_HOST -U postgres << EOF
CREATE USER app_user_new WITH PASSWORD '$NEW_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE myapp TO app_user_new;
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_user_new;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app_user_new;
EOF

# 3. Update DATABASE_URL in env (Vercel example)
vercel env add DATABASE_URL production
# Paste: postgresql://app_user_new:$NEW_PASSWORD@host:5432/myapp

# 4. Redeploy app (picks up new user)
vercel --prod

# 5. Monitor logs (5 min)
vercel logs --prod --follow

# 6. If no errors, drop old user
psql -h $DB_HOST -U postgres -c "DROP USER app_user_old;"
```

**Alternative (change password instead of user):**

```sql
-- Works if app uses connection pooling (PgBouncer, Supabase)
ALTER USER app_user WITH PASSWORD 'new_password_here';
-- Then update env + redeploy
```

**Rollback:** If errors, revert `DATABASE_URL` to old user, redeploy.

---

## 2. API Key Rotation (Stripe, OpenAI, Resend, etc.)

### Scenario: Rotate Stripe secret key

**Risk:** Medium (payments fail if done wrong)

**Steps:**

```bash
# 1. Generate new key in Stripe dashboard
# Dashboard → Developers → API Keys → Create secret key
# Copy: sk_live_NEW_KEY_HERE

# 2. Add NEW key to env (keep old for now)
vercel env add STRIPE_SECRET_KEY production
# Paste: sk_live_NEW_KEY_HERE

# 3. Deploy with new key
vercel --prod

# 4. Test payment in production (small amount, refund after)
curl -X POST https://myapp.com/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}' # $1.00 test

# 5. If success, delete old key in Stripe dashboard
# Dashboard → Developers → API Keys → Delete sk_live_OLD_KEY

# 6. Monitor for 24h (old key might be cached somewhere)
```

**Rollback:** If errors, revert env to old key, redeploy.

---

## 3. JWT Secret Rotation (Session Tokens)

### Scenario: Rotate JWT signing secret

**Risk:** High (all active sessions invalidated)

**Steps (Graceful with Dual-Key Support):**

```typescript
// lib/jwt.ts
const JWT_SECRETS = [
  process.env.JWT_SECRET_NEW!,  // Sign with this
  process.env.JWT_SECRET_OLD!,  // Verify with this (fallback)
]

export function signToken(payload: any) {
  return jwt.sign(payload, JWT_SECRETS[0]) // Always sign with NEW
}

export function verifyToken(token: string) {
  for (const secret of JWT_SECRETS) {
    try {
      return jwt.verify(token, secret) // Try NEW first, then OLD
    } catch (err) {
      continue
    }
  }
  throw new Error('Invalid token')
}
```

**Rotation steps:**

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -base64 64)

# 2. Add both secrets to env
vercel env add JWT_SECRET_NEW production
vercel env add JWT_SECRET_OLD production
# JWT_SECRET_NEW=<new>
# JWT_SECRET_OLD=<current>

# 3. Deploy (signs with NEW, verifies both)
vercel --prod

# 4. Wait for old tokens to expire (e.g., 7 days if TTL=7d)
sleep $((7 * 24 * 3600)) # Or monitor active session count

# 5. Remove JWT_SECRET_OLD from env
vercel env rm JWT_SECRET_OLD production

# 6. Update code to use single secret again
```

**Aggressive rotation (invalidates all sessions):**

```bash
# Generate new secret
openssl rand -base64 64 > .jwt-secret

# Update env
vercel env add JWT_SECRET production < .jwt-secret

# Deploy (all users logged out immediately)
vercel --prod

# Notify users: "Please log in again"
```

---

## 4. OAuth Client Secret Rotation (Google, GitHub, etc.)

### Scenario: Rotate GitHub OAuth app secret

**Risk:** Medium (login fails, but users can retry)

**Steps:**

```bash
# 1. Generate new secret in GitHub
# Settings → Developer settings → OAuth Apps → [Your App] → Generate new client secret
# Copy: NEW_CLIENT_SECRET_HERE

# 2. Add new secret to env (keep old)
vercel env add GITHUB_CLIENT_SECRET production
# Paste: NEW_CLIENT_SECRET_HERE

# 3. Deploy
vercel --prod

# 4. Test login flow (incognito window)
# Click "Login with GitHub"

# 5. If success, delete old secret in GitHub dashboard

# 6. Monitor login success rate (24h)
```

**Rollback:** Revert env to old secret, redeploy.

---

## 5. Supabase API Key Rotation

### Scenario: Rotate Supabase anon key (leaked in frontend)

**Risk:** Low (anon key is public anyway, RLS protects data)

**Steps:**

```bash
# 1. Reset keys in Supabase dashboard
# Project Settings → API → Reset anon key
# Copy new key

# 2. Update env
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# 3. Deploy
vercel --prod

# 4. Old key invalidated immediately (no grace period)
```

### Scenario: Rotate Supabase service role key (CRITICAL)

**Risk:** CRITICAL (full database access, no RLS bypass)

**Steps:**

```bash
# 1. Reset service role key in Supabase dashboard
# Project Settings → API → Reset service_role key
# ⚠️ WARNING: This invalidates old key IMMEDIATELY

# 2. Update env FAST (downtime if slow)
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 3. Deploy ASAP
vercel --prod

# 4. Monitor logs (errors = old key still in use somewhere)
```

**Mitigation:** Schedule during low-traffic window (e.g., 2am UTC).

---

## 6. AWS Access Key Rotation

### Scenario: Rotate IAM user access key

**Risk:** Medium (S3 uploads fail, Lambda can't run)

**Steps:**

```bash
# 1. Create new access key (IAM → Users → Security credentials → Create access key)
# Copy: AWS_ACCESS_KEY_ID_NEW + AWS_SECRET_ACCESS_KEY_NEW

# 2. Add new keys to env
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production

# 3. Deploy
vercel --prod

# 4. Test S3 upload
aws s3 ls s3://my-bucket --profile production

# 5. Deactivate old key (IAM → Make inactive)
# Wait 24h to ensure no usage

# 6. Delete old key
```

**Rollback:** Reactivate old key, revert env, redeploy.

---

## 7. Encryption Key Rotation (Data at Rest)

### Scenario: Rotate AES encryption key for PII

**Risk:** CRITICAL (can't decrypt old data if done wrong)

**Steps (Multi-Key Envelope Encryption):**

```typescript
// lib/crypto.ts
const ENCRYPTION_KEYS = {
  v2: process.env.ENCRYPTION_KEY_V2!, // Current
  v1: process.env.ENCRYPTION_KEY_V1!, // Legacy
}

export function encrypt(data: string): string {
  const key = ENCRYPTION_KEYS.v2
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv)
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  
  return JSON.stringify({
    version: 'v2', // Tag version
    iv: iv.toString('hex'),
    data: encrypted.toString('hex'),
    authTag: authTag.toString('hex'),
  })
}

export function decrypt(encrypted: string): string {
  const { version, iv, data, authTag } = JSON.parse(encrypted)
  const key = ENCRYPTION_KEYS[version] // Use versioned key
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))
  
  return Buffer.concat([decipher.update(Buffer.from(data, 'hex')), decipher.final()]).toString('utf8')
}
```

**Rotation steps:**

```bash
# 1. Generate new key
openssl rand -hex 32 > encryption-key-v2.txt

# 2. Add both keys to env
vercel env add ENCRYPTION_KEY_V2 production < encryption-key-v2.txt
vercel env add ENCRYPTION_KEY_V1 production # (existing key)

# 3. Deploy (encrypts with v2, decrypts both v1 and v2)
vercel --prod

# 4. Re-encrypt old data (background job)
node scripts/re-encrypt-data.js
# Reads v1 encrypted data → decrypts with v1 → encrypts with v2

# 5. After 100% re-encrypted, remove ENCRYPTION_KEY_V1
```

---

## 8. SSH Key Rotation (Server Access)

### Scenario: Rotate SSH key for production server

**Risk:** Medium (lose access if done wrong)

**Steps:**

```bash
# 1. Generate new key pair
ssh-keygen -t ed25519 -C "production-$(date +%Y%m%d)" -f ~/.ssh/prod_new

# 2. Add new public key to server
ssh -i ~/.ssh/prod_old root@server "echo '$(cat ~/.ssh/prod_new.pub)' >> ~/.ssh/authorized_keys"

# 3. Test new key
ssh -i ~/.ssh/prod_new root@server "echo 'Success'"

# 4. If success, remove old key from server
ssh -i ~/.ssh/prod_new root@server "sed -i '/prod_old/d' ~/.ssh/authorized_keys"

# 5. Update CI/CD secrets (GitHub Actions example)
# Settings → Secrets → Update SSH_PRIVATE_KEY
cat ~/.ssh/prod_new | gh secret set SSH_PRIVATE_KEY

# 6. Delete old key locally
rm ~/.ssh/prod_old ~/.ssh/prod_old.pub
```

---

## Emergency Rotation (Leaked Secret)

**When:** Secret found in git history, public Slack, screenshot, logs.

**Immediate actions (5 minutes):**

1. **Revoke secret in provider dashboard** (Stripe, AWS, Supabase, etc.)
2. **Generate new secret**
3. **Update env** (Vercel, Railway, K8s)
4. **Deploy ASAP** (accept brief downtime over continued exposure)
5. **Monitor errors** (15 min)
6. **Clean git history** (if leaked in repo, use BFG)

**Post-incident:**

- [ ] Update `docs/incidents/YYYY-MM-DD-secret-leak.md`
- [ ] Review: How did secret leak? (git commit, log line, screenshot)
- [ ] Fix root cause (enable pre-commit hook, sanitize logs, redact screenshots)
- [ ] Rotate related secrets (if one leaked, others might be exposed too)

---

## Rotation Schedule (Quarterly Maintenance)

**Recommended rotation frequency:**

| Secret Type | Frequency | Reason |
|-------------|-----------|--------|
| **Database password** | Every 90 days | Compliance (PCI-DSS, SOC 2) |
| **API keys** | Every 90 days | Reduce blast radius of leaks |
| **JWT secret** | Every 180 days | Balance security vs. user disruption |
| **OAuth client secret** | Every 180 days | Low risk (user can re-authorize) |
| **Encryption keys** | Every 365 days | High risk operation, do annually |
| **SSH keys** | On staff departure | Immediate revocation |

**Automate with cron job:**

```bash
# Remind to rotate secrets quarterly
0 0 1 */3 * echo "Q$(date +%q) secret rotation due" | mail -s "Security: Rotate secrets" ops@example.com
```

---

## Checklist: Secret Rotation

### Before Rotation
- [ ] Schedule during low-traffic window (if high-risk)
- [ ] Notify team in Slack (#ops channel)
- [ ] Backup current env vars (`vercel env pull .env.backup`)
- [ ] Rollback plan documented (revert steps ready)

### During Rotation
- [ ] Generate new secret
- [ ] Add new secret to env (KEEP old)
- [ ] Deploy with both secrets active
- [ ] Test critical flow (payment, login, upload)
- [ ] Monitor logs/metrics (15-30 min)

### After Rotation
- [ ] Revoke old secret in provider dashboard
- [ ] Remove old secret from env
- [ ] Update password manager (1Password, Bitwarden)
- [ ] Document rotation in `docs/operations/SECRET_ROTATION_LOG.md`
- [ ] Update runbooks if secret location changed

### If Emergency (Leak)
- [ ] Revoke old secret IMMEDIATELY (accept brief downtime)
- [ ] Deploy new secret ASAP
- [ ] Clean git history (if leaked in repo)
- [ ] Post-mortem: how did it leak? Fix root cause.

---

**Last updated:** 2026-09-22  
**Version:** 1.0.0
