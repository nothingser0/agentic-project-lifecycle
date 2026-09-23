# Stack-Specific Testing Guide — Next.js + Supabase + Prisma

**Purpose:** Concrete testing examples for the most common 2026 stack (Next.js 15 + Supabase + Prisma/Drizzle + Vitest).

**When to use:** Phase 4 (Testing), when TESTING_STRATEGY_DETAIL.md feels too generic.

---

## Stack Overview

| Layer | Tech | Test Strategy |
|-------|------|---------------|
| **Frontend** | Next.js 15 (App Router) + React 19 | Vitest + Testing Library + MSW |
| **Backend** | Next.js API Routes / Server Actions | Vitest + Supertest (API) / direct invoke (Server Actions) |
| **Database** | Supabase (PostgreSQL) | Testcontainers PostgreSQL |
| **ORM** | Prisma or Drizzle | Mock in unit tests, real DB in integration tests |
| **Auth** | Supabase Auth | Mock session in tests |
| **Realtime** | Supabase Realtime (WebSocket) | Mock in unit, real in e2e |

---

## 1. Unit Tests — Server Actions (Next.js 15)

**Problem:** Server Actions run server-side, can't test like normal functions without mocking DB.

**Solution:** Mock Prisma/Drizzle client.

### Example: Create Employee Action

```typescript
// app/actions/employees.ts
'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createEmployee(data: { name: string; position: string }) {
  const employee = await prisma.employee.create({ data })
  revalidatePath('/employees')
  return employee
}
```

**Test:**

```typescript
// __tests__/unit/actions/employees.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { createEmployee } from '@/app/actions/employees'
import * as dbModule from '@/lib/db'

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    employee: {
      create: vi.fn(),
    },
  },
}))

// Mock Next.js cache revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('createEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('creates employee and revalidates path', async () => {
    const mockEmployee = { id: 1, name: 'John Doe', position: 'Developer' }
    vi.mocked(dbModule.prisma.employee.create).mockResolvedValue(mockEmployee)

    const result = await createEmployee({ name: 'John Doe', position: 'Developer' })

    expect(result).toEqual(mockEmployee)
    expect(dbModule.prisma.employee.create).toHaveBeenCalledWith({
      data: { name: 'John Doe', position: 'Developer' },
    })
  })

  test('throws error when name is empty', async () => {
    vi.mocked(dbModule.prisma.employee.create).mockRejectedValue(
      new Error('Name cannot be empty')
    )

    await expect(createEmployee({ name: '', position: 'Developer' })).rejects.toThrow(
      'Name cannot be empty'
    )
  })
})
```

---

## 2. Integration Tests — Supabase Auth + Database

**Problem:** Need real database + auth session for integration tests.

**Solution:** Testcontainers PostgreSQL + mock Supabase auth.

### Setup Test Database

```typescript
// __tests__/setup/db.ts
import { GenericContainer, StartedTestContainer } from 'testcontainers'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

let container: StartedTestContainer
let prisma: PrismaClient

export async function setupTestDB() {
  // Start PostgreSQL container
  container = await new GenericContainer('postgres:16')
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'test',
    })
    .withExposedPorts(5432)
    .start()

  const port = container.getMappedPort(5432)
  const databaseUrl = `postgresql://test:test@localhost:${port}/test`

  // Set env var for Prisma
  process.env.DATABASE_URL = databaseUrl

  // Run migrations
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })

  prisma = new PrismaClient({ datasourceUrl: databaseUrl })

  return prisma
}

export async function cleanupTestDB() {
  await prisma.$disconnect()
  await container.stop()
}

export function resetTestDB() {
  return prisma.$transaction([
    prisma.employee.deleteMany(),
    prisma.attendance.deleteMany(),
    // ... delete all tables in reverse FK order
  ])
}
```

### Integration Test Example

```typescript
// __tests__/integration/api-employees.test.ts
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestDB, cleanupTestDB, resetTestDB } from '../setup/db'
import { prisma } from '@/lib/db'

beforeAll(async () => {
  await setupTestDB()
})

afterAll(async () => {
  await cleanupTestDB()
})

beforeEach(async () => {
  await resetTestDB()
})

describe('GET /api/employees', () => {
  test('returns employee list', async () => {
    // Seed test data
    await prisma.employee.createMany({
      data: [
        { name: 'John Doe', position: 'Developer', email: 'john@example.com' },
        { name: 'Jane Smith', position: 'Manager', email: 'jane@example.com' },
      ],
    })

    const response = await fetch('http://localhost:3000/api/employees', {
      headers: {
        Authorization: 'Bearer mock-token', // Mock auth
      },
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)
    expect(data[0].name).toBe('John Doe')
  })
})
```

---

## 3. Mock Supabase Auth

**Problem:** Tests need authenticated session without hitting real Supabase.

**Solution:** Mock `@supabase/ssr` server client.

```typescript
// __tests__/setup/supabase-mock.ts
import { vi } from 'vitest'

export function mockSupabaseAuth(user = { id: 'test-user-id', email: 'test@example.com' }) {
  vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn(() => ({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user },
          error: null,
        }),
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user,
              access_token: 'mock-token',
            },
          },
          error: null,
        }),
      },
    })),
  }))
}
```

**Usage in test:**

```typescript
import { mockSupabaseAuth } from '../setup/supabase-mock'

describe('Protected API', () => {
  beforeEach(() => {
    mockSupabaseAuth({ id: 'admin-id', email: 'admin@example.com' })
  })

  test('returns data for authenticated user', async () => {
    const response = await fetch('http://localhost:3000/api/protected')
    expect(response.status).toBe(200)
  })
})
```

---

## 4. E2E Tests — Playwright + Supabase

**Problem:** E2E tests need real login flow.

**Solution:** Use Supabase test user + Playwright auth storage.

### Create Test User (run once)

```typescript
// scripts/create-test-user.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Admin key
)

