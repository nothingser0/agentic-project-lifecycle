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
- [ ] Indexes created concurrently (`CREATE INDEX CONCURRENTLY`) on production tables
- [ ] Strict lock timeout configured (`SET lock_timeout = '2s';`) at top of DDL script
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

### Rule 3: 4-Phase Expand-Contract Migration Pattern (Zero-Downtime Renames & Drops)

Directly renaming or dropping a database column causes immediate 500 errors during rolling deployments: running application instances reading the old column name crash as soon as the migration executes, and old code cannot write to the new column.

To achieve 100% zero downtime, execute every column rename, type conversion, or column split across **four distinct deployment phases**:

```text
Phase 1: EXPAND           Phase 2: BACKFILL         Phase 3: SWITCH READS     Phase 4: CONTRACT
Add new column nullable   Copy existing data        App reads new column      Stop dual writes
Deploy dual-write code    in safe batches           Old column now unread     Drop old column
```

#### Phase 1: Expand (Add Column & Dual-Write)
1. **Database Migration:** Add the new column as `NULLABLE` (do not add NOT NULL yet) with a lock timeout:
   ```sql
   -- migration_01_expand.sql
   SET lock_timeout = '2s';
   ALTER TABLE "User" ADD COLUMN "fullName" TEXT;
   ```
2. **Application Code (Deploy v1):** Update models to write to **both** columns simultaneously, while still reading from the old column:
   ```typescript
   // app/api/users/route.ts (v1)
   export async function createUser(data: UserInput) {
     return db.user.create({
       data: {
         name: data.name,      // Old column (primary read source)
         fullName: data.name,  // New column (dual write for new rows)
         email: data.email
       }
     });
   }
   ```

#### Phase 2: Backfill Historical Rows (Background Script)
Never run a single monolithic `UPDATE "User" SET "fullName" = "name"` on tables with >10,000 rows — it locks the entire table and causes replication lag. Backfill in indexed primary-key chunks:
```typescript
// scripts/backfill-user-fullname.ts
async function backfillFullName() {
  const BATCH_SIZE = 500;
  let lastId = 0;
  let updated = 0;

  while (true) {
    const batch = await db.user.findMany({
      where: { id: { gt: lastId }, fullName: null },
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE,
    });

    if (batch.length === 0) break;

    for (const user of batch) {
      await db.user.update({
        where: { id: user.id },
        data: { fullName: user.name },
      });
    }

    lastId = batch[batch.length - 1].id;
    updated += batch.length;
    await new Promise((r) => setTimeout(r, 50)); // Throttling: yield to user traffic
  }
  console.log(`Backfill complete: ${updated} rows updated.`);
}
```

#### Phase 3: Switch Reads to New Column (Deploy v2)
Once backfill script completes with 0 remaining nulls:
1. Update application code to read from `fullName` with a fallback:
   ```typescript
   // app/api/users/route.ts (v2)
   const displayName = user.fullName ?? user.name;
   ```
2. If `fullName` is required, add the `NOT NULL` constraint safely:
   ```sql
   -- migration_02_add_constraint.sql
   SET lock_timeout = '2s';
   ALTER TABLE "User" ALTER COLUMN "fullName" SET NOT NULL;
   ```
3. Deploy v2 across all instances and background worker queues. Monitor for 24–48 hours to confirm zero dependencies on `name`.

#### Phase 4: Contract (Remove Dual-Write & Drop Old Column)
1. **Application Code (Deploy v3):** Remove all references to the old `name` column from application code, ORM schemas (Prisma/Drizzle), and workers.
2. **Worker Drain:** Ensure all in-flight queues processing v2 payloads have drained.
3. **Database Migration:** Drop the old column:
   ```sql
   -- migration_03_contract.sql
   SET lock_timeout = '2s';
   ALTER TABLE "User" DROP COLUMN "name";
   ```
*(Result: Zero downtime, zero lock contention, zero data loss, fully auditable).*

### Rule 4: DDL Concurrency & Lock Outage Prevention (PostgreSQL)

**The Failure Mode:** Any `ALTER TABLE` or standard `CREATE INDEX` in PostgreSQL acquires an `ACCESS EXCLUSIVE` or `SHARE` lock on the target table. While waiting for long-running read queries to finish, the migration blocks behind them, and **all subsequent read/write queries queue behind the migration**. Within seconds, database connection pools (PgBouncer, Prisma) are exhausted and the entire application goes down.

**Mandatory Safeguards for All Production Migrations:**

1. **Always Set Lock Timeouts First:**
   Prepend every migration script or migration runner session with a strict lock timeout. If the lock cannot be acquired within 2 seconds, fail immediately rather than queuing traffic:
   ```sql
   -- Top of migration file:
   SET lock_timeout = '2s';
   SET statement_timeout = '30s';
   ```

2. **Always Create Indexes Concurrently:**
   Standard `CREATE INDEX` locks table writes for the entire duration of the index build. Always use `CONCURRENTLY` (which runs outside a transaction block):
   ```sql
   -- Run outside transaction (in Prisma: use custom migration or execute raw SQL outside transaction)
   CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_appointments_patient_id" 
   ON "appointments"("patient_id");
   ```

