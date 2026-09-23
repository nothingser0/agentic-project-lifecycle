# Code Review Checklist — Quality Gate Criteria

**Purpose:** Ensure consistent code quality across all PRs.

**When to use:** Every PR before merge (enforced at `gate:pr`)

---

## Code Review Checklist

**Reviewer fills this template in PR review comment:**

```markdown
## Code Review — PR #42

**Reviewer:** @reviewer-name  
**Date:** 2026-09-22

### Functionality
- [ ] Feature works as described (tested locally)
- [ ] Edge cases handled (empty state, max input, invalid data)
- [ ] Error messages clear and actionable
- [ ] No console.log / debug code left behind

### Code Quality
- [ ] Code readable (clear variable/function names)
- [ ] No duplicated logic (DRY principle)
- [ ] Functions single-purpose (one function, one job)
- [ ] No magic numbers (use named constants)
- [ ] Comments added only where non-obvious (not "// increment i")

### Security
- [ ] User input validated (no raw input to DB/API)
- [ ] SQL injection prevented (parameterized queries / ORM)
- [ ] XSS prevented (sanitized output, React auto-escapes)
- [ ] Auth checked (protected routes require auth)
- [ ] Secrets not hardcoded (use env vars)
- [ ] CORS configured correctly (no wildcard `*` in production)

### Performance
- [ ] No N+1 queries (check DB query count)
- [ ] Large lists paginated (not fetching 10K items)
- [ ] Images optimized (WebP, lazy load)
- [ ] Heavy computation deferred (async, Web Worker)
- [ ] Bundle size impact acceptable (< 20% increase)

### Maintainability
- [ ] Type-safe (TypeScript strict, no `any` without justification)
- [ ] Error handling present (try-catch, error boundaries)
- [ ] Logging added for critical paths (not debug spam)
- [ ] File structure follows project conventions
- [ ] No TODO comments (convert to GitHub issue)

### Testing
- [ ] Unit tests added for new functions
- [ ] Integration test added for new API routes
- [ ] E2E test added for new user flows (if critical)
- [ ] Test coverage ≥ 80% for new code (check coverage report)
- [ ] All tests pass (`npm test`)

### Documentation
- [ ] README updated (if new setup step / env var)
- [ ] AGENTS.md updated (if new command / script)
- [ ] API documented (if new endpoint)
- [ ] ADR created (if significant architecture decision)

### Verdict

- [ ] ✅ **Approve** (ready to merge)
- [ ] ⚠️ **Approve with comments** (non-blocking suggestions)
- [ ] ❌ **Request changes** (blocking issues found)

**Blocking issues:**
1. [issue description]

**Non-blocking suggestions:**
1. [suggestion]
```

---

## Fast-Track Review (Small PRs)

**For PRs with:**
- ≤ 50 lines changed
- No new dependencies
- No auth/payment/security changes
- Typo fix, config tweak, minor refactor

**Use simplified checklist:**

```markdown
## Fast-Track Review — PR #42

- [ ] Code works (tested locally or CI passed)
- [ ] No security issue
- [ ] No breaking change

**Verdict:** ✅ Approve
```

---

## Code Smells to Flag

### Red Flags (Request changes)

❌ **Hardcoded secrets:**
```typescript
const apiKey = 'sk_live_abc123'; // ❌ BLOCK
```

❌ **SQL injection risk:**
```typescript
db.query(`SELECT * FROM users WHERE id = ${userId}`); // ❌ BLOCK
```

❌ **No error handling:**
```typescript
const data = await fetch('/api/users'); // ❌ What if fetch fails?
return data.json(); // ❌ What if not JSON?
```

❌ **Type safety bypass:**
```typescript
const user = data as any; // ❌ Avoid `any`
```

### Yellow Flags (Approve with comments)

⚠️ **Magic numbers:**
```typescript
if (items.length > 100) { // ⚠️ Why 100? Use named constant
```

⚠️ **Duplicated logic:**
```typescript
// Same validation in 3 places — extract to function
```

⚠️ **Large function:**
```typescript
function handleSubmit() { // ⚠️ 200 lines — split into smaller functions
```

⚠️ **TODO comment:**
```typescript
// TODO: Add pagination // ⚠️ Convert to GitHub issue, remove comment
```

---

## Security-Specific Review

**For PRs touching:**
- Auth (login, logout, session, token)
- Payment (checkout, webhook, refund)
- User input (form, API endpoint, file upload)
- Database query (raw SQL, ORM)

**Additional checks:**

### Auth
- [ ] Password hashed (bcrypt, Argon2, never plaintext)
- [ ] Session token httpOnly (not accessible via JS)
- [ ] Token expiry set (not infinite)
- [ ] CSRF protection enabled (for state-changing requests)
- [ ] Rate limiting on login (prevent brute force)

### Payment
- [ ] Card number never stored (use Stripe token)
- [ ] CVV never logged (PCI-DSS violation)
- [ ] Webhook signature verified (prevent spoofing)
- [ ] Amount verified server-side (never trust client)