async function createTestUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test@example.com',
    password: 'test-password-123',
    email_confirm: true, // Auto-confirm
  })

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Test user created:', data.user.id)
  }
}

createTestUser()
```

**Run once:**

```bash
tsx scripts/create-test-user.ts
```

### Playwright Auth Setup

```typescript
// __tests__/e2e/setup/auth.ts
import { Page } from '@playwright/test'

export async function loginAsTestUser(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'test-password-123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}

// Save auth state (run once, reuse across tests)
export async function saveAuthState(page: Page) {
  await loginAsTestUser(page)
  await page.context().storageState({ path: '.auth/test-user.json' })
}
```

**playwright.config.ts:**

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
    storageState: '.auth/test-user.json', // Reuse auth across tests
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'e2e',
      dependencies: ['setup'],
      use: { storageState: '.auth/test-user.json' },
    },
  ],
})
```

**E2E Test:**

```typescript
// __tests__/e2e/employee-crud.spec.ts
import { test, expect } from '@playwright/test'

test('create employee', async ({ page }) => {
  // Already authenticated via storageState
  await page.goto('/employees')

  await page.click('button:has-text("Add Employee")')
  await page.fill('input[name="name"]', 'Test Employee')
  await page.fill('input[name="position"]', 'Tester')
  await page.fill('input[name="email"]', 'tester@example.com')
  await page.click('button:has-text("Save")')

  await expect(page.locator('table')).toContainText('Test Employee')
})
```

---

## 5. Test Supabase Realtime

**Problem:** Realtime WebSocket hard to test in unit tests.

**Solution:** Mock in unit, real in e2e.

### Unit Test (Mock Realtime)

```typescript
// __tests__/unit/realtime/presence.test.ts
import { vi } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
      track: vi.fn().mockResolvedValue({ status: 'ok' }),
      untrack: vi.fn().mockResolvedValue({ status: 'ok' }),
    })),
  })),
}))

test('tracks user presence', async () => {
  const { trackPresence } = await import('@/lib/realtime')
  await trackPresence('user-123', { status: 'online' })
  // Assert mock called
})
```

### E2E Test (Real Realtime)

```typescript
// __tests__/e2e/realtime-presence.spec.ts
import { test, expect } from '@playwright/test'

test('shows other users online', async ({ page, context }) => {
  // User 1 logs in
  await page.goto('/dashboard')
  await expect(page.locator('.presence-indicator')).toContainText('You')

  // User 2 logs in (new tab)
  const page2 = await context.newPage()
  await page2.goto('/dashboard')

  // User 1 should see User 2 online
  await expect(page.locator('.presence-indicator')).toContainText('2 online')
})
```

---

## 6. Test Drizzle ORM (Alternative to Prisma)

**Setup:**

```typescript
// __tests__/setup/drizzle-mock.ts
import { vi } from 'vitest'
import * as schema from '@/db/schema'

export function mockDrizzle() {
  return {
    query: {
      employees: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn(),
      }),
    }),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  }
}
```

**Test:**

```typescript
import { mockDrizzle } from '../setup/drizzle-mock'

test('queries employees with Drizzle', async () => {
  const db = mockDrizzle()
  vi.mocked(db.query.employees.findMany).mockResolvedValue([
    { id: 1, name: 'John' },
  ])

  const employees = await db.query.employees.findMany()
  expect(employees).toHaveLength(1)
})
```

---

## 7. Test Next.js Middleware (Auth Guard)

**Problem:** Middleware runs before every request, hard to test in isolation.

**Solution:** Test via integration test (real request).

```typescript
// __tests__/integration/middleware-auth.test.ts
import { describe, test, expect } from 'vitest'

describe('Middleware Auth Guard', () => {
  test('redirects unauthenticated user to login', async () => {
    const response = await fetch('http://localhost:3000/dashboard', {
      redirect: 'manual', // Don't follow redirect
    })

    expect(response.status).toBe(307) // Redirect
    expect(response.headers.get('location')).toBe('/login')
  })

  test('allows authenticated user to access dashboard', async () => {
    const response = await fetch('http://localhost:3000/dashboard', {
      headers: {
        Cookie: 'sb-access-token=mock-token',
      },
    })

    expect(response.status).toBe(200)
  })
})
```

---

## 8. Performance Testing — Next.js API Routes

**k6 script for Next.js:**

```javascript
// load-tests/nextjs-api.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '1m', target: 50 },   // Sustain
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
}

export default function () {
  const res = http.get('http://localhost:3000/api/employees', {
    headers: {
      Authorization: 'Bearer test-token',
    },
  })

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })

  sleep(1)
}
```

**Run:**

```bash
k6 run load-tests/nextjs-api.js
```

---

## Summary: Testing Checklist (Next.js + Supabase)

### Unit Tests
- [ ] Server Actions mocked (Prisma/Drizzle + revalidatePath)
- [ ] React components (Testing Library)
- [ ] Business logic functions (pure functions)
- [ ] Supabase Auth mocked (`createServerClient`)

### Integration Tests
- [ ] Testcontainers PostgreSQL started
- [ ] Prisma migrations run on test DB
- [ ] API routes tested with real DB
- [ ] Auth middleware tested with mock session

### E2E Tests
- [ ] Test user created in Supabase
- [ ] Auth state saved (`.auth/test-user.json`)
- [ ] Playwright tests reuse auth
- [ ] Realtime presence tested with 2 tabs

### Load Tests
- [ ] k6 script for critical API routes
- [ ] p95 < 500ms threshold
- [ ] Error rate < 1%

---

**Last updated:** 2026-09-22  
**Version:** 1.0.0
