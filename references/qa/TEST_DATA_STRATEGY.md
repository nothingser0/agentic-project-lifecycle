# Test Data Strategy — Reliable, Fast, Maintainable Test Data

**Purpose:** Solve test data problems (slow setup, flaky tests, data leaks between tests, hard to debug failures).

**When to use:** Phase 4 (Testing), when writing integration/e2e tests.

---

## Problems with Test Data

### ❌ Problem 1: Shared Fixtures (Brittle)

```typescript
// Bad: All tests use same fixture file
const user = testData.users[0] // { id: 1, email: 'test@example.com' }

test('update user email', async () => {
  await updateUser(user.id, { email: 'new@example.com' })
  // ❌ Changes global fixture, breaks other tests
})
```

### ❌ Problem 2: Manual Setup (Slow, Repetitive)

```typescript
// Bad: Every test duplicates setup
test('create expense', async () => {
  const user = await db.user.create({ data: { email: 'test@example.com' } })
  const category = await db.category.create({ data: { name: 'Food' } })
  const expense = await db.expense.create({ data: { userId: user.id, categoryId: category.id } })
  // Actual test starts here...
})
```

### ❌ Problem 3: Data Leaks Between Tests

```typescript
// Bad: Tests depend on execution order
test('create user', async () => {
  await db.user.create({ data: { id: 1, email: 'test@example.com' } })
})

test('find user', async () => {
  const user = await db.user.findUnique({ where: { id: 1 } })
  expect(user).toBeDefined() // ❌ Fails if run in isolation
})
```

---

## Solution: Factory Pattern + Test Isolation

### ✅ Pattern 1: Factory Functions (Recommended)

**Create `__tests__/factories/index.ts`:**

```typescript
import { faker } from '@faker-js/faker'
import { db } from '@/lib/db'

// Base factory: generates unique data every call
export const UserFactory = {
  build: (overrides = {}) => ({
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: faker.internet.password(),
    ...overrides, // Allow overriding defaults
  }),

  create: async (overrides = {}) => {
    return db.user.create({
      data: UserFactory.build(overrides),
    })
  },
}

export const CategoryFactory = {
  build: (overrides = {}) => ({
    name: faker.commerce.department(),
    color: faker.color.rgb(),
    ...overrides,
  }),

  create: async (overrides = {}) => {
    return db.category.create({
      data: CategoryFactory.build(overrides),
    })
  },
}

export const ExpenseFactory = {
  build: async (overrides = {}) => {
    // Auto-create related records if not provided
    const user = overrides.userId ? { id: overrides.userId } : await UserFactory.create()
    const category = overrides.categoryId ? { id: overrides.categoryId } : await CategoryFactory.create()

    return {
      userId: user.id,
      categoryId: category.id,
      amount: faker.number.float({ min: 10, max: 500, multipleOf: 0.01 }),
      description: faker.commerce.productName(),
      date: faker.date.recent(),
      ...overrides,
    }
  },

  create: async (overrides = {}) => {
    return db.expense.create({
      data: await ExpenseFactory.build(overrides),
    })
  },
}
```

**Install Faker:**

```bash
npm install -D @faker-js/faker
```

---

### Usage in Tests

**✅ Clean, isolated tests:**

```typescript
import { UserFactory, ExpenseFactory } from '@/__tests__/factories'

describe('Expense API', () => {
  test('create expense', async () => {
    // Each test gets fresh, unique data
    const user = await UserFactory.create()
    const expense = await ExpenseFactory.create({ userId: user.id, amount: 100 })

    expect(expense.amount).toBe(100)
    expect(expense.userId).toBe(user.id)
  })

  test('cannot create expense with negative amount', async () => {
    // Override only what matters for this test
    await expect(
      ExpenseFactory.create({ amount: -50 })
    ).rejects.toThrow('Amount must be positive')
  })
})
```

**Benefits:**

- ✅ Unique data every test (no collisions)
- ✅ Override only what matters (readable tests)
- ✅ Auto-create relations (less boilerplate)
- ✅ Fast (factories reuse DB connection)

---

## Pattern 2: Database Seeding (For Manual Testing)

**Purpose:** Populate dev/staging database with realistic data.

**Create `scripts/seed.ts`:**

