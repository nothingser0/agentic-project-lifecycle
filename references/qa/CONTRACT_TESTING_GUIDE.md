# Contract Testing Guide — Consumer-Driven API Reliability

**Purpose:** Prevent API-breaking changes from reaching production by validating agreements between API providers and consumers (web frontend, mobile apps, microservices).

**When to use:** Mandatory for Large+ projects; recommended for Medium projects with separate frontend/backend teams or mobile apps.

---

## 1. Why Contract Testing?

Traditional testing gaps that contract testing solves:
- **Unit tests:** Mock the API response — if the real API changes, unit tests still pass (false sense of security).
- **E2E tests:** Test against live environments — slow, brittle, hard to debug, and catch breakages late in the cycle.
- **Contract testing:** Captures the exact request/response expectations in a machine-readable contract (Pact or OpenAPI) and verifies both sides independently in CI.

```
+-------------------+                      +-------------------+
|   API Consumer    |                      |   API Provider    |
| (Frontend/Mobile) |                      |     (Backend)     |
+---------+---------+                      +---------+---------+
          |                                          |
          | 1. Generate contract                     | 2. Verify contract
          v                                          v
+--------------------------------------------------------------+
|                     Pact Contract JSON                       |
|               (or OpenAPI 3.1 Specification)                 |
+--------------------------------------------------------------+
```

---

## 2. Tooling Selection

| API Protocol | Primary Tool | CI/CD Integration |
|---|---|---|
| **REST APIs (Microservices / Teams)** | **Pact** (`@pact-foundation/pact`) | Pact Broker / GitHub Actions |
| **REST APIs (Schema-first)** | **Prism** (mocking) + **Spectral** (linting) | GitHub Actions OpenAPI check |
| **GraphQL** | **GraphQL Inspector** | PR action (fails on breaking schema change) |
| **gRPC / Protocol Buffers** | **Buf** (`buf breaking`) | Buf schema registry / CI check |

---

## 3. Pact Consumer-Driven Contract Example (TypeScript)

### Step 1: Consumer Defines Expectations (`__tests__/contract/consumer.test.ts`)

```typescript
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';

const provider = new PactV3({
  consumer: 'HRIS-Frontend',
  provider: 'HRIS-Backend',
  dir: path.resolve(process.cwd(), 'pacts'),
});

describe('Employees API Contract', () => {
  it('returns an employee by ID with correct schema', async () => {
    await provider
      .uponReceiving('a request for employee 101')
      .withRequest({
        method: 'GET',
        path: '/api/v1/employees/101',
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: MatchersV3.integer(101),
          name: MatchersV3.string('Jane Doe'),
          email: MatchersV3.email('jane@example.com'),
          status: MatchersV3.regex(/^(active|inactive|on_leave)$/, 'active'),
        },
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(`${mockServer.url}/api/v1/employees/101`, {
          headers: { Accept: 'application/json' },
        });
        const data = await res.json();
        expect(data.id).toBe(101);
        expect(data.name).toBe('Jane Doe');
      });
  });
});
```

Running this test generates `pacts/HRIS-Frontend-HRIS-Backend.json`.

---

### Step 2: Provider Verifies Against Contract (`__tests__/contract/provider.test.ts`)

In the backend repository CI pipeline:

```typescript
import { Verifier } from '@pact-foundation/pact';
import path from 'path';

describe('Pact Verification', () => {
  it('validates the expectations of HRIS-Frontend', async () => {
    const verifier = new Verifier({
      providerBaseUrl: 'http://localhost:3000',
      pactFilesOrDirs: [path.resolve(process.cwd(), 'pacts/HRIS-Frontend-HRIS-Backend.json')],
    });

    const output = await verifier.verifyProvider();
    expect(output).toBeTruthy();
  });
});
```

---

## 4. GraphQL Schema Breaking Change Detection

For projects utilizing GraphQL, add `graphql-inspector` to CI to block PRs that break consumers:

```bash
npm install -D @graphql-inspector/cli
```

**Add to CI (`.github/workflows/graphql-check.yml`):**

```yaml
- name: Check GraphQL Schema Breaking Changes
  run: npx @graphql-inspector/cli diff git:origin/main:schema.graphql schema.graphql
```

*Blocked breaking changes include:*
- Deleting an existing type or field.
- Changing a field from nullable to non-nullable (or vice-versa).
- Changing an argument type.

---

## 5. Gate Integration (`gate:production-deploy`)

For projects with external or decoupled consumers, the following evidence is mandatory:
- [ ] Consumer contracts generated and verified against the backend staging build.
- [ ] No unapproved breaking changes in OpenAPI or GraphQL schemas.
- [ ] If breaking changes exist, a new version path (`/api/v2`) must be published with RFC 8594 Sunset headers on the legacy version.