### User Input
- [ ] Input validated (type, length, format)
- [ ] Special characters escaped (prevent XSS)
- [ ] File upload restricted (type, size, scan for malware)
- [ ] No code execution from user input (eval, Function constructor)

### Database
- [ ] Parameterized queries (prevent SQL injection)
- [ ] Least privilege (app user has only needed permissions)
- [ ] No SELECT * (fetch only needed columns)
- [ ] Indexes on frequently queried columns

---

## Performance-Specific Review

**For PRs touching:**
- Database queries
- Image/asset handling
- Heavy computation
- External API calls

### Database
- [ ] No N+1 queries (use eager loading / join)
- [ ] Pagination for large datasets (limit + offset)
- [ ] Index on filter/sort columns
- [ ] No full table scans (check EXPLAIN plan)

**Example N+1 fix:**

```typescript
// ❌ N+1: 1 query for users, N queries for posts
const users = await prisma.user.findMany();
for (const user of users) {
  user.posts = await prisma.post.findMany({ where: { userId: user.id } });
}

// ✅ Fixed: 1 query with include
const users = await prisma.user.findMany({
  include: { posts: true },
});
```

### Images
- [ ] Format: WebP/AVIF (not raw JPEG/PNG)
- [ ] Lazy load below fold (`loading="lazy"`)
- [ ] Responsive images (`srcset`)
- [ ] Compressed (TinyPNG, Squoosh)

### Computation
- [ ] Heavy work deferred (async, not blocking main thread)
- [ ] Cached when possible (memoization, Redis)
- [ ] Debounced/throttled (search input, scroll handler)

---

## Test Coverage Review

**Check coverage report:**

```bash
npm run test:coverage
```

**Target:**
- Overall: ≥ 80%
- New code: ≥ 80%
- Critical paths (auth, payment): ≥ 95%

**Flag if:**
- New function has 0% coverage (no test added)
- Coverage drops > 5% from base branch
- Critical path coverage < 95%

---

## Automated Checks (CI/CD)

**Should pass before human review:**

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks
on: pull_request

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
  
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run typecheck
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - name: Check coverage
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% < 80%"
            exit 1
          fi
  
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm audit --audit-level=high
  
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

**Human review starts only after all CI checks pass.**

---

## Review Time SLA

**Target response time:**

| PR Size | Initial Review | Final Approval |
|---------|----------------|----------------|
| **Tiny** (≤ 50 lines) | 1 hour | 2 hours |
| **Small** (51-200 lines) | 4 hours | 8 hours |
| **Medium** (201-500 lines) | 1 day | 2 days |
| **Large** (501-1000 lines) | 2 days | 3 days |
| **Huge** (> 1000 lines) | Split into smaller PRs first |

**Rule:** PRs > 1000 lines should be split (hard to review, high error rate).

---

## Review Etiquette

### For Reviewers

✅ **DO:**
- Explain why (not just "change this")
- Suggest alternative (not just "this is wrong")
- Praise good code (not just find flaws)
- Test locally for complex changes
- Mark non-blocking suggestions clearly

❌ **DON'T:**
- Nitpick style (use automated linter)
- Rewrite entire PR in comments
- Approve without reading (rubber stamp)
- Block PR for personal preference (if both approaches work)

### For Authors

✅ **DO:**
- Keep PRs small (< 500 lines)
- Add context in PR description
- Respond to all comments (even if just "fixed")
- Test locally before requesting review
- Update PR based on feedback promptly

❌ **DON'T:**
- Force-push after review started (resets reviewer state)
- Argue personal preference (use team convention)
- Add unrelated changes (scope creep)
- Merge without approval

---

## Integration with Gates

Update `engine/GATE-REGISTRY.md`:

```markdown
### gate:pr (Pull Request)

**Trigger:** Before merging to main/production branch

**Evidence:**
- All CI checks passed (lint, typecheck, test, security)
- **Code review approved (1+ reviewer)** ← EXISTING, detailed here
- Code review checklist completed
- Security checklist completed (if auth/payment/user-input changes)
- Performance budget not exceeded (if frontend changes)
- Test coverage ≥ 80% for new code
- OWNERSHIP.md check passed (if multi_agent: true)

**Blocker:** Cannot merge if:
- CI checks failed
- Code review not approved
- Security issue flagged (SQL injection, hardcoded secret, etc.)
- Coverage < 80%
```

---

**Agent Instruction:**

When creating a PR:
1. Keep PR ≤ 500 lines (split if larger)
2. Fill PR description (what, why, how to test)
3. Self-review using code review checklist
4. Ensure all CI checks pass before requesting review
5. Address reviewer feedback promptly

When reviewing a PR:
1. Use code review checklist template
2. Test locally for complex changes
3. Flag security issues as blocking
4. Approve only when all checks met
5. Respond within SLA (based on PR size)
