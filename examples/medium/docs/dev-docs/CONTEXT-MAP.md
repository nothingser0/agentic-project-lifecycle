# CONTEXT MAP — Team Expense Tracker

Read Tier 0 for every task. Add matching routing rows. Do not read PM docs.

## Domain

- **Team:** one group. This product is one team per deploy, not multi-tenant.
- **Member:** person in the team. Role `admin` (manage members) or `member` (record expenses).
- **Expense:** one expenditure. `amountCents`, `category`, `payerId`, `note`, `occurredAt`.
- **ExpenseShare:** debt slice per member for one expense. Sum of shares = `amountCents`.
- **Category:** Food, Transport, Office, Other. Enum in Prisma, not a table.
- **Settlement:** `ExpenseShare.settledAt` is filled. Not a separate entity.
- **Balance:** net (owed to you minus you owe) per member, computed by reports, not stored.

Money is always cents. `[email]` is the seed admin, not a domain concept.

## Bounded contexts

- **Auth:** login, session, `requireUser()`. Does not know about expenses.
- **Members:** people list + role. Expenses read member id, do not write.
- **Expenses:** create/list/delete + split. Does not compute dashboard.
- **Reports:** aggregate balances. Reads expenses + shares, does not mutate.

## Routing

| Task type | Read | Do not read |
|---|---|---|
| Form / table UI | DESIGN.md, `src/components/expenses/*` | Prisma migrations, auth internals |
| API expense | ARCHITECTURE.md flow A, `src/modules/expenses` | DESIGN.md |
| Split bill (#7) | CONTEXT.md next_action, `split.ts`, TASKS.md #7 AC | reports, Resend |
| Schema / migrate | `prisma/schema.prisma` | UI |
| Bug #12 cascade | schema `ExpenseShare`, delete path in expenses | DESIGN.md |
| Auth / session | `src/modules/auth`, e2e/login.spec.ts | reports |

If a referenced file does not exist: report it, do not invent its contents.
