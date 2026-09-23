# Database Strategy Guide

**Purpose:** Schema versioning, migration management, backup/restore, indexing strategy, and data quality.

**When to use:** Medium+ projects with database (SQL or NoSQL).

---

## Schema Versioning

### Migration Tools by Stack

| ORM/Framework | Migration Tool | Language |
|---------------|----------------|----------|
| **Prisma** | Prisma Migrate | SQL (generated) |
| **Drizzle** | Drizzle Kit | SQL (generated) |
| **TypeORM** | TypeORM Migrations | TypeScript |
| **Sequelize** | Sequelize CLI | JavaScript |
| **Django** | Django Migrations | Python |
| **Rails** | Active Record Migrations | Ruby |
| **Flyway** | SQL scripts | SQL (raw) |
| **Liquibase** | XML/YAML/SQL | Multi-format |

**Recommendation:**

- **Prisma/Drizzle:** Best for TypeScript projects, schema-first approach
- **Flyway/Liquibase:** Best for brownfield projects, existing databases

---

## Migration Workflow (Prisma Example)

### 1. Schema Definition

**prisma/schema.prisma:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  posts Post[]
  
  @@index([email])
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  createdAt DateTime @default(now())
  
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  @@index([authorId])
  @@index([published, createdAt])
}
```

### 2. Generate Migration

```bash
npx prisma migrate dev --name add_user_post_models

# Output:
# ✔ Generated migration: 20260922_add_user_post_models.sql
# ✔ Applied migration: 20260922_add_user_post_models.sql
```

**Generated SQL (`prisma/migrations/20260922_add_user_post_models/migration.sql`):**

```sql
-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_published_createdAt_idx" ON "Post"("published", "createdAt");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 3. Review Migration

**MANDATORY:** Review generated SQL before applying to production.

**Check for:**

- [ ] No data loss (e.g., dropping column without backup)
- [ ] Indexes on foreign keys (performance)
- [ ] `onDelete` behavior correct (CASCADE vs. RESTRICT vs. SET NULL)
- [ ] Default values safe for existing rows
- [ ] Migration is reversible — see "Reversibility is a gate, not a checkbox" below

### 3a. Reversibility Is a Gate, Not a Checkbox

**"Migration is reversible (or manual rollback documented)" is not satisfied by
writing a sentence.** Backups and quarterly restore drills (Rule 20) protect against
catastrophic data loss, but they are slow (a full restore is not a same-day fix during
a live incident) and they roll back *everything*, not just the one bad migration. A
schema-level rollback is the fast path and needs to actually exist before the forward
migration is approved, not be improvised after something breaks.

**Before a migration is approved for production, one of these must be true — pick one
and record which:**

1. **A tested down-migration exists.** For Prisma, this means the down SQL has actually
   been generated (or hand-written) and run against a staging DB restored to the
   pre-migration state, confirmed to bring the schema back cleanly. Record:
   `rollback_tested: true, rollback_method: [file/command]`.
