# Test Environment Management Guide

**Purpose:** Provision, configure, and teardown test environments (dev, staging, production-like) systematically.

**When to use:** Medium+ projects with multiple environments.

---

## Environment Types

| Environment | Purpose | Data | Uptime | Access |
|-------------|---------|------|--------|--------|
| **Local (dev)** | Individual developer work | Fake/seed data | On-demand | Developer only |
| **Shared Dev** | Integration testing | Synthetic data | 24/7 | All developers |
| **Staging (pre-prod)** | UAT, demo, final QA | Anonymized prod copy | 24/7 | Internal + select clients |
| **Production** | Real users | Real data | 99.9%+ SLA | Public (or authenticated users) |
| **Ephemeral (PR preview)** | Review before merge | Fake data | Hours (auto-teardown) | PR author + reviewers |

---

## Environment Parity (12-Factor App)

**Goal:** Dev/staging/prod should be as similar as possible

**Parity dimensions:**

| Dimension | Bad (low parity) | Good (high parity) |
|-----------|------------------|--------------------|
| **Time** | Dev uses code from 3 weeks ago | Dev uses latest main branch |
| **Personnel** | Ops deploy, devs don't know how | Devs can deploy (self-service) |
| **Tools** | Dev: SQLite, Prod: Postgres | Dev & Prod: Both Postgres (Docker local) |
| **Data** | Dev: 10 rows, Prod: 10M rows | Dev: Subset of prod data (anonymized) |
| **Config** | Hardcoded values | Environment variables (`.env`) |
| **Dependencies** | Different library versions | Lockfiles (package-lock.json, poetry.lock) |

**How to achieve:**
- Use Docker Compose for local dev (same Postgres/Redis as prod)
- Deploy from same CI/CD pipeline (staging & prod use same build)
- Use infrastructure-as-code (staging = prod with smaller instance size)
- Seed dev DB with anonymized prod subset (quarterly refresh)

---

## Provisioning (Who Creates Environments?)

### Responsibility Matrix

| Environment | Provisioner | Frequency | Tool |
|-------------|-------------|-----------|------|
| **Local** | Each developer | Once (onboarding) | Docker Compose, README |
| **Shared Dev** | DevOps or senior dev | Once (project start) | Terraform + CI/CD |
| **Staging** | DevOps | Once (before UAT) | Terraform + CI/CD |
| **Production** | DevOps + approval | Once (launch), updates ongoing | Terraform + change control |
| **Ephemeral (PR)** | CI/CD (automated) | Per PR | GitHub Actions + Vercel/Heroku/Railway |

---

## Local Environment Setup

### Onboarding Checklist (New Developer)

```markdown
# Local Dev Setup — [Project Name]

**Time estimate:** 30-60 min

## Prerequisites

- [ ] Git installed
- [ ] Node.js 18+ (check: `node -v`)
- [ ] Docker Desktop (check: `docker -v`)
- [ ] Code editor (VS Code recommended)

## Steps

1. **Clone repo:**
   ```bash
   git clone https://github.com/org/project.git
   cd project
   ```

2. **Install dependencies:**
   ```bash
   npm install  # or: pnpm install, yarn install
   ```

3. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

4. **Start services (DB, Redis, etc.):**
   ```bash
   docker compose up -d
   ```
   
   (Wait 10 sec for DB to initialize)

5. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Seed database:**
   ```bash
   npm run db:seed
   ```
   
   (Creates test users, sample data)

7. **Start dev server:**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000

8. **Verify:**
   - [ ] App loads
   - [ ] Login works (test user: `test@example.com` / `password123`)
   - [ ] Database connection works (check: visit /api/health)

## Troubleshooting

**"Port 3000 already in use":**
```bash
lsof -ti:3000 | xargs kill  # Kill process on port 3000
```

**"Database connection failed":**
```bash
docker compose logs postgres  # Check DB logs
docker compose restart postgres
```

**"Module not found":**
```bash
rm -rf node_modules package-lock.json
npm install  # Reinstall dependencies
```

## Daily Workflow

**Start work:**
```bash
docker compose up -d  # Start DB (if not running)
npm run dev           # Start dev server
```

**Stop work:**
```bash
Ctrl+C                # Stop dev server
docker compose down   # Stop DB (optional, can leave running)
```

**Reset database:**
```bash
npm run db:reset      # Drop + migrate + seed
```
```

