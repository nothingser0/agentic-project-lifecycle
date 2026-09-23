# Anti-Slop Core Rules

**Version:** 1.0  
**Purpose:** Filter AI-generated slop (UI, code, copy) during development phase.  
**Source:** Derived from [anti-slop by miqdadbadjuber](https://github.com/miqdadbadjuber/anti-slop) (10 critical rules subset).

---


## Contents

- [Overview](#overview)
- [10 Critical Rules](#10-critical-rules)
- [Delivery Gate (Mandatory Checklist)](#delivery-gate-mandatory-checklist)
- [Delivery Gate — Commit Checklist](#delivery-gate-commit-checklist)
- [Usage (Agent Instructions)](#usage-agent-instructions)
- [Extended Enforcement (Optional)](#extended-enforcement-optional)

## Overview

**What is "AI Slop"?**

Generic, low-quality output that AI agents generate by default:
- **UI Slop:** Decorative elements marking nothing, useless animations, missing responsive states
- **Code Slop:** Multi-line useless comments, generic variable names, dead code
- **Copy Slop:** AI tone patterns ("Let me help"), fake stats, corporate jargon

**This Filter:**
- ✅ Blocks 10 most common slop patterns
- ✅ Enforces quality gates (responsive, accessibility, code clarity)
- ✅ Built-in to Phase 3 (Development) — agent loads automatically

**For Full Enforcement:**
Install [anti-slop repo](https://github.com/miqdadbadjuber/anti-slop) (38 rules):
```bash
npx antislop-ai
```

---

## 10 Critical Rules

### UI Slop Patterns (BLOCKED)

#### R-15: Decorative Status Dot

**BLOCKED:**
```html
<!-- ❌ Glowing/pulsing dot marking nothing -->
<div class="flex items-center gap-2">
  <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
  <h2>Dashboard</h2>
</div>
```

**Why blocked:** Dot indicates status (online, active, syncing) but marks nothing here — pure decoration.

**Allowed only when:**
- Marks real-time status (user online, job running, sync in progress)
- Changes based on state (green=online, red=offline)
- User can interact (click to see details)

**Example (ALLOWED):**
```html
<!-- ✅ Marks real status -->
<div class="flex items-center gap-2">
  <span class="w-2 h-2 bg-green-500 rounded-full" 
        title="Server online"></span>
  <p>API Server</p>
</div>
```

---

#### R-22: Exactly Two Layout States

**BLOCKED:**
```css
/* ❌ Only phone stack + desktop grid, no tablet */
.grid {
  grid-template-columns: 1fr; /* Mobile: 375px */
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr); /* Desktop: 1024px+ */
  }
}
/* Tablet (768px) ignored → content jumps from 1-col to 4-col */
```

**Why blocked:** Real users have tablets, landscape phones, narrow desktop windows — 2 states leave gaps.

**Required:** Minimum 3 breakpoints (mobile / tablet / desktop).

**Example (ALLOWED):**
```css
/* ✅ Three responsive states */
.grid {
  grid-template-columns: 1fr; /* Mobile: <768px */
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet */
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr); /* Desktop */
  }
}
```

---

#### R-29: Useless Fade-In Animation

**BLOCKED:**
```css
/* ❌ Every element fades in on page load */
.card, .button, .text, .image {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Why blocked:** No purpose — everything fades in simultaneously, slows perceived performance, annoying on repeat visits.

**Allowed only when:**
- Marks new content (notification toast, live update)
- User-triggered (modal open, dropdown expand)
- Loading state transition (skeleton → content)

**Example (ALLOWED):**
```vue
<!-- ✅ Fade-in marks new content -->
<div v-if="newNotification" 
     class="toast animate-fade-in">
  New message received
</div>
```

---

### Code Slop Patterns (BLOCKED)

#### Rule: Multi-Line Useless Comments

**BLOCKED:**
```php
// ❌ 3-line comment for 1-line fact
// This function adds two numbers together
// It takes two parameters a and b
// And returns their sum
function add($a, $b) {
    return $a + $b;
}
```

**Why blocked:** Comment states obvious (function name "add" already says it).

**Rule:** Comment only when:
- Explains WHY (not WHAT)
- Non-obvious business logic
- Workaround for bug/limitation

**Example (ALLOWED):**
```php
// ✅ Explains WHY (non-obvious)
// Use floor division to match backend rounding behavior (API bug #1234)
function calculateDiscount($price, $rate) {
    return floor($price * $rate / 100);
}
```

**Example (ALLOWED):**
```php
// ✅ Explains complex business logic
// Score decays 10% daily after 7 days inactivity (Product requirement)
function calculateLeadScore($baseScore, $lastActivityDate) {
    $daysSinceActivity = now()->diffInDays($lastActivityDate);
    if ($daysSinceActivity > 7) {
        $decay = pow(0.9, $daysSinceActivity - 7);
        return $baseScore * $decay;
    }
    return $baseScore;
}
```

---

#### Rule: Generic Variable Names

**BLOCKED:**
```php
// ❌ Generic names
$data = Contact::all();
$temp = $request->input('name');
$result = $service->process($temp);
$item = $result[0];
$val = $item['score'];
```

**Why blocked:** Meaningless — reader can't understand purpose without tracing code.

**Rule:** Variable name describes content/purpose.

**Example (ALLOWED):**
```php
// ✅ Descriptive names
$contacts = Contact::all();
$contactName = $request->input('name');
$scoredContacts = $leadScoringService->score($contacts);
$topContact = $scoredContacts[0];
$leadScore = $topContact['score'];
```

**Exception (ALLOWED):**
```php
// ✅ Loop index/accumulator (standard convention)
for ($i = 0; $i < count($items); $i++) { ... }
$sum = array_reduce($numbers, fn($acc, $n) => $acc + $n, 0);
```

---

### Copy Slop Patterns (BLOCKED)

#### Rule: AI Tone Patterns

**BLOCKED:**

❌ "Let me help you with that"  
❌ "I hope this helps"  
❌ "In today's digital landscape"  
❌ "Seamlessly integrate"  
❌ "Leverage the power of"  
❌ "Unlock the potential"  
❌ "Empower your team"  
❌ "Transform your business"  
❌ "Take your [X] to the next level"

**Why blocked:** Generic AI tone — sounds corporate/robotic, not human.

**Rule:** Write direct, specific, human copy.

**Example (BAD):**
```
Seamlessly manage your contacts and leverage AI-powered insights 
to unlock the full potential of your sales pipeline.
```

**Example (GOOD):**
```
Track contacts, score leads with AI, close more deals.
```

---

#### Rule: Fake Stats Without Sources

**BLOCKED:**
```html
<!-- ❌ No source -->
<p>95% of users love this feature</p>
<p>Join 10,000+ happy customers</p>
<p>Trusted by Fortune 500 companies</p>
```

**Why blocked:** Unverifiable — reader assumes fake (and probably is).

**Rule:** Stats need sources OR remove them.

**Example (ALLOWED):**
```html
<!-- ✅ Verifiable source -->
<p>4.8/5 stars (127 reviews on G2)</p>
<p>2,341 active tenants (live count from database)</p>
```

**Example (ALLOWED — remove stat):**
```html
<!-- ✅ No stat claim -->
<p>Manage contacts, deals, and activities in one place</p>
```

---

### Quality Gates (REQUIRED)

#### Gate: Responsive 3 Breakpoints

**Required breakpoints:**
- **Mobile:** 375px - 767px (stack layout, tap targets ≥44px)
- **Tablet:** 768px - 1023px (2-col grid)
- **Desktop:** 1024px+ (3-4 col grid)

**Test:**
```bash
# Chrome DevTools → Responsive mode
# Test: 375px, 768px, 1024px, 1440px
# Verify: No horizontal scroll, content readable, actions reachable
```

**Example (CSS):**
```css
/* Mobile first */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

#### Gate: Comments Explain WHY

**Rule:** Comments explain:
- ✅ WHY this approach (not obvious from code)
- ✅ Business logic rationale
- ✅ Workarounds for bugs/limitations
- ❌ NOT what code does (code already says)

**Test:**
```bash
# Search comments:
grep -r "\/\/" app/ resources/

# Check each comment:
# - Does it explain WHY or WHAT?
# - WHAT → remove (redundant)
# - WHY → keep (valuable)
```

**Example (WHAT — remove):**
```php
// ❌ Loop through contacts (obvious from code)
foreach ($contacts as $contact) {
    // ❌ Check if email exists (obvious)
    if ($contact->email) {
        // ❌ Send email (obvious)
        Mail::to($contact->email)->send(new WelcomeEmail);
    }
}
```

**Example (WHY — keep):**
```php
// ✅ Batch 50 at a time to avoid memory limit on large tenant datasets
foreach ($contacts->chunk(50) as $batch) {
    // ✅ Skip contacts without email (common for imported legacy data)
    $batch->filter(fn($c) => $c->email)
          ->each(fn($c) => Mail::to($c->email)->send(new WelcomeEmail));
}
```

---

#### Gate: Accessibility

**Required:**

1. **Contrast Ratio ≥4.5:1** (text vs background)
   ```bash
   # Test: Chrome DevTools → Lighthouse → Accessibility
   # OR: https://webaim.org/resources/contrastchecker/
   ```

2. **Keyboard Navigation Works**
   ```bash
   # Test: Tab through entire page
   # Verify: All interactive elements reachable, focus visible, logical order
   # Escape closes modals, Enter submits forms, Arrow keys navigate dropdowns
   ```

3. **Semantic HTML** (not div soup)
   ```html
   <!-- ❌ BAD: divs with click handlers -->
   <div onclick="submit()">Submit</div>
   
   <!-- ✅ GOOD: semantic button -->
   <button type="submit">Submit</button>
   ```

---

## Delivery Gate (Mandatory Checklist)

**Run BEFORE every commit:**

```markdown
## Delivery Gate — Commit Checklist

Agent: Complete this checklist before commit. PASS = all 4 blocks checked.

### Block 1: No Slop Patterns Present

□ **UI Slop Checked:**
  - No decorative status dots (R-15)
  - Responsive has 3+ breakpoints (R-22)
  - No useless fade-in animations (R-29)

□ **Code Slop Checked:**
  - No multi-line useless comments
  - No generic variable names ($data, $temp, $result)
  - Comments explain WHY (not WHAT)

□ **Copy Slop Checked:**
  - No AI tone patterns ("Let me help", "In today's landscape")
  - No fake stats without sources
  - Copy is direct, specific, human

### Block 2: Responsive Works

□ **Mobile (375px):**
  - Stack layout (1-col)
  - Tap targets ≥44px
  - No horizontal scroll

□ **Tablet (768px):**
  - 2-col grid
  - Content readable
  - Actions reachable

□ **Desktop (1024px+):**
  - 3-4 col grid
  - Full features visible
  - Optimal layout

### Block 3: Code Quality

□ **Naming:**
  - Functions: verb + noun (createContact, calculateScore)
  - Variables: descriptive (contactName not $name)
  - Classes: PascalCase noun (ContactController)

□ **Comments:**
  - Explain WHY (business logic, workarounds)
  - No WHAT comments (redundant)
  - No commented-out code (delete it)

□ **No Dead Code:**
  - No unused functions
  - No unused imports
  - No unreachable code

### Block 4: Accessibility

□ **Contrast:** Text/background ratio ≥4.5:1 (check Lighthouse)

□ **Keyboard Nav:** Tab through page works, focus visible

□ **Semantic HTML:** Use <button>, <a>, <input> (not div onclick)

---

**Result:**

- ✅ **PASS:** All 4 blocks checked → Commit allowed
- ❌ **FAIL:** Any unchecked → Fix before commit

**Agent: Report result in commit message footer:**
```
Delivery Gate: PASS (4/4 blocks)
- No slop patterns
- Responsive 375/768/1024 tested
- Code quality verified
- Accessibility checked
```
```

---

## Usage (Agent Instructions)

**When to load:**
- Phase 3 (Development) — every Sprint
- Before commit (Delivery Gate mandatory)

**How to use:**

1. **Read this file** at Sprint start
2. **Check patterns** during coding (real-time prevention)
3. **Run Delivery Gate** before commit (4-block checklist)
4. **Report PASS/FAIL** in commit message

**If FAIL:**
- Fix issues (remove slop, add breakpoint, improve names)
- Re-run checklist
- Commit only when PASS

---

## Extended Enforcement (Optional)

**For full 38-rule coverage:**

Install [anti-slop repo](https://github.com/miqdadbadjuber/anti-slop):
```bash
npx antislop-ai
# Choose: Hermes → Global install
```

**Load in prompt:**
```
Load skills:
- project-lifecycle (core workflow)
- antislop (38 rules full enforcement)
- antislop-ui (UI patterns deep)
- antislop-copywriting (copy filters)
```

**When to use full repo:**
- Enterprise projects (high quality bar)
- Client work (professional output)
- Open source (community standards)
- Team collaboration (consistency)

**When core 10 rules sufficient:**
- Solo projects (v1.0 MVP)
- Learning projects (portfolio)
- Internal tools (speed over polish)
- Prototypes (throwaway code)

---

**Last Updated:** September 17, 2026  
**Version:** 1.0  
**Maintained By:** Project Lifecycle Skill  
**Source:** https://github.com/miqdadbadjuber/anti-slop (10-rule subset)
