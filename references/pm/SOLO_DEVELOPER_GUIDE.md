# Solo Developer Guide — Simplifying Medium Artifacts

**When to use this guide:** Solo or personal projects classified as Medium tier, but don't need enterprise formality.

**Key principle:** Keep the structure (CONTEXT.md, TASKS.md, VERIFY.md) but simplify content for single-person use.

---

## The Problem

Medium tier defaults assume 1-5 developers and include artifacts designed for team coordination:
- BUSINESS-CASE.md (formal business justification)
- PROJECT-CHARTER.md (sponsor sign-off)
- STAKEHOLDERS.md (multi-stakeholder matrix)
- TIMELINE.md (Gantt chart with dependencies)

**For solo/indie devs:** These feel like bureaucracy without value. You don't need to justify to yourself or track stakeholders when you are the only stakeholder.

---

## Simplified Artifacts for Solo Medium

### Planning Documents (Phase 0-2)

**Instead of separate PM files, consolidate into CONTEXT.md:**

```markdown
# CONTEXT — Project Name

lifecycle_phase: BUILD
complexity_tier: Medium
planning_mode: Lightweight
lifecycle_docs: simplified-solo
multi_agent: false

## Rationale (replaces BUSINESS-CASE.md)
Personal project to learn Next.js App Router and Prisma. Goal: build a working expense tracker that I actually use daily. Success = tracking 3 months of expenses without switching back to spreadsheet.

## Scope (replaces PROJECT-CHARTER.md + SCOPE-STATEMENT.md)
Building: Expense tracking with categories, monthly reports, CSV export
Not building: Multi-currency, receipt OCR, team sharing, mobile app

## Timeline (replaces TIMELINE.md + MILESTONE-REGISTER.md)
- Week 1-2: Auth + database schema + CRUD expenses
- Week 3: Categories + monthly report view
- Week 4: CSV export + polish
Target done: End of month

## Stack
Next.js 14, Prisma + SQLite, Tailwind CSS

last_milestone: Auth complete, expenses CRUD working
next_action: Read TASKS.md item #3 (category filter), implement GET /api/expenses?category=X with Prisma where clause, add CategoryFilter component to ExpenseList, write test asserting category=Food returns only food expenses, run npm test && npm run build
```

**Benefit:** All context in one file. No clicking through 5 separate docs.

---

### STAKEHOLDERS.md (skip entirely)

Solo projects have one stakeholder: you. Don't create this file.

---

### PROJECT-CHARTER.md (skip or 1-paragraph in README)

**Skip when:** Personal/learning project

**1-paragraph alternative when needed** (client work, portfolio piece):

Add to README.md:
```markdown
## Project Goals

Build expense tracker to replace my current spreadsheet workflow. Must handle 100+ transactions/month, work offline, export to CSV for tax filing. Timeline: 4 weeks part-time. Success: daily use for 3 months without regression.
```

---

### TIMELINE.md (replace with milestone list in TASKS.md)

**Instead of Gantt chart, add Milestones section to TASKS.md:**

```markdown
# TASKS — Expense Tracker

## Milestones
- [x] M0: Scaffold + design tokens (Sept 1)
- [x] M1: Auth + expenses CRUD (Sept 8)
- [ ] M2: Categories + filters (Sept 15)
- [ ] M3: Monthly reports (Sept 22)
- [ ] M4: CSV export + polish (Sept 29)

## Queued
- [ ] #5: Add monthly summary view with chart
- [ ] #6: CSV export with date range picker

## Building
- [ ] #4: Implement category filter dropdown

## Done
- [x] #3: Auth middleware + protected routes
...
```

**No dependency graph needed** — you're the only person and you know the order.

---

### FSD.md / PRD.md (replace with brief in CONTEXT.md)

**Instead of multi-page PRD, write 1-paragraph scope in CONTEXT.md** (see example above).

For slightly more detail, create lightweight `docs/SCOPE.md`:

```markdown
# Scope — Expense Tracker

## Features
1. Add/edit/delete expenses with amount, date, category, note
2. Filter by category + date range
3. Monthly summary: total spent per category, line chart
4. Export filtered expenses to CSV

## Not building
- Multi-user / team sharing
- Receipt photo upload
- Budgets or spending alerts
- Recurring expense templates
- Mobile app (desktop web only)

## Data model
- User (id, email, password_hash)
- Expense (id, user_id, amount, date, category, note)
- Category (id, name, color)

## Acceptance criteria per feature
1. Expenses: add expense → reload page → expense still there
2. Filter: select "Food" category → only food expenses shown
3. Summary: view September → chart shows daily spending trend
4. Export: click Export → downloads expenses-2026-09.csv with correct rows
```

**3-page doc vs 15-page FSD.** Still complete, no enterprise boilerplate.

---

### REQUIREMENTS-SIGNOFF.md (skip for personal, lightweight for client)

**Skip when:** Personal/learning project

**Lightweight alternative for client work:**

```markdown
# Requirements Sign-off

Client: Jane Doe (jane@example.com)
Date: 2026-09-05

Agreed scope (email confirmation Sept 5):
- Expense CRUD, categories, monthly report, CSV export
- Timeline: 4 weeks
- Delivery: Vercel deployment link + GitHub repo access

Client approved proceeding to build.
```

**One page. No traceability matrix unless client contractually requires it.**

---

### ARCHITECTURE.md (keep, but simplify)

**Keep this file** — even solo devs need to remember their own decisions 2 months later.

**Simplified version:**

