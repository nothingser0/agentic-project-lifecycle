# Module 03c — Build: Quality & Standards

**Contains:** Stack Decisions (defaults, persistence, data integrity, external integration, frontend ladder, banned list), Quality Floor, Security Floor, Accessibility Floor, UI State, Product Finish Gate, Anti-Slop Defaults, Skill Routing.

**When to read:** Before first commit and at every milestone — the quality bar for the project.

---

## Stack Decisions

Preference order when there is no stack yet:

1. The ecosystem named by the user.
2. The ecosystem of the existing repo.
3. Modern boring default for the artifact type (table below).
4. Avoid external services until the prototype proves the flow.

State the stack and fit reason in one short line before scaffolding: fast local run, current ecosystem, low ceremony, or existing repo compatibility. With an existing stack, use it. Do not introduce a new framework mid-session.

**Dependency rule:** stdlib first, existing dependency second, new package only when it removes meaningful complexity. Do not add packages for formatting, small utilities, or one-off state. Commit the lockfile for every project that has one.

### Default stack per artifact type

| Artifact | Runtime / framework | Persistence | API style | Auth |
|---|---|---|---|---|
| Web UI prototype | Vite + React + TypeScript | see persistence ladder | n/a | none until needed |
| Full-stack web app | Next.js (App Router) + TypeScript, or repo framework | SQLite via local Prisma/Drizzle, Postgres at deploy | REST route handler | framework-native session auth library (Auth.js, Better-Auth, or framework-owned) |
| Standalone API | Node + Hono/Fastify + TypeScript, or Python + FastAPI | SQLite → Postgres | REST + route map or `contracts/openapi.yaml` | session or JWT via maintained library, no hand-rolled crypto |
| CLI | Node + TypeScript, or Python + Typer, or Go | local file / SQLite | n/a | n/a |
| Data / script | Python + stdlib + pandas only if tabular | file in, file out | n/a | n/a |
| Desktop | Tauri or Electron only if user asks for desktop | SQLite | n/a | local only |
| Background jobs | start as in-process queue or cron, move to a real queue only under the multi-process persistence ladder trigger | | | |

GraphQL only when the user asks or an existing consumer requires it. RPC (tRPC) only when one TypeScript codebase owns both sides and there is no external consumer. Services, message buses, and separate workers do not appear in vibe sessions unless the repo already has them.

### Persistence ladder

Move up one rung only when the trigger happens. Do not start higher than needed, and do not stay lower than the trigger permits.

| Rung | Use when | Move up when |
|---|---|---|
| In-memory state | One-off demo, one screen, data loss on refresh is acceptable | Data must survive refresh |
| localStorage / single JSON file | Single user, single device, one entity, small data | A related second entity appears, or data must survive device changes, or there are two writers |
| SQLite | Relational query, multiple entities, local single-process app, local dev for anything deployable | Target deploy has an ephemeral filesystem, or concurrent writers from multiple processes, or multi-user deployment |
| Postgres (or managed database host) | Deployed multi-user app, concurrent writes, relational integrity matters | Only for reasons outside the vibe session |

Choosing a rung does not change the complexity tier. See the anti-downgrade rule.

### Data integrity floor (any project with persistence)

- Declare constraints at creation, not later: primary key, foreign key with explicit cascade or restrict behavior, unique constraint on anything the product considers unique, NOT NULL on anything the product requires, sensible defaults, and `created_at`.
- Wrap multi-step writes in a transaction. Any operation that writes two rows and must not be half-complete (transfer, order plus line item, status change plus audit row) is one transaction, not two calls.
- **Transactional Outbox for external side-effects:** When a database mutation triggers an external network call (sending transactional email, publishing webhook, queuing job, charging Stripe), NEVER make the external call inside or immediately after the DB transaction without persistence. Write an `outbox_events` record within the *same* database transaction. A resilient worker (BullMQ, Celery, pg_cron) polls the outbox and executes the external call using idempotency keys, marking the record processed upon success. This prevents dual-write split-brain when the DB commits but the external call fails (or vice versa).
- Use migrations when the stack supports them. Name them `NNN_verb_noun`. Every migration is reversible or explicitly documented as not reversible. **Do not edit a migration that has been applied anywhere.** Add a new one.
- Money is never float. Integer minor unit or decimal type.
- Store timestamps in UTC.
- No destructive schema or data change without a backup or snapshot first (see Quality Floor).