---

## Shared Dev Environment

### Purpose
- Integration testing (multiple services interact)
- Demo to stakeholders
- QA testing before staging

### Setup (One-time)

**Infrastructure (Terraform):**

```hcl
# environments/dev/main.tf
module "dev_env" {
  source = "../../modules/app"
  
  environment = "dev"
  instance_size = "small"  # t3.small or equivalent
  db_instance = "db.t3.micro"
  auto_scaling = false     # Fixed capacity for dev
  
  allowed_ips = [
    "0.0.0.0/0"  # Public (use VPN for sensitive projects)
  ]
}
```

**Deploy:**

```bash
cd environments/dev
terraform init
terraform apply
```

**CI/CD (GitHub Actions):**

```yaml
# .github/workflows/deploy-dev.yml
name: Deploy to Dev

on:
  push:
    branches: [develop]  # Auto-deploy develop branch to dev env

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to dev
        run: |
          # Build + push Docker image
          # Update dev environment (Terraform or Kubernetes)
          # Run smoke tests
```

**Access:**
- URL: https://dev.project.com
- Credentials: Shared in team password manager (1Password, Bitwarden)

**Data refresh:**
- Weekly: Anonymize + copy prod DB subset to dev
- Script: `scripts/refresh-dev-data.sh`

---

## Staging Environment

### Purpose
- UAT (User Acceptance Testing)
- Client demo
- Final pre-production QA
- Performance testing (load tests)

### Requirements
- **Identical infrastructure to prod** (same services, scaled down)
- **Anonymized prod data** (or realistic synthetic data)
- **Isolated from prod** (separate database, separate API keys)
- **Protected access** (password-protected, VPN, or IP whitelist)

### Setup

**Infrastructure:**

```hcl
# environments/staging/main.tf
module "staging_env" {
  source = "../../modules/app"
  
  environment = "staging"
  instance_size = "medium"  # 50% of prod capacity
  db_instance = "db.t3.small"
  auto_scaling = true
  min_instances = 1
  max_instances = 3
  
  allowed_ips = [
    "10.0.0.0/8"  # Company VPN
  ]
}
```

**Deploy:**

Manual trigger (not auto-deploy):

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  workflow_dispatch:  # Manual trigger only
    inputs:
      version:
        description: 'Git tag or commit SHA'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.event.inputs.version }}
      - name: Deploy to staging
        run: |
          # Build + tag Docker image with version
          # Deploy to staging
          # Run integration tests
          # Notify team (Slack/Discord)
```

**UAT Process:**

1. Developer deploys feature to staging
2. QA runs test plan (manual + automated)
3. Product owner reviews (acceptance criteria met?)
4. Stakeholder demo (if applicable)
5. Sign-off (PASS/FAIL)
6. If PASS: promote to production
7. If FAIL: fix bugs, re-deploy to staging

---

## Ephemeral Environments (PR Previews)

### Purpose
- Review UI changes before merge
- Test feature in isolation
- Share with designer/PM for feedback

### Tools

| Platform | Auto-deploy | Database | Custom domain | Teardown |
|----------|-------------|----------|---------------|----------|
| **Vercel** | Yes (per PR) | Supabase (shared) | `pr-123-project.vercel.app` | Auto (on PR close) |
| **Netlify** | Yes (per PR) | External | `deploy-preview-123.netlify.app` | Auto |
| **Railway** | Yes (manual trigger) | Ephemeral Postgres | Custom | Auto (24h idle) |
| **Heroku Review Apps** | Yes (per PR) | Ephemeral Postgres | `pr-123.herokuapp.com` | Auto |
| **Render PR Previews** | Yes (per PR) | Shared DB | Custom | Auto |

### Example: Vercel PR Previews

**Setup:**

1. Connect GitHub repo to Vercel
2. Enable "Preview Deployments" in project settings
3. Every PR = automatic preview URL
4. Comment posted on PR with preview link

**Environment variables:**

```bash
# Vercel project settings → Environment Variables