2. **The migration is genuinely irreversible, and that's explicitly justified.** Some
   migrations cannot be cleanly reversed (e.g., a destructive column drop after the
   two-phase migration's expand-contract cycle has already completed and old code is
   confirmed gone). In this case, do not write "reversible: no" and move on — record
   the specific reason, the mitigation (e.g., "restore from the pre-migration backup
   taken at `[timestamp]`, expect ~15 min RTO per the restore drill baseline"), and get
   explicit human sign-off before applying to production. Record:
   `rollback_method: irreversible, justification: [reason], fallback: restore_from_backup, human_approved_by: [name]`.

An agent must not mark this checklist item done with only a comment like "should be
fine to roll back manually" — that is exactly the unverified, improvised state this
gate exists to prevent. If neither (1) nor (2) has been explicitly recorded, the
migration is not approved for production, regardless of how simple it looks.



**Staging:**

```bash
# Run against staging DB
DATABASE_URL="postgresql://user:pass@staging-db:5432/myapp" \
  npx prisma migrate deploy
```

**Production:**

```bash
# Run as part of deployment (CI/CD)
DATABASE_URL="$PROD_DATABASE_URL" npx prisma migrate deploy

# Or via Docker entrypoint:
# docker-entrypoint.sh:
#!/bin/bash
prisma migrate deploy
node dist/index.js
```

---

## Migration Safety Rules

### Rule 1: Never Drop Columns Directly

**Bad (data loss risk):**

```sql
ALTER TABLE "User" DROP COLUMN "phone";
```

**Good (two-phase migration):**

**Phase 1: Mark column unused (deploy code that doesn't read it)**

```prisma
// Remove from schema, but don't drop yet
// model User {
//   phone String? // REMOVED
// }
```

**Phase 2: Wait 1-2 weeks, then drop**

```sql
-- After verifying no code reads this column
ALTER TABLE "User" DROP COLUMN "phone";
```

### Rule 2: Add Columns as Nullable First

**Bad (breaks existing inserts):**

```sql
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';
-- Problem: If app doesn't know about "role" yet, inserts fail
```

**Good (two-phase):**

**Phase 1: Add nullable column**

```sql
ALTER TABLE "User" ADD COLUMN "role" TEXT;
```

**Phase 2: Backfill, then add constraint**

```sql
UPDATE "User" SET "role" = 'user' WHERE "role" IS NULL;
ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL;
```

### Rule 3: Rename via Alias (Zero Downtime)

**Bad (breaks running app):**

```sql
ALTER TABLE "User" RENAME COLUMN "name" TO "fullName";
-- Old code reading "name" crashes immediately
```

**Good (three-phase):**

**Phase 1: Add new column, copy data**

```sql
ALTER TABLE "User" ADD COLUMN "fullName" TEXT;
UPDATE "User" SET "fullName" = "name";
```

**Phase 2: Deploy code reading both columns (fallback to old)**

```typescript
const name = user.fullName || user.name;
```

**Phase 3: Drop old column after all instances updated**

```sql
ALTER TABLE "User" DROP COLUMN "name";
```

### Rule 4: Index Before Foreign Key (Large Tables)

**Bad (locks table during FK creation):**

```sql
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" 
  FOREIGN KEY ("authorId") REFERENCES "User"("id");
-- On 10M rows, this locks table for minutes
```

**Good (index first):**

```sql
-- Add index first (concurrent, no lock)
CREATE INDEX CONCURRENTLY "Post_authorId_idx" ON "Post"("authorId");

-- Then add FK (faster with index)
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" 
  FOREIGN KEY ("authorId") REFERENCES "User"("id");
```

### Rule 5: Background Workers & Long-Running Jobs Schema Sync

In asynchronous worker systems (BullMQ, Celery, Sidekiq, Temporal), background jobs queued *before* a migration can execute *after* a migration runs, or long-running workers may cache outdated schema models in memory:

1. **Expand phase must be backward-compatible with in-flight queue jobs.** If an old job payload lacks a newly required column, inserts will crash. Always make new columns nullable or provide DB-level defaults during expand.
2. **Contract phase requires worker drain or coordinated restart.** Never execute a `DROP COLUMN` or destructive contract step while older worker instances are running. The sequence must be:
   - Deploy code reading new columns.
   - Drain or gracefully restart all background workers so no worker process holds cached references to the old schema.
   - Verify job failure rate in monitoring is 0%.
   - Only then apply the final contract drop migration.

---

## Backup & Restore

### Automated Backup (PostgreSQL)

**Daily backup script:**

```bash
#!/bin/bash
# /opt/scripts/backup-db.sh

set -e

DB_NAME="myapp"
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/$DB_NAME-$DATE.sql.gz"

# Create backup
pg_dump $DB_NAME | gzip > $FILE

# Verify backup
gunzip -t $FILE

# Upload to S3 (optional)
aws s3 cp $FILE s3://my-backups/postgres/

# Delete local backups older than 7 days
find $BACKUP_DIR -name "$DB_NAME-*.sql.gz" -mtime +7 -delete

echo "Backup complete: $FILE"
```

**Cron job:**

```bash
# /etc/cron.d/backup-db
0 2 * * * postgres /opt/scripts/backup-db.sh >> /path/to/logs/backup-db.log 2>&1
```

### Backup Strategy by Tier

| Tier | Backup Frequency | Retention | Storage |
|------|------------------|-----------|----------|
| **Small** | Weekly (manual) | 1 month | Local disk |
| **Medium** | Daily (automated) | 30 days | S3/GCS |
| **Large** | Daily + hourly WAL | 90 days | S3 + cross-region replica |
| **Enterprise** | Continuous (streaming replica) | 1 year | Multi-region + tape archive |

### Point-in-Time Recovery (PITR)

**Enable WAL archiving (PostgreSQL):**

**postgresql.conf:**

```ini
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://my-backups/wal/%f'
archive_timeout = 300  # Archive every 5 minutes
```

**Restore to specific time:**

```bash
# Stop PostgreSQL
sudo systemctl stop postgresql

# Restore base backup
cd /path/to/data/postgresql/14/main
rm -rf *
gunzip -c /backups/base-backup.tar.gz | tar xf -

# Create recovery.signal
touch recovery.signal

# Configure recovery target
echo "restore_command = 'aws s3 cp s3://my-backups/wal/%f %p'" >> postgresql.auto.conf
echo "recovery_target_time = '2026-09-22 14:30:00'" >> postgresql.auto.conf

# Start PostgreSQL (will replay WAL until target time)
sudo systemctl start postgresql
```

### Restore Drill (Mandatory Quarterly)

**Checklist:**

1. [ ] Download latest backup from S3
2. [ ] Restore to temporary database
3. [ ] Run smoke tests (check row counts, critical records exist)
4. [ ] Time the restore (document in runbook)
5. [ ] Verify data integrity (no corruption)
6. [ ] Document any issues found
7. [ ] Update restore runbook with learnings

**Smoke test script:**

```sql
-- Check critical tables
SELECT 'Users' AS table_name, COUNT(*) FROM "User"
UNION ALL
SELECT 'Posts', COUNT(*) FROM "Post"
UNION ALL
SELECT 'Orders', COUNT(*) FROM "Order";

-- Check latest records exist
SELECT MAX("createdAt") AS latest_user FROM "User";
SELECT MAX("createdAt") AS latest_post FROM "Post";

-- Check referential integrity
SELECT COUNT(*) AS orphaned_posts
FROM "Post" p
LEFT JOIN "User" u ON p."authorId" = u.id
WHERE u.id IS NULL;
-- Should be 0
```

---

## Indexing Strategy

### When to Add Index

**Add index when:**

- [ ] Column used in `WHERE` clause frequently
- [ ] Column used in `JOIN` condition
- [ ] Column used in `ORDER BY` / `GROUP BY`
- [ ] Foreign key column (performance + FK constraint)
- [ ] Unique constraint needed (email, username)

**Skip index when:**

- [ ] Table has < 1000 rows (seq scan faster than index scan)
- [ ] Column has low cardinality (e.g., boolean, enum with 2-3 values)
- [ ] Column rarely queried
- [ ] Write-heavy table (indexes slow down inserts/updates)

### Index Types (PostgreSQL)

| Index Type | Use Case | Example |
|------------|----------|----------|
| **B-tree** (default) | Equality + range queries | `WHERE age > 18`, `WHERE email = 'x'` |
| **Hash** | Equality only (rare) | `WHERE id = 123` (B-tree also works) |
| **GIN** | Full-text search, JSONB | `WHERE tags @> '{postgres}'` |
| **GiST** | Geometric, full-text | `WHERE location <-> point(0,0) < 10` |
| **BRIN** | Very large tables, sorted | Time-series data (billions of rows) |

**Examples:**

```sql
-- B-tree (default)
CREATE INDEX idx_user_email ON "User"(email);

-- Composite index (order matters!)
CREATE INDEX idx_post_published_created ON "Post"(published, "createdAt" DESC);
-- Optimizes: WHERE published = true ORDER BY "createdAt" DESC
-- Does NOT optimize: WHERE "createdAt" > '2024-01-01' (wrong column order)

-- Partial index (filtered)
CREATE INDEX idx_post_published_only ON "Post"("createdAt") WHERE published = true;
-- Smaller index, faster for: WHERE published = true ORDER BY "createdAt"

-- GIN index (JSONB)
CREATE INDEX idx_user_metadata ON "User" USING GIN (metadata);
-- Optimizes: WHERE metadata @> '{"role": "admin"}'

-- Full-text search
CREATE INDEX idx_post_title_search ON "Post" USING GIN (to_tsvector('english', title));
-- Optimizes: WHERE to_tsvector('english', title) @@ to_tsquery('postgres');
```

### Index Monitoring

**Find unused indexes:**

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelid NOT IN (
    -- Exclude indexes enforcing constraints
    SELECT conindid FROM pg_constraint WHERE contype IN ('p', 'u')
  )
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Find missing indexes (slow queries):**

```sql
-- Enable pg_stat_statements extension first
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slow queries
SELECT
  calls,
  total_exec_time,
  mean_exec_time,
  query
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- > 100ms average
ORDER BY total_exec_time DESC
LIMIT 10;

-- Then EXPLAIN ANALYZE those queries to find missing indexes
```

**EXPLAIN ANALYZE example:**

```sql
EXPLAIN ANALYZE
SELECT * FROM "Post" WHERE "authorId" = 123 ORDER BY "createdAt" DESC LIMIT 10;

-- Bad output (seq scan):
-- Seq Scan on "Post" (cost=0.00..1000.00 rows=100 width=100) (actual time=50.123..50.456 rows=10)
--   Filter: ("authorId" = 123)

-- Good output (index scan):
-- Index Scan using idx_post_authorId on "Post" (cost=0.29..8.45 rows=10 width=100) (actual time=0.012..0.023 rows=10)
--   Index Cond: ("authorId" = 123)
```

---

## Data Quality & Validation

### Database Constraints (Data Integrity Floor)

**Mandatory constraints (from BUILD module):**

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique  // ✅ Unique constraint
  age   Int    @default(0)  // ✅ Default value
  
  // ❌ Missing: check constraint (age >= 0)
}
```

**Add check constraints (raw SQL):**

```sql
ALTER TABLE "User" ADD CONSTRAINT "User_age_check" CHECK (age >= 0 AND age <= 150);
ALTER TABLE "Order" ADD CONSTRAINT "Order_total_check" CHECK (total >= 0);
ALTER TABLE "Post" ADD CONSTRAINT "Post_title_length" CHECK (LENGTH(title) >= 3);
```

**Foreign key with correct `onDelete`:**

```prisma
model Post {
  authorId Int
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  // CASCADE: Delete posts when user deleted
  // RESTRICT: Prevent user deletion if posts exist
  // SET NULL: Set authorId to NULL when user deleted
}
```

### Data Validation Layers

**Layer 1: Application (Zod/Yup)**

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email().max(255),
  age: z.number().int().min(0).max(150),
  name: z.string().min(1).max(100),
});

// Validate before DB insert
const data = createUserSchema.parse(req.body);
await prisma.user.create({ data });
```

**Layer 2: Database Constraints**

```sql
-- Belt-and-suspenders: validate at DB level too
ALTER TABLE "User" ADD CONSTRAINT "User_age_check" CHECK (age >= 0 AND age <= 150);
```

**Layer 3: Data Auditing**

```sql
-- Periodic data quality check (run weekly)
SELECT
  'Invalid email' AS issue,
  COUNT(*) AS count
FROM "User"
WHERE email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'

UNION ALL

SELECT
  'Age out of range',
  COUNT(*)
FROM "User"
WHERE age < 0 OR age > 150

UNION ALL

SELECT
  'Orphaned posts',
  COUNT(*)
FROM "Post" p
LEFT JOIN "User" u ON p."authorId" = u.id
WHERE u.id IS NULL;
```

---

## Data Retention & GDPR

### Retention Policy

**Example policy:**

| Data Type | Retention | Deletion Method |
|-----------|-----------|------------------|
| **User account** | Active + 3 years inactive | Hard delete (GDPR right to erasure) |
| **Audit logs** | 1 year | Archive to cold storage, then delete |
| **Payment records** | 7 years (legal requirement) | Anonymize after user deletion |
| **Analytics events** | 90 days | Roll up to aggregates, delete raw events |

### GDPR Compliance

**User data export (GDPR Article 20):**

```typescript
// /api/me/export
export async function exportUserData(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: true,
      comments: true,
      orders: true,
    },
  });
  
  return {
    personal_data: {
      email: user.email,
      name: user.name,
      created_at: user.createdAt,
    },
    posts: user.posts.map(p => ({ title: p.title, content: p.content })),
    comments: user.comments,
    orders: user.orders.map(o => ({ id: o.id, total: o.total })),
  };
}
```

**User data deletion (GDPR Article 17):**

```typescript
// /api/me/delete
export async function deleteUserData(userId: number) {
  await prisma.$transaction([
    // Delete user-generated content
    prisma.post.deleteMany({ where: { authorId: userId } }),
    prisma.comment.deleteMany({ where: { authorId: userId } }),
    
    // Anonymize orders (legal requirement: keep 7 years)
    prisma.order.updateMany({
      where: { userId },
      data: {
        userId: null,
        email: 'deleted@example.com',
        name: 'Deleted User',
      },
    }),
    
    // Delete user account
    prisma.user.delete({ where: { id: userId } }),
  ]);
}
```

---

## Performance Optimization

### N+1 Query Detection

**Bad (N+1):**

```typescript
// 1 query for users
const users = await prisma.user.findMany();

// N queries for posts (one per user)
for (const user of users) {
  user.posts = await prisma.post.findMany({ where: { authorId: user.id } });
}
// Total: 1 + 100 = 101 queries if 100 users
```

**Good (1 query with include):**

```typescript
const users = await prisma.user.findMany({
  include: { posts: true },
});
// Total: 1 query (JOIN)
```

**Detect N+1 in production:**

```typescript
// Add query logging
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
});

let queryCount = 0;

prisma.$on('query', (e) => {
  queryCount++;
  if (queryCount > 10) {
    console.warn('⚠️ Possible N+1 query detected:', queryCount, 'queries');
  }
});

// Reset per request
app.use((req, res, next) => {
  queryCount = 0;
  next();
});
```

### Connection Pooling

**Prisma connection pool config:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Adjust based on server capacity
  // connection_limit = 10  // Default
}
```

**DATABASE_URL format & Connection Security (SSL/TLS):**

All production and staging database connections MUST enforce TLS encryption over the wire to prevent credential theft and man-in-the-middle packet sniffing:

```bash
# Production / Staging (Mandatory TLS encryption):
DATABASE_URL="postgresql://user:pass@db.example.com:5432/myapp?sslmode=require&connection_limit=10&pool_timeout=20"

