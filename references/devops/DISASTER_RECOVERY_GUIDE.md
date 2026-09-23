# Disaster Recovery Guide — Large+ Projects

**Purpose:** Survive catastrophic failures (data center outage, data corruption, ransomware, natural disaster).

**When to use:** Large+ projects with uptime SLA ≥99% or compliance requirements (SOC 2, ISO 27001, HIPAA).

---

## RTO & RPO — Define Your Tolerance

**RTO (Recovery Time Objective):** How long can you be down?

**RPO (Recovery Point Objective):** How much data loss is acceptable?

### Example Targets by Tier

| Tier | RTO | RPO | Strategy |
|------|-----|-----|----------|
| **Small** | 24 hours | 24 hours | Manual restore from daily backup |
| **Medium** | 4 hours | 1 hour | Automated backup + runbook |
| **Large** | 1 hour | 15 minutes | Hot standby + automated failover |
| **Enterprise** | 5 minutes | 0 (zero data loss) | Multi-region active-active + synchronous replication |

**Your targets:**

```markdown
# Record in docs/operations/DISASTER_RECOVERY_PLAN.md

**RTO:** [target here, e.g., "1 hour"]  
**RPO:** [target here, e.g., "15 minutes"]  
**Business justification:** [e.g., "SLA guarantees 99.9% uptime to customers"]
```

---

## DR Strategy by RTO/RPO

### Strategy 1: Backup & Restore (RTO: 4-24h, RPO: 1-24h)

**What:** Daily automated backups, manual restore when needed.

**Cost:** Low ($10-50/month for storage)

**Setup:**

```bash
# PostgreSQL automated backup (daily)
0 2 * * * pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > /backups/$(date +\%Y\%m\%d).sql.gz

# Upload to S3
aws s3 sync /backups/ s3://my-backups/database/

# Retention: 30 days
find /backups/ -name "*.sql.gz" -mtime +30 -delete
```

**Restore procedure:**

```bash
# 1. Download backup
aws s3 cp s3://my-backups/database/20260922.sql.gz .

# 2. Restore to new database
gunzip 20260922.sql.gz
psql -h $NEW_DB_HOST -U postgres -c "CREATE DATABASE myapp;"
psql -h $NEW_DB_HOST -U postgres myapp < 20260922.sql

# 3. Update DATABASE_URL in env
vercel env add DATABASE_URL production
# Paste new connection string

# 4. Deploy
vercel --prod
```

**Test quarterly:** Run full restore drill to staging.

---

### Strategy 2: Warm Standby (RTO: 1-4h, RPO: 15min-1h)

**What:** Standby database/server in different region, replicating continuously.

**Cost:** Medium ($100-500/month for standby resources)

**Setup (PostgreSQL Replication):**

```bash
# Primary (us-east-1)
postgresql.conf:
  wal_level = replica
  max_wal_senders = 3
  
pg_hba.conf:
  host replication replicator 0.0.0.0/0 md5

# Standby (us-west-2)
recovery.conf:
  standby_mode = on
  primary_conninfo = 'host=primary-db.us-east-1 port=5432 user=replicator password=xxx'
  trigger_file = '/tmp/promote'
```

**Failover procedure (manual, 30-60 min):**

```bash
# 1. Promote standby to primary
ssh standby-db "touch /tmp/promote"

# 2. Update DNS (Route 53 example)
aws route53 change-resource-record-sets --hosted-zone-id Z123 --change-batch '{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "db.myapp.com",
      "Type": "CNAME",
      "TTL": 60,
      "ResourceRecords": [{"Value": "standby-db.us-west-2.rds.amazonaws.com"}]
    }
  }]
}'

# 3. Wait for DNS propagation (5-15 min)
# 4. Restart app (picks up new DB)
vercel --prod

# 5. Monitor logs
vercel logs --prod --follow
```

**Test quarterly:** Run failover drill to standby.

---

### Strategy 3: Hot Standby (RTO: 5-15min, RPO: 0-5min)