# Shared dev database (all PRs use same Supabase project)
DATABASE_URL=postgresql://user:[email]/dev
NEXT_PUBLIC_SUPABASE_URL=https://dev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Or: Separate DB per PR (advanced, requires automation)
DATABASE_URL=${{ secrets.SUPABASE_POOL_URL }}?schema=pr_${{ github.event.pull_request.number }}
```

**Teardown:**
- Automatic when PR closed/merged
- Vercel deletes deployment + DNS
- Database schema `pr_123` can be cleaned up weekly (cron job)

---

## Environment Configuration Management

### Environment Variables (.env files)

**Structure:**

```
project/
  .env.example         # Template (committed to git, no secrets)
  .env.local           # Local dev (gitignored)
  .env.development     # Shared dev (in secret manager)
  .env.staging         # Staging (in secret manager)
  .env.production      # Production (in secret manager)
```

**Example `.env.example`:**

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Auth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# OAuth (get from GitHub/Google)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Resend)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Environment
NODE_ENV=development  # development | staging | production
```

**Per-environment overrides:**

```bash
# .env.production
DATABASE_URL=postgresql://user:[email]:5432/prod
NEXTAUTH_URL=https://app.yourdomain.com
NODE_ENV=production
```

**Secret management:**

- **Local:** `.env.local` (gitignored)
- **CI/CD:** GitHub Secrets, GitLab CI/CD variables
- **Cloud:** AWS Secrets Manager, Google Secret Manager, Vercel Environment Variables
- **Team:** 1Password (shared vault), Bitwarden (organization)

**Never commit secrets to git** (use `.gitignore`):

```gitignore
.env.local
.env.development
.env.staging
.env.production
.env*.local
```

---

## Teardown Process

### When to Teardown

| Environment | Teardown Trigger |
|-------------|------------------|
| **Local** | Developer offboarding (delete local files) |
| **Shared Dev** | Project cancellation (never for active project) |
| **Staging** | After production launch (optional, many keep it for ongoing UAT) |
| **Production** | Project decommission (formal process) |
| **Ephemeral** | PR closed/merged (automatic) |

### Teardown Checklist (Staging/Production)

```markdown
# Environment Teardown — [Environment Name]

**Date:** 2026-09-22  
**Requested by:** [Sponsor]  
**Approved by:** [CTO / PM]  
**Reason:** [Project cancelled / Migration complete / Cost reduction]  

## Pre-Teardown

- [ ] **Backup all data** (database export, file storage backup)
- [ ] **Document retention period** (How long to keep backups? 1 year? Forever?)
- [ ] **Notify users** (if user-facing environment)
- [ ] **Export critical data** (logs, analytics, user reports)
- [ ] **Cancel subscriptions** (AWS, Vercel, Supabase, etc.)

## Teardown Steps

1. **Disable writes:**
   - [ ] Set app to read-only mode (or maintenance page)
   - [ ] Disable cron jobs
   - [ ] Stop accepting new traffic (DNS change or load balancer rule)

2. **Export data:**
   - [ ] Database dump: `pg_dump -U user -h host dbname > backup.sql`
   - [ ] File storage: `aws s3 sync s3://bucket /local/backup`
   - [ ] Logs: Export to S3 / CloudWatch archive

3. **Verify backups:**
   - [ ] Restore backup to temporary environment (smoke test)
   - [ ] Confirm all critical data present

4. **Destroy infrastructure:**
   ```bash
   cd environments/staging
   terraform destroy  # Confirm with "yes"
   ```
   - [ ] Servers terminated
   - [ ] Databases deleted
   - [ ] Load balancers removed
   - [ ] DNS records removed (or pointed to decommission page)

5. **Revoke access:**
   - [ ] Remove team access (AWS IAM, GitHub, etc.)
   - [ ] Rotate secrets (invalidate old API keys)
   - [ ] Delete CI/CD pipelines (or disable)

6. **Financial cleanup:**
   - [ ] Confirm no recurring charges (check AWS bill next month)
   - [ ] Cancel SaaS subscriptions (Sentry, Datadog, etc.)
   - [ ] Archive invoices

7. **Documentation:**
   - [ ] Update project status (CONTEXT.md: "Project decommissioned 2026-09-22")
   - [ ] Archive git repository (read-only)
   - [ ] Document backup location + retention policy

## Post-Teardown