# Local Development (Docker):
DATABASE_URL="postgresql://user:pass@localhost:5432/myapp?connection_limit=10&pool_timeout=20"
```

Never configure `sslmode=disable` on any hosted or cloud database endpoint (AWS RDS, Supabase, Neon, PlanetScale).

**PostgreSQL max connections:**

```sql
-- Check current connections
SELECT COUNT(*) FROM pg_stat_activity;

-- Check max connections
SHOW max_connections;
-- Default: 100

-- Increase if needed (requires restart)
-- postgresql.conf:
max_connections = 200
```

**Connection pool sizing:**

```
connections_per_instance = ((core_count * 2) + disk_spindles)

Example:
4 cores, 1 SSD = (4 * 2) + 1 = 9 connections

With 10 app instances:
total_connections = 9 * 10 = 90 (within 100 max)
```

---

## Integration with Project Lifecycle

**Update `modules/03a-build-foundations.md` § Data Integrity Floor:**

```markdown
### Data Integrity Floor (All Tiers with Database)

**Mandatory before first data insert:**

- [ ] Foreign keys with correct `onDelete` (CASCADE/RESTRICT/SET NULL)
- [ ] Unique constraints on natural keys (email, username, slug)
- [ ] Check constraints on ranges (age >= 0, total >= 0)
- [ ] Default values for non-nullable columns
- [ ] Indexes on foreign keys (performance)
- [ ] Migration reviewed for data loss risks
- [ ] Backup strategy documented (see DATABASE_STRATEGY_GUIDE.md)
```

**Update `engine/GATE-REGISTRY.md`:**

```markdown
### gate:production-deploy