**What:** Load balancer routes traffic to multiple regions, automatic failover.

**Cost:** High ($500-2K/month for multi-region deployment)

**Setup (AWS Multi-Region with Auto Failover):**

```yaml
# Route 53 Health Check
aws route53 create-health-check --caller-reference $(date +%s) --health-check-config '{
  "Type": "HTTPS",
  "ResourcePath": "/health",
  "FullyQualifiedDomainName": "api.myapp.com",
  "Port": 443,
  "RequestInterval": 30,
  "FailureThreshold": 3
}'

# Route 53 Failover Policy
Primary: us-east-1 (main region)
Secondary: us-west-2 (failover region)

If health check fails → automatic DNS switch to secondary
```

**Database:** PostgreSQL with synchronous replication (zero data loss).

```sql
-- postgresql.conf (primary)
synchronous_commit = on
synchronous_standby_names = 'standby1'
```

**Failover:** Automatic (5-15 min DNS TTL).

**Test monthly:** Kill primary region, verify automatic failover.

---

### Strategy 4: Active-Active (RTO: <1min, RPO: 0)

**What:** Traffic routed to multiple regions simultaneously, no failover needed.

**Cost:** Very High ($2K-10K/month for full active-active)

**Setup:**

- Multi-region database cluster (CockroachDB, YugabyteDB, Spanner)
- Global load balancer (Cloudflare, AWS Global Accelerator)
- Conflict-free replicated data types (CRDTs) or eventual consistency

**Example (CockroachDB):**

```sql
-- Create table with geo-partitioning
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT,
  region TEXT,
  CONSTRAINT check_region CHECK (region IN ('us', 'eu', 'asia'))
) PARTITION BY LIST (region) (
  PARTITION us_users VALUES IN ('us'),
  PARTITION eu_users VALUES IN ('eu'),
  PARTITION asia_users VALUES IN ('asia')
);

-- Configure zone constraints
ALTER PARTITION us_users CONFIGURE ZONE USING constraints='[+region=us-east]';
ALTER PARTITION eu_users CONFIGURE ZONE USING constraints='[+region=eu-west]';
ALTER PARTITION asia_users CONFIGURE ZONE USING constraints='[+region=asia-southeast]';
```

**Failover:** Not needed (all regions active).

**Test:** Kill one region, verify no user impact.

---

## Data Loss Scenarios & Recovery

### Scenario 1: Accidental DELETE (User Error)

**Example:** Engineer runs `DELETE FROM users WHERE` without `WHERE` clause.

**Prevention:**

```sql
-- Require explicit WHERE on production
-- Add to postgresql.conf or use SQL proxy
require_safe_update_mode = on
```

**Recovery (if caught within RPO window):**

```bash
# Option 1: Point-in-Time Recovery (PITR)
# Restore to 5 minutes before DELETE
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance mydb \
  --target-db-instance mydb-recovery \
  --restore-time 2026-09-22T10:25:00Z

# Option 2: Restore from latest backup (if no PITR)
pg_restore -d mydb /backups/20260922-0200.dump
```

**Mitigation:** Enable soft deletes (add `deleted_at` column, never hard delete).

---

### Scenario 2: Ransomware / Data Corruption

**Example:** Attacker encrypts database, demands ransom.

**Prevention:**

- Immutable backups (S3 Object Lock, GCS retention policy)
- Offline backups (tape, cold storage)
- Multi-factor auth on production access

**Recovery:**

```bash
# 1. Isolate infected systems (disconnect from network)
aws ec2 stop-instances --instance-ids i-infected

# 2. Restore from last clean backup (before infection)
aws s3 cp s3://immutable-backups/20260920.sql.gz .
gunzip 20260920.sql.gz
psql -h $CLEAN_DB -U postgres mydb < 20260920.sql

# 3. Re-deploy app to clean infrastructure
# DO NOT reuse infected servers/containers

# 4. Rotate ALL secrets (assume attacker has credentials)
# See references/security/SECRET_ROTATION_RUNBOOK.md

# 5. Forensics: how did attacker get in?
# Review access logs, patch vulnerability
```

