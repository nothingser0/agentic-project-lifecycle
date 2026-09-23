# AGENTS — Team Expense Tracker
# Entry point. Read this first, then CONTEXT.md.

## Run commands

```bash
npm install
cp .env.example .env.local   # fill DATABASE_URL + AUTH_SECRET
npx prisma migrate dev
npm run dev                  # http://localhost:3000
```

Seed user: `[email]` / `devpass` (scripts/seed.ts).

## Stack

- Next.js 15 (App Router) — pages, Server Actions, Route Handlers
- PostgreSQL + Prisma 6 — source of truth
- NextAuth v5 credentials — session cookie, no OAuth yet
- Tailwind v4 — semantic tokens from DESIGN.md (`bg-surface`, `text-muted`)
- Vitest + Playwright — unit in `tests/`, e2e in `e2e/`

## Reading order

1. This file
2. CONTEXT.md — `lifecycle_phase` + `next_action`
3. VERIFY.md — gate commands, do not skip
4. TASKS.md — pick topmost Building or Queued item
5. ARCHITECTURE.md — module boundaries before adding files
6. DESIGN.md — when touching UI
7. docs/dev-docs/CONTEXT-MAP.md — domain terms

## Conventions

- Commit: `feat:` / `fix:` / `refactor:` + area (`feat(expenses): split evenly`)
- Error: `throw new Error("[expenses] amount must be positive cents")`
- Money: integer cents in DB, format in `src/lib/money.ts`
- Route: `/api/expenses`, `/api/members` — no `/v1`
- Server Components by default. `"use client"` only for forms and charts.

## Intentionally unchanged

- Draft expense form in localStorage — not yet persisted to backend
- CSV export not available; UI button disabled on purpose
- Auth credentials-only; Google OAuth deferred
