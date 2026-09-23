# API Documentation & Schema Guide

**Purpose:** Standardize automated API specification generation, interactive documentation, and CI schema synchronization across all backend services.

**When to use:** Mandatory for all Medium+ projects exposing REST, GraphQL, or gRPC APIs.

---

## 1. Documentation Tooling Matrix

| Architecture | Specification Standard | Interactive UI Viewer | Generation Tool (Code-First) |
|---|---|---|---|
| **TypeScript / Node.js** | **OpenAPI 3.1** | **Scalar** or **Swagger UI** | `zod-to-openapi` or `tsoa` |
| **Python** | **OpenAPI 3.1** | **Scalar** or **Redoc** | Native FastAPI / Django Ninja |
| **PHP / Laravel** | **OpenAPI 3.1** | **Scramble** or **Scribe** | Native attributes |
| **GraphQL** | **GraphQL Schema (SDL)** | **Apollo Sandbox** / **GraphiQL** | Code-first / Schema-first SDL |
| **gRPC** | **Protobuf (proto3)** | **Buf Studio** | `protoc-gen-doc` |

---

## 2. Generating OpenAPI 3.1 from Zod Schemas (Next.js / Node.js)

Avoid maintaining manual YAML/JSON files that drift out of sync with real code. Generate OpenAPI specs directly from your existing runtime Zod validation schemas.

### Step 1: Install Dependencies

```bash
npm install @asteasolutions/zod-to-openapi swagger-ui-react
npm install -D @types/swagger-ui-react
```

### Step 2: Define Schema Registry (`lib/openapi.ts`)

```typescript
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Register Bearer Auth Security Scheme
registry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// Register Employee Model
export const EmployeeSchema = registry.register(
  'Employee',
  z.object({
    id: z.number().openapi({ example: 101 }),
    name: z.string().min(2).openapi({ example: 'Jane Doe' }),
    email: z.string().email().openapi({ example: 'jane@example.com' }),
    position: z.string().openapi({ example: 'Staff Software Engineer' }),
  })
);

// Register Route Definition
registry.registerPath({
  method: 'get',
  path: '/api/v1/employees/{id}',
  description: 'Get employee details by ID',
  summary: 'Retrieve an employee',
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: '101' }),
    }),
  },
  responses: {
    200: {
      description: 'Employee found',
      content: {
        'application/json': {
          schema: EmployeeSchema,
        },
      },
    },
    404: {
      description: 'Employee not found',
    },
  },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'HRIS Core API',
      version: '1.0.0',
      description: 'Production HRIS API documentation',
    },
    servers: [{ url: '/api/v1' }],
  });
}
```

---

### Step 3: Serve OpenAPI JSON and Interactive Docs in Next.js

**OpenAPI JSON Endpoint (`app/api/openapi.json/route.ts`):**

```typescript
import { NextResponse } from 'next/server';
import { generateOpenApiDocument } from '@/lib/openapi';

export async function GET() {
  const spec = generateOpenApiDocument();
  return NextResponse.json(spec);
}
```

**Interactive Scalar API Documentation Page (`app/api-docs/page.tsx`):**

```tsx
export default function ApiDocsPage() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <iframe
        src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"
        data-url="/api/openapi.json"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}
```

---

## 3. CI Linting & Drift Prevention

Add **Spectral** in CI to ensure OpenAPI specs conform to security and design standards:

```bash
npm install -D @stoplight/spectral-cli
```

**Lint Configuration (`.spectral.yaml`):**

```yaml
extends: ["spectral:oas"]
rules:
  operation-description: error
  operation-tags: error
  no-eval: error
  security-defined: error
```

**Run in CI:**

```bash
npx spectral lint openapi.json
```

---

## 4. API Client Collections (Git-Tracked)

Do not rely solely on proprietary cloud workspaces. Include a git-tracked collection for local development:
- **Bruno Collection:** Store in `docs/api/bruno/` (plain text YAML/JSON files).
- Every PR adding a new endpoint must commit an accompanying Bruno request file.
