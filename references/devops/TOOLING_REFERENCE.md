# Tooling Reference — Concrete Tool Recommendations

**Purpose:** Map every "check X" instruction in the skill to specific, runnable tools. No more "check N+1 queries" without naming the tool.

---

## Performance Profiling

### Database Query Analysis

| Stack | Tool | Command | What it shows |
|-------|------|---------|---------------|
| **PostgreSQL** | pgAdmin EXPLAIN | `EXPLAIN ANALYZE SELECT ...` | Execution plan, seq scans, index usage |
| **PostgreSQL** | pg_stat_statements | `SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC;` | Slowest queries across DB |
| **MySQL** | EXPLAIN | `EXPLAIN SELECT ...` | Query plan, type, rows scanned |
| **Prisma** | Prisma Studio | `npx prisma studio` | Visual query builder + explain |
| **Prisma** | Debug logs | `DEBUG="prisma:query" npm run dev` | Generated SQL queries in console |
| **Drizzle** | Debug mode | `drizzle.query.users.findMany({ ... }, { debug: true })` | SQL output |
| **TypeORM** | Logging | `logging: ["query", "error"]` in config | All queries logged |

**N+1 Detection:**
- **Node.js:** `npm install --save-dev @shopify/hydrogen-logger` → wraps DB client, counts queries per request
- **Rails:** Bullet gem → alerts in dev console when N+1 detected
- **Django:** django-debug-toolbar → shows query count per view

### Frontend Performance

| Tool | Install | Use Case |
|------|---------|----------|
| **Lighthouse CI** | `npm install -g @lhci/cli` | Automated performance budget enforcement in CI |
| **Chrome DevTools** | Built-in | Performance tab → record, find long tasks (>50ms) |
| **React DevTools Profiler** | Browser extension | Component render time, why re-rendered |
| **Bundle Analyzer** | `npm install --save-dev webpack-bundle-analyzer` | Visualize bundle size, find heavy deps |
| **Calibre** | SaaS (paid) | Continuous performance monitoring |

**Bundle size check (CI):**
```bash
# Install
npm install --save-dev size-limit @size-limit/preset-app

# .size-limit.js
module.exports = [
  {
    path: 'dist/index.js',
    limit: '100 KB'
  }
]

# Run in CI
npx size-limit
```

### Backend Performance

| Language | Tool | Command |
|----------|------|----------|
| **Node.js** | Clinic.js | `clinic doctor -- node app.js` |
| **Node.js** | 0x (flamegraph) | `0x -- node app.js` |
| **Python** | cProfile | `python -m cProfile -o output.pstats app.py` |
| **Python** | py-spy | `py-spy top --pid <PID>` |
| **Go** | pprof | `import _ "net/http/pprof"` → `go tool pprof` |
| **Rust** | cargo-flamegraph | `cargo flamegraph` |

---

## Debugging Tools

### Structured Logging

| Stack | Library | Example |
|-------|---------|----------|
| **Node.js** | Pino | `logger.info({ userId, action: 'checkout', correlationId }, 'User checked out')` |
| **Python** | structlog | `log.info('user.checkout', user_id=123, correlation_id='abc')` |
| **Go** | zap | `logger.Info("checkout", zap.String("user_id", id), zap.String("correlation_id", cid))` |
| **Rust** | tracing | `tracing::info!(user_id = %id, correlation_id = %cid, "checkout")` |

**Correlation ID pattern (trace request across services):**

```typescript
// Middleware: inject correlation ID
export function correlationMiddleware(req, res, next) {
  req.correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  res.setHeader('x-correlation-id', req.correlationId);
  next();
}

// Logger: include in every log
logger.info({ correlationId: req.correlationId, userId, action }, 'Message');

// Forward to downstream service
fetch('/api/payment', {
  headers: { 'x-correlation-id': req.correlationId }
});
```

### Distributed Tracing

