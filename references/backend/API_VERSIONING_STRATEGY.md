# API Versioning Strategy Guide

**Purpose:** Standardize API versioning, evolution, deprecation, and sunset policies across REST, GraphQL, and gRPC architectures.

**Applies to:** Medium+ projects with APIs consumed by web clients, mobile apps, or third-party integrations.

---

## 1. Versioning Approaches by Architecture

| Architecture | Recommended Strategy | Format Example | Why |
|---|---|---|---|
| **REST (Public / Mobile)** | **URI Path Versioning** | `/api/v1/employees` | Explicit, easily cached by CDNs, transparent in access logs, zero client confusion. |
| **REST (Internal / B2B SaaS)** | **Header Versioning** | `X-API-Version: 2026-09-01` or `Accept: application/vnd.app.v1+json` | Keeps URLs clean, supports point-in-time date-based versioning (Stripe model). |
| **GraphQL** | **Schema Evolution** | `@deprecated(reason: "Use statusV2")` | Continuous evolution; deprecate fields without bumping global schema versions. |
| **gRPC / Protobuf** | **Package Namespacing** | `package billing.v1;` | Enforces protobuf backwards compatibility and multi-version co-existence. |

*Default rule for projects in this skill:* **Use URI Path Versioning (`/api/v1/...`) for REST** unless customer enterprise contracts require header-based date versioning.

---

## 2. Breaking vs. Non-Breaking Changes

### Non-Breaking Changes (No Version Bump Required)
These changes must be handled gracefully by clients and do **not** require a new version:
- Adding a new optional request field or query parameter.
- Adding a new response field. (Clients MUST ignore unknown fields).
- Adding a new endpoint (e.g. `POST /api/v1/employees/bulk-export`).
- Adding a new optional HTTP header.
- Performance optimizations and internal bug fixes.

### Breaking Changes (Major Version Bump Mandatory)
These changes require incrementing the API version (`v1` → `v2`):
- Removing or renaming an existing endpoint.
- Removing or renaming an existing request or response field.
- Changing the data type of an existing field (e.g. integer `id` to UUID string).
- Changing validation rules to make previously optional fields required.
- Altering HTTP status codes for expected responses (e.g. changing 200 OK to 201 Created or 202 Accepted).
- Changing authentication or authorization requirements on existing routes.

---

## 3. Deprecation & Sunset Workflow (RFC 8594)

Never abruptly turn off an older API version. Follow the standard RFC 8594 lifecycle:

### Deprecation Timelines
- **Public APIs & Mobile-backed APIs:** Minimum **6 months** notice before sunset. (Mobile users lag in updating apps).
- **Internal Microservices:** Minimum **3 months** notice before sunset.

### HTTP Response Headers for Deprecated Versions
When a client hits a deprecated endpoint, the server MUST return standard deprecation headers:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Deprecation: @1794441600
Sunset: Wed, 11 Nov 2026 00:00:00 GMT
Link: <https://docs.example.com/api/v2-migration>; rel="sunset"; type="text/html"
```

- `Deprecation`: RFC 8594 date or timestamp when deprecation occurred.
- `Sunset`: The exact future date and time when the endpoint will return `410 Gone`.
- `Link`: URI to the migration documentation.

---

## 4. Implementation Examples

### Next.js App Router
Structure versioned endpoints cleanly in directory hierarchies:

```
app/
└── api/
    ├── v1/
    │   └── employees/
    │       └── route.ts      # Legacy v1 logic with Sunset headers
    └── v2/
        └── employees/
            └── route.ts      # Active modern v2 logic
```

**Deprecated route handler (`app/api/v1/employees/route.ts`):**

```typescript
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const data = await getEmployeesV1();

  const response = NextResponse.json(data);
  // Add deprecation and sunset headers (RFC 8594)
  response.headers.set('Deprecation', 'true');
  response.headers.set('Sunset', 'Wed, 31 Dec 2026 23:59:59 GMT');
  response.headers.set(
    'Link',
    '<https://api.example.com/docs/migrations/v2>; rel="sunset"'
  );

  return response;
}
```

### Express.js Middleware for Version Deprecation

```typescript
import { Request, Response, NextFunction } from 'express';

export function deprecationNotice(sunsetDate: string, docUrl: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Deprecation', 'true');
    res.setHeader('Sunset', sunsetDate);
    res.setHeader('Link', `<${docUrl}>; rel="sunset"`);
    next();
  };
}

// Usage in router
app.use('/api/v1', deprecationNotice('Wed, 31 Dec 2026 23:59:59 GMT', 'https://api.example.com/docs/v2'));
```

---

## 5. Monitoring Deprecated API Usage

Before decommissioning an older API version:
1. Instrument metrics in Prometheus or Datadog:
   ```typescript
   apiRequestsTotal.labels({ version: 'v1', route: '/api/v1/employees' }).inc();
   ```
2. Identify top client IP addresses, API keys, or User-Agents still accessing `v1`.
3. Send targeted notifications to lingering consumers 60 days, 30 days, and 7 days prior to the Sunset date.
4. Execute a "brownout" drill (return `503 Service Unavailable` for 15 minutes during non-peak hours) 2 weeks before permanent sunset to uncover unmonitored critical dependencies.
