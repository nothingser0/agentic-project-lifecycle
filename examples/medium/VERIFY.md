# VERIFY — Team Expense Tracker
# Run the relevant gate before moving columns in TASKS.md.

## gate:fast — before every commit

```bash
npx prisma generate
npx tsc --noEmit
npx eslint . --max-warnings 0
npx vitest run
```

## gate:pr — before PR leaves draft

```bash
npx prisma generate
npx tsc --noEmit
npx eslint . --max-warnings 0
npx vitest run --coverage
npm run build
```

Coverage floor: lines ≥ 70% in `src/modules/expenses` and `src/modules/auth`.

## gate:qa — after e2e tests are written

```bash
npx playwright test e2e/login.spec.ts e2e/expense-create.spec.ts
```

## Critical path (manual)

- [x] Login `[email]` / `devpass` lands on `/expenses`
- [x] Create expense 50000 cents category Food, appears in current month list
- [x] Delete own expense — row disappears
- [ ] Split 3 members shows chips owed/owe totaling amountCents
- [ ] Logout then open `/expenses` redirects to `/login`

Exit 0 on all commands in the executed gate = gate pass. Do not `--skip` or `|| true`.
