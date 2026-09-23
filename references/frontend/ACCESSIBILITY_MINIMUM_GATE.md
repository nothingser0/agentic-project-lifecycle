# Accessibility Minimum Gate — Medium Tier Mandatory

**Purpose:** Ensure Medium tier projects (not just Large+) meet basic accessibility standards before production.

**When to run:** Before `gate:production-deploy` (Medium+ projects).

---

## Why This Matters

**Current gap:** Small/Medium projects can ship without accessibility audit → users with disabilities excluded.

**Fix:** Medium tier gets lightweight accessibility gate (15 min), Large+ gets full WCAG AA.

---

## Medium Tier — Accessibility Minimum (15 minutes)

### 1. Lighthouse Score ≥85

**Run:**

```bash
# Option A: Headless CI / Automated Agent Execution (Zero GUI Required)
npx playwright test tests/a11y.spec.ts  # Runs axe-core assertions across all routes
# or via Lighthouse CLI:
npx @lhci/cli autorun --collect.url=http://localhost:3000 --assert.assertions.categories:accessibility=0.85

# Option B: Manual Local Check (Developer DevTools)
1. Open page in Chrome
2. F12 → Lighthouse tab
3. Select "Accessibility" only
4. Click "Analyze page load"
```

**Target:** Score ≥85/100

**Common failures:**
- Form inputs without labels
- Images without alt text
- Insufficient color contrast
- Missing ARIA labels on icon buttons

**Fix before deploy.**

---

### 2. Keyboard Navigation (5 minutes)

**Test:**

1. **Tab through entire critical flow** (e.g., login → dashboard → create item)
2. **Check:**
   - [ ] All interactive elements reachable (buttons, links, inputs)
   - [ ] Focus indicator visible (outline or custom style)
   - [ ] Tab order logical (top → bottom, left → right)
   - [ ] No keyboard trap (can Tab out of modals/dropdowns)

**Common failures:**
- Icon buttons without tabindex
- Modal closes only via "X" button (need Escape key)
- Dropdown not navigable with Arrow keys

**Fix before deploy.**

---

### 3. Color Contrast (2 minutes)

**Test:**

1. Open page in Chrome
2. Inspect any text element
3. Check contrast ratio in Color Picker (DevTools shows automatically)

**Requirements:**
- **Normal text** (< 18px): ≥4.5:1
- **Large text** (≥18px or bold ≥14px): ≥3:1
- **UI components** (buttons, inputs): ≥3:1

