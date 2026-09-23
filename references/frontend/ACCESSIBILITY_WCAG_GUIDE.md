# Accessibility WCAG 2.1 AA Compliance Guide

**Purpose:** Expand the accessibility floor in `03c-build-quality.md` to full WCAG 2.1 Level AA compliance. Provides testable criteria, verification workflow, and common violations to avoid.

Read this when: building public-facing UI, government/education project, or when Q94 (Compliance) mentions accessibility requirements.

## Contents

- [WCAG 2.1 Level AA Quick Reference](#wcag-21-level-aa-quick-reference)
- [Perceivable](#perceivable)
- [Operable](#operable)
- [Understandable](#understandable)
- [Robust](#robust)
- [Verification Workflow](#verification-workflow)
- [Common Violations and Fixes](#common-violations-and-fixes)
- [Assistive Technology Testing](#assistive-technology-testing)

## WCAG 2.1 Level AA Quick Reference

WCAG organizes into 4 principles (POUR): **Perceivable, Operable, Understandable, Robust**.

**Level A:** Minimum (most basic)
**Level AA:** Mid-range (target for most projects) ← **This guide covers AA**
**Level AAA:** Highest (rarely required, often impractical)

## Perceivable

### 1.1 Text Alternatives

**1.1.1 Non-text Content (A):**
All images, icons, charts have text alternatives.

```html
<!-- ✅ GOOD -->
<img src="chart.png" alt="Revenue growth: 15% increase from Q1 to Q2">
<button><img src="edit.svg" alt="Edit"> Edit</button>
<img src="decorative-line.svg" alt="" role="presentation">

<!-- ❌ BAD -->
<img src="chart.png">  <!-- missing alt -->
<img src="decorative.svg" alt="decorative image">  <!-- decorative should be alt="" -->
```

### 1.3 Adaptable

**1.3.1 Info and Relationships (A):**
Semantic HTML conveys structure.

```html
<!-- ✅ GOOD -->
<h1>Page Title</h1>
<nav><ul><li><a href="/">Home</a></li></ul></nav>
<main>
  <form>
    <label for="email">Email</label>
    <input id="email" type="email">
  </form>
</main>

<!-- ❌ BAD -->
<div class="title">Page Title</div>  <!-- should be <h1> -->
<div class="nav">...</div>  <!-- should be <nav> -->
<div class="input-label">Email</div>
<input type="email">  <!-- label not connected -->
```

**1.3.5 Identify Input Purpose (AA):**
Use autocomplete attributes for common fields.

```html
<input type="email" autocomplete="email">
<input type="tel" autocomplete="tel">
<input type="text" autocomplete="name">
```

### 1.4 Distinguishable

**1.4.3 Contrast (Minimum) (AA):**
- Normal text: **4.5:1** contrast ratio
- Large text (18pt+ or 14pt+ bold): **3:1** contrast ratio
- UI components (buttons, input borders): **3:1** contrast ratio

**Check contrast:**
- Chrome DevTools: Inspect element → hover over color swatch → contrast ratio shown
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- `axe DevTools` browser extension

```css
/* ✅ GOOD */
.text { color: #333; background: #fff; }  /* 12.6:1 */
.button { color: #fff; background: #0066cc; }  /* 7.7:1 */

/* ❌ BAD */
.text { color: #999; background: #fff; }  /* 2.8:1 — fails 4.5:1 */
.button { color: #bbb; background: #ddd; }  /* 1.4:1 — fails 3:1 */
```

**1.4.4 Resize Text (AA):**
Text can be zoomed to 200% without loss of functionality (no horizontal scrolling).

**1.4.10 Reflow (AA):**
Content reflows at 320px width without horizontal scrolling (mobile responsive).

**1.4.11 Non-text Contrast (AA):**
UI components and graphics have **3:1** contrast.

**1.4.13 Content on Hover or Focus (AA):**
Tooltips/popovers triggered by hover/focus are:
- Dismissible (Esc key closes)
- Hoverable (mouse can move to the tooltip without it disappearing)
- Persistent (doesn't disappear on time-out while hovered)

## Operable

### 2.1 Keyboard Accessible

**2.1.1 Keyboard (A):**
All functionality available via keyboard (no mouse-only actions).

```javascript
// ✅ GOOD: clickable div with keyboard support
<div 
  role="button" 
  tabIndex={0} 
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick(e);
  }}
>
  Click me
</div>

// 🔧 BETTER: use real button
<button onClick={handleClick}>Click me</button>
```

**2.1.2 No Keyboard Trap (A):**
Keyboard focus never gets stuck (user can always Tab away).

### 2.4 Navigable

**2.4.1 Bypass Blocks (A):**
"Skip to main content" link at page top.

```html
<a href="#main" class="skip-link">Skip to main content</a>
<nav>...</nav>
<main id="main">...</main>

<style>
.skip-link {
  position: absolute;
  top: -40px;  /* hidden by default */
}
.skip-link:focus {
  top: 0;  /* visible on keyboard focus */
}
</style>
```

**2.4.3 Focus Order (A):**
Tab order follows visual/reading order.

**2.4.4 Link Purpose (In Context) (A):**
Link text describes destination. Avoid "click here", "read more".

```html
<!-- ✅ GOOD -->
<a href="/pricing">View pricing plans</a>

<!-- ❌ BAD -->
<a href="/pricing">Click here</a>  <!-- destination unclear -->
```

**2.4.7 Focus Visible (AA):**
Keyboard focus indicator is visible.

```css
/* ✅ GOOD */
button:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* ❌ BAD */
button:focus { outline: none; }  /* removes focus indicator */
```

### 2.5 Input Modalities

**2.5.3 Label in Name (A):**
Visible label text is included in accessible name.

```html
<!-- ✅ GOOD -->
<button aria-label="Search products">Search</button>  <!-- "Search" in both -->

<!-- ❌ BAD -->
<button aria-label="Submit query">Search</button>  <!-- mismatch -->
```

## Understandable

### 3.1 Readable

**3.1.1 Language of Page (A):**
Set `<html lang="en">`.

**3.1.2 Language of Parts (AA):**
Mark inline language changes.

```html
<p>The French word for "hello" is <span lang="fr">bonjour</span>.</p>
```

### 3.2 Predictable

**3.2.1 On Focus (A):**
Focusing an element doesn't trigger context change (auto-submit, navigation).

**3.2.3 Consistent Navigation (AA):**
Navigation order stays consistent across pages.

### 3.3 Input Assistance

**3.3.1 Error Identification (A):**
Form validation errors are clearly identified.

```html
<!-- ✅ GOOD -->
<label for="email">Email</label>
<input id="email" type="email" aria-invalid="true" aria-describedby="email-error">
<span id="email-error" role="alert">Invalid email format</span>
```

**3.3.3 Error Suggestion (AA):**
Validation error includes suggestion for fix.

```
<!-- ❌ BAD -->
"Password invalid"

<!-- ✅ GOOD -->
"Password must be at least 8 characters and include a number"
```

**3.3.4 Error Prevention (Legal, Financial, Data) (AA):**
For legal/financial transactions:
- Reversible, OR
- Checked (user reviews before submit), OR
- Confirmed (confirmation step before final submit)

## Robust

### 4.1 Compatible

**4.1.2 Name, Role, Value (A):**
Custom UI components have proper ARIA roles and states.

```html
<!-- ✅ GOOD: custom checkbox -->
<div 
  role="checkbox" 
  aria-checked="false" 
  tabIndex={0}
  onKeyDown={handleToggle}
>
  Accept terms
</div>

<!-- 🔧 BETTER: use native HTML -->
<input type="checkbox" id="terms">
<label for="terms">Accept terms</label>
```

**4.1.3 Status Messages (AA):**
Status updates announced to screen readers.

```javascript
// ✅ GOOD: toast notification
<div role="status" aria-live="polite">
  {message}
</div>

// Use aria-live="assertive" for urgent alerts (error, warning)
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

## Verification Workflow

**Gate requirement — read before running any of the steps below:** automated
tooling (axe, pa11y, Lighthouse) catches roughly 30-40% of WCAG issues by
independent industry estimates — things like missing alt text or insufficient
contrast ratios that a static scanner can check mechanically. It cannot catch
whether a screen reader announces a dynamic error message, whether focus order
makes sense, or whether a custom widget's keyboard interaction actually works.
**A passing automated scan (step 1) is necessary but never sufficient to mark
the WCAG AA gate as passed.** Steps 2 (manual keyboard) and 3 (screen reader)
below are mandatory, not optional extras, before this gate can be recorded as
satisfied — record the tester's name and date for steps 2 and 3 alongside the
automated report, the same way `SKILL.md` Rule 9 requires a named, recorded
enforcement artifact rather than a report nobody reads. An agent must not
report "WCAG 2.1 AA compliant" to a user based on an automated pass alone —
this is especially important for the government/education/compliance-driven
projects this guide is written for, where "compliant" is a claim someone may
rely on.

**Autonomous Agent Execution Mode (Headless / Non-Human Execution):**
When an autonomous AI agent executes this SDLC in headless or CI environments without physical screen-reader audio output:
1. The agent MUST execute and pass Step 1 (automated `axe-core`, `pa11y`, Lighthouse a11y ≥ 90) and programmatic keyboard traversal tests via Playwright (verifying non-trapped focus and visible focus rings).
2. The agent MUST NOT hallucinate a human tester name or claim full manual screen-reader sign-off.
3. The agent records in `CONTEXT.md`:
   ```yaml
   accessibility_gate:
     automated_status: PASS
     manual_screen_reader_audit: PENDING_HUMAN_AUDITOR
     blocked_for_production: false  # Allows dev/staging; human audit required at gate:production-deploy
   ```
4. Development and staging proceed cleanly, while the pending human screen-reader audit is registered in `TASKS.md` for human QA before formal regulatory certification.

### 1. Automated Testing

Run on every page/component:

```bash
# Install tools
npm install -D @axe-core/cli pa11y lighthouse

# Run automated checks
npx axe http://localhost:3000 --exit
npx pa11y http://localhost:3000
lighthouse http://localhost:3000 --only-categories=accessibility --view
```

**Add to CI:**
```yaml
# .github/workflows/a11y.yml
name: Accessibility
on: [pull_request]
jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build && npm run start &
      - run: sleep 5
      - run: npx axe http://localhost:3000 --exit
```

### 2. Manual Keyboard Testing

Test critical path keyboard-only:

```
□ Tab through all interactive elements
□ Focus indicator visible on every element
□ Enter/Space activates buttons and links
□ Escape closes modals and dropdowns
□ Arrow keys navigate within menus/tabs
□ Focus never trapped (can always Tab away)
```

### 3. Screen Reader Testing — mandatory for the AA gate, not optional

**Minimum (required, not aspirational):** Test with one screen reader, on the
primary user flows (not just the homepage):
- **macOS:** VoiceOver (Cmd+F5)
- **Windows:** NVDA (free) or JAWS
- **Mobile:** iOS VoiceOver, Android TalkBack

**Test scenarios:**
```
□ Navigate by headings (VoiceOver: Ctrl+Opt+Cmd+H)
□ Navigate by landmarks (VoiceOver: Ctrl+Opt+U)
□ Form fields read with labels
□ Buttons read with accessible name
□ Error messages announced
□ Dynamic content changes announced (aria-live)
```

### 4. Zoom Testing

```
□ Zoom to 200% (Cmd/Ctrl + +)
□ No horizontal scrolling
□ All content visible and functional
□ No overlapping text
```

## Common Violations and Fixes

### Violation: Missing Alt Text

```html
<!-- ❌ BAD -->
<img src="photo.jpg">

<!-- ✅ GOOD -->
<img src="photo.jpg" alt="Team celebrating product launch">
<img src="decorative.svg" alt="" role="presentation">  <!-- decorative -->
```

### Violation: Low Contrast

```css
/* ❌ BAD: 2.8:1 contrast */
.text { color: #999; background: #fff; }

/* ✅ GOOD: 7:1 contrast */
.text { color: #333; background: #fff; }
```

### Violation: Missing Form Labels

```html
<!-- ❌ BAD -->
<input type="text" placeholder="Email">

<!-- ✅ GOOD -->
<label for="email">Email</label>
<input id="email" type="email" placeholder="you@example.com">
```

### Violation: Non-semantic Button

```html
<!-- ❌ BAD -->
<div onClick={handleClick}>Submit</div>

<!-- ✅ GOOD -->
<button onClick={handleClick}>Submit</button>
```

### Violation: Missing Focus Indicator

```css
/* ❌ BAD */
* { outline: none; }

/* ✅ GOOD */
button:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

### Violation: Inaccessible Modal

```javascript
// ❌ BAD: focus not trapped, no close on Escape
<div className="modal">
  <button onClick={onClose}>Close</button>
  {content}
</div>

// ✅ GOOD: focus trap + Escape key
import FocusTrap from 'focus-trap-react';

function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <FocusTrap>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">Modal Title</h2>
        <button onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </FocusTrap>
  );
}
```

## Assistive Technology Testing

**Reality check:** Full WCAG compliance requires manual testing with assistive technologies, especially:
- Screen reader navigation (VoiceOver, NVDA, JAWS)
- Voice control (Dragon NaturallySpeaking)
- Switch access (for users who cannot use keyboard/mouse)

Automated tools catch ~30-40% of issues. The remaining 60-70% require human judgment.

**When to involve expert accessibility review:**
- Government/education/healthcare projects (often legally required)
- B2B SaaS selling to large enterprises (procurement checklist)
- Public-facing products with diverse user base
- Any project where accessibility is a stated requirement

---

**Version:** 1.0.0  
**Part of:** Phase 5 (Testing) + Build Quality Floor  
**Pairs with:** `03c-build-quality.md` (Accessibility floor), `TESTING_STRATEGY_DETAIL.md`