### External integration hygiene

Every outbound call gets: explicit timeout, one bounded retry with backoff only for idempotent reads, idempotency key on anything that creates or charges, pagination handling when the endpoint paginates, and an error surfaced as a usable UI state instead of a thrown stack trace. Do not call a remote service inside a loop over rows; batch or fetch once.

### Frontend ladder

**State:** local `useState` → lifted state → context for genuinely cross-cutting values (theme, session, locale) → store (Zustand or equivalent) only when three or more distant components write the same state. **Server data is not client state:** any project with more than two fetched endpoints uses a data-fetching library (TanStack Query, SWR, or the framework loader) instead of hand-rolled `useEffect` fetching.

**Component split:** split when pure component LOC exceeds 200 lines (excluding imports and types), when a component is imported in two or more distinct routes, or when an isolated subtree manages its own independent state. Colocate a component with the only route that uses it until a second consumer appears. Props by default; context only for the cross-cutting values above. Do not build a generic component at its first use.

**Form:** one input does not need a library. Any form with validation rules, multiple fields, and a submit path uses the ecosystem-standard form + schema validation pair, and the same schema validates on the server.

**Routing:** use the framework router. Do not hand-roll route matching.

### Banned by default (review this list when revising the skill, last reviewed 2026-09)

Do not use these unless the repo already uses them: Create React App, class components in new code, jQuery, hand-rolled Webpack config, `moment`, `request`, callback-style database client, Express 4 patterns in new projects, `var`, PHP mysql_* functions, `componentWillMount`, CSS float layout, Bootstrap 3, `any` as the default TypeScript escape hatch, rolling your own password hashing or JWT verification, runtime CSS-in-JS (`styled-components`, `emotion`) in React Server Component / Next.js App Router projects (causes runtime SSR hydration mismatches, blocks streaming, and breaks strict Content Security Policy nonces without unsafe-inline; use Tailwind CSS, CSS Modules, or vanilla-extract instead).

Reason: model training data over-represents these. Familiarity is not currency.

### Live documentation over static banned lists

The banned list above is a floor, not a fix; it goes stale as training data goes stale, so it is dated and reviewed instead of treated as permanent. When a tool that pulls current version-specific library documentation and examples into context on demand is available, prefer checking it over trusting memory for API surfaces, package versions, or "is this still the current way" questions. This closes the recency gap that banned lists can only patch after the fact. When unavailable, the banned list and the package-validation step in Recon are the ceiling.

### Performance and support floor

Unless the user says otherwise: latest evergreen browsers, no IE support, initial JS payload kept strictly below tier transfer budget (Medium: ≤ 300 KB gzipped, Large/Enterprise: ≤ 200 KB gzipped, enforced via Lighthouse CI and bundle analysis per `references/frontend/FRONTEND_PERFORMANCE_BUDGET.md`), no route blocks first paint on a network call that could be streamed or deferred, and no unbounded list rendering past ~200 rows without virtualization or pagination. Measure before any optimization (`performance-optimization`).

---

## Quality Floor

Vibe coding moves fast, not carelessly. Humans do not read code, so code protects itself.

