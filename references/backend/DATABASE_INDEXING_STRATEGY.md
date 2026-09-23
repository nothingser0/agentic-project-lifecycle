# Database Indexing Strategy — Before Production

**Purpose:** Prevent slow queries in production.

**Applies to:** All tiers with database. Mandatory Medium+.

---

## Index Rules

### Rule 1: Index All Foreign Keys

**Why:** JOIN queries are slow without indexes.

**Example:**

```sql
-- Table: employees
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL,
  manager_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ❌ Bad: No indexes on FK
SELECT * FROM employees e
JOIN departments d ON e.department_id = d.id;
-- Result: Full table scan on employees (slow)

-- ✅ Good: Index FK
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);

SELECT * FROM employees e
JOIN departments d ON e.department_id = d.id;
-- Result: Index scan (fast)
```

**Enforcement:**

Before production deploy, run:

```sql
-- Find FK columns without indexes (Postgres)
SELECT
  t.table_name,
  kcu.column_name
FROM information_schema.table_constraints t
JOIN information_schema.key_column_usage kcu
  ON t.constraint_name = kcu.constraint_name
WHERE t.constraint_type = 'FOREIGN KEY'
AND NOT EXISTS (
  SELECT 1 FROM pg_indexes
  WHERE tablename = t.table_name
  AND indexdef LIKE '%' || kcu.column_name || '%'
);
```

If any rows returned → **add indexes before deploy**.

---

### Rule 2: Index WHERE Clause Columns

**Why:** Filtering without indexes scans entire table.

**Example:**

```sql
-- Query
SELECT * FROM employees WHERE status = 'active';

-- ❌ Bad: No index on status
EXPLAIN SELECT * FROM employees WHERE status = 'active';
-- Seq Scan on employees  (cost=0.00..1234.00 rows=5000)

-- ✅ Good: Index on status
CREATE INDEX idx_employees_status ON employees(status);

EXPLAIN SELECT * FROM employees WHERE status = 'active';
-- Index Scan using idx_employees_status  (cost=0.00..45.00 rows=5000)
```

**When to index:**
- Column used in WHERE clause frequently
- Column has low cardinality (few distinct values) BUT queries filter to small subset
- Column used in JOIN ON condition

**When NOT to index:**
- Column has very high cardinality (e.g., `uuid`, `email`) BUT always queried by single value → still index
- Column changes frequently (e.g., `updated_at`) → index cost > benefit
- Small table (< 1000 rows) → index overhead > scan cost

---

### Rule 3: Index ORDER BY Columns

**Why:** Sorting without indexes requires full table scan + sort.

**Example:**

```sql
-- Query
SELECT * FROM employees ORDER BY created_at DESC LIMIT 10;

-- ❌ Bad: No index
EXPLAIN SELECT * FROM employees ORDER BY created_at DESC LIMIT 10;
-- Seq Scan + Sort  (cost=1234.00..1456.00)

-- ✅ Good: Index on created_at
CREATE INDEX idx_employees_created_at ON employees(created_at DESC);

EXPLAIN SELECT * FROM employees ORDER BY created_at DESC LIMIT 10;
-- Index Scan using idx_employees_created_at  (cost=0.00..12.00)
```

**Direction matters:** `ORDER BY created_at DESC` → index with `DESC`.

---

### Rule 4: Composite Indexes for Multi-Column Queries

**Why:** Single-column indexes don't help multi-column WHERE.

**Example:**

```sql
-- Query
SELECT * FROM employees
WHERE department_id = 5 AND status = 'active'
ORDER BY created_at DESC;

-- ❌ Bad: Separate indexes
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(status);
-- Postgres uses only ONE index, scans the other

-- ✅ Good: Composite index
CREATE INDEX idx_employees_dept_status_created 
  ON employees(department_id, status, created_at DESC);
-- All conditions covered by one index
```

**Index column order:** Most selective first, then ORDER BY columns.

**Rule of thumb:**
- Equality conditions first (`department_id = 5`)
- Range conditions next (`created_at > '2026-01-01'`)
- ORDER BY columns last

---

## Index Strategy by Tier

### Small (< 1K rows per table)

**Minimal indexing:**
- Primary keys (automatic)
- Foreign keys (manual)

Skip other indexes until performance issue appears.

---

### Medium (1K-100K rows per table)

**Required before production:**
- All foreign keys indexed
- Columns in WHERE clauses indexed (top 5 queries)
- Columns in ORDER BY indexed (top 3 sorts)

**Audit:**

```bash
# Find slow queries in logs
grep "duration:" production.log | awk '{if ($2 > 1000) print}'

# Or use Supabase Dashboard → Logs → Slow Queries
```

If query > 1s → add index.

---

### Large (100K+ rows per table)

**Required:**
- Medium + composite indexes for common multi-column queries
- Partial indexes for filtered queries
- Covering indexes for heavy read queries

**Example partial index:**

```sql
-- Only index active employees (not all)
CREATE INDEX idx_employees_active_created 
  ON employees(created_at DESC) 
  WHERE status = 'active';

-- Query
SELECT * FROM employees 
WHERE status = 'active' 
ORDER BY created_at DESC;
-- Uses partial index (smaller, faster)
```

**Example covering index:**

```sql
-- Query
SELECT id, name, email FROM employees WHERE department_id = 5;

-- Covering index (includes all columns in SELECT)
CREATE INDEX idx_employees_dept_covering 
  ON employees(department_id) 
  INCLUDE (id, name, email);
-- Postgres doesn't need to access table (index-only scan)
```

