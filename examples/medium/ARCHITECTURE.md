# ARCHITECTURE — Team Expense Tracker

**Version:** 0.4 | **Last updated:** 2026-09-18

Single-team web app for recording shared expenses. Modular monolith Next.js + PostgreSQL, deployed on Vercel + Neon. Constraint: money is always integer cents; no floats at API or Prisma boundary.

## Boundary

| Inside the system | Outside the system |
|---|---|
| Web app, Route Handlers, Prisma | SMTP via Resend (not yet wired, mock in tests/mocks/resend.ts) |
| Session + credentials auth | Vercel hosting, Neon Postgres |

## Modules

| Module | Path | Responsibility | Called by |
|---|---|---|---|
| auth | `src/modules/auth` | Login, session, requireUser() | all routes |
| members | `src/modules/members` | Team member list, role admin/member | expenses, settings |
| expenses | `src/modules/expenses` | CRUD, categories, split (WIP) | app router, api |
| reports | `src/modules/reports` | Aggregate per person / category / month | dashboard |
| ui | `src/components` | Pages, form, table | app router only |

```
ui → modules → lib/db     allowed
modules → ui              forbidden
reports → expenses        allowed (read)
expenses → reports        forbidden — compute in reports
```

## Data flow

### A: Record expense
1. Client POST `/api/expenses` JSON `{amountCents, category, payerId, note}`
2. `expenses.create` validates cents > 0, payer exists in members, writes row `UNSPLIT`
3. Redirect `/expenses` — list reads via Server Component

### B: Login
1. POST `/api/auth/callback/credentials`
2. NextAuth checks hash in `User.password`, sets session cookie
3. `requireUser()` in layout rejects anonymous to `/expenses`

API failure: JSON `{error: "[expenses] amount must be positive cents"}` + 4xx. Never 200 + error field.