```typescript
import { db } from '@/lib/db'
import { UserFactory, CategoryFactory, ExpenseFactory } from '@/__tests__/factories'

async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await db.expense.deleteMany()
  await db.category.deleteMany()
  await db.user.deleteMany()

  // Create admin user (fixed credentials for login)
  const admin = await UserFactory.create({
    email: 'admin@example.com',
    password: 'admin123', // Plaintext for dev, hashed in factory
    role: 'ADMIN',
  })

  // Create 3 categories
  const categories = await Promise.all([
    CategoryFactory.create({ name: 'Food', color: '#10b981' }),
    CategoryFactory.create({ name: 'Transport', color: '#3b82f6' }),
    CategoryFactory.create({ name: 'Entertainment', color: '#8b5cf6' }),
  ])

  // Create 10 regular users
  const users = await Promise.all(
    Array.from({ length: 10 }, () => UserFactory.create())
  )

  // Create 100 expenses (random users, random categories)
  for (let i = 0; i < 100; i++) {
    await ExpenseFactory.create({
      userId: users[Math.floor(Math.random() * users.length)].id,
      categoryId: categories[Math.floor(Math.random() * categories.length)].id,
    })
  }

  console.log('✅ Seed complete!')
  console.log(`- ${users.length + 1} users (1 admin + ${users.length} regular)`)
  console.log(`- ${categories.length} categories`)
  console.log('- 100 expenses')
  console.log('\nLogin as admin:')
  console.log('  Email: admin@example.com')
  console.log('  Password: admin123')
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
```

**Add to `package.json`:**

```json
{
  "scripts": {
    "db:seed": "tsx scripts/seed.ts",
    "db:seed:test": "DATABASE_URL=postgresql://test:test@localhost:5433/test tsx scripts/seed.ts"
  }
}
```

**Run:**

```bash
npm run db:seed
```

---

## Pattern 3: Test Database Isolation

**Problem:** Tests pollute each other's data.

**Solution:** Reset database between tests.

**Setup `__tests__/setup/db.ts`:**

```typescript
import { beforeEach, afterAll } from 'vitest'
import { db } from '@/lib/db'

// Reset database before each test
beforeEach(async () => {
  // Delete in reverse FK order (children before parents)
  await db.expense.deleteMany()
  await db.category.deleteMany()
  await db.user.deleteMany()
})

// Close DB connection after all tests
afterAll(async () => {
  await db.$disconnect()
})
```

**Import in test files:**

```typescript
import '@/__tests__/setup/db' // Auto-runs beforeEach/afterAll
import { UserFactory } from '@/__tests__/factories'

test('create user', async () => {
  const user = await UserFactory.create()
  // Database is clean at start of every test
})
```

**Alternative (Faster): Transactions + Rollback**

```typescript
// __tests__/setup/db-transactions.ts
import { beforeEach, afterEach } from 'vitest'
import { db } from '@/lib/db'

let transaction: any

beforeEach(async () => {
  // Start transaction
  transaction = await db.$transaction(async (tx) => {
    // All queries in this test use `tx` instead of `db`
    return tx
  })
})

afterEach(async () => {
  // Rollback transaction (undo all changes)
  await transaction.$rollback()
})
```

**Trade-off:** Transactions are faster (no DELETE queries), but can't test transaction behavior itself.

---

## Pattern 4: Anonymized Production Data (Staging Only)

**Purpose:** Test with realistic data volume/distribution.

**⚠️ WARNING:** NEVER copy production data with real PII to local/dev.

**Safe workflow:**

```typescript
// scripts/anonymize-prod-data.ts
import { db as prodDb } from '@/lib/db-production'
import { db as stagingDb } from '@/lib/db-staging'
import { faker } from '@faker-js/faker'

async function anonymize() {
  const users = await prodDb.user.findMany()

  for (const user of users) {
    await stagingDb.user.create({
      data: {
        id: user.id, // Keep IDs for FK integrity
        email: faker.internet.email(), // ✅ Anonymized
        name: faker.person.fullName(), // ✅ Anonymized
        phone: faker.phone.number(), // ✅ Anonymized
        createdAt: user.createdAt, // Keep timestamps
      },
    })
  }

  console.log(`Anonymized ${users.length} users`)
}
```

**Run manually (never automated):**

```bash
DATABASE_URL_PROD=xxx DATABASE_URL_STAGING=yyy tsx scripts/anonymize-prod-data.ts
```

---

## Pattern 5: Fixture Files (For Reference Data Only)

**When to use:** Enums, lookups, static data that never changes.

**Example: Countries, Currencies, Timezones**

```typescript
// __tests__/fixtures/countries.json
[
  { "code": "US", "name": "United States" },
  { "code": "ID", "name": "Indonesia" },
  { "code": "SG", "name": "Singapore" }
]
```