**Do NOT pay ransom** — no guarantee of decryption, funds criminals.

---

### Scenario 3: Cloud Provider Region Outage

**Example:** AWS us-east-1 down (DynamoDB, RDS, S3 unavailable).

**Impact:** If single-region → full outage.

**Recovery:**

```bash
# If multi-region setup exists:
# 1. Traffic automatically fails over to us-west-2 (Route 53 health check)

# If single-region:
# 1. Wait for AWS to restore service (historical: 2-12 hours)
# 2. Communicate with users (status page)
# 3. Post-mortem: why single-region? Budget for multi-region?
```

**Mitigation:** Multi-region deployment (Strategy 3 or 4).

---

### Scenario 4: Data Center Natural Disaster

**Example:** Earthquake destroys data center.

**Impact:** Total loss of primary region.

**Recovery:**

```bash
# If cross-region backups exist:
# 1. Restore from backup in different region
aws s3 sync s3://backups-us-west-2/ /restore/

# 2. Provision new infrastructure in surviving region
terraform apply -var="region=us-west-2"

# 3. Restore database
psql -h $NEW_DB mydb < /restore/20260922.sql

# 4. Update DNS to new region
aws route53 change-resource-record-sets ...

# 5. Communicate downtime duration to users
```

**Mitigation:** 
- Geo-redundant backups (3 regions minimum)
- Multi-region deployment

---

## Disaster Recovery Drills

### Quarterly Drill (4 times/year)

**Goal:** Verify backup restore works, team knows runbook.

**Steps:**

1. **Schedule drill** (announce 1 week ahead, pick low-traffic time)
2. **Restore latest backup to staging**
3. **Time the restore** (verify meets RTO)
4. **Check data integrity** (row count, checksums)
5. **Document deviations** (runbook outdated? Missing step?)
6. **Update runbook** (fix gaps found)

**Drill report template:**

```markdown
# DR Drill Report — 2026-09-22

**Scenario:** Full database restore from backup

**Start time:** 10:00 UTC  
**End time:** 10:45 UTC  
**Total duration:** 45 minutes  

**RTO target:** 1 hour ✅  
**RPO target:** 15 minutes ✅  

**Steps executed:**
1. Downloaded backup from S3 (5 min)
2. Restored to staging DB (30 min)
3. Verified row counts (5 min)
4. Smoke tested app (5 min)

**Issues found:**
- Backup download slow (30 Mbps, should be 100 Mbps) → investigate S3 bandwidth
- Staging DB credentials expired → update 1Password

**Action items:**
- [ ] Increase S3 download speed (configure VPC endpoint)
- [ ] Rotate staging DB credentials
- [ ] Update runbook: add "verify credentials first" step

**Next drill:** 2026-12-22
```

---

### Annual Full Failover Test (Enterprise only)

**Goal:** Verify entire region can fail over.

**Steps:**

1. **Schedule maintenance window** (announce 2 weeks ahead)
2. **Kill primary region** (shut down all services)
3. **Activate DR plan** (failover to standby region)
4. **Verify app works** (run full test suite)
5. **Switch traffic back** (failback to primary)
6. **Post-mortem** (what broke? What took longest?)

**Duration:** 4-8 hours (includes failback).

---

## DR Runbook Template

**Store at:** `docs/operations/DISASTER_RECOVERY_RUNBOOK.md`