| Tool | Use Case | Integration |
|------|----------|-------------|
| **Jaeger** | Open-source distributed tracing | OpenTelemetry SDK |
| **Zipkin** | Open-source tracing | Zipkin client libraries |
| **Datadog APM** | Commercial (free tier 5GB/mo) | `dd-trace` npm package |
| **Sentry Performance** | Commercial (free tier 10K events/mo) | `@sentry/node`, `@sentry/react` |
| **OpenTelemetry** | Vendor-neutral standard | `@opentelemetry/api`, `@opentelemetry/sdk-node` |

**OpenTelemetry setup (Node.js):**

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({ endpoint: 'http://localhost:14268/api/traces' }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

Now every HTTP request, DB query, Redis call auto-traced.

---

## Design QA Tools

### Accessibility

| Tool | Type | Use Case |
|------|------|----------|
| **axe DevTools** | Browser extension (free) | WCAG audit, highlights issues in DOM |
| **Lighthouse** | Built into Chrome DevTools | Accessibility score 0-100 |
| **WAVE** | Browser extension (free) | Visual feedback on page |
| **Stark** | Figma plugin + browser extension (free tier) | Contrast checker, colorblind simulator |
| **Pa11y** | CLI / CI | `npx pa11y https://localhost:3000` |

**Automated a11y check in CI:**

```yaml
# .github/workflows/a11y.yml
name: Accessibility
on: pull_request

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npm start & # Start dev server
      - run: npx wait-on http://localhost:3000
      - run: npx pa11y-ci --threshold 10 # Max 10 errors
```

### Contrast Checking

| Tool | Platform | Command |
|------|----------|----------|
| **Stark** | Figma, browser | Visual picker |
| **Chrome DevTools** | Built-in | Inspect element → color picker shows contrast ratio |
| **Contrast Checker** | Web app | https://webaim.org/resources/contrastchecker/ |
| **colorable** | CLI | `npx colorable --foreground "#333" --background "#fff"` |

---

## Security Scanning

### SAST (Static Application Security Testing)

| Language | Tool | Command |
|----------|------|----------|
| **JavaScript/TypeScript** | ESLint security plugin | `npm install --save-dev eslint-plugin-security` → `.eslintrc: { plugins: ['security'] }` |
| **JavaScript/TypeScript** | Semgrep | `npx semgrep --config=auto .` |
| **Python** | Bandit | `pip install bandit` → `bandit -r src/` |
| **Go** | Gosec | `go install github.com/securego/gosec/v2/cmd/gosec@latest` → `gosec ./...` |
| **Rust** | Cargo audit | `cargo install cargo-audit` → `cargo audit` |
| **PHP** | Psalm taint analysis | `vendor/bin/psalm --taint-analysis` |
| **Java** | SpotBugs | `mvn spotbugs:check` |
| **Multi-language** | Snyk Code | `npm install -g snyk` → `snyk code test` |

### Dependency Scanning

| Package Manager | Tool | Command |
|----------------|------|----------|
| **npm** | npm audit | `npm audit --audit-level=high` |
| **npm** | Snyk | `npx snyk test` |
| **pnpm** | pnpm audit | `pnpm audit` |
| **yarn** | yarn audit | `yarn audit` |
| **pip** | pip-audit | `pip install pip-audit` → `pip-audit` |
| **pip** | Safety | `pip install safety` → `safety check` |
| **Cargo** | cargo-audit | `cargo audit` |
| **Go** | govulncheck | `go install golang.org/x/vuln/cmd/govulncheck@latest` → `govulncheck ./...` |
| **Bundler** | bundler-audit | `gem install bundler-audit` → `bundle audit` |

### Secret Scanning

| Tool | Install | Command |
|------|---------|----------|
| **gitleaks** | `brew install gitleaks` | `gitleaks detect --source .` |
| **trufflehog** | `brew install trufflehog` | `trufflehog git file://. --only-verified` |
| **git-secrets** | `brew install git-secrets` | `git secrets --scan` |
| **detect-secrets** | `pip install detect-secrets` | `detect-secrets scan` |

**Pre-commit hook (gitleaks):**

```bash
# .git/hooks/pre-commit
#!/bin/sh
gitleaks protect --verbose --redact --staged
```

### Penetration Testing

| Tool | Type | Use Case |
|------|------|----------|
| **OWASP ZAP** | Free, GUI + CLI | Automated scan + manual proxy |
| **Burp Suite Community** | Free, GUI | Manual proxy, Intruder |
| **Nikto** | CLI | Web server scanner |
| **SQLMap** | CLI | SQL injection scanner |
| **Nuclei** | CLI | Template-based scanner (`nuclei -u https://example.com`) |

**OWASP ZAP baseline scan (CI):**

```bash
docker run -v $(pwd):/zap/wrk/:rw \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t https://localhost:3000 -r report.html
```

---

## Infrastructure as Code

### IaC Tools

| Tool | Provider Support | Language |
|------|------------------|----------|
| **Terraform** | AWS, GCP, Azure, 3000+ providers | HCL |
| **Pulumi** | AWS, GCP, Azure, Kubernetes | TypeScript, Python, Go, C# |
| **AWS CDK** | AWS only | TypeScript, Python, Java, C# |
| **CloudFormation** | AWS only | YAML/JSON |
| **Bicep** | Azure only | Bicep DSL |

**Recommended:** Pulumi (if TypeScript project) or Terraform (if multi-cloud or mature tooling needed).

### IaC Validation

| Tool | Use Case | Command |
|------|----------|----------|
| **tflint** | Terraform linting | `tflint` |
| **checkov** | IaC security scanning (TF, CloudFormation, K8s) | `checkov -d .` |
| **tfsec** | Terraform security checks | `tfsec .` |
| **terrascan** | Multi-IaC security | `terrascan scan -t terraform` |

---

## Observability Stack

### Monitoring (Metrics)

| Tool | Type | Best For |
|------|------|----------|
| **Prometheus** | Open-source, pull-based | Kubernetes, self-hosted |
| **Grafana Cloud** | Commercial (free tier 10K series) | Hosted Prometheus |
| **Datadog** | Commercial (free tier 5 hosts) | Full-stack observability |
| **New Relic** | Commercial (free tier 100GB/mo) | APM + infrastructure |
| **CloudWatch** | AWS native | AWS-only infrastructure |

**Prometheus + Grafana setup (Docker Compose):**

```yaml
# docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    ports: ["9090:9090"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports: ["3001:3000"]
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'app'
    static_configs:
      - targets: ['host.docker.internal:3000']
```

**Instrument your app (Node.js):**

```typescript
import { register, Counter, Histogram } from 'prom-client';

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Logging

| Tool | Type | Best For |
|------|------|----------|
| **Loki** | Open-source | Grafana ecosystem |
| **Elasticsearch + Kibana** | Open-source | Large scale, full-text search |
| **Datadog Logs** | Commercial | Integrated with metrics |
| **CloudWatch Logs** | AWS native | AWS infrastructure |
| **Papertrail** | Commercial (free tier 50MB/mo) | Simple log aggregation |

### Error Tracking

| Tool | Free Tier | Best For |
|------|-----------|----------|
| **Sentry** | 5K events/mo | Frontend + backend errors |
| **Rollbar** | 5K events/mo | Backend errors |
| **Bugsnag** | 7.5K events/mo | Mobile + web |
| **Raygun** | 14-day trial | Real user monitoring |

**Sentry setup (Next.js):**

```bash
npx @sentry/wizard@latest -i nextjs
```

Auto-configures error tracking for both client and server.

---

## Database Tools

### Schema Migration

| ORM/Tool | Migration Command | Rollback |
|----------|-------------------|----------|
| **Prisma** | `npx prisma migrate dev` | `npx prisma migrate reset` (dev only) |
| **Drizzle** | `drizzle-kit generate:pg` → `drizzle-kit push:pg` | Manual (write down migration) |
| **TypeORM** | `typeorm migration:run` | `typeorm migration:revert` |
| **Flyway** | `flyway migrate` | `flyway undo` (Teams edition) |
| **Liquibase** | `liquibase update` | `liquibase rollback` |

### Backup + Restore

| Database | Backup | Restore |
|----------|--------|----------|
| **PostgreSQL** | `pg_dump mydb > backup.sql` | `psql mydb < backup.sql` |
| **MySQL** | `mysqldump mydb > backup.sql` | `mysql mydb < backup.sql` |
| **SQLite** | `.backup backup.db` (in sqlite3 CLI) | `cp backup.db production.db` |
| **MongoDB** | `mongodump --db mydb` | `mongorestore --db mydb dump/mydb` |

**Automated backup (cron):**

```bash
# /etc/cron.daily/backup-db
#!/bin/bash
pg_dump mydb | gzip > /backups/mydb-$(date +\%Y\%m\%d).sql.gz
# Keep only last 7 days
find /backups -name "mydb-*.sql.gz" -mtime +7 -delete
```

**Restore drill (test quarterly):**

1. Restore backup to staging DB
2. Run smoke tests
3. Check data integrity (row counts, critical records exist)
4. Time the restore (document in runbook)

---

## Test Data Management

### Synthetic Data Generation

| Tool | Use Case | Example |
|------|----------|----------|
| **Faker.js** | Realistic fake data | `faker.person.fullName()`, `faker.internet.email()` |
| **Chance.js** | Lightweight alternative | `chance.name()`, `chance.email()` |
| **Mockaroo** | Web UI, CSV/JSON export | https://mockaroo.com |
| **Synth** | CLI, schema-based | `synth generate users --size 1000` |

**Seed script (Prisma):**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  const users = Array.from({ length: 100 }, () => ({
    email: faker.internet.email(),
    name: faker.person.fullName(),
  }));
  
  await prisma.user.createMany({ data: users });
}

main();
```

```bash
# Run seed
npx prisma db seed
```

### Data Anonymization (production → staging)

| Tool | Use Case |
|------|----------|
| **pg_dump with --exclude-table** | Skip sensitive tables |
| **PostgreSQL Anonymizer** | `anon` extension, mask columns |
| **MySQL Enterprise Masking** | Built-in masking functions |

**Manual anonymization script:**

```sql
-- Copy production to staging, then run:
UPDATE users SET
  email = CONCAT('user', id, '@example.com'),
  phone = NULL,
  address = 'REDACTED';
```

---

## Recommended CI/CD Pipeline (Medium+ Project)

```yaml
# .github/workflows/ci.yml
name: CI/CD
on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test -- --coverage
      - name: Check coverage
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% < 80%"
            exit 1
          fi
  
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm audit --audit-level=high
      - run: npx snyk test --severity-threshold=high
      - run: npx gitleaks detect --source .
  
  build:
    runs-on: ubuntu-latest
    needs: [lint, test, security]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
  
  deploy-staging:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: build }
      - run: # Deploy to staging (Vercel/Netlify/AWS)
  
  e2e:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright test --grep @smoke
  
  deploy-production:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: e2e
    runs-on: ubuntu-latest
    environment: production # Requires approval in GitHub
    steps:
      - uses: actions/download-artifact@v4
      - run: # Deploy to production
```

---

**Integration with existing gates:**

Update tool references in:
- `references/security/SECURITY_GATE_GUIDE.md` → link to Security Scanning section
- `references/qa/CODE_REVIEW_CHECKLIST.md` → link to Performance Profiling + Debugging
- `references/frontend/DESIGN_VALIDATION_GUIDE.md` → link to Design QA Tools
- `modules/03b-build-loop.md` → link to Debugging Tools (structured logging)

**Agent instruction:**

When a guide says "check X" or "scan for Y", consult this file first for the concrete tool and command. Never say "check for N+1 queries" without running the tool from the table above.