- **Cheapest reliable guard.** Strict types when available, one smoke test for non-trivial behavior, and a real run of the critical path. If LSP is unavailable, use the project-native check (`npm run typecheck`, `npm test`, `npm run build`, `node --check`). Missing LSP is not a blocker when an equivalent check passes.
- **Test depth follows risk.** Display-only UI and simple local tools: one smoke check. Add targeted checks when behavior can lose data, gate access, transform user input, or call an external service. Persistence can save/load/reset. Auth can login/logout/protected-route **plus one ownership-denial test**. API can success plus validation failure. Migration can apply/rollback or fresh-db.
- **Non-trivial means (objective checklist):** Any function, route, or component that meets ANY of these six conditions: (1) executes database persistence or storage mutation, (2) transforms financial, mathematical, or tabular data, (3) validates or decodes external input against a schema, (4) authorizes an endpoint or inspects session/roles, (5) executes a network request to an external service or internal API, or (6) contains more than 1 conditional branching statement (`if/else`, `switch`, ternary). Every non-trivial slice requires at least one automated unit or integration test before being marked Done.
- **No dead code.** Delete unused code after every iteration.
- **Clear naming.** Self-explanatory even at high speed.
- **Comments explain why, not what.**
- **No secrets in code.** No tokens, passwords, or keys in source, docs, or screenshots. `.env.example` with placeholder names only.
- **Env var synchronization.** Whenever code reads a new environment variable, update `.env.example` in the same cycle with a placeholder and one-line purpose.
- **No silent destructive actions.** Delete, migration, overwrite, payment, email, external side effect: dry-run, backup, or ask first.
- **Data reset path documented** in `README.md` for anything with seeded local data.

### Security floor

**Authentication (any tier with accounts):**
- No plaintext or reversible password storage. Use framework or library defaults for hashing (bcrypt/argon2), not a hand-rolled scheme.
- No client-only auth for anything deployed. Protect server routes, API handlers, and server actions, not only UI navigation.
- Secure session framework defaults: `httpOnly: true`, `secure: true` (in production), `sameSite: 'lax'` (or `'strict'`), explicit session expiration: access token max 15 minutes, idle session timeout max 30 minutes, refresh token max 7 days with automatic refresh token rotation.
- Rate limit authentication endpoints (login, signup, password reset, OTP).
- Do not log tokens, passwords, session IDs, or personal data.

**Authorization (the rule most often missed in vibe-coded apps):**
- **Every read, update, and delete of user-scoped records verifies server-side that the requester owns it or has a role that permits it.** Scoping by ID in the URL alone is an IDOR bug, and it is the most common vulnerability in AI-built CRUD apps.
- Enforce ownership in the query (`where id = ? AND user_id = ?`), not by a check the client can skip.
- **One negative test is mandatory before any slice carrying auth is marked Done:** user A cannot fetch, edit, or delete user B's record. Return 404 or 403, not the record.
- Role checks live server-side. Hiding a menu item is presentation, not authorization.

**Ownership test format** (choose one, record in SECURITY.md):

1. **Integration test (preferred):**
   ```typescript
   test('cross-user access denied', async () => {
     const userA = await createUser('userA@test.com');
     const userB = await createUser('userB@test.com');
     const postB = await createPost(userB.id, 'private post');
     
     const tokenA = await getAuthToken(userA.id);
     const response = await fetch(`/api/posts/${postB.id}`, {
       headers: { Authorization: `Bearer ${tokenA}` }
     });
     
     expect(response.status).toBe(403); // or 404
     expect(await response.json()).not.toContain('private post');
   });
   ```
   Record in SECURITY.md: `Ownership test: integration test in tests/auth/cross-user.test.ts, last pass 2026-09-22`

2. **Manual verification (when test framework unavailable):**
   ```bash
   # Recorded in SECURITY.md
   curl -H "Authorization: Bearer $USER_A_TOKEN" \
        http://localhost:3000/api/posts/$USER_B_POST_ID
   # Expected: 403 Forbidden or 404 Not Found
   # Actual (2026-09-22): 403 Forbidden, body: {"error":"Forbidden"}
   ```
   Record in SECURITY.md: `Ownership test: manual curl verification, last pass 2026-09-22, command in VERIFY.md`