```markdown
# ARCHITECTURE — Expense Tracker

## Structure
- `/app` — Next.js pages + API routes
- `/components` — UI components
- `/lib` — utils, Prisma client, auth helpers
- `/prisma` — schema + migrations

## Data flow
Client → API route → Prisma → SQLite

## Design tokens
Tailwind semantic utilities in `tailwind.config.ts`:
- `bg-surface`, `text-default`, `border-subtle`, `ring-focus`

## Auth
Session cookies via Auth.js, httpOnly
```

**Keep it under 1 page.**

---

### AGENTS.md, VERIFY.md, TASKS.md (keep as-is)

**These are valuable even for solo:**

- **AGENTS.md** — future-you in 3 months needs run commands and conventions
- **VERIFY.md** — regression protection (run before every commit)
- **TASKS.md** — prevents forgetting what's next after 2-week break

No simplification needed. These are already lightweight.

---

## Closure Simplification

### BAST.md (skip unless client work)

Solo projects: skip. No formal acceptance needed.

Client work: use email confirmation as BAST equivalent:

```markdown
# Handover Confirmation

Date: 2026-09-29
Client: Jane Doe

Email confirmation received:
> "Expense tracker works great. Deployed to my Vercel account. Thanks!"

Repo transferred: github.com/janedoe/expense-tracker
Access revoked: None needed (client owns repo)
```

---

### RETROSPECTIVE.md (keep, but 1 paragraph)

**Instead of multi-page retrospective:**

```markdown
# Retrospective — Expense Tracker

Completed: 2026-09-29 (4 weeks, on schedule)

**Went well:**
- Prisma migrations smooth, no rollback needed
- Tailwind semantic tokens worked — no design drift

**Would change next time:**
- Start with CSV export schema first (had to refactor queries later)
- Use Zod schemas from day 1, not halfway through

**Next project:**
- Try tRPC for type-safe API instead of REST
```

**3 bullets each. Done.**

---

### HANDOVER.md (skip for personal, 1-page for client)

**Personal project:** Skip. If you archive it, just write in README:

```markdown
## Archive Notice

Last updated: 2026-12-15
Status: Feature-complete, using daily, no active development
Run: `npm install && npm run dev`
Reset: `npx prisma migrate reset`
```

**Client work:**

```markdown
# Handover — Expense Tracker

Delivered to: Jane Doe
Date: 2026-09-29

Access:
- Vercel project: jane-expense-tracker (transferred ownership)
- GitHub repo: janedoe/expense-tracker (transferred ownership)
- Database: Supabase project ID abc123 (owner: jane@example.com)

Credentials:
- Supabase dashboard: jane@example.com (client's account)
- Vercel: jane@example.com (client's account)

Known limitations:
- CSV export limited to 1000 rows (add pagination if needed)
- No recurring expense support (mentioned in SCOPE.md as excluded)

Support: None (one-time delivery, no ongoing maintenance)
```

---

## Summary: Solo Medium File Structure

```
project/
├── .gitignore
├── .env.example
├── CONTEXT.md              ← rationale, scope, timeline, stack (consolidated)
├── AGENTS.md               ← keep as-is
├── ARCHITECTURE.md         ← simplified 1-pager
├── TASKS.md                ← milestones + kanban
├── VERIFY.md               ← keep as-is
├── README.md               ← project goals (optional 1-paragraph)
├── docs/
│   ├── SCOPE.md            ← optional lightweight scope (3 pages max)
│   ├── decisions/          ← ADRs (event-triggered, keep these)
│   └── dev-docs/
│       └── CONTEXT-MAP.md  ← routing map (simplified)
└── [no BUSINESS-CASE.md, PROJECT-CHARTER.md, STAKEHOLDERS.md, TIMELINE.md]
```

**What's gone:**
- BUSINESS-CASE.md → 1 paragraph in CONTEXT.md
- PROJECT-CHARTER.md → 1 paragraph in README or skip
- STAKEHOLDERS.md → skip
- TIMELINE.md → milestone list in TASKS.md
- REQUIREMENTS-SIGNOFF.md → skip or email confirmation
- BAST.md → skip or email confirmation
- Multi-page retrospective → 3 bullets

**What stays:**
- CONTEXT.md (enhanced with consolidated planning content)
- AGENTS.md (future-you needs this)
- VERIFY.md (regression protection)
- TASKS.md (prevents memory loss)
- ARCHITECTURE.md (simplified)
- ADRs (valuable for reversible decisions)

---

## When to Graduate to Full Medium

**Upgrade from simplified-solo to full Medium when:**

- Second developer joins
- Client requires formal sign-off documents
- Project becomes billable/contract work
- Scope grows beyond original 1-month timeline
- Stakeholders beyond yourself appear (manager, client, compliance)

**How:** Run scaffold again without `simplified-solo` flag, fill the missing docs from templates.

---

## FAQ

**"Is simplified-solo still Medium tier?"**

Yes. Tier is determined by features/entities/auth/deploy, not by document formality. A solo dev building a 3-feature app with auth and deploy is Medium even with simplified docs.

**"Can I use this for Large projects?"**

No. Large tier (5-20 devs, payments, public API, multi-role auth) requires the full artifact set for team coordination and compliance. Solo devs don't build Large projects — if you are, you're either misclassified or need to add team members.

**"What if I'm a solo contractor for a client?"**

Use lightweight client alternatives shown above:
- BUSINESS-CASE → 1 paragraph in README
- CHARTER → email agreement
- SIGNOFF → email confirmation
- BAST → email + handover doc (1 page)

Still way less than enterprise ceremony, but enough for professional delivery.

**"Do I still run the document validation checklist?"**

Yes — this skill has no `verify-docs` script, so it's the manual checklist in
`engine/STATE-MACHINE.md`. It checks CONTEXT.md, VERIFY.md, AGENTS.md, TASKS.md exist —
which solo-simplified still has. Should pass without changes.
