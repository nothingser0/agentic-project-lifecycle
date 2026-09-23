# Design System Governance Guide

**Purpose:** Manage design token versioning, component library approval, and design-to-code handoff workflow.

**When to use:** Medium+ projects with UI, especially multi-team or long-lived products.

---

## Design System Versioning

### Semantic Versioning for Design Tokens

**Apply semver to design tokens:**

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1: Patch (fix contrast ratio bug, no visual change)
1.0.0 → 1.1.0: Minor (add new token --color-info, backward compatible)
1.0.0 → 2.0.0: Major (rename --color-primary to --color-brand, breaking)
```

**Breaking changes:**

- Token renamed or removed
- Token value changes significantly (e.g., `--radius-md` from `4px` to `8px`)
- Color contrast drops below WCAG AA

**Non-breaking changes:**

- Add new token
- Fix bug (e.g., wrong hex value)
- Improve contrast (e.g., `#666` → `#555` for better readability)

### Token Changelog

**Create `DESIGN_CHANGELOG.md`:**

```markdown
# Design System Changelog

All notable changes to design tokens and components.

## [2.0.0] - 2026-09-22

### BREAKING CHANGES

- Renamed `--color-primary` → `--color-brand` (update all components)
- Increased `--radius-md` from `4px` → `8px` (affects 50+ components)

### Migration Guide

```bash
# Find and replace
find src -type f -name "*.tsx" -exec sed -i 's/--color-primary/--color-brand/g' {} +
```

### Added

- `--color-info` for informational alerts
- `--space-0` (0px) for utility resets

### Fixed

- `--color-text-muted` contrast ratio 3.8:1 → 4.6:1 (WCAG AA compliant)

---

## [1.1.0] - 2026-09-15

### Added

- `--shadow-xl` for elevated modals
- `--font-family-mono` for code blocks

### Changed

- `--space-4` from `16px` → `1rem` (responsive scaling)

---

## [1.0.0] - 2026-09-01

Initial release.
```

### Token Migration Script

**Automate breaking changes:**

```bash
#!/bin/bash
# migrate-v1-to-v2.sh

echo "Migrating design tokens from v1 to v2..."

# Rename tokens
find src -type f \( -name "*.tsx" -o -name "*.css" \) -exec sed -i '' \
  -e 's/var(--color-primary)/var(--color-brand)/g' \
  -e 's/bg-primary/bg-brand/g' \
  -e 's/text-primary/text-brand/g' \
  {} +

# Update imports
find src -type f -name "*.tsx" -exec sed -i '' \
  's/import.*tokens\.v1/import { tokens } from "@/design-tokens.v2"/g' \
  {} +

echo "Migration complete. Run 'npm run lint' to verify."
```

---

## Component Library Governance

### Component Approval Process

**Decision matrix:**

| Question | Yes → | No → |
|----------|-------|------|
| Does this variant already exist? | Use existing variant | Continue |
| Can this be achieved with props? | Add prop, don't create new component | Continue |
| Is this used in 3+ places? | Create component | Inline implementation |
| Does this follow token system? | Approve | Reject, refactor first |

**Approval authority:**

| Project Tier | Approver |
|--------------|----------|
| **Small** | Solo dev decides |
| **Medium** | Senior dev or design lead |
| **Large** | Design system working group (2+ designers, 2+ devs) |
| **Enterprise** | Design system council (monthly review) |

### Component Lifecycle

```
Proposed → Draft → Beta → Stable → Deprecated → Removed
```

**Status definitions:**

- **Proposed:** RFC opened, not coded yet
- **Draft:** Implementation in progress, API unstable
- **Beta:** API frozen, gathering feedback (mark with `@beta` JSDoc)
- **Stable:** Production-ready, semver applies
- **Deprecated:** Marked for removal, use alternative (show console warning)
- **Removed:** Deleted from codebase (major version bump)

**Example (Button deprecation):**

```typescript
import { logger } from '@/lib/logger';

/**
 * @deprecated Use <Button variant="primary"> instead. Will be removed in v3.0.
 */
export function PrimaryButton(props: ButtonProps) {
  if (process.env.NODE_ENV === 'development') {
    logger.warn('PrimaryButton is deprecated. Use <Button variant="primary"> instead.');
  }
  
  return <Button {...props} variant="primary" />;
}
```

