# DevOps & Deployment Guide — Phase 5

**Purpose:** Turn the Phase 5 DevOps answers (Q45-Q50c) into concrete content for `docs/deployment/CI-CD.md`, `ENVIRONMENTS.md`, `CHECKLIST.md`, and `docs/operations/BACKUP-RESTORE.md`.

Read this when: Phase 5 DevOps questions come up, or when generating any file under `docs/deployment/` or `docs/operations/`. `references/devops/MONITORING_OBSERVABILITY.md` covers what happens *after* deploy (errors, metrics, logs, alerts) — this file covers getting code to production and back safely.

## Contents

- [Q45 — CI/CD](#q45-cicd)
- [Q46 — Environments](#q46-environments)
- [Q47 — Infrastructure Approach](#q47-infrastructure-approach)
- [Q48 — Container Registry](#q48-container-registry)
- [Q49 — Deploy-Time Secrets](#q49-deploy-time-secrets)
- [Q50 — Rollback Strategy](#q50-rollback-strategy)
- [Q50a — DB Migration Strategy](#q50a-db-migration-strategy)
- [Q50b — Zero-Downtime Deploys](#q50b-zero-downtime-deploys)
- [Q50c — Backup Strategy](#q50c-backup-strategy)
- [Putting it together: a minimal pipeline](#putting-it-together-a-minimal-pipeline)

## Q45 — CI/CD

Filtered by Q12 (team size) and where the repo lives:

- **None (manual deploy)** — acceptable only for a true solo prototype; drop this the moment a second person joins.
- **GitHub Actions** — free for public repos, generous free minutes for private repos on small teams; default recommendation for anything hosted on GitHub.
- **GitLab CI** — default if the repo is already on GitLab; comparable feature set to Actions.
- **CircleCI** — worth it once a team needs advanced caching/parallelism CI providers charge extra for; rarely the right starting choice.

Minimum pipeline regardless of provider: lint → typecheck → test → build, gating merge to main. Deploy is a separate job triggered by a successful merge, not bundled into the same job as tests.

## Q46 — Environments

- **Prod only** — solo/MVP, accept that testing happens against production or locally. State this trade-off explicitly rather than pretending otherwise.
- **Dev + Prod** — minimum viable safety net; catches "works on my machine" before real users see it.
- **Dev + Staging + Prod** — recommended default for any team of 2+. Staging should use production-like data volume and the same infra shape (even if smaller), or it won't catch what it's meant to catch.
- **Dev + Staging + Prod + DR** — compliance-grade or high-uptime-SLA projects; DR (disaster recovery) environment is a cold or warm standby in a different region/provider.

## Q47 — Infrastructure Approach

Filtered by Q12 (team size) — don't recommend IaC to a solo dev shipping an MVP in a week; don't recommend ClickOps to a 20-person team that will hand-drift its way into an outage.

- **Manual / ClickOps** — solo, $0 budget, fine as long as the person doing it documents what they clicked (screenshots or a short runbook in `docs/deployment/ENVIRONMENTS.md`).
- **Platform-managed** — Vercel/Railway/Render/Fly.io handle infra provisioning; no IaC needed because the platform's config file (vercel.json, railway.toml) already is the infra-as-code.
- **Terraform or Pulumi** — once there's more than one environment to keep consistent, or infra spans multiple cloud services that a PaaS doesn't unify.
- **Terraform + GitOps** (infra changes go through the same PR+review flow as code) — enterprise default; state stored remotely (Terraform Cloud, S3 backend) with locking, never on a laptop.

### Kubernetes Deployment (Large+ projects)

**When to use Kubernetes:**
- Multi-service architecture (5+ microservices)
- Need auto-scaling (HPA, VPA)
- Multi-region deployment required
- Team experienced with K8s ops

**Don't use K8s if:**
- Solo/small team (<5 devs)
- Single monolith app
- PaaS (Vercel, Railway) already sufficient

**Minimal K8s Stack:**

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: myapp-secrets
              key: database-url
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

**Helm Chart (recommended for reusable config):**

```bash
helm create myapp
helm install myapp ./myapp --values values-prod.yaml
```

**GitOps with ArgoCD/FluxCD:**

```yaml
# argocd-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
spec:
  project: default
  source:
    repoURL: https://github.com/org/repo
    targetRevision: main
    path: k8s/
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

**Reference:** For full K8s guide, see `references/devops/KUBERNETES_DEPLOYMENT_GUIDE.md` (Large+ projects).

### Multi-Cloud Deployment (AWS + GCP)

**When to use:**
- Compliance requires multi-region across providers
- Vendor lock-in mitigation
- Best-of-breed services (AWS RDS + GCP BigQuery)
- High availability requirements

**Architecture example:**

```
Primary: AWS us-east-1
  - ECS/EKS (compute)
  - RDS PostgreSQL (database)
  - S3 (storage)
  - Route 53 (DNS)

Secondary: GCP us-central1
  - GKE (compute)
  - Cloud SQL (database replica)
  - Cloud Storage (backup)
  - Cloud Load Balancing

Traffic routing:
  - Route 53 health checks
  - Failover to GCP if AWS down
  - Active-passive (primary AWS, standby GCP)
```

**Terraform multi-cloud setup:**

```hcl
# AWS provider
provider "aws" {
  region = "us-east-1"
}

# GCP provider
provider "google" {
  project = "my-project"
  region  = "us-central1"
}

# AWS resources
resource "aws_ecs_cluster" "main" {
  name = "myapp-cluster"
}

resource "aws_db_instance" "primary" {
  identifier = "myapp-db-primary"
  engine     = "postgres"
  instance_class = "db.t4g.micro"
  allocated_storage = 20
  multi_az = true
}

# GCP resources
resource "google_container_cluster" "secondary" {
  name     = "myapp-cluster-gcp"
  location = "us-central1"
  initial_node_count = 2
}

resource "google_sql_database_instance" "replica" {
  name = "myapp-db-replica"
  database_version = "POSTGRES_15"
  settings {
    tier = "db-f1-micro"
  }
  # Read replica from AWS RDS (requires VPN/interconnect)
}

# Route 53 failover
resource "aws_route53_record" "primary" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.example.com"
  type    = "A"
  set_identifier = "primary"
  failover_routing_policy {
    type = "PRIMARY"
  }
  alias {
    name = aws_lb.main.dns_name
    zone_id = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "secondary" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.example.com"
  type    = "A"
  set_identifier = "secondary"
  failover_routing_policy {
    type = "SECONDARY"
  }
  alias {
    name = google_compute_global_address.lb.address
    zone_id = google_compute_global_address.lb.zone_id
    evaluate_target_health = true
  }
}
```

**Database replication (AWS → GCP):**

```bash
# AWS RDS Primary → GCP Cloud SQL Replica
# Requires: VPN tunnel or Cloud Interconnect between AWS-GCP

# 1. Enable logical replication on AWS RDS
ALTER SYSTEM SET wal_level = logical;
ALTER SYSTEM SET max_replication_slots = 10;

# 2. Create publication on AWS
CREATE PUBLICATION myapp_pub FOR ALL TABLES;

# 3. Create subscription on GCP Cloud SQL
CREATE SUBSCRIPTION myapp_sub 
  CONNECTION 'host=aws-rds-endpoint dbname=myapp user=replication_user password=***'
  PUBLICATION myapp_pub;
```

**Cost comparison (Small tier):**

| Service | AWS (us-east-1) | GCP (us-central1) | Total/Month |
|---------|-----------------|-------------------|-------------|
| Compute | ECS t3.micro $7 | GKE n1-standard-1 $25 | $32 |
| Database | RDS t4g.micro $15 | Cloud SQL db-f1-micro $10 | $25 |
| Storage | S3 10GB $0.23 | Cloud Storage 10GB $0.20 | $0.43 |
| **Total** | **$22** | **$35** | **$57/month** |

**Trade-offs:**
- ✅ High availability (provider outage doesn't take down entire service)
- ✅ Compliance (data residency in multiple regions/providers)
- ❌ 2-3x cost vs single-cloud
- ❌ Complex networking (VPN/interconnect setup)
- ❌ Operational overhead (two dashboards, two CLIs, two IAM systems)

**Recommendation:** Only pursue multi-cloud if compliance/SLA requires it. Default to single-cloud + multi-region within same provider (simpler, cheaper).

## Q48 — Container Registry

Only relevant if the project actually containerizes (check this against Q19 Backend Architecture and Q47 above before asking — skip if not using containers at all).

- **None** — not containerized; platform builds from source directly (most Vercel/Railway/PaaS deployments).
- **Docker Hub** — free for public images; simplest option for open-source or low-stakes private images.
- **GHCR (GitHub Container Registry)** — free with a GitHub repo, same auth as the code, good default for private images on small teams.
- **ECR / GCR** — cloud-native choice once the deploy target is already AWS/GCP, for IAM-integrated pull permissions.

## Q49 — Deploy-Time Secrets

Should be consistent with the Q36 answer in `references/security/SECURITY_HARDENING_GUIDE.md` — don't let the two diverge (e.g. Vault for app secrets but plaintext env vars in the deploy pipeline defeats the point).

- **Platform env vars** — set directly in the Vercel/Railway dashboard; fine for solo/small team, but has no audit trail of who changed what.
- **GitHub Actions secrets** — scoped per-repo or per-environment (production vs. preview), visible only to workflow runs, not to PR authors from forks.
- **Doppler / Infisical sync** — single source of truth that pushes to CI and runtime both, avoiding drift between "what CI has" and "what prod has."
- **Vault with dynamic secrets** — enterprise; secrets are generated per-deploy and expire, so a leaked deploy log doesn't leak a permanent credential.

## Q50 — Rollback Strategy

- **Redeploy previous build** — the platform-native default (Vercel/Railway keep prior deploys one click away); sufficient baseline for every project regardless of tier.
- **Blue-green swap** — two full environments, traffic switches at the load balancer/DNS level; rollback is instant (swap back) with zero rebuild time.
- **Feature flags to disable** — for when the *code* is fine but a specific feature is causing problems; faster than any redeploy because there's no build step at all.
- **Automated rollback on health-check failure** — deploy pipeline itself watches error rate/latency post-deploy and reverts without a human in the loop; pairs with the Monitoring guide's alerting section.

## Q50a — DB Migration Strategy

- **Manual** — solo/MVP; migrations run by hand against production. Acceptable early, but write down the exact commands run each time in `docs/dev-docs/COMMIT-LOG.md` or equivalent.
- **Framework migrations** — Prisma Migrate, Laravel migrations, Rails migrations, Django migrations — run automatically as a deploy step. Default recommendation for anything past MVP.
- **Expand-contract pattern** — for zero-downtime schema changes: add the new column/table (expand), deploy code that writes to both old and new, backfill, deploy code that reads only new, then drop the old (contract). Required whenever Q50b below is anything but "not needed."
- **Managed migration tool** (Flyway, Liquibase) — enterprise teams with multiple services sharing schema ownership conventions.

## Q50b — Zero-Downtime Deploys

- **Not needed** — internal tools, low-traffic MVPs where a 30-second blip during deploy is genuinely fine; say so rather than over-engineering.
- **Rolling deploy** — most PaaS platforms do this by default (new instances come up, old ones drain) — often "free" once picked, worth confirming rather than assuming.
- **Blue-green** — full environment swap, used when a rolling deploy isn't safe (e.g. schema changes that aren't backward-compatible mid-rollout).
- **Canary** — route a small percentage of traffic to the new version first, watch metrics, ramp up; right choice once Q8 (Scale) is in the six-figure-user range where a bad deploy affecting 100% of traffic is unacceptable risk.

## Q50c — Backup Strategy

- **Managed DB automatic backups only** — Supabase/RDS/PlanetScale default daily backups; the floor, not the ceiling — confirm the retention window (often 7 days on free tiers) matches the project's actual recovery needs.
- **+ Point-in-time recovery (PITR)** — needed the moment "restore to 3am this morning" isn't good enough and "restore to the exact minute before the bad migration ran" is required.
- **+ Cross-region replica** — protects against a full region outage, not just data loss; relevant once Q8 scale or Q94 compliance requires real availability guarantees.
- **+ Regular restore drills** — the tier most projects skip and shouldn't: schedule an actual restore-to-a-test-environment quarterly. A backup that has never been restored is a backup you don't actually have.

## Putting it together: a minimal pipeline

For a typical Standard-tier answer set (small team, platform-managed infra, framework migrations), `docs/deployment/CI-CD.md` should describe this shape concretely, not abstractly:

```
PR opened → lint + typecheck + test + security scan (GitHub Actions)
  → merge to main → build container → Trivy vulnerability scan
  → run DB migration → deploy to staging
  → smoke test → manual promote to prod (or auto after N min if no alerts fire)
  → post-deploy: watch error rate for 15 min (ties into Monitoring guide alerting)
```

Adjust each stage's tooling per the answers above, but keep the shape — this is the part that's easy to leave vague, and vague deployment docs are exactly what Pitfall 4 (Ignoring AGENTS.md) turns into in practice.

---

## Container Security & CI Supply Chain Hardening

For containerized workloads and production deployment pipelines:

### 1. Automated Container Image Scanning (Trivy)
Fail the deployment build if any unpatched `HIGH` or `CRITICAL` Common Vulnerabilities and Exposures (CVEs) exist in base OS layers:

```yaml
- name: Build Container Image
  run: docker build -t myapp:${{ github.sha }} .

- name: Scan Image with Trivy
  uses: aquasecurity/trivy-action@0.20.0
  with:
    image-ref: myapp:${{ github.sha }}
    format: 'table'
    exit-code: '1'
    ignore-unfixed: true
    severity: 'CRITICAL,HIGH'
```

### 2. Supply Chain Protections
- **Deterministic Installs:** Always run `npm ci` or `pnpm install --frozen-lockfile`. Never use `npm install` in CI pipelines as it can pull unpinned minor versions.
- **Short-Lived Cloud Credentials (OIDC):** Never store permanent `AWS_ACCESS_KEY_ID` or GCP service account JSON in CI secrets. Use OpenID Connect (OIDC) federation to exchange ephemeral tokens directly with cloud providers.
- **Action Pinning:** For Large and Enterprise projects, pin all third-party GitHub Actions to specific commit SHAs rather than mutable branch/tag references.

---

**Version:** 1.0.0
**Part of:** Phase 5 (DevOps)