```markdown
# Disaster Recovery Runbook

**Last updated:** 2026-09-22  
**Last tested:** 2026-09-22 (quarterly drill)  

**RTO:** 1 hour  
**RPO:** 15 minutes  

---

## Scenario 1: Database Corruption

**Trigger:** Unusual query results, data inconsistencies, error logs.

### Steps (60 min total)

1. **Verify corruption** (5 min)
   ```sql
   SELECT pg_database_size('mydb'); -- Check size
   SELECT * FROM users LIMIT 10; -- Sample data
   ```

2. **Stop writes** (2 min)
   ```bash
   # Enable maintenance mode (block new requests)
   vercel env add MAINTENANCE_MODE true production
   vercel --prod
   ```

3. **Download latest backup** (10 min)
   ```bash
   aws s3 cp s3://backups/latest.sql.gz .
   gunzip latest.sql.gz
   ```

4. **Restore to new DB** (30 min)
   ```bash
   psql -h $NEW_DB -U postgres -c "CREATE DATABASE mydb_restored;"
   psql -h $NEW_DB -U postgres mydb_restored < latest.sql
   ```

5. **Update connection string** (3 min)
   ```bash
   vercel env add DATABASE_URL production
   # Paste new DB URL
   ```

6. **Deploy & verify** (10 min)
   ```bash
   vercel --prod
   vercel logs --prod --follow
   # Test critical flow: login → create item
   ```

7. **Disable maintenance mode**
   ```bash
   vercel env rm MAINTENANCE_MODE production
   vercel --prod
   ```

---

## Scenario 2: Region Outage

**Trigger:** AWS status page reports us-east-1 down.

### Steps (30 min total, if multi-region setup exists)

1. **Verify outage** (2 min)
   - Check AWS status: https://status.aws.amazon.com/
   - Ping health endpoint: `curl https://api.myapp.com/health`

2. **Initiate failover** (5 min)
   ```bash
   # Promote standby DB to primary
   ssh standby-db "touch /tmp/promote"
   ```

3. **Update DNS** (10 min, includes propagation)
   ```bash
   aws route53 change-resource-record-sets --hosted-zone-id Z123 --change-batch file://failover.json
   ```

4. **Restart app in secondary region** (5 min)
   ```bash
   # Deploy to us-west-2
   vercel --prod --region sfo1
   ```

5. **Verify traffic routing** (5 min)
   ```bash
   curl -I https://api.myapp.com | grep x-vercel-id
   # Should show sfo1 region
   ```

6. **Notify users** (3 min)
   - Update status page: "Experiencing issues, investigating"
   - Post to Twitter/status channel

---

## Contact List

**On-call engineer:** [phone]  
**Database admin:** [phone]  
**AWS support:** 1-866-221-0634 (Enterprise)  
**Incident coordinator:** [name, phone]  

**Escalation ladder:**
1. On-call engineer (respond within 15 min)
2. Senior engineer (if on-call unavailable)
3. CTO (if downtime > 1 hour)

---

## Post-Incident Checklist

After disaster is resolved:

- [ ] Write post-mortem (`docs/incidents/YYYY-MM-DD-disaster.md`)
- [ ] Update runbook (fix gaps found during incident)
- [ ] Rotate secrets (if security incident)
- [ ] Improve monitoring (add alert for this failure mode)
- [ ] Budget review (cost of downtime vs. cost of better DR)

```

---

## Checklist: DR Setup

### Initial Setup (Large+ projects)
- [ ] Define RTO & RPO targets (documented in DR plan)
- [ ] Choose DR strategy (backup/warm/hot/active-active)
- [ ] Setup automated backups (daily minimum)
- [ ] Test backup restore (verify actually works)
- [ ] Setup cross-region backups (S3 replication or manual sync)
- [ ] Document DR runbook (step-by-step, with commands)
- [ ] Assign on-call rotation (who responds to incidents?)
- [ ] Setup monitoring & alerts (detect failures fast)

### Quarterly
- [ ] Run DR drill (restore from backup to staging)
- [ ] Time the restore (verify meets RTO)
- [ ] Update runbook (fix gaps found in drill)
- [ ] Review backup retention (still meeting compliance?)

### Annually (Enterprise)
- [ ] Full failover test (simulate region outage)
- [ ] Review RTO/RPO targets (still appropriate?)
- [ ] Update incident response team (new hires, departures)
- [ ] Audit backups (are they immutable? Encrypted?)

---

**Last updated:** 2026-09-22  
**Version:** 1.0.0