### Component Documentation Template

**Create `components/Button/Button.mdx`:**

```mdx
# Button

**Status:** Stable  
**Since:** v1.0  
**Owner:** @design-team

## Usage

```tsx
import { Button } from '@/components/Button';

<Button variant="primary" size="md">Click me</Button>
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state (shows spinner) |
| `onClick` | `() => void` | - | Click handler |

## Variants

### Primary

High-emphasis actions (submit forms, primary CTA).

```tsx
<Button variant="primary">Submit</Button>
```

### Secondary

Medium-emphasis actions (cancel, secondary CTA).

```tsx
<Button variant="secondary">Cancel</Button>
```

### Ghost

Low-emphasis actions (dismiss, tertiary CTA).

```tsx
<Button variant="ghost">Dismiss</Button>
```

## Accessibility

- Focus visible on keyboard navigation
- ARIA label required if no text children:
  ```tsx
  <Button aria-label="Close dialog"><XIcon /></Button>
  ```
- Disabled state announced to screen readers

## Design Tokens Used

- `--color-brand` (primary background)
- `--color-on-brand` (primary text)
- `--radius-md` (border radius)
- `--space-3` (horizontal padding)
- `--space-2` (vertical padding)

## Migration from v1

v1 had separate `PrimaryButton`, `SecondaryButton` components:

```diff
- <PrimaryButton>Submit</PrimaryButton>
+ <Button variant="primary">Submit</Button>
```
```

---

## Figma to Code Handoff

### Design File Structure

**Figma organization (Large+ projects):**

```
Project/
├── 00-Tokens (color, typography, spacing styles)
├── 01-Foundations (icons, illustrations, brand assets)
├── 02-Components (button, input, card, etc.)
├── 03-Patterns (form layouts, navigation, modals)
├── 04-Screens (actual designs per feature)
└── 99-Archive (deprecated designs)
```

### Handoff Checklist

**Designer checklist before handoff:**

- [ ] All components use styles (not local overrides)
- [ ] Text uses defined text styles (not arbitrary font sizes)
- [ ] Colors use defined color styles (not hex values)
- [ ] Spacing uses 4px/8px grid (enable "Snap to pixel grid")
- [ ] All interactive elements have hover/focus/disabled states
- [ ] Responsive breakpoints defined (375px, 768px, 1024px)
- [ ] Design handoff annotations added (measurements, behaviors)
- [ ] Dev Mode enabled (Figma Pro required)

**Developer checklist when receiving design:**

- [ ] Inspect design in Figma Dev Mode (not manual measurement)
- [ ] Extract tokens (color, spacing, typography) first
- [ ] Build components bottom-up (atoms → molecules → organisms)
- [ ] Match token names (Figma `Primary/500` → CSS `--color-brand`)
- [ ] Test all states (hover, focus, active, disabled, loading, error)
- [ ] Verify responsive behavior at breakpoints
- [ ] Screenshot actual implementation, compare with Figma side-by-side

### Figma Dev Mode Workflow

**Enable Dev Mode (Figma):**

1. Open design file
2. Click "Dev Mode" toggle (top-right)
3. Select component → Inspect panel shows:
   - CSS code (copy-paste)
   - Spacing measurements
   - Color values
   - Typography styles

**Token mapping (before coding):**

| Figma Style | CSS Token | Tailwind Utility |
|-------------|-----------|------------------|
| `Primary/500` | `--color-brand` | `bg-brand` |
| `Text/Body` | `--text-base` | `text-base` |
| `Spacing/4` | `--space-4` | `p-4` |
| `Radius/Medium` | `--radius-md` | `rounded-md` |

**Automated token sync (optional, requires plugin):**

Plugins:
- **Figma Tokens** (free) — Sync tokens to JSON, commit to repo
- **Style Dictionary** (CLI) — Transform tokens to CSS/SCSS/JS

**Setup (Figma Tokens + Style Dictionary):**

1. Install Figma Tokens plugin
2. Export tokens to `tokens.json`
3. Commit to repo: `design-tokens/tokens.json`
4. Transform with Style Dictionary:

```bash
npm install --save-dev style-dictionary
```

**Config (`style-dictionary.config.js`):**

```javascript
module.exports = {
  source: ['design-tokens/tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
        },
      ],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'src/',
      files: [
        {
          destination: 'design-tokens.ts',
          format: 'javascript/es6',
        },
      ],
    },
  },
};
```

```bash
npx style-dictionary build
# Generates:
# src/styles/tokens.css
# src/design-tokens.ts
```

### Component Props Mapping

**Map Figma variants to component props:**

| Figma Component | Figma Variant Property | React Prop | Type |
|-----------------|------------------------|------------|------|
| Button | `Variant` (Primary, Secondary, Ghost) | `variant` | `'primary' \| 'secondary' \| 'ghost'` |
| Button | `Size` (Small, Medium, Large) | `size` | `'sm' \| 'md' \| 'lg'` |
| Button | `State` (Default, Hover, Disabled) | `disabled` | `boolean` |
| Input | `State` (Empty, Filled, Error, Disabled) | `error`, `disabled` | `boolean`, `boolean` |

**Example (auto-generate from Figma):**

Figma API → extract component variants → generate TypeScript types:

```typescript
// Auto-generated from Figma
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