3. **E2E test (for UI-heavy apps):**
   ```typescript
   test('profile page shows 404 for other users', async ({ page }) => {
     await page.goto('/login');
     await page.fill('[name=email]', 'userA@test.com');
     await page.fill('[name=password]', 'password');
     await page.click('button[type=submit]');
     
     // Navigate to userB's profile URL
     await page.goto('/profile/user-b-id');
     
     await expect(page.locator('text=Not Found')).toBeVisible();
     await expect(page.locator('text=private email')).not.toBeVisible();
   });
   ```
   Record in SECURITY.md: `Ownership test: E2E test in tests/e2e/profile-access.spec.ts, last pass 2026-09-22`

**Recording requirement:** Every auth-protected feature must have its ownership test recorded in SECURITY.md with format, location, and last pass date. Re-run after any auth or query change.

**Web vulnerability floor:**
- Parameterized query or ORM. Do not string-concatenate SQL.
- CSRF protection on every state-changing route that uses cookie auth (framework default is enough).
- Explicit CORS allowlist. No `*` with credentials.
- Validate and limit uploads: allowed MIME type, size limit, generated filename, stored outside the web root or in object storage. Do not trust only client-supplied filename or content type.
- Do not render user input as raw HTML (`dangerouslySetInnerHTML`, `v-html`, `innerHTML`) without a sanitizer.
- Validate at the trust boundary with schema, server-side, even when the client also validates.
- Do not expose stack trace, query text, or internal ID in error responses.

**Supply chain:** commit lockfile, install the exact name verified in Recon, run the ecosystem audit command once before the first push (`npm audit`, `pip-audit`), and do not add packages that are unmaintained, have near-zero downloads, or have names suspiciously similar to popular packages.

**Demo data and seed route:**
- Demo credentials, seed scripts, and reset endpoints are local-only. They must not exist in deployed builds: remove the route, not only the button.
- **Hidden-control trap:** Product Finish Gate says to hide dev controls from the primary surface. Hiding the reset button while `/api/seed` stays live and unauthenticated is strictly worse than showing it, because the affordance is now invisible to the user and visible to everyone else. Hiding UI is a finish task. Removing or auth-gating the route is a security task. Do both, and do not substitute the first for the second.

**Secret:** see Leaked Secret Protocol in Version Control. Rotate first, always.

### Accessibility floor (web UI)

Keyboard-reachable controls, visible `:focus-visible` styling using `--color-focus-ring`, labels connected to inputs, semantic buttons and links (not clickable divs), alt text or explicit empty alt on images, contrast at the numeric target in Design Bootstrap, and no information conveyed by color alone.

**Verification, not aspiration:** before Product Finish Gate, run one automated a11y check (`axe` CLI, Lighthouse a11y, `eslint-plugin-jsx-a11y`, or stack equivalent) **and** one keyboard-only pass through the critical path: tab to every control, operate it, confirm focus is always visible and never trapped.

**For WCAG 2.1 Level AA full compliance** (government/education/enterprise projects or when COMP1–COMP2 Compliance mentions accessibility), see `references/frontend/ACCESSIBILITY_WCAG_GUIDE.md` for the complete checklist, screen reader testing, and CI integration.

### UI state and responsiveness

Empty, loading, and error states for any data UI that the user can encounter in normal use. Check one narrow viewport and one desktop viewport before the layout is considered done.

### Product Finish Gate (project UI)

Before showing a UI slice as complete, make it feel like a product, not a scaffold.

**Primary surface:** no dev or demo controls (Reset demo, Load sample data, Mock AI, seed button, debug label) in the header, footer, sidebar, empty state, modal, or main UI. Move them to README or a dev-only command. Pair with the security rule above: hide the control **and** remove or auth-gate its route.

**Lifecycle completeness:** data objects shown in the UI have the lifecycle expected for this slice: create, view, update/move/edit, delete/archive. Operations intentionally absent are the remaining 20% and go into `TASKS.md`, not into "done".