**Load in tests:**

```typescript
import countries from '@/__tests__/fixtures/countries.json'

test('validate country code', () => {
  const validCodes = countries.map(c => c.code)
  expect(validCodes).toContain('US')
})
```

**DO NOT use fixtures for:**
- ❌ User data (emails, names) — use Faker
- ❌ Transactional data (orders, payments) — use factories
- ❌ Data that changes per test — use factories with overrides

---

## Pattern 6: Snapshot Testing (For Complex Objects)

**When to use:** API responses, generated HTML, config objects.

**Example:**

```typescript
import { UserFactory } from '@/__tests__/factories'

test('user API response format', async () => {
  const user = await UserFactory.create({
    email: 'test@example.com',
    name: 'John Doe',
  })

  const response = await fetch(`/api/users/${user.id}`)
  const data = await response.json()

  // Remove dynamic fields before snapshot
  delete data.id
  delete data.createdAt

  expect(data).toMatchSnapshot()
})
```

**First run:** Creates `__snapshots__/user.test.ts.snap`

**Subsequent runs:** Compares against snapshot, fails if different.

**Update snapshot:**

```bash
npm test -- -u
```

---

## Debugging Test Data Issues

### Issue 1: Test Passes Locally, Fails in CI

**Cause:** Data leaks between tests (execution order differs in CI).

**Fix:** Ensure database reset in `beforeEach`.

```typescript
beforeEach(async () => {
  await db.expense.deleteMany()
  await db.user.deleteMany()
})
```

---

### Issue 2: Unique Constraint Violation

**Cause:** Factory generates same email twice.

**Fix:** Use Faker (generates unique values by default).

```typescript
// ❌ Bad
email: 'test@example.com' // Same every time

// ✅ Good
email: faker.internet.email() // Unique: test-abc123@example.com
```

---

### Issue 3: Foreign Key Constraint Violation

**Cause:** Deleting parent before child.

**Fix:** Delete in reverse FK order.

```typescript
// ❌ Bad
await db.user.deleteMany() // Fails if expenses still exist

// ✅ Good
await db.expense.deleteMany() // Delete children first
await db.user.deleteMany() // Then delete parent
```

---

### Issue 4: Tests Slow (> 5 sec)

**Cause:** Creating too many records, or no database connection pooling.

**Fix:**

1. **Limit data creation:**

```typescript
// ❌ Bad
for (let i = 0; i < 1000; i++) {
  await UserFactory.create() // 1000 DB calls
}

// ✅ Good
await db.user.createMany({
  data: Array.from({ length: 1000 }, () => UserFactory.build()),
}) // 1 DB call
```

2. **Use transactions:**

```typescript
await db.$transaction(async (tx) => {
  const user = await tx.user.create({ data: UserFactory.build() })
  const expense = await tx.expense.create({ data: { userId: user.id, amount: 100 } })
}) // Batched, faster
```

3. **Enable connection pooling:**

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/test?connection_limit=10"
```

---

## Checklist: Test Data Strategy

### Setup (One-time)
- [ ] Install Faker (`npm install -D @faker-js/faker`)
- [ ] Create factories (`__tests__/factories/index.ts`)
- [ ] Setup database reset (`__tests__/setup/db.ts`)
- [ ] Create seed script (`scripts/seed.ts`)
- [ ] Document test data approach in README

### Per Test File
- [ ] Import `@/__tests__/setup/db` (auto-reset between tests)
- [ ] Use factories for test data (not hard-coded fixtures)
- [ ] Override only relevant fields (keep tests readable)
- [ ] Delete test data in reverse FK order (if manual cleanup)

### Debugging Flaky Tests
- [ ] Run test 10x in isolation (`npm test -- --run 10`)
- [ ] Check for shared state (global variables, static fixtures)
- [ ] Verify database reset happens (`beforeEach` runs)
- [ ] Check for race conditions (async/await missing?)

---

## Tools

**Data generation:**
- [@faker-js/faker](https://fakerjs.dev/) (realistic fake data)
- [Chance.js](https://chancejs.com/) (alternative to Faker)
- [Falso](https://github.com/ngneat/falso) (typed fake data)

**Database management:**
- [Testcontainers](https://testcontainers.com/) (Docker containers for tests)
- [Prisma](https://www.prisma.io/docs/guides/testing) (transaction rollback)
- [Drizzle](https://orm.drizzle.team/) (lightweight ORM)

---

**Last updated:** 2026-09-22  
**Version:** 1.0.0
