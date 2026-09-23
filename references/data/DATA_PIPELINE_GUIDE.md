# Data Pipeline & Quality Engineering Guide

**Purpose:** Standardize data pipeline architecture, analytical schema evolution, automated data quality gates, and privacy handling for data-heavy projects.

**When to use:** Any project where data ingestion, transformation, ETL/ELT, analytics, or batch processing is in scope.

---

## 1. OLTP vs. OLAP Architecture Boundaries

Do not treat analytical workloads like application transactional databases.

| Dimension | OLTP (Application DB) | OLAP (Analytical Data Store) |
|---|---|---|
| **Primary Engines** | PostgreSQL, MySQL, SQLite | ClickHouse, DuckDB, Snowflake, BigQuery |
| **Storage Format** | Row-oriented | Columnar (Parquet, ORC, native columnar) |
| **Query Pattern** | High concurrency, single-record lookup/update | Low concurrency, large aggregate scans over billions of rows |
| **Schema Design** | Normalized (3NF) with Foreign Key constraints | Dimensional (Star Schema, Fact/Dimension tables) or Wide Flattened Tables |
| **Migrations** | Strict DDL transactions (`ALTER TABLE`) | Schema evolution via partition re-creation or additive Parquet metadata |

---

## 2. Idempotent Ingestion & Pipeline Patterns

Every pipeline step must be safe to re-run multiple times without producing duplicate data or corrupting state.

### Rule 1: Partition Overwrites over Incremental Appends
When processing batch dates (e.g. daily ingestion):
```sql
-- ❌ BAD: Blind insert duplicates records on retry
INSERT INTO daily_metrics SELECT * FROM staging_events;

-- ✅ GOOD: Atomic partition overwrite (idempotent)
INSERT OVERWRITE TABLE daily_metrics PARTITION (date = '2026-09-22')
SELECT * FROM staging_events WHERE date = '2026-09-22';
```

### Rule 2: Natural Keys & Deduplication
Always define a deterministic business composite key (`hash(tenant_id, entity_id, updated_at)`) for deduplication at the staging layer.

---

## 3. Automated Data Quality Gates (Shift-Left Data QA)

Just as application code requires unit tests before merge, data models require automated quality assertions before downstream consumption.

### Tooling Matrix:
- **dbt test:** Native tests (`unique`, `not_null`, `relationships`, `accepted_values`)
- **Great Expectations / Soda Core:** Complex distributional and anomaly assertions

### Mandatory Pre-Merge Data Quality Checklist:
Every pull request altering a transformation model must assert:
1. **Uniqueness:** Primary entity keys have 0 duplicates.
2. **Nullability:** Critical business columns (e.g. `amount`, `user_id`, `created_at`) have 0 null values.
3. **Referential Integrity:** Dimension foreign keys resolve to valid records in dimension tables.
4. **Range / Value Bounds:** Numeric figures fall within valid physics/business bounds (e.g. `latency_ms >= 0`, `discount_rate BETWEEN 0 AND 1`).

Example `schema.yml` for dbt:
```yaml
version: 2
models:
  - name: fct_appointments
    description: "Sanitized clinical appointment fact table"
    columns:
      - name: appointment_id
        tests:
          - unique
          - not_null
      - name: patient_id_hash
        tests:
          - not_null
          - relationships:
              to: ref('dim_patients')
              field: patient_id_hash
      - name: status
        tests:
          - accepted_values:
              values: ['scheduled', 'completed', 'cancelled', 'no_show']
```

---

## 4. PII & Sensitive Data Handling in the Analytics Layer

Analytical data stores are frequently accessed by business intelligence tools, data scientists, and analysts. Raw PII must NEVER land unmasked in data warehouses.

1. **Pseudonymization at Ingestion Boundary:**
   Replace direct identifiers (SSN, national ID, real name, email) with irreversible HMAC-SHA256 tokens using a secret key held in a secure vault:
   ```python
   import hashlib, hmac

   def anonymize_identifier(raw_id: str, salt: str) -> str:
       return hmac.new(salt.encode(), raw_id.encode(), hashlib.sha256).hexdigest()
   ```
2. **Column-Level Access Control (RBAC):**
   Ensure BI roles cannot query semi-identifiable columns (IP address, full user agent, postal code).
3. **Data Retention in Analytics:**
   Enforce automated lifecycle policies (e.g. S3 Glacier transition after 90 days; permanent deletion of raw staging buckets after 30 days).