**Tool:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Common failures:**
- Gray text on white background (e.g., #999 on #FFF = 2.8:1 ❌)
- Light blue links on white (e.g., #3b82f6 on #FFF = 3.2:1 ❌)

**Fix before deploy.**

---

### 4. Touch Targets ≥44×44px (1 minute, mobile only)

**Test:**

1. Open page on mobile (375px width in DevTools)
2. Enable rulers (DevTools → Settings → Show rulers)
3. Measure buttons/links

**Requirement:** All tappable elements ≥44×44px (Apple HIG / WCAG 2.1 AA)

**Common failures:**
- Icon-only buttons 32×32px
- Close "X" button 24×24px
- Links with tight padding

**Fix:** Add padding to increase hit area.

```css
/* Before: 24×24px icon */
.icon-button {
  width: 24px;
  height: 24px;
}

/* After: 44×44px hit area */
.icon-button {
  width: 24px;
  height: 24px;
  padding: 10px; /* (44 - 24) / 2 = 10px */
}
```

---

### 5. Screen Reader Smoke Test (Optional but Recommended, 5 minutes)

**Test one critical flow with eyes closed:**

1. **macOS:** Cmd+F5 (enable VoiceOver)
2. **Windows:** Download [NVDA](https://www.nvaccess.org/) (free)
3. **Navigate with keyboard only** (Tab, Arrow keys, Enter)
4. **Listen:** Are labels read correctly? Can you complete the task?

**Critical flows to test:**
- Login
- Create first item (e.g., add expense, create employee)
- Submit form

**Common failures:**
- Form inputs announced as "Edit text" (no label)
- Icon buttons announced as "Button" (no aria-label)
- Loading spinner not announced (no aria-live)

**Fix before deploy** (or document as known limitation if time-critical).

---

## Large+ Tier — Full WCAG 2.1 AA

**See:** `references/frontend/ACCESSIBILITY_WCAG_GUIDE.md` (comprehensive guide).

**Requirements:**
- All Medium tier checks +
- Full WCAG 2.1 AA compliance (25+ criteria)
- Screen reader testing on 2 platforms (VoiceOver + NVDA)
- Keyboard shortcuts documented
- ARIA patterns validated (combobox, dialog, tabs)

---

## Integration with Gates

**Update `engine/GATE-REGISTRY.md`:**

```markdown
### gate:production-deploy (Production Deploy)

**Trigger:** Before deploying to production

**Evidence:**
- UAT passed
- Security checklist passed
- Performance budget not exceeded
- Design validation passed
- **Accessibility minimum passed** ← NEW (Medium+)
  - Lighthouse Accessibility score ≥85
  - Keyboard navigation works (Tab, Enter, Escape)
  - Color contrast ≥4.5:1 for text
  - Touch targets ≥44×44px (mobile)
- Rollback plan documented

**Blocker (Medium+):** Cannot deploy if Lighthouse Accessibility < 85.
**Blocker (Large+):** Cannot deploy if WCAG 2.1 AA not met (see ACCESSIBILITY_WCAG_GUIDE.md).
```

---

## Quick Fixes (Common Issues)

### Issue 1: Form Input Without Label

**❌ Before:**

```jsx
<input type="email" name="email" />
```

**✅ Fix:**

```jsx
<label htmlFor="email">Email</label>
<input type="email" name="email" id="email" />
```

---

### Issue 2: Icon Button Without Label

**❌ Before:**

```jsx
<button>
  <XIcon />
</button>
```

**✅ Fix:**

```jsx
<button aria-label="Close">
  <XIcon />
</button>
```

---

### Issue 3: Image Without Alt Text

**❌ Before:**

```jsx
<img src="/avatar.jpg" />
```

**✅ Fix:**

```jsx
<img src="/avatar.jpg" alt="User profile picture" />

<!-- OR if decorative: -->
<img src="/decorative.png" alt="" /> <!-- Empty alt = skip -->
```

---

### Issue 4: Low Contrast Text

**❌ Before:**

```css
.text-muted {
  color: #999999; /* 2.8:1 on white ❌ */
}
```

**✅ Fix:**

```css
.text-muted {
  color: #6b7280; /* 4.6:1 on white ✅ */
}
```

---

### Issue 5: Focus Indicator Missing

**❌ Before:**

```css
button:focus {
  outline: none; /* ❌ Removes default focus */
}
```

**✅ Fix:**

```css
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

---

## Accessibility Checklist (Medium Tier)

**Before production deploy:**

- [ ] Lighthouse Accessibility score ≥85
- [ ] Keyboard navigation works (Tab through critical flow)
- [ ] Focus indicator visible on all interactive elements
- [ ] Color contrast ≥4.5:1 for text, ≥3:1 for UI components
- [ ] Touch targets ≥44×44px (mobile)
- [ ] Form inputs have labels (visible or aria-label)
- [ ] Icon buttons have aria-label
- [ ] Images have alt text (or alt="" if decorative)
- [ ] No keyboard traps (can Escape modals, Tab out of dropdowns)

**Optional (recommended):**
- [ ] Screen reader test (VoiceOver or NVDA) on 1 critical flow

**Time estimate:** 15 minutes total.

---

## Tools

**Automated:**
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/accessibility/) (Chrome DevTools)
- [axe DevTools](https://www.deque.com/axe/devtools/) (browser extension, free)
- [WAVE](https://wave.webaim.org/) (web-based)

**Manual:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) (macOS built-in)
- [NVDA](https://www.nvaccess.org/) (Windows, free)

**Learning:**
- [WebAIM WCAG 2 Checklist](https://webaim.org/standards/wcag/checklist)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

**Last updated:** 2026-09-22  
**Version:** 1.0.0