- [ ] **Verify no charges** (check cloud bills 1 month later)
- [ ] **Confirm backups accessible** (test restore 6 months later)
- [ ] **Final report** (cost savings, lessons learned)
```

---

## Cost Optimization

### Environment Cost Breakdown (Typical)

| Environment | Monthly Cost (Example) | Optimization |
|-------------|------------------------|---------------|
| **Local** | $0 (runs on dev laptop) | N/A |
| **Shared Dev** | $50-200 | Use spot instances, auto-shutdown nights/weekends |
| **Staging** | $200-500 | Scale down when not in use, share with QA env |
| **Production** | $500-5000+ | Right-size instances, reserved instances, caching |
| **Ephemeral** | $0-50 | Auto-teardown after 24h idle |

### Cost Reduction Tactics

1. **Auto-shutdown non-prod environments:**
   ```bash
   # Cron: Stop dev environment at 6pm, start at 8am weekdays
   0 18 * * 1-5 aws ec2 stop-instances --instance-ids i-xxx
   0 8 * * 1-5 aws ec2 start-instances --instance-ids i-xxx
   ```

2. **Use smaller instances for non-prod:**
   - Prod: `t3.large` (2 vCPU, 8GB RAM)
   - Staging: `t3.medium` (2 vCPU, 4GB RAM)
   - Dev: `t3.small` (2 vCPU, 2GB RAM)

3. **Ephemeral DB (staging):**
   - Snapshot prod DB weekly
   - Restore snapshot to staging only when UAT starts
   - Delete staging DB when UAT done
   - Cost: $0 when idle, $50/week when active

4. **Consolidate environments:**
   - Merge dev + QA into one shared-dev
   - Use namespace/schema separation (Kubernetes namespaces, Postgres schemas)

---

## Integration with Project Lifecycle

**Update `modules/03a-build-foundations.md` Phase 6:**

```markdown
### Q63c — Environment Strategy

> "What environments will exist, who provisions them, and when?"

**Required environments:**
- **Local (dev):** Every developer (Docker Compose)
- **Staging:** Before UAT (Medium+)
- **Production:** At launch

**Optional environments:**
- **Shared dev:** If >3 developers
- **Ephemeral (PR previews):** If UI-heavy project (Vercel/Netlify)

**Sub-questions:**
- Q63c-i: Who provisions? (DevOps / Senior dev / Automated)
- Q63c-ii: Environment parity? (Docker for local, IaC for cloud)
- Q63c-iii: Teardown policy? (Ephemeral: auto after PR close, Staging: keep until post-launch, Dev: never unless project cancelled)

**Output files:**
- `docs/ops/ENVIRONMENT-SETUP.md` (onboarding guide)
- `docker-compose.yml` (local dev services)
- `environments/*/` (Terraform per environment)

**Mandatory for:** Medium+ projects

**Skip for:** Solo Small tier (local only)
```

**Update `engine/GATE-REGISTRY.md`:**

```markdown
### gate:environment-ready (Environment Provisioned)

**Trigger:** Before deploying to environment (dev/staging/prod)

**Evidence:**
- Infrastructure provisioned (Terraform applied)
- Database migrated (schema up-to-date)
- Environment variables configured (secrets in place)
- Health check passes (`/api/health` returns 200)
- Smoke tests pass (basic functionality works)
- Access documented (who can access, how)

**Blocker:** Cannot deploy without healthy environment.
```

---

**Agent instruction:**

Before first deploy to any environment:

1. Confirm environment exists (check `environments/` directory or cloud console)
2. If not: provision via Terraform or platform UI (Vercel/Railway)
3. Run health check (`curl https://env.domain.com/api/health`)
4. Verify database connection (run migration, check tables exist)
5. Seed data if needed (`npm run db:seed`)
6. Document access (URL, credentials, who can access)
7. Add environment to CI/CD (deploy pipeline)

For local setup:
1. Generate `docs/ops/ENVIRONMENT-SETUP.md` from template above
2. Include troubleshooting section (common errors + fixes)
3. Test onboarding on fresh machine (or ask teammate to test)

For teardown:
1. Require approval (PM + sponsor)
2. Backup all data first (database dump + file storage)
3. Verify backup restorable (test restore to temp environment)
4. Destroy infrastructure (Terraform destroy)
5. Confirm no recurring charges (check bills 1 month later)

Do not deploy to environment without health check passing.
