# TASKS — Team Expense Tracker

**Sprint:** 2 (2026-09-15 — 2026-09-26)
**Goal:** Split bill working in API + UI, balance dashboard per person.

WIP limit: 1 item Building.

## Done

- [x] #1 git init, `.gitignore`, remote private `studio/expense-tracker`
- [x] #2 Prisma schema: User, Member, Expense, Category — migrate `20260908_init`
- [x] #3 NextAuth credentials + seed `[email]`
- [x] #4 Expense form (amount, category, payer, note) + POST `/api/expenses`
- [x] #5 List `/expenses` filtered to current month, delete own
- [x] #6 DESIGN.md tokens bridged to Tailwind (`bg-surface`, `text-muted`)

## Building

- [ ] #7 Split bill: `splitEvenly(amountCents, memberIds)` in `src/modules/expenses/split.ts`, persist `ExpenseShare`, show chip "you are owed" on row. AC: 10000 cents / 3 members = 3334 + 3333 + 3333, remainder to payer.

## Queued

- [ ] #8 Dashboard `/` — net balance per member this month (via reports.aggregate). AC: numbers match sum of shares.
- [ ] #9 Settle: "mark settled" button sets `ExpenseShare.settledAt`. AC: row disappears from "you owe".
- [ ] #10 Invite member via form `/settings/members` (unique email, role member). AC: appears in payer dropdown.
- [ ] #11 CSV export `/api/expenses/export` — UI button already exists, disabled. AC: file `expenses-YYYY-MM.csv`.

## Bug

- [ ] #12 Deleting expense does not delete `ExpenseShare` rows — reproduce: create expense, (after #7) delete, `ExpenseShare` orphaned in DB. Fix cascade in Prisma `onDelete: Cascade`.

## Blocked

(empty)

## Needs Spec

(empty)