---

## Automated Design Token Drift Prevention (CI Gate)

Do not rely on code reviewers to spot hardcoded hex values or arbitrary spacing. Enforce design tokens at `gate:pr` using automated linter rules that fail CI when arbitrary values are introduced.

### 1. Tailwind Arbitrary Value Blocker (ESLint)

Install `eslint-plugin-tailwindcss`:
```bash
npm install -D eslint-plugin-tailwindcss
```

Configure `.eslintrc.json`:
```json
{
  "plugins": ["tailwindcss"],
  "rules": {
    "tailwindcss/no-arbitrary-value": "error",
    "tailwindcss/no-custom-classname": "error"
  }
}
```
*Effect:* Rejects arbitrary CSS classes like `bg-[#1a2b3c]` or `p-[17px]` directly in CI. Developers and agents are forced to use configured tokens like `bg-brand` or `p-4`.

### 2. Strict CSS Variable Enforcement (Stylelint)

For raw CSS / SCSS / CSS Modules, install `stylelint-declaration-strict-value`:
```bash
npm install -D stylelint stylelint-declaration-strict-value
```

Configure `.stylelintrc.json`:
```json
{
  "plugins": ["stylelint-declaration-strict-value"],
  "rules": {
    "scale-unlimited/declaration-strict-value": [
      ["/color$/", "font-size", "border-radius", "/margin/", "/padding/"],
      {
        "ignoreValues": ["transparent", "inherit", "unset", "0", "auto"],
        "message": "Direct values not allowed for ${property}. Use a CSS token variable (e.g. var(--color-brand))"
      }
    ]
  }
}
```

### 3. CI Gate Integration

Add to `VERIFY.md` under `gate:fast`:
```bash
# Must pass before merge
npm run lint:tokens # runs: eslint . && stylelint "**/*.css"
```

---

## Design QA Workflow

### Visual Regression Testing

**Tools:**

| Tool | Best For | Setup |
|------|----------|-------|
| **Chromatic** (Storybook) | Component libraries | `npm install --save-dev chromatic` |
| **Percy** | Full pages | `npm install --save-dev @percy/cli` |
| **Playwright** (screenshots) | E2E tests | `await page.screenshot()` |
| **BackstopJS** | Self-hosted | `npm install -g backstopjs` |

**Chromatic setup (Storybook):**

```bash
npm install --save-dev chromatic storybook
npx storybook@latest init

# Build Storybook
npm run build-storybook

# Run Chromatic
npx chromatic --project-token=<token>
```

**Result:** Visual diff for every component, flags unintended changes.

**Percy setup (Cypress E2E):**

```bash
npm install --save-dev @percy/cli @percy/cypress
```

**Test (`cypress/e2e/homepage.cy.ts`):**

```typescript
import '@percy/cypress';

describe('Homepage', () => {
  it('renders correctly', () => {
    cy.visit('/');
    cy.percySnapshot('Homepage');
  });
  
  it('renders dark mode', () => {
    cy.visit('/');
    cy.get('[data-theme-toggle]').click();
    cy.percySnapshot('Homepage - Dark Mode');
  });
});
```

