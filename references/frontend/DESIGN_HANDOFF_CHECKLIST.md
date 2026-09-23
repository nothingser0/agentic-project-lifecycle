# Design Handoff Checklist — Designer to Engineer

**Purpose:** Ensure engineers have everything needed to implement design with zero ambiguity.

**When to use:** After Phase 4 (Design) complete, before Sprint 1 starts.

---

## Pre-Handoff (Designer Prepares)

### 1. Figma File Ready

- [ ] **All frames named clearly** (e.g., "Dashboard - Desktop", "Login - Mobile 375px")
- [ ] **Components organized** (buttons, inputs, cards in dedicated page)
- [ ] **Design system documented** (colors, typography, spacing, shadows in Figma or separate doc)
- [ ] **Variants created** for interactive states:
  - [ ] Default
  - [ ] Hover
  - [ ] Active/Pressed
  - [ ] Disabled
  - [ ] Loading
  - [ ] Error (for forms)
- [ ] **Responsive breakpoints** defined (mobile 375px, tablet 768px, desktop 1024px+)
- [ ] **Dev Mode enabled** in Figma (for CSS export)

### 2. Interactions Documented

**For each non-obvious interaction:**

- [ ] **Transition duration** (e.g., "Modal fade-in: 200ms ease-out")
- [ ] **Animation easing** (ease, ease-in-out, spring, custom cubic-bezier)
- [ ] **Micro-interactions** (hover effects, button ripple, skeleton loading)
- [ ] **Error states** (form validation, API error, empty state, 404)

**Document via:**
- Figma prototype with transitions
- OR Loom video showing interaction
- OR written spec: "On button click → Modal slides up from bottom (300ms ease-out) → Overlay fades in (200ms)"

### 3. Assets Exported

**Export these BEFORE handoff:**

- [ ] **Icons** (SVG format, viewBox normalized, single color stroke/fill)
- [ ] **Illustrations** (SVG or WebP, optimized via SVGO/Squoosh)
- [ ] **Images** (WebP or AVIF, multiple sizes: 1x, 2x, 3x for retina)
- [ ] **Logos** (SVG + PNG fallback)
- [ ] **Fonts** (WOFF2 format, with license confirmation)

**Export structure:**

```
/design-assets/
├── icons/
│   ├── chevron-down.svg
│   ├── user.svg
│   └── ...
├── illustrations/
│   ├── empty-state.svg
│   └── ...
├── images/
│   ├── hero-1x.webp
│   ├── hero-2x.webp
│   └── ...
└── fonts/
    ├── Inter-Regular.woff2
    ├── Inter-Bold.woff2
    └── ...
```

### 4. Design Tokens Exported

**Export from Figma:**

- [ ] **Colors** (hex values + CSS custom properties)
- [ ] **Typography** (font family, sizes, line heights, letter spacing)
- [ ] **Spacing scale** (4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px)
- [ ] **Border radius** (0, 4px, 8px, 16px, full)
- [ ] **Shadows** (elevation 1-5 with box-shadow values)

**Format: CSS variables**

```css
/* colors.css */
:root {
  /* Brand */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  
  /* Semantic */
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  
  /* Neutral */
  --color-gray-50: #f9fafb;
  --color-gray-900: #111827;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Font sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  
  /* Spacing */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Border radius */
  --radius-sm: 0.25rem;  /* 4px */
  --radius-md: 0.5rem;   /* 8px */
  --radius-lg: 1rem;     /* 16px */
  --radius-full: 9999px;
}
```

