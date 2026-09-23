# Pre-Commit Secret Scan Setup — Mandatory Security Gate

**Purpose:** Block secrets from entering git history BEFORE commit happens.

**When to run:** During scaffold (Phase 0 or first git init), BEFORE first commit.

---

## Why This Matters

**Problem:** Secrets in git history = permanent security breach. Rotation + history rewrite costs hours/days.

**Solution:** Pre-commit hook scans staged files, blocks commit if secret detected.

**Coverage:** API keys, tokens, passwords, private keys, AWS credentials, database URLs.

---

## Setup (5 minutes)

### Option 1: Gitleaks (Recommended)

**Install:**

```bash
# macOS
brew install gitleaks

# Linux
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.4/gitleaks_8.18.4_linux_x64.tar.gz
tar -xzf gitleaks_8.18.4_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/

# Windows
choco install gitleaks
```

**Verify:**

```bash
gitleaks version
# Should output: v8.x or later
```

**Create hook:**

```bash
# In project root
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh

echo "🔍 Scanning for secrets with gitleaks..."

# Scan staged files only
gitleaks protect --staged --verbose

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ COMMIT BLOCKED: Secret detected in staged files"
  echo ""
  echo "Fix:"
  echo "1. Remove secret from file"
  echo "2. Move to .env (add .env to .gitignore)"
  echo "3. Create .env.example with placeholder"
  echo "4. Commit again"
  exit 1
fi

echo "✅ No secrets detected"
exit 0
EOF

chmod +x .git/hooks/pre-commit
```

**Test:**

```bash
# Add fake secret
echo "aws_access_key_id=AKIAIOSFODNN7EXAMPLE" > test-secret.txt
git add test-secret.txt
git commit -m "test"

# Should output:
# ❌ COMMIT BLOCKED: Secret detected
```

---

### Option 2: Trufflehog (Alternative)

**Install:**

```bash
# macOS
brew install trufflehog

# Linux
curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh -s -- -b /usr/local/bin

# Windows
choco install trufflehog
```

**Create hook:**

```bash
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh

echo "🔍 Scanning for secrets with trufflehog..."

trufflehog git file://. --since-commit HEAD --only-verified --fail

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ COMMIT BLOCKED: Secret detected"
  exit 1
fi

echo "✅ No secrets detected"
exit 0
EOF

chmod +x .git/hooks/pre-commit
```

---

### Option 3: git-secrets (AWS-focused)

**Install:**

```bash
# macOS
brew install git-secrets

# Linux
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install
```

**Setup:**

```bash
cd /path/to/your/repo
git secrets --install
git secrets --register-aws  # Detects AWS keys
```

**Add custom patterns:**

```bash
# Block common patterns
git secrets --add 'password\s*=\s*["\']?[^"\'[:space:]]+["\']?'
git secrets --add 'api[_-]?key\s*=\s*["\']?[^"\'[:space:]]+["\']?'
git secrets --add 'secret[_-]?key\s*=\s*["\']?[^"\'[:space:]]+["\']?'
git secrets --add 'bearer\s+[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+'
```

---

## Gitleaks Configuration (Custom Rules)

**Create `.gitleaks.toml` in project root:**

```toml
title = "Project Secret Scan Config"

[extend]
useDefault = true  # Include default ruleset

# Custom rules
[[rules]]
id = "supabase-anon-key"
description = "Supabase Anon Key"
regex = '''eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'''
tags = ["supabase", "jwt"]

[[rules]]
id = "supabase-service-role-key"
description = "Supabase Service Role Key (CRITICAL)"
regex = '''eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'''
tags = ["supabase", "service-role", "critical"]

[[rules]]
id = "resend-api-key"
description = "Resend API Key"
regex = '''re_[a-zA-Z0-9]{32}'''
tags = ["resend", "email"]

[[rules]]
id = "stripe-secret-key"
description = "Stripe Secret Key"
regex = '''sk_live_[0-9a-zA-Z]{24,}'''
tags = ["stripe", "payment", "critical"]

[[rules]]
id = "openai-api-key"
description = "OpenAI API Key"
regex = '''sk-[a-zA-Z0-9]{48}'''
tags = ["openai", "ai"]

# Allow these files (false positives)
[allowlist]
paths = [
  '''.env.example''',
  '''.env.template''',
  '''docs/''',
  '''README.md''',
]

# Ignore specific strings (known safe)
regexes = [
  '''EXAMPLE_KEY_PLACEHOLDER''',
  '''your-api-key-here''',
]
```

**Run with config:**

```bash
gitleaks protect --staged --config .gitleaks.toml
```

---

## CI/CD Integration (Mandatory for Medium+)

**GitHub Actions:**

```yaml
# .github/workflows/security-scan.yml
name: Secret Scan

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for comprehensive scan
      
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}  # Optional: for Gitleaks Enterprise
```

**GitLab CI:**

```yaml
# .gitlab-ci.yml
secret-scan:
  stage: security
  image: zricethezav/gitleaks:latest
  script:
    - gitleaks detect --source . --verbose
  allow_failure: false
```

---

## What to Do When Secret is Detected

### If NOT Yet Pushed (Local Only)

**1. Remove from staged files:**

```bash
git reset HEAD <file-with-secret>
```

**2. Remove secret from file:**

```bash
# Move to .env
echo "API_KEY=sk_live_abc123" >> .env

# Replace in code with env var
# Before:
# const apiKey = 'sk_live_abc123'
# After:
# const apiKey = process.env.API_KEY
```

**3. Ensure .gitignore covers .env:**