**Product-specific visual hook (mandatory, tracked):** every UI project carries one named hook in `TASKS.md` from the start: streak rhythm, timeline, board density, status system, progress ring, domain illustration, distinctive empty state. Without it, the output is a clean CRUD list with no identity. Because it lives in the task file, it cannot evaporate under time pressure.

**Honest AI labels:** if behavior is mocked, local, deterministic, or heuristic, name it as "suggested steps" or "breakdown assistant". Do not imply a real model. Output must still be useful: derive subtasks from the actual card title and description, include acceptance criteria or next action, and avoid generic filler like "research, implement, test" in every card. Register the mock in `TECHNICAL_DEBT.md` in the same cycle.

**Product detail surface:** consistent icon set, meaningful empty state that says what to do next, product-specific status badges, card actions, and hover/focus/active/disabled states on every interactive element. Forms and placeholders read like product copy, not scaffold labels.

### Anti-Slop Defaults

Built-in minimum rules. For full coverage, load `antislop` and companions (`antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `antislop-code`).

**Visual (UI):**
- No blue-purple, blue-cyan, or purple-pink gradients as the default palette. Colors come from product identity or `DESIGN.md`. Gradient is a hierarchy tool, not a default.
- No decoration without purpose: sparkles, floating orbs, dot-grid backgrounds, glow on everything, glass on every surface. If you cannot name its function, delete the effect.
- No dark mode by default "because it looks tech". Choose from audience and brand. If there is no strong reason, ship light or build a real toggle with full token parity.
- No uniform pill-shape on everything. Two or three radius values, applied deliberately.
- No template landing page sequence (hero → features → testimonial → pricing → CTA → footer) unless the content truly needs it.
- Inspect the rendered result and produce the visual evidence requested in Show and Checkpoint. If it looks like every AI-generated SaaS page, it is slop: change palette, density, typography, rhythm, empty state, and primary action until the result is specific to this product.

**Copy (all projects):**
- No fabricated statistics, fake testimonials, invented user counts, or unearned superlatives.
- Avoid em dash in generated text. Use comma, semicolon, or two sentences.
- No emoji bullets in docs or UI copy.
- No marketing buzzword as placeholder content.
- **No internal metadata in user-facing content.** Do not expose tier labels, scoring, skill names, or agent decision metadata in README, UI, or docs.
- **UI copy matches how a real product talks.** No machine-translation formality ("Muat Ulang Data Contoh" → "Reset Data"). Study how category leaders label buttons and states. Use the shortest natural phrase real users recognize.
- **Localization:** use the UI language requested by the user, not necessarily the conversation language. If many languages are needed, centralize user-facing strings before the UI grows beyond one screen. Do not invent translations for domain, legal, or financial copy; ask or mark as draft.

**Code (all projects):**
- No comments that repeat the code (`// increment counter`).
- No over-abstraction: no interface with one implementation, no factory for one product, no config for a value that never changes, no wrapper that only delegates.
- No decorative organization: no ASCII box headers, no emoji in comments, no `// =====` separators.

### Skill Routing

**Boundary rule for this section.** Content stays inline in this skill only when it is a fixed check, universally applicable, under roughly 15 lines, and has no judgment call: a ban, not a decision. Anything that needs reference examples, judgment trade-offs, or scales with project depth is a specialist skill, loaded at the trigger point below, never inlined here. This is why floors elsewhere in this document (Security floor, Data integrity floor, Anti-Slop Defaults) stay short and mostly say "do not do X"; the positive and reference-heavy counterpart of each lives in a specialist skill.

**Graceful degradation, all entries below:** if the named skill is unavailable in this environment, the inline floor elsewhere in this document applies. A missing specialist skill lowers depth, never removes a requirement.

**Recon (Phase 1):**
- `codebase-design` when working in an existing codebase with module boundaries that must be respected.
- **Required load attempt for UI projects:** `ui-ux-pro-max` for any project with visible UI and no design system yet. **If unavailable:** Design Bootstrap minimum + Anti-Slop Defaults still enforced. State to user: *"UI design skill unavailable — using built-in floor only. Visual quality will be reduced."*
- `architecture-patterns` or `software-architecture-design` when the project has 2+ related entities, any relational query beyond a single table, or a persistence-ladder move to SQLite/Postgres. Covers schema design, indexing, event-driven vs CRUD, and sharding triggers beyond what the persistence ladder states. If unavailable, Data integrity floor and persistence ladder are the ceiling of what gets built, and that ceiling is stated to the user in one line.

**Build Loop:**
- **Required load attempt for UI projects:** `emil-design-eng` for any project with visible UI, alongside `ui-ux-pro-max`, not replacing it. **If unavailable:** Design Bootstrap minimum and interaction-state requirement still apply. Does not block build.
- **Required load attempt:** `antislop` alongside the design skill above, for code, copy, and product scope, not only visuals. `antislop` is the positive counterpart to Anti-Slop Defaults: Anti-Slop Defaults say what must be removed, `antislop` and its companions (`antislop-ui`, `antislop-code`, `antislop-copywriting`) provide the reference library for what to choose between two options that are each defensible, including what stays out of scope even if requested. **If unavailable:** Anti-Slop Defaults are the ceiling; do not try to substitute personal judgment for a missing reference library, prefer the plainer option.
- `tdd`, or a specific test-driven-development discipline bundled in a more complete methodology skill when installed (RED before GREEN, no production code without a failing test first, no hollow mock replacing the thing under test), for non-trivial behavior: persistence, transformation, public API, bug fix. This is a discipline substitution, not ceremony: it replaces what "run the fastest check" means for the current task, and does not import the full workflow skill into a Small-tier project.
- `diagnosing-bugs`, or systematic-debugging discipline when available (reproduce reliably and find the actual root cause before patching, check the same root cause elsewhere, state the fix as a hypothesis and confirm before touching code, then implement), when a failure survives one fix attempt or blocks runnability. Same rule as above: borrow the discipline, not its ceremony, for anything below Medium.
- `performance-optimization` when performance is a stated requirement or a flow feels slow. Measure first. See `references/devops/PERFORMANCE_ENGINEERING_GUIDE.md` for load testing, capacity planning, and profiling workflow.
- `pick-ui-library` on request only.
- `prototype` when the user wants divergent visual options. Do not auto-load.
- `security-review` when Mandatory Rule 10 graduates a slice that involves payments, regulated data, or multi-role auth, or at tier Large once auth design starts. Covers threat modeling, framework-specific auth patterns, and compliance mapping beyond Security floor. Security floor is never optional even when this skill runs; this skill adds depth, it does not replace the floor.
- `performance-optimization` when a refactor trigger happens (third duplication, oversized file, three consecutive edits in the same file) or when continuing a session with 3+ open `TECHNICAL_DEBT.md` entries. Decides what gets paid down now versus queued; `TECHNICAL_DEBT.md` remains the record either way. If unavailable, apply the refactor trigger rules from Build Loop directly and record the decision in `TECHNICAL_DEBT.md`.

**Documentation (Phase 4b):**
- `writing-for-agents` before creating `AGENTS.md`, `CONTEXT.md`, or continuation docs.
- `domain-modeling` for Large projects that need a glossary.

**Before shipping:**
- `git-master` before commit, push, branch, remote, or repo operations.
- `code-review` for Medium projects with auth, persistence, API, or security concern, and all Large projects.
- `research` for unfamiliar APIs, compliance facts, or vendor decisions, only when the answer is not locally available.

**Deployment Flow, Large only:**
- `devops-cicd` when the deploy target needs real CI/CD design, observability, or incident-response paths beyond the built-in Deployment Flow minimal CI workflow. `git-master` owns commit and branch mechanics; this skill owns pipelines and runbooks.

---