**Evidence:**
- Database migration reviewed (no data loss, reversible)
- **Backup verified (restore drill passed within last 90 days)** ← NEW
- **Database indexes checked (no missing indexes on slow queries)** ← NEW
- Connection pool sized correctly
- Data retention policy documented (GDPR compliance)
```

**Update Phase 6 (Build Setup):**

```markdown
### Q63b — Database Strategy

> "What database are you using, and what's the backup strategy?"

Options:
- PostgreSQL / MySQL / MongoDB / SQLite / Supabase / Planetscale

Sub-questions:
- Q63b-i: Migration tool? (Prisma Migrate / Flyway / Liquibase / Django Migrations)
- Q63b-ii: Backup frequency? (Daily / Hourly / Continuous PITR)
- Q63b-iii: Backup storage? (Local / S3 / Cross-region)
- Q63b-iv: Last restore drill? (Never / > 6 months ago / < 3 months ago)

**Output files:**
- `docs/dev-docs/DATABASE.md` (connection, migrations, backup runbook)
- `/opt/scripts/backup-db.sh` (automated backup script)
```

---

**Agent instruction:**

For Medium+ projects with database:

1. Set up migration tool (Prisma Migrate / Flyway)
2. Review generated migrations for safety (no data loss, indexes, constraints)
3. Document two-phase migration strategy for breaking changes
4. Configure automated daily backups (S3/GCS)
5. Schedule quarterly restore drills (verify backup integrity)
6. Add indexes on foreign keys and frequently queried columns
7. Enable query logging to detect N+1 queries
8. Document data retention policy (GDPR compliance)
9. Implement user data export/deletion endpoints

Do not deploy schema changes to production without:
- Migration reviewed by senior engineer
- Backup verified (restore drill passed)
- Rollback plan documented