```bash
npx percy exec -- cypress run
```

### Design Review Gate

**Before merging UI PR (Medium+ projects):**

1. Developer: Deploy preview (Vercel/Netlify preview URL)
2. Developer: Screenshot actual vs. Figma, attach to PR
3. Designer: Review preview URL, compare with Figma
4. Designer: Check:
   - [ ] Visual match (color, spacing, typography)
   - [ ] All states implemented (hover, focus, disabled, loading, error)
   - [ ] Responsive behavior at 375px, 768px, 1024px
   - [ ] Animations/transitions smooth (not jarring)
   - [ ] Accessibility (contrast, focus visible, keyboard nav)
5. Designer: Approve or request changes

**Label PRs: `needs-design-review`**

GitHub Action (block merge until label removed):

```yaml
# .github/workflows/design-review.yml
name: Design Review Gate

on:
  pull_request:
    types: [opened, synchronize, labeled, unlabeled]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check design review label
        if: contains(github.event.pull_request.labels.*.name, 'needs-design-review')
        run: |
          echo "❌ Design review required. Remove 'needs-design-review' label after approval."
          exit 1
```

---

## Common Design Debt Patterns

### Pattern 1: Raw Values in Components

**Smell:**

```tsx
// ❌ Magic values
<div style={{ padding: '16px', borderRadius: '8px', color: '#3b82f6' }}>
```

**Fix:**

```tsx
// ✅ Design tokens
<div className="p-4 rounded-md text-brand">
// Or:
<div style={{
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-brand)'
}}>
```

### Pattern 2: Inconsistent Component Naming

**Smell:**

```
components/
├── PrimaryButton.tsx
├── ButtonSecondary.tsx
├── ghost-button.tsx
```

**Fix:**

```
components/
└── Button/
    ├── Button.tsx (single component with variants)
    ├── Button.stories.tsx
    └── Button.test.tsx
```

### Pattern 3: Duplicate Components

**Smell:**

```
<ModalDialog>
<PopupModal>
<DialogBox>
// All do the same thing
```

**Fix:**

Audit components quarterly:

```bash
# Find similar component names
find src/components -type f -name "*.tsx" | xargs basename -s .tsx | sort | uniq -c | sort -rn
```

Consolidate into one `Dialog` component with variants.

---

## Integration with Project Lifecycle

**Update `modules/03a-build-foundations.md` Design Bootstrap:**

```markdown
### Design Bootstrap (UI projects only, HARD GATE)

**Do not write the first UI component before this is complete.**

1. Choose references
2. Create `DESIGN.md` with token set
3. **Create `DESIGN_CHANGELOG.md` (Medium+ projects)** ← NEW
4. **Define component approval process (Large+ projects)** ← NEW
5. Establish token bridge mechanism
6. Verify contrast ratios (4.5:1 text, 3:1 UI)
7. Establish Figma handoff workflow (if designer involved)

**For Large+ projects with designer:**
- Q: "Is Figma Dev Mode enabled?"
- Q: "Who approves new components?"
- Document token mapping (Figma style → CSS variable → Tailwind class)
```

**Update `references/frontend/DESIGN_VALIDATION_GUIDE.md`:**

```markdown
## Design System Compliance Check

**Before sprint demo:**

- [ ] All colors from design tokens (no hardcoded hex)
- [ ] All spacing from design tokens (no magic pixel values)
- [ ] All components match Figma (screenshot comparison)
- [ ] Design changelog updated (if token changes)
- [ ] Visual regression tests passing (if Chromatic/Percy setup)
```

---

**Agent instruction:**

For Medium+ projects with UI:

1. Create `DESIGN_CHANGELOG.md` from first token commit
2. Version design tokens with semver (breaking changes = major bump)
3. Document component approval process in `DESIGN.md`
4. Set up Figma Dev Mode workflow (if designer exists)
5. Create component documentation template (API, variants, a11y)
6. Add visual regression testing (Chromatic/Percy) for Large+ projects
7. Require design review approval before merging UI PRs

Do not allow raw color/spacing values in components — enforce token usage via linting.
