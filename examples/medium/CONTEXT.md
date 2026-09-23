# CONTEXT — Team Expense Tracker
# Generated: 2026-09-08

lifecycle_phase: BUILD
complexity_tier: Medium
planning_mode: Lightweight
lifecycle_docs: partial
multi_agent: false
last_milestone: Expense CRUD + categories + current month list on /expenses
next_action: Implement split bill in src/modules/expenses/split.ts — function `splitEvenly(amount, memberIds)` returns cents per member (remainder to payer), write tests/split.test.ts for 10000/3 and 1/2, wire to POST /api/expenses, then run gate:fast in VERIFY.md

# Rule 0
# Building: Team Expense Tracker. Core: one form to record team expenses, then see who owes whom. Not building: receipt OCR, payroll, or multi-workspace.

# Stack
# Next.js 15 App Router, TypeScript, Prisma + PostgreSQL, NextAuth credentials, Tailwind v4 + tokens in DESIGN.md, Vitest, Playwright.

# Notes
# Auth already has login/logout. Session cookie httpOnly. No invite-by-email yet — members added by admin via /settings/members.
# Draft form still uses localStorage (intentional, see AGENTS.md). Split bill not yet in API.

handover_formality: email