```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

**4. Create .env.example:**

```bash
echo "API_KEY=your-api-key-here" > .env.example
git add .env.example
```

**5. Commit again:**

```bash
git add <fixed-file>
git commit -m "fix: move API key to env var"
```

---

### If ALREADY Pushed (History Rewrite Required)

**⚠️ CRITICAL: Rotate the secret FIRST, then clean history.**

**Step 1: Rotate Secret Immediately**

- Stripe: Revoke key in dashboard → generate new key
- Supabase: Reset project API keys
- AWS: Deactivate IAM access key → create new key
- OpenAI: Delete API key → create new key

**Step 2: Update .env with new secret**

```bash
# Update .env (don't commit this)
API_KEY=new_rotated_key_here
```

**Step 3: Clean Git History**

**Option A: BFG Repo-Cleaner (Easiest)**

```bash
# Install
brew install bfg  # macOS
# or download from https://rtyley.github.io/bfg-repo-cleaner/

# Clone fresh copy
git clone --mirror https://github.com/you/repo.git repo-mirror
cd repo-mirror

# Remove secrets
bfg --replace-text secrets.txt  # File with secrets, one per line

# Force push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

**Option B: git-filter-repo (Manual)**

```bash
# Install
pip install git-filter-repo

# Remove file from history
git filter-repo --path <file-with-secret> --invert-paths

# OR remove specific string
git filter-repo --replace-text <(echo 'sk_live_abc123==>***REMOVED***')

# Force push
git push --force --all
```

**Step 4: Notify collaborators**

```
Team: I force-pushed to clean a leaked secret from git history.

Action required:
1. Delete your local repo clone
2. Re-clone from GitHub
3. Do NOT push from old clones (it will re-add the secret)

Secret has already been rotated.
```

---

## False Positives (Allow Safe Strings)

**Add to `.gitleaks.toml`:**

```toml
[allowlist]
regexes = [
  '''test-api-key-placeholder''',
  '''EXAMPLE_.*''',
  '''MOCK_.*''',
]
```

**OR add inline comment:**

```typescript
// gitleaks:allow
const mockKey = 'sk_test_example123'  // Safe: test fixture
```

---

## Scaffold Integration (Mandatory)

This skill ships no scaffold script, so install the hook directly as part of the
manual scaffolding step in `SKILL.md` ("Scaffolding a project"), right after `git init`:

```bash
# Run once, by hand, right after git init:
if command -v gitleaks &> /dev/null; then
  cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
echo "🔍 Scanning for secrets..."
gitleaks protect --staged --verbose
if [ $? -ne 0 ]; then
  echo "❌ COMMIT BLOCKED: Secret detected"
  exit 1
fi
echo "✅ No secrets detected"
exit 0
EOF
  chmod +x .git/hooks/pre-commit
  echo "✅ Pre-commit secret scan hook installed"
else
  echo "⚠️  Gitleaks not found. Install: brew install gitleaks"
  echo "⚠️  Secret scanning disabled (HIGH RISK)"
fi
```

Note this is a project-level git hook the agent installs directly in the new
repository — it is not part of this skill's own tooling, so it has no dependency on
`{SKILL_PATH}` or any script this skill would otherwise ship.

---

## Testing the Hook

**Create test file:**

```bash
cat > test-secrets.txt << EOF
aws_access_key_id=AKIAIOSFODNN7EXAMPLE
stripe_key=sk_live_abcdef123456789
password=supersecret123
EOF
```

**Try to commit:**

```bash
git add test-secrets.txt
git commit -m "test secrets"
```

**Expected output:**

```
🔍 Scanning for secrets with gitleaks...

    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks

Finding:     aws_access_key_id=AKIAIOSFODNN7EXAMPLE
Secret:      AKIAIOSFODNN7EXAMPLE
RuleID:      aws-access-token
Entropy:     3.5
File:        test-secrets.txt
Line:        1

❌ COMMIT BLOCKED: Secret detected in staged files

Fix:
1. Remove secret from file
2. Move to .env (add .env to .gitignore)
3. Create .env.example with placeholder
4. Commit again
```

**Clean up:**

```bash
git reset HEAD test-secrets.txt
rm test-secrets.txt
```

---

## Checklist: Secret Scan Setup

### Initial Setup (One-time)
- [ ] Install gitleaks/trufflehog (team-wide, document in README)
- [ ] Create `.gitleaks.toml` config in repo root
- [ ] Add pre-commit hook to `.git/hooks/pre-commit`
- [ ] Test hook with fake secret (verify blocks commit)
- [ ] Add CI/CD secret scan job (GitHub Actions/GitLab CI)

### Every Project
- [ ] Run `install_secret_scan_hook()` in scaffold script
- [ ] Ensure `.env` in `.gitignore`
- [ ] Create `.env.example` with placeholders
- [ ] Document secret rotation procedure in `SECURITY.md`

### If Secret Leaked
- [ ] Rotate secret FIRST (revoke old key)
- [ ] Clean git history (BFG or git-filter-repo)
- [ ] Force push + notify team to re-clone
- [ ] Update incident log in `docs/incidents/`

---

**Integration with gates:**

Update `engine/GATE-REGISTRY.md`:

```markdown
### gate:first-commit (First Commit)

**Trigger:** Before ANY code enters git history

**Evidence:**
- `.gitignore` exists (contains .env, node_modules, dist)
- Pre-commit secret scan hook installed (gitleaks/trufflehog)
- `.env.example` exists (if project uses env vars)
- Test hook executed successfully (blocked fake secret)

**Blocker:** Cannot commit if secret scan hook not installed (Medium+ projects).
```

---

**Last updated:** 2026-09-22  
**Version:** 1.0.0