3. **Index Before Foreign Key (Large Tables):**
   Adding a Foreign Key constraint checks existing rows and acquires a lock. Always create the index concurrently first, then add the constraint:
   ```sql
   -- Step 1: Add index concurrently without locking writes
   CREATE INDEX CONCURRENTLY IF NOT EXISTS "Post_authorId_idx" ON "Post"("authorId");

   -- Step 2: Add FK constraint using the existing index (fast validation)
   SET lock_timeout = '2s';
   ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" 
     FOREIGN KEY ("authorId") REFERENCES "User"("id");
   ```

4. **Never Add a NOT NULL Column without a Constant Default on Postgres < 11:**
   In modern Postgres (11+), adding a column with a constant default (`DEFAULT 'active' NOT NULL`) is metadata-only and instant. However, using a volatile function (`DEFAULT now()`) or backfilling in the same transaction forces a full table rewrite while holding an exclusive lock. Always add nullable, backfill in batches, then `ALTER COLUMN SET NOT NULL`.

### Rule 5: Background Workers & Long-Running Jobs Schema Sync

In asynchronous worker systems (BullMQ, Celery, Sidekiq, Temporal), background jobs queued *before* a migration can execute *after* a migration runs, or long-running workers may cache outdated schema models in memory:

1. **Expand phase must be backward-compatible with in-flight queue jobs.** If an old job payload lacks a newly required column, inserts will crash. Always make new columns nullable or provide DB-level defaults during expand.
2. **Contract phase requires worker drain or coordinated restart.** Never execute a `DROP COLUMN` or destructive contract step while older worker instances are running. The sequence must be:
   - Deploy code reading new columns.
   - Drain or gracefully restart all background workers so no worker process holds cached references to the old schema.
   - Verify job failure rate in monitoring is 0%.
   - Only then apply the final contract drop migration.

### Rule 6: Transactional Outbox Pattern (Dual-Write Prevention)

**Problem:** An application commits a database transaction (e.g. creating an order, registering an appointment) and then immediately attempts to make an external network call (charging Stripe, sending an SMS/email, publishing to Kafka/RabbitMQ/BullMQ).
- If the network call times out or throws, the database has already committed, resulting in orphaned state.
- If the database commit fails after the external call, the customer is charged or notified for an entity that does not exist.

**Solution:** Write external events to an `outbox_events` table inside the *same* local database transaction:

```sql
-- Outbox table schema
CREATE TABLE outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  retry_count INT NOT NULL DEFAULT 0,
  last_error TEXT
);
CREATE INDEX idx_outbox_unprocessed ON outbox_events (created_at) WHERE processed_at IS NULL;
```

**Atomic Transaction:**
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Mutate application entity
  const booking = await tx.booking.create({ data: bookingData });
  
  // 2. Persist side-effect to outbox (guaranteed atomic with booking)
  await tx.outboxEvent.create({
    data: {
      aggregateType: 'Booking',
      aggregateId: booking.id,
      eventType: 'BookingConfirmed',
      payload: { bookingId: booking.id, patientId: booking.patientId, email: booking.patientEmail },
    }
  });
});
```

**Relay Worker:**
A separate worker or cron process reads unprocessed outbox rows, sends the external notification with an idempotency key (`idempotency_key = outbox_event.id`), and marks `processed_at = NOW()`. If the worker crashes, it safely retries without data loss.

---

## Backup & Restore

### Automated Backup (PostgreSQL)

**Daily backup procedure (run as cron task or container job):**

```bash
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
3. [ ] **Replay GDPR/CCPA erasure tombstones** (MANDATORY if handling personal data — see `references/security/COMPLIANCE_AUTOMATION_GUIDE.md` § Erasure Tombstone Replay Pattern). Run the post-restore erasure tombstone replay query to purge resurrected records before certifying restore.
4. [ ] Run smoke tests (check row counts, critical records exist)
5. [ ] Time the restore (document in runbook)
6. [ ] Verify data integrity (no corruption, no resurrected erased users)
7. [ ] Document any issues found
8. [ ] Update restore runbook with learnings

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
| **Audit logs** | 1 year (general) / 6 years (HIPAA ePHI per 45 CFR § 164.316(b)(2)) | Archive to immutable cold storage (S3 Object Lock), never purge HIPAA audit trails |
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

**Mapping in Phase 3 (Architecture) & Phase 5 (DevOps):**

```markdown
### Q18 & Q50a/c — Database & Backup Strategy

> "What database are you using, and what's the migration and backup strategy?"

Options:
- PostgreSQL / MySQL / MongoDB / SQLite / Supabase / Planetscale

Sub-questions:
- Q50a: Migration tool? (Prisma Migrate / Flyway / Liquibase / Django Migrations)
- Q50c: Backup frequency? (Daily / Hourly / Continuous PITR)
- Q50c-i: Backup storage? (Local / S3 / Cross-region)
- Q50c-ii: Last restore drill? (Never / > 6 months ago / < 3 months ago)

**Output files:**
- `docs/dev-docs/DATABASE.md` (connection, migrations, backup runbook)
- `docs/operations/BACKUP-RESTORE.md` (automated backup procedures)
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