---

## Performance Analysis

### Step 1: Identify Slow Queries

**Postgres slow query log:**

```sql
-- Enable slow query logging (>500ms)
ALTER DATABASE mydb SET log_min_duration_statement = 500;

-- Check logs
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Supabase Dashboard:**

Database → Logs → Filter by "slow query" → Sort by duration

---

### Step 2: EXPLAIN Query

```sql
EXPLAIN ANALYZE
SELECT * FROM employees
WHERE department_id = 5
ORDER BY created_at DESC
LIMIT 10;
```

**Look for:**
- `Seq Scan` → full table scan (bad)
- `Index Scan` → using index (good)
- `cost=0.00..1234.00` → high cost = slow
- `rows=50000` → scanning too many rows

---

### Step 3: Add Index

```sql
CREATE INDEX idx_employees_dept_created 
  ON employees(department_id, created_at DESC);
```

---

### Step 4: Verify

```sql
EXPLAIN ANALYZE
SELECT * FROM employees
WHERE department_id = 5
ORDER BY created_at DESC
LIMIT 10;

-- Before: Seq Scan (cost=1234.00)
-- After: Index Scan using idx_employees_dept_created (cost=12.00)
```

If cost reduced 10x → index working.

---

## Common N+1 Query Issues

**Detection (name the tool — don't just say "watch for N+1 queries"):**

- **Prisma:** set `log: ['query']` in the `PrismaClient` constructor, or use `prisma-query-log` in dev; a query count spike proportional to result-set size is the signature. In CI, assert on it with `@prisma/instrumentation` + OpenTelemetry span count, or a lighter approach: wrap the test DB client to fail the test if query count for a single request exceeds a fixed ceiling (e.g. `expect(queryCount).toBeLessThan(5)`).
- **Drizzle / raw SQL (Postgres):** enable `pg_stat_statements` and query it for `calls` grouped by normalized query text; a query with `calls` scaling linearly with a request's result size is an N+1. `EXPLAIN ANALYZE` on the single query form (with JOIN) vs. the naive loop form confirms the fix.
- **Django:** `django-debug-toolbar`'s SQL panel in dev; `django.test.utils.CaptureQueriesContext` or `assertNumQueries()` in tests to enforce a query-count ceiling in CI, the same way a coverage threshold is enforced (see `references/qa/TESTING_STRATEGY_DETAIL.md`).
- **Any stack, production:** APM query-count-per-request panels (Sentry Performance, Datadog APM, New Relic) — alert when a single request's DB query count exceeds a threshold (e.g. >20), since that's the runtime signature of an N+1 that slipped past dev/CI checks.

**Problem:** Loop executes 1 query per iteration.

**Example (bad):**

```typescript
// ❌ N+1 query
const employees = await db.query('SELECT * FROM employees');
for (const emp of employees) {
  const dept = await db.query('SELECT * FROM departments WHERE id = $1', [emp.department_id]);
  console.log(`${emp.name} works in ${dept.name}`);
}
// 1 query for employees + N queries for departments = N+1
```

**Fix 1: JOIN**

```typescript
// ✅ Single query with JOIN
const employees = await db.query(`
  SELECT e.name, d.name as department_name
  FROM employees e
  JOIN departments d ON e.department_id = d.id
`);
for (const emp of employees) {
  console.log(`${emp.name} works in ${emp.department_name}`);
}
// 1 query total
```

**Fix 2: Eager Loading (ORM)**

```typescript
// Prisma
const employees = await prisma.employee.findMany({
  include: { department: true }
});

// Drizzle
const employees = await db.query.employees.findMany({
  with: { department: true }
});
```

---

## Index Maintenance

### Monitor Index Usage

```sql
-- Find unused indexes (Postgres)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE '%_pkey'  -- exclude primary keys
ORDER BY tablename;
```

If `index_scans = 0` after 1 month → **drop index** (wasted space).

---

### Monitor Index Size

```sql
-- Index size (Postgres)
SELECT
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

If index > table size → re-evaluate (too many indexes).

---

### Reindex (Large+ only)

**When:** Index becomes bloated (frequent updates/deletes).

```sql
-- Rebuild index
REINDEX INDEX idx_employees_created_at;

-- Or entire table
REINDEX TABLE employees;
```

**Schedule:** Quarterly for Large+, only if performance degrades.

---

## Pre-Deploy Checklist

**Before first production deploy (Medium+):**

- [ ] All foreign key columns indexed
- [ ] Top 5 WHERE clause columns indexed
- [ ] Top 3 ORDER BY columns indexed
- [ ] Ran EXPLAIN ANALYZE on critical queries
- [ ] No `Seq Scan` on tables > 1K rows
- [ ] Tested with realistic data volume (seed 10K+ rows)
- [ ] Slow query log enabled (>500ms)
- [ ] Database monitoring dashboard setup (Supabase/Vercel Postgres)

---

**Agent Instruction:**

Before production deploy:
1. List all foreign keys: `SELECT * FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY'`
2. For each FK, verify index exists
3. List top 5 queries (from codebase: `grep -r "WHERE" src/`)
4. For each WHERE column, add index
5. Run EXPLAIN ANALYZE on all queries
6. If `Seq Scan` on table > 1K rows → add index
7. Test with 10K+ seed data
8. Deploy

Do not deploy without indexes. Production will be slow.

---

**Last Updated:** 2026-09-22  
**Version:** 1.0.0
