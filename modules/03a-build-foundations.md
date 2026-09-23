# Module 03a — Build: Foundations & Setup

**Contains:** Rule 0 (Intent Echo), Discovery Depth, Complexity Tier reference, Small Fast Path, Operating Posture, Role Framing & Deliberate Reasoning, Mandatory Rules, Permission Table, Pre-Project phases (Recon, Domain Grounding, Milestone Sequence, Design Bootstrap, Bootstrap Minimum).

**When to read:** Always — start here after the gate check in `03-build-router.md`.

---

## Rule 0: Intent Echo (ALL TIERS, MANDATORY)

**Before writing the first file for a new build target, state one line to the user:**

> Building: [user's own words]. Core: [one feature that makes it that thing]. Not building: [closest thing you are deliberately excluding].

Use the user's vocabulary, not your paraphrase. If they say "kanban board", that line says kanban board, not "task manager". This is not optional in the Small tier, cannot be skipped because the target looks obvious, and does not wait for approval. State it and continue building. If the user corrects the noun, retarget before scaffolding.

Repeat the echo after a pivot, every Medium or Large scope addition, and at the start of a resumed session.

**Why:** the most expensive failure mode in vibe coding is building a product that is similar but wrong. Every other guardrail in this document assumes the right thing is being built.

---


## Discovery Depth

Default: no interview. Rule 0 echo plus domain-derived content rules are enough for most projects, and a working artifact is a cheaper question than any question you could ask.

Open limited discovery only when one of these occurs:

- The domain has vocabulary you cannot model confidently (specific commerce, regulation, or internal business process).
- The product has more than one type of user with different permissions.
- Money, invoicing, or inventory is involved.
- The user describes a real-world workflow they want reflected.

Rules:

- Maximum 3 questions, asked once, in one batch, as choices when possible. Not a conversation.
- Non-blocking: build the parts that are already clear while waiting. Do not let discovery delay the first runnable version.
- Ask only about product behavior and domain facts. Do not ask about stack, libraries, or implementation.
- Answers go into `CONTEXT.md` and seed data, not requirements documents.

If three questions are not enough, the project is not ambiguous — the project is Large. Classify and route the unclear slice to `spec-driven-development`.

---

## Complexity Tier

The tier was already determined in `00-classifier.md`. Use the tier from `CONTEXT.md`. Do not classify again here unless there is a major scope addition — if there is, round up and record it in CONTEXT.md.


## Small Fast Path

Only after classifier confirms Small. **Planning is always skipped for Small tier (per `engine/PROJECT-PROFILE.md`).** Deliver the Rule 0 intent echo, complete the git and design hard gates, build the first runnable version, verify it runs, commit, push if a remote exists, show it. No milestone sequence, no TASKS.md, no docs scaffolding, no closing ceremony except cleanup, verify, and a one-line handoff. Track state mentally.

Still applies in Small: Rule 0, Operating Posture, Mandatory Rules, Permission Table, Version Control, Design Bootstrap for UI, Build Loop including regression rule, Quality Floor, Product Finish Gate for UI, Anti-Slop Defaults.

---

## Operating Posture

**Bias: action over discussion.** Humans choose vibe coding because they want results, not requirements meetings. Every question you ask is a speed bump; make sure it is useful or skip it.

- Use what the project already has. If starting from zero, choose the smallest boring stack that can produce a runnable artifact. Add libraries only when they clearly reduce risk or implementation time.
- Ship a working increment. Humans evaluate by using, not reading. A working feature that is half-styled beats a perfectly planned feature that has not been built.
- Absorb ambiguity. "Make it good" means apply a coherent visual direction. State your choice in one line; do not ask.
- Keep the artifact runnable at all times. Save a working checkpoint before risky changes and restore runnability before showing or accepting feedback.
- Use labeled placeholders or product-specific draft copy, never lorem ipsum or fabricated claims.
- Do not reread files or context that have not changed since the last read in the same session.

## Role Framing & Deliberate Reasoning

Two techniques a human would normally apply *to you* through prompting also work applied to yourself, unprompted — do not wait for the user to ask for them.

- **Adopt a role for non-trivial judgment calls.** Before a decision with real trade-offs — security posture, a data model shape, an architecture choice with maintenance cost — briefly frame it from the relevant seat: "as a security reviewer, does this route leak data on error?", "as whoever maintains this in six months, is this still readable?" Let the framing change the answer; do not narrate it to the user.
- **Reason before acting on anything hard.** For a decision with more than one defensible option, or a bug that survived one fix attempt, think through the options and trade-offs before writing code, not after. Reversible, low-stakes calls (color, copy, spacing) skip this — that's what "Decide silently" in the Permission Table already covers. For a material decision, this becomes a Decision Record per `engine/DECISION-RULES.md` (options considered, not just the pick); for an ordinary build-loop decision, one line stating the choice and why, per Mandatory Rule 1, is enough.
- **Do not fake deliberation.** A role or a reasoning pass that would not change the outcome is theater, not rigor. If you already know the answer, state it and move; save both for calls that are actually contested.

## Mandatory Rules

1. **Do not ask technical questions the user does not need to care about.** "PostgreSQL or SQLite?" is valid if it affects their deployment. "Use `useMemo` here?" is not. Decide and continue. Ask only about product behavior, taste, constraints, or irreversible cost.
2. **Show, do not spec.** Build directly. The loop is: build, show, react, adjust. For API/library/CLI, "show" means a runnable example (curl, import snippet, command), not a written spec.
3. **Working beats perfect.** Ship the 80% solution. Record the remaining 20% as a `TASKS.md` entry (Medium+) or named line in the handoff (Small). Do not leave it only as a passing chat comment.
4. **Do not silently break what already works.** The mechanism is the Regression Rule in the Build Loop, not good intentions.
5. **Default taste is your responsibility.** No unstyled HTML. No leftover `color: red`. Reference design language from leading products in the same category. Set the visual direction before the first component. The floor is "someone would want to show this to another person." The target is "this looks like a real product."
6. **Match ceremony to complexity.** Do not apply enterprise ceremony to a landing page, do not cowboy a multi-role system. If a tier's ceremony does not fit the session budget, that is a signal to route the slice to `spec-driven-development`, not a reason to generate the paperwork anyway.
7. **Build before docs.** No documentation scaffolding before the first runnable result, unless the result cannot run without it (example `prisma/schema.prisma`). `DESIGN.md`, `.gitignore`, `.env.example`, and `VERIFY.md` are build prerequisites, not documentation.
8. **Do not polish a broken flow.** Fix runnability and the critical path before styling, refactor, or docs.
9. **The Permission Table governs every decision** (below). There is no "continue unless you object" path for anything irreversible.
10. **Graduation trigger.** Real customers, real payments, regulated data, real personal data, public launch, uptime SLA, production data migration, or strict acceptance criteria: "This slice has graduated from vibe coding. I can still vibe the UI and non-critical scaffolding, but [slice] needs spec-driven-development." See Spec Escalation Protocol.

## Permission Table

Only two levels. Nothing in between.

| Level | Applies to | Behavior |
|---|---|---|
| **Decide silently** | Reversible, low-coupling: colors, layout, font, component style, local copy, icons, spacing, minor interactions, internal file structure, stdlib helper choices | Choose well, state it in one line afterward, continue building |
| **Stop and wait** | Irreversible, expensive, high-coupling, or externally visible: paid services or anything with billing, production deployment, public repository, auth model for a deployed app, database schema shape after data exists, destructive migration or data deletion, public API shape, payments, regulated or real personal data, irreversible external side effects (email, webhook, third-party writes) | Ask one precise question, then wait for the actual answer before acting |

For high-coupling choices that are still cheap to reverse **before data or consumers exist** (component architecture, ORM choice, state library, local vs multi-user model, real API vs local heuristic), state the recommendation and continue in the same turn: "Use X because Y." This is a statement, not a consent request. Once data exists or consumers depend on it, the same decision moves to Stop and wait.

Async agents must not write "continue unless you object" and then continue in the same turn. That accomplishes nothing.

---

## Pre-Project

### Build Step 1: Recon

Scan the terrain before building. Even a Small project needs 30 seconds: empty directory or existing project? What is the run command?

| State | Action |
|---|---|
| Empty directory | Choose a stack. Scaffold from zero. |
| Manifest exists (`package.json`, `go.mod`, `composer.json`) | Detect the stack from config. Use what exists. |
| Existing codebase with code | Read structure, conventions, patterns. Run the existing test/build first. Identify the ownership boundary. Build within the existing pattern, smallest diff. Preserve migrations, schema, config. Do not overwrite user-created files without checking their contents. |
| Screenshot / Figma / design reference | Extract layout, colors, components. Target visual fidelity, not a pixel-perfect spec. |
| "Clone [app/site]" | Borrow interaction pattern and density. Do not copy protected branding, assets, or trade dress. |
| Monorepo | Identify which package is being worked on. Stay in scope. Do not modify shared packages without understanding their consumers. |

**Dangerous existing patterns:** building within the existing pattern is the default, not absolute. If the existing pattern is the bug the user asked you to fix (plaintext password, no ownership check, schema without constraints), mention it in one line and fix it inside your slice instead of replicating it. Do not silently propagate security or data-integrity defects for consistency.

**Package validation:** before adding a dependency that is not already present, verify the exact package name and current install command. Prefer existing dependencies and stdlib. Do not guess package names.

**Done when:** run command and stack constraints are known.

### Build Step 2: Domain Grounding

Rule 0 already states what is being built. This phase states what it contains.

**Core model (Medium+ with persistence or workflow):** one sentence before building deeper.

> "Modeling this as [entities] where [main workflow]."

**Domain-derived content rules (all tiers with any UI):** every user-visible enumeration, seed record, default category, status label, and empty-state line is derived from the domain and persona stated by the user, not from a generic template. A freelancer expense tracker seeds client payments, software subscriptions, equipment, and taxes. Not Food, Transport, Entertainment. Echo at least one of these derived lists in the first checkpoint so the user can correct it cheaply:

> "Seeded categories: client payments, software subscriptions, equipment, tax set-aside. Say the word if that is the wrong shape."

**Scope changes** (one rule set, referenced from Build Loop):

- Small ("also add dark mode"): absorb and build. Mention it in the next checkpoint line.
- Medium ("it also needs notifications"): state the trade-off: "Adding notifications. This pushes [X] to next session, still good?"
- Large ("it should also handle invoicing"): flag: "Invoicing is a separate system. Finish current scope first?"
- Full pivot: see Pivot Handling. Run Rule 0 again.

Nothing is absorbed invisibly. Even small additions appear in the next checkpoint ledger line.

**Done when:** core model is stated, domain content is grounded.

### Build Step 3: Milestone Sequence and Acceptance Criteria

Declare the build sequence before the first cycle. Not a Gantt chart, but a sequence with implicit dependency. For Small tier, state only the target, without a sequence.

> "Build order: (1) [most tangible part] → (2) [next part] → (3) [integration/polish]. Start with #1. Stack: [framework + main choices]. Design direction: [product reference]."

**Every milestone carries one acceptance criterion, written as a user action with the expected result:**

> (1) Board with draggable cards. Accept: drag card from To Do to Doing, reload the page, card is still in Doing.

A milestone is Done only when its acceptance criterion has actually been performed and observed, not when it compiles. "Done" is a product claim, not an engineering claim.

The sequence becomes an anchor against drift: "That is milestone #3, let me finish #1 first."

**Done when:** sequence and criteria are stated, there is no redirect.

### Design Bootstrap (UI projects only, HARD GATE)

**Do not write the first UI component before this is complete.** Build prerequisite, not documentation.

1. **Choose references.** Mention 1-2 real products in the same category (kanban → Linear, Trello). Use their density, spacing rhythm, and interaction pattern as the north star.
2. **Create `DESIGN.md`** with a token set that can express hierarchy. Minimum:

```
## Visual Direction
Reference: [product name]
Theme rationale: [why light/dark, derived from audience or brand, not "looks tech"]

## Color
--color-bg, --color-surface, --color-surface-raised
--color-border, --color-border-strong
--color-text, --color-text-muted, --color-text-subtle
--color-primary, --color-primary-hover, --color-on-primary
--color-success, --color-warning, --color-danger, --color-info
--color-focus-ring

## Type scale (minimum 4 step + line height)
--font-family, --font-family-mono
--text-xs / --text-sm / --text-base / --text-lg / --text-xl
--leading-tight / --leading-normal
--weight-normal / --weight-medium / --weight-semibold

## Space scale (minimum 6 step)
--space-1 ... --space-8   (a single spacing unit is not a scale)

## Radius (2-3 values, applied deliberately)
--radius-sm / --radius-md / --radius-lg

## Elevation
--shadow-sm / --shadow-md
--z-dropdown / --z-modal / --z-toast
```

3. **Token bridge (MANDATORY, state the mechanism):** tokens that components do not consume are decoration. State in `DESIGN.md` exactly how tokens reach components, and follow it. Choose one mechanism:

   **Option 1: Utility framework (Tailwind, UnoCSS, Windi)**
   - Write tokens into theme config as *semantic* utility classes (`bg-surface`, `text-muted`, `border-subtle`, `ring-focus`)
   - Raw palette utilities forbidden in components: no `bg-slate-900`, no `text-indigo-500`, no `rounded-full` everywhere
   - If a raw utility appears in a component, the token system failed

   **Option 2: CSS custom properties (vanilla CSS, CSS Modules, styled-components)**
   - Define tokens as CSS variables in `:root` or a base stylesheet
   - Components consume via `var(--color-surface)`, `var(--space-4)`, `var(--text-base)`
   - No literal hex, no magic pixel numbers in component files
   - Works with: plain CSS, CSS Modules, Sass, styled-components, Emotion, vanilla-extract

   **Option 3: JavaScript theme object (CSS-in-JS, framework-specific)**
   - Export tokens as JS/TS object from `design-tokens.ts`
   - Components import and reference: `color: tokens.color.surface`, `padding: tokens.space[4]`
   - Works with: styled-components, Emotion, Stitches, Panda CSS, vanilla-extract, React Native StyleSheet

   **Option 4: Framework-native theming (Vue, Svelte, etc.)**
   - Vue: CSS custom properties in `<style>` + theme provider composable
   - Svelte: CSS variables in `:global(:root)` + context API for runtime switching
   - Angular: SCSS variables + theme mixins
   - Solid: CSS variables + createContext for theme state
   - Qwik: CSS custom properties + useContext

   Any styling approach that cannot express the token set is the wrong approach for this project.
4. **Contrast is a number, not a vibe.** Body and UI text must be at least 4.5:1 against their actual background. Large text and non-text UI boundaries (input border, icon button, focus ring) must be at least 3:1. Check the actual pairs, not the palette separately.
5. **Dark mode parity:** if a toggle is built, every semantic token has values in both themes, and contrast is checked in both. Dark mode that is half-mapped is worse than no dark mode.
6. **Load design skill, adjust to what is actually being built, floor first.** A searchable style database (`ui-ux-pro-max` or similar) is a lookup table, not judgment: the same skill makes the same choices for every user who installs it, which is exactly how a style becomes the new generic. Worse, most general design skills are tuned for marketing pages, and most of what this skill builds is not a marketing page — it is a tool, dashboard, or internal app (see Artifact Types). Applying landing-page instincts (hero, big headline moment, one bold typography risk) to a settings screen or admin table produces the *wrong* kind of distinctive, not the right kind. Split by what the UI actually is:
   - **Product UI (dashboard, admin panel, SaaS app, internal tool, settings, data table) — default for most vibe-coding projects:** load a skill whose scope is specifically product/app UI, not general or marketing-first. Judge fit from what the skill description itself says; a skill that explicitly lists dashboards, admin panels, and data interfaces as targets and explicitly excludes landing pages is the right shape. The priority is correct hierarchy and density: one clear focal action per screen, consistent information density, real empty/loading/error states, not a hero moment.
   - **Marketing/brand UI (landing page, portfolio, campaign page):** load a skill whose scope is brand/creative direction — bold typography choices, named visual references, one deliberate aesthetic risk. A skill built for this purpose says so; do not use it as the default for product UI.
   - **If only one general-purpose skill is available, or the project truly mixes both** (marketing page leading to dashboard): a skill that runs in explicit brand/product mode with different rules per mode is the correct single choice compared with a skill that has one vocabulary with no differentiation for everything — check whether the available skill declares a mode split before assuming one vocabulary fits both project parts.
   - **Grounding, when available, in both cases:** a skill that reads the actual codebase or real references before choosing tokens, instead of choosing blindly from a catalog. Prefer this over a pure lookup-table skill whenever the project has an existing product, brand, or reference to ground in.
   - **Interaction feel, optional:** a skill that governs component feel and micro-interaction quality, supporting the floor rather than replacing it.
   - **Divergent options before commit, when available:** if the environment offers an interactive draft-and-pick workflow (generate multiple visual directions, choose one, then implement), prefer it over single-shot generation for Medium+ project UI — this is the mechanism behind `prototype` in Skill Routing when the user wants options, and closes the gap that text-only skills cannot: the agent never sees its own output before commit otherwise.
   - If nothing is available besides a general floor, the minimum Design Bootstrap above still applies, and interaction states (hover, focus-visible, active, disabled, loading) are still mandatory for every interactive element.
7. **Reference-ground and self-critique, not only generate.** A skill alone does not fix genericness; it only removes the worst defaults. Before the first checkpoint: mention one concrete reference (real subject from the brief, uploaded screenshot, or actual token from the existing codebase), then take a screenshot of the rendered result and check it against that reference and against the slop-tell list above. If it could pass as another AI-built product in the same category, it has not passed. This loop, not a better skill, is what actually produces distinctive output.
8. **Vet third-party skills before install.** `SKILL.md` and bundled scripts run with full agent permissions; a significant share of cataloged community skills carry security flaws, and popular names get cloned under nearly identical repository names. Read any file and script before install, prefer canonical/official sources when more than one repo claims the same name, and prefer first-party or well-known-maintainer skills for anything that runs code rather than only returning text.

If `DESIGN.md` already exists, read and follow it. If the user provides a screenshot or reference, extract tokens from it.

**Why this is a hard gate:** building components with browser defaults and styling later produces the generic look users reject. Tokens first, bridge second, components third.

### Build Step 4a: Bootstrap Minimum

Project scaffolding establishes the lifecycle control surface before application code is written. `README.md` starts as a safe stub and is upgraded with real project commands during Build Step 4b.

**Complete the Version Control hard gate first: `git init`, `.gitignore`, remote decision.**

| Tier | Files before coding |
|---|---|
| **Small** | `.gitignore`, `CONTEXT.md`, `README.md`, `VERIFY.md`, `DESIGN.md` if UI |
| **Medium** | Small set + `AGENTS.md`, `TASKS.md`, `ARCHITECTURE.md`, `docs/dev-docs/CONTEXT-MAP.md`, `.env.example`, `DESIGN.md` if UI |
| **Large** | Medium set + `OWNERSHIP.md` when multi-agent, `contracts/`, ADR directory |
| **Enterprise** | Large set + formal planning/compliance artifacts as required by the planning profile |

Do not claim Gate D is passed until the required artifacts are filled and `verify-docs` exits 0. This does not require writing production code during planning.

---