**Tools to generate tokens:**
- [Figma Tokens plugin](https://www.figma.com/community/plugin/843461159747178978/Figma-Tokens)
- [Style Dictionary](https://amzn.github.io/style-dictionary/) (converts tokens to CSS/SCSS/JSON)

---

## Handoff Meeting (30 min)

### Attendees
- Designer (presenter)
- Frontend engineers (all)
- Product Owner (optional)

### Agenda

**1. Walkthrough (10 min)**

Designer shares screen, walks through:
- User flow (start → end)
- Key interactions
- Responsive behavior
- Edge cases (empty state, loading, error)

**2. Q&A (15 min)**

Engineers ask:
- "What happens if text is longer than this?"
- "How does this look on mobile?"
- "Is this button always enabled?"
- "What's the loading state?"
- "Where does this data come from?"

**3. Action Items (5 min)**

- [ ] Designer: Upload assets to shared folder (Google Drive / repo `/design-assets/`)
- [ ] Designer: Share Figma link (view-only or dev mode)
- [ ] Engineer: Create UI tasks in TASKS.md
- [ ] Engineer: Import design tokens to codebase

---

## Post-Handoff (Engineer Verifies)

### Engineer Checklist

**Before starting implementation:**

- [ ] **Figma link accessible** (can view + inspect in Dev Mode)
- [ ] **All assets downloaded** (icons, images, fonts)
- [ ] **Design tokens imported** (CSS variables or Tailwind config)
- [ ] **Interactions understood** (re-watch Loom if unclear)
- [ ] **Responsiveness confirmed** (mobile/tablet/desktop frames exist)
- [ ] **Edge cases confirmed** (empty state, error, loading, long text)

**If ANY item missing → ping designer BEFORE coding.**

---

## Common Handoff Gaps (Avoid These)

### ❌ Gap 1: No Interactive States

**Problem:** Designer only shows default button, engineer guesses hover/disabled states.

**Fix:** Designer exports button with all variants (default, hover, active, disabled, loading).

---

### ❌ Gap 2: Spacing Not Defined

**Problem:** Engineer eyeballs spacing, design looks "off" in code.

**Fix:** Designer uses 8px grid (Figma: View → Layout Grids → 8px), annotates spacing in Figma.

**Example annotation:**

```
Button padding: 12px (vertical) × 24px (horizontal)
Gap between icon and text: 8px
Margin below heading: 16px
```

---

### ❌ Gap 3: Font Weights Wrong

**Problem:** Designer uses "Semibold" (600), engineer implements "Bold" (700).

**Fix:** Designer specifies exact font-weight in design tokens:

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

### ❌ Gap 4: Responsive Behavior Unclear

**Problem:** Designer shows mobile + desktop, engineer guesses tablet behavior.

**Fix:** Designer creates 3 artboards (375px mobile, 768px tablet, 1024px desktop) OR documents breakpoint behavior:

```
Mobile (< 768px): Stack vertically, full-width buttons
Tablet (768-1023px): 2-column grid
Desktop (≥ 1024px): 3-column grid, fixed max-width 1280px
```

---

### ❌ Gap 5: Icons Not Exported Consistently

**Problem:** Some icons 24×24, some 20×20, some have padding, some don't.

**Fix:** Designer normalizes all icons:
- Same viewBox (0 0 24 24)
- Same stroke-width (1.5px or 2px)
- No padding in SVG (padding added via CSS)

---

### ❌ Gap 6: Colors by Name Only

**Problem:** Designer says "use primary blue", engineer picks wrong shade (500 vs 600).

**Fix:** Designer specifies exact hex + variable name:

```
Primary button background: --color-primary-600 (#2563eb)
Primary button text: --color-white (#ffffff)
Primary button hover: --color-primary-700 (#1d4ed8)
```

---

## Handoff Deliverables (Summary)

**Designer provides:**

1. **Figma link** (Dev Mode enabled)
2. **Design tokens** (CSS variables or Tailwind config)
3. **Exported assets** (icons SVG, images WebP, fonts WOFF2)
4. **Interaction video** (Loom or Figma prototype)
5. **Responsive spec** (mobile/tablet/desktop behavior)
6. **Edge case frames** (empty, loading, error states)

**Engineer confirms:**

1. **Can inspect design** (Figma accessible)
2. **Assets integrated** (icons imported, fonts loaded)
3. **Tokens imported** (CSS variables in codebase)
4. **Interactions understood** (can implement without guessing)

---

## Tools

**Design tokens:**
- [Figma Tokens plugin](https://www.figma.com/community/plugin/843461159747178978)
- [Style Dictionary](https://amzn.github.io/style-dictionary/)

**Asset export:**
- [SVGO](https://github.com/svg/svgo) (optimize SVGs)
- [Squoosh](https://squoosh.app/) (compress images)
- [Fontsquirrel Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator) (convert fonts to WOFF2)

**Handoff:**
- Figma Dev Mode (built-in)
- [Zeplin](https://zeplin.io/) (alternative)
- [Loom](https://loom.com/) (record interaction videos)

---

## Agentic Design Handoff (AI Coding Agent Protocol)

When an AI agent is responsible for implementing the UI from a design handoff:

1. **Token Bridge Enforcement (Zero Arbitrary Palette Colors):**
   - The agent MUST translate tokens into semantic CSS variables or Tailwind semantic classes (`bg-surface`, `text-muted`, `border-subtle`).
   - The agent MUST NOT invent raw arbitrary palette classes (e.g. `bg-slate-900`, `text-blue-600`, or arbitrary `#hex` values in component styles).
2. **Mandatory Interactive States:**
   - Every interactive control (button, input, select, link) must have: default, hover, focus-visible (minimum 2px ring with contrast), active, disabled, and loading state.
3. **Visual QA Gate Evidence:**
   - Mobile responsive check at 375px width (no horizontal scrollbar).
   - Form inputs have associated `<label>` or `aria-label`.
   - Touch targets are minimum 44×44px on mobile viewports.
4. **No Hallucinated UI Variants:**
   - If an edge-case modal, drawer, or empty state is missing from the handoff artifacts, the agent must model it after existing DESIGN.md patterns rather than creating an ungrounded visual paradigm.

---

## Integration with Gates

Update `engine/GATE-REGISTRY.md`:

```markdown
### gate:sprint-1-start (Sprint 1 Start)

**Trigger:** Before first line of UI code written

**Evidence:**
- Design handoff checklist completed (designer + engineer sign-off)
- Figma link shared + accessible
- Design tokens imported to codebase (CSS variables or Tailwind config)
- Assets folder exists (icons, images, fonts)
- UI tasks created in TASKS.md (mapped to Figma frames)

**Blocker:** Cannot start Sprint 1 if design handoff incomplete (Medium+ projects with UI).
```

---

**Last updated:** 2026-09-22  
**Version:** 1.0.0
