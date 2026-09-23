# Design Validation Gate Guide — UX Quality Enforcement

**Purpose:** Prevent shipping UI/UX without user validation.

**When to run:** Before Sprint demo (end of sprint), before production deploy

---

## Gate: Design Validation

**Trigger:** `gate:sprint-demo` (before showing to stakeholders/users)

**Evidence required:**

```markdown
## Design Validation Checklist

### Visual QA
- [ ] Design matches approved mockups/DESIGN.md (color, typography, spacing)
- [ ] Responsive breakpoints tested (mobile 375px, tablet 768px, desktop 1024px)
- [ ] Dark mode tested (if applicable)
- [ ] All interactive states implemented (hover, focus, active, disabled)
- [ ] Loading states implemented (skeleton, spinner, progress)
- [ ] Error states implemented (empty state, 404, 500, form validation)

### Accessibility
- [ ] **Lighthouse Accessibility score ≥85** (MANDATORY for Medium+, see `references/frontend/ACCESSIBILITY_MINIMUM_GATE.md`)
- [ ] Color contrast ≥ 4.5:1 for text, ≥ 3:1 for UI components (WCAG AA)
- [ ] Keyboard navigation works (Tab, Shift+Tab, Enter, Escape, Arrow keys)
- [ ] Focus visible on all interactive elements
- [ ] Screen reader tested (at least VoiceOver/NVDA on 1 critical flow)
- [ ] Touch targets ≥ 44x44px (mobile)
- [ ] Form labels/ARIA labels present

### Usability Test
- [ ] User test completed (min 3 users, 1 critical flow)
- [ ] Task completion rate ≥ 80% achieved (see remediation loop below if < 80%)
- [ ] User feedback recorded (see below)

**Remediation Loop (if task completion rate < 80%):**
1. Identify specific friction points where users failed or got stuck.
2. Implement targeted UX/UI fixes (clearer labels, flow simplification, inline guidance).
3. Retest with 3+ new users (original users retain learned behavior).
4. Repeat until task completion reaches ≥ 80%.
5. Only then mark gate:sprint-demo as passed (see engine/NUMERIC_STANDARDS.md § Usability Thresholds).
```

---

## User Research Methodology

**When to use:** Phase 2 (Planning) to validate assumptions, Phase 5 (Build) to test prototypes.

### Research Methods by Project Phase

| Method | When | Duration | Participants | Output |
|--------|------|----------|--------------|--------|
| **User Interviews** | Phase 2 (before design) | 30-45 min each | 5-8 users | Pain points, needs, workflows |
| **Surveys** | Phase 2 (validate scale) | 5-10 min | 50-100+ users | Quantitative data (priorities, demographics) |
| **Competitive Analysis** | Phase 2 (before design) | 4-8 hours | N/A | Feature matrix, UX patterns |
| **Usability Testing** | Phase 5 (prototype/build) | 15-30 min each | 3-5 users | Task completion, friction points |
| **A/B Testing** | Phase 6 (post-launch) | 1-2 weeks | Real users | Conversion rates, engagement metrics |

### Fallback Usability Validation (When Real Users Are Unavailable)

**Hard Rule (Decision Rules #2): Never invent or fabricate user testing results or fake participant personas.**

If real external end-users cannot be reached prior to launch (e.g. stealth MVP, strict confidentiality, or zero customer access), the team must replace live user testing with one of these three formal proxy methods and record the substitution explicitly:

1. **Structured Cognitive Walkthrough:**
   - Evaluator walks through the critical path asking four questions at every step:
     - Will the user try to achieve the right effect?
     - Will the user notice that the correct action is available?
     - Will the user associate the correct action with the effect they are trying to achieve?
     - If the correct action is performed, will the user see that progress is being made toward solution of the task?
   - Record issues against the Nielsen Norman 10 Usability Heuristics.
2. **Internal Cross-Functional Dogfooding:**
   - Run usability tasks with 2–3 colleagues who did **not** build the feature (support team, sales engineer, operations).
3. **Guerrilla Proxy Testing:**
   - 5-minute task test with an unbiased external colleague or friend using the exact task script.

Record in `DESIGN.md` or the gate evidence:
```yaml
usability_validation_method: proxy_cognitive_walkthrough # or proxy_internal_dogfooding
proxy_evaluator: "Jane Doe (Support Lead)"
limitation_acknowledged: "Internal testing may miss non-technical user mental model discrepancies"
```

### Avoiding Confirmation Bias — Read Before Writing Any Script

Research run by or for someone who already has a preferred direction is the
single easiest way to produce a script that confirms rather than tests that
direction — and an agent drafting a script from a stakeholder's framing is
especially prone to this, because it will tend to mirror the language and
assumptions it was given rather than independently question them.

**Before finalizing any interview or usability script, apply these checks:**

1. **Neutral framing, not feature framing.** Ask about the *problem* before
   ever naming the *solution* under consideration. "What's the most
   frustrating part of this process?" (problem-first) is neutral; "Would
   [Feature X] solve your problem?" (solution-first) invites agreement bias —
   most participants will say yes to be polite or helpful, regardless of
   whether the feature actually fits their workflow. If a solution must be
   validated, ask the participant to describe their ideal solution *before*
   showing them the one under consideration, then compare.
2. **At least one disconfirming hypothesis per research round.** Before
   running the sessions, write down one plausible way the current design
   direction is *wrong* (not just ways it could be improved) and design at
   least one question or task that could surface evidence for it. If every
   question in the script can only produce evidence *for* the current
   direction, the script needs revision before running it.
3. **Report contradicting data, not just supporting data.** In "Key
   Insights," a finding that contradicts the design direction must be
   recorded with the same visibility as a supporting finding — do not let a
   summary section quietly drop the participant who said the opposite of
   what five others said; note the disagreement and flag it for follow-up
   rather than treating five-out-of-six as a settled consensus.
4. **Where feasible, separate the person who wants the answer from the
   person writing the script.** If the same person (or agent session) both
   holds a stake in the outcome and writes the questions, that is a known
   risk factor even with good intentions — a second read of the script by
   someone without that stake, purely checking for leading language, is a
   cheap mitigation.

### User Interview Script Template

**Goal:** Understand user pain points and workflows (before building features).

```markdown
# User Interview — [Project Name]

**Date:** 2026-09-22
**Interviewer:** [contributor]
**Participant:** P1 (HR manager, 5 years experience)
**Duration:** 35 minutes

## Introduction (2 min)
> "Thanks for joining. We're building [product] and want to understand your current workflow. There are no right answers — we just want to learn from your experience."

## Current Workflow (10 min)
1. Walk me through how you [do task X] today.
   - **P1:** "I use Excel to track employee attendance. Every Monday I manually copy-paste data from our punch-in system."

2. What tools do you use for this?
   - **P1:** "Excel, our biometric system (ZKTeco), and sometimes Google Sheets for sharing."

3. How much time does this take per week?
   - **P1:** "About 3 hours every Monday, plus 1-2 hours fixing errors during the month."

## Pain Points (10 min)
4. What's the most frustrating part of this process?
   - **P1:** "Manual data entry. The biometric system exports CSV but columns don't match our payroll format, so I have to remap everything."

5. Have you tried other solutions?
   - **P1:** "We tried [Competitor A] but it was too expensive ($50/employee/month). We tried [Competitor B] but it didn't integrate with our payroll software."

6. If you could wave a magic wand, what would you change?
   - **P1:** "Auto-sync attendance to payroll. One-click export. Mobile app for employees to check their own attendance."

## Feature Validation (10 min)
7. Before we go further — if you could design the ideal solution to [the pain point from Q4-6] yourself, what would it look like? (Ask this before naming your own feature idea, to avoid leading the participant toward agreeing with a solution they haven't independently evaluated.)
   - **P1:** "Auto-sync attendance to payroll, ideally daily. I don't need it to be fancy, just accurate."
   - *Then, only after their own answer:* "We're considering [Feature X] — how does that compare to what you just described?"
   - **P1:** "Yes, that matches, if it auto-syncs daily. Weekly sync wouldn't help because I need to catch errors early."

8. How much would you pay for a solution that does [X, Y, Z]?
   - **P1:** "Our budget is $10-15 per employee per month. Anything above $20 is a hard pass."

## Wrap-up (3 min)
9. Anything else you'd like to share?
   - **P1:** "Make sure it works offline. Our factory has spotty internet."

10. Can we follow up for usability testing later?
   - **P1:** "Yes, happy to help."

## Key Insights
- ✅ Pain point: Manual CSV remapping (3h/week wasted)
- ✅ Must-have: Daily auto-sync, not weekly
- ✅ Must-have: Offline mode (factory use case)
- ✅ Price ceiling: $15/employee/month
- ⚠️ Integration blocker: Must integrate with [Payroll Software X]
```

### Survey Design (Quantitative Validation)

**Tool:** Google Forms (free), Typeform ($25-83/mo), Tally (free).

**Survey structure (5-10 questions max):**

```markdown
# [Product Name] User Survey

**Goal:** Validate feature priorities (100+ responses).

1. What's your role?
   - [ ] HR Manager
   - [ ] Payroll Admin
   - [ ] Finance
   - [ ] Other: ___

2. How do you currently track employee attendance?
   - [ ] Excel/Google Sheets
   - [ ] Biometric system + manual export
   - [ ] Dedicated HRIS software
   - [ ] Paper timesheets
   - [ ] Other: ___

3. How much time per week do you spend on attendance/payroll?
   - [ ] < 1 hour
   - [ ] 1-3 hours
   - [ ] 3-5 hours
   - [ ] > 5 hours

4. What's your biggest pain point? (Rank 1-5, 1=most painful)
   - Manual data entry
   - Payroll calculation errors
   - Late/absent tracking
   - Report generation
   - Integration with payroll software

5. Which features would you use? (Check all that apply)
   - [ ] Auto-sync attendance from biometric
   - [ ] Mobile app for employees
   - [ ] Overtime calculation
   - [ ] Leave management
   - [ ] Payroll integration

6. How much would you pay per employee per month?
   - [ ] $0-5
   - [ ] $5-10
   - [ ] $10-20
   - [ ] $20+
   - [ ] Would not pay

7. Would you switch from your current solution?
   - [ ] Yes, immediately
   - [ ] Yes, if price/features better
   - [ ] No, happy with current
   - [ ] No, locked into contract
```

**Analysis:**

```python
# Analyze survey results
import pandas as pd

df = pd.read_csv('survey_results.csv')

# Feature demand
feature_demand = df[['auto_sync', 'mobile_app', 'overtime', 'leave', 'payroll_integration']].sum()
print(feature_demand.sort_values(ascending=False))

# Output:
# payroll_integration    87
# auto_sync              76
# overtime               45
# mobile_app             34
# leave                  28

# Prioritize: Payroll integration + auto-sync (top 2)
```

### Usability Testing Tools

**Remote moderated testing:**
- **Zoom/Google Meet** (free): Screen share + record, manual notes
- **Loom** (free): Participant records their screen + voice
- **Maze** ($99-300/mo): Prototype testing with heatmaps, analytics
- **UserTesting** ($49+/test): Recruit participants + AI insights

**Remote unmoderated testing:**
- **Hotjar** (free-$99/mo): Session recordings, heatmaps (production site)
- **FullStory** ($free-$199/mo): Session replay with error tracking
- **Lookback** ($free-$100/mo): Participant self-recording

**In-person testing:**
- **Paper + pen** (free): Observer takes notes during test
- **Screen recorder** (QuickTime/OBS, free): Record screen + audio

**Recommendation:**
- **Solo dev / $0 budget:** Zoom + manual notes
- **Small team / <$100/mo:** Hotjar (post-launch analytics)
- **Team 3+ / <$300/mo:** Maze (prototype testing) + Hotjar (production)

### Usability Testing (Task-Based)

**Goal:** Find critical blockers before launch, not perfection.

**Minimum viable test:**
- **Participants:** 3-5 users (internal team, friends, beta users)
- **Duration:** 15 min per user
- **Method:** Task-based observation (not survey)
- **Critical flow:** 1-2 most important user journeys (e.g., sign up → create first item)

### Test Script Template

```markdown
# Usability Test — [Feature Name]

**Date:** 2026-09-22
**Tester:** [contributor]
**Participant:** P1 (internal team member, first-time user)

## Pre-test Questions
1. Have you used similar tools before? (Yes/No)
2. What's your tech comfort level? (Beginner/Intermediate/Advanced)

## Task 1: Sign up and create first expense

**Instruction (read aloud):**
> "Imagine you just had lunch and spent $15. Sign up for the app and record that expense."

**Observation:**
- Started at: homepage
- Clicked: "Sign Up" button (found immediately)
- Filled: email, password (no issues)
- **Blocker:** After sign up, landed on empty dashboard, unclear where to add expense
- **Recovery:** Scrolled, found "+ Add Expense" button after 8 seconds
- Completed: Yes (with hesitation)
- Time: 45 seconds (target: 30s)

**Participant feedback (verbatim):**
> "I wasn't sure where to click after signing up. Maybe show a tooltip or highlight the button?"

## Task 2: Filter expenses by category

**Instruction:**
> "You want to see only your Food expenses. Can you filter the list?"

**Observation:**
- Started at: expense list (3 expenses visible)
- **Blocker:** Looked for dropdown, didn't see filter UI (hidden in hamburger menu)
- **Failed:** Gave up after 20 seconds
- Asked: "Where's the filter?" (tester pointed to hamburger icon)
- Completed: Yes (after hint)

**Participant feedback:**
> "I expected filters to be visible at the top, not hidden."

## Post-test Questions
1. Overall, how easy was it to use? (1-5, 5=very easy): **3/5**
2. Would you use this daily? **"Maybe, if the filter is easier to find."**

## Summary
- **Task 1 completion:** 100% (with hesitation)
- **Task 2 completion:** 0% (without hint)
- **Critical fix needed:** Move filter UI to visible position (top bar)
- **Nice-to-have:** Onboarding tooltip after first sign up
```

---

## Design Review Checklist (Self-Check Before User Test)

### Layout & Hierarchy
- [ ] Primary action is visually dominant (size, color, position)
- [ ] Information hierarchy clear (title > body > caption)
- [ ] Whitespace used intentionally (not cluttered)
- [ ] Alignment consistent (left-aligned text, centered headings)

### Color & Contrast
- [ ] All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [ ] Status colors semantically correct (green=success, red=error, yellow=warning)
- [ ] Links distinguishable from body text (color + underline, or high contrast)

**Tool:** Chrome DevTools → Inspect element → Contrast ratio displayed in color picker

### Typography
- [ ] Font size ≥ 16px for body text (mobile)
- [ ] Line height 1.5x for body text (readability)
- [ ] Line length 50-75 characters (optimal reading)
- [ ] Font weight differentiation (bold for headings, regular for body)

### Touch Targets (Mobile)
- [ ] All buttons/links ≥ 44x44px (Apple HIG)
- [ ] Spacing between targets ≥ 8px (prevent misclick)

**Tool:** Chrome DevTools → Device mode → Show rulers

**Advanced usability testing tools:**

| Tool | Best For | Price | Features |
|------|----------|-------|----------|
| **Maze** | Prototype testing | $99-300/mo | Mission paths, heatmaps, misclick detection |
| **UserTesting** | Recruit + test | $49/test | Real users, video recordings, AI insights |
| **Lookback** | Live moderated | Free-$100/mo | Screen share, multi-participant, transcripts |
| **Hotjar** | Production analytics | Free-$99/mo | Heatmaps, session recordings, surveys |
| **FullStory** | Production replay | Free-$199/mo | Session replay, error tracking, funnels |
| **Optimal Workshop** | IA testing | $99-249/mo | Card sorting, tree testing, first-click tests |

**When to use which tool:**
- **Phase 2 (Planning):** Optimal Workshop (card sorting for IA), UserTesting (validate concepts)
- **Phase 4 (Design):** Maze (test Figma prototypes), Lookback (live feedback)
- **Phase 5 (Build):** Zoom + manual notes (cheap task-based testing)
- **Phase 6 (Production):** Hotjar/FullStory (watch real user sessions, find bugs)

**Example: Maze prototype test setup**

```markdown
# Maze Mission — Sign Up Flow

**Prototype:** Figma link
**Mission:** "Sign up and create your first expense"

**Metrics tracked:**
- Completion rate (target: 80%+)
- Time to complete (target: <60s)
- Misclicks (target: <2 per user)
- Heatmap (where users click)

**Results (5 participants):**
- Completion: 60% (3/5 completed without help)
- Avg time: 95s (35s over target)
- Misclicks: 4.2 avg (users clicked logo, expected it to be clickable)
- Blocker: "Add Expense" button not visible on mobile (hidden below fold)

**Action items:**
- #1: Move "Add Expense" button above fold (mobile)
- #2: Remove clickable area from logo (confuses users)
```

### Loading & Error States
- [ ] Loading state shown within 200ms (skeleton or spinner)
- [ ] Error message actionable (not "Error 500", say "Failed to save. Retry?")
- [ ] Empty state helpful (not blank screen, show CTA or explanation)

---

## Accessibility Audit (Quick)

### Automated Scan (5 min)

**Tool:** Lighthouse (Chrome DevTools → Lighthouse → Accessibility)

**Target:** Score ≥ 85 (Medium) / ≥ 90 (Large+)

**Common issues:**
- Missing `alt` text on images
- Form inputs without `<label>` or `aria-label`
- Insufficient color contrast
- Missing focus indicators
- Heading levels skipped (h1 → h3, skipping h2)

### Manual Keyboard Test (5 min)

**Test:**
1. Tab through entire page (all interactive elements reachable?)
2. Shift+Tab (reverse order works?)
3. Enter on buttons (activates action?)
4. Escape on modals (closes modal?)
5. Arrow keys in dropdowns/select (navigates options?)

**Blocker:** Any interactive element not reachable via keyboard.

### Screen Reader Test (10 min, optional here — but not a substitute for the mandatory AA gate)

**This is a quick designer self-check, not the compliance gate.** For the formal
WCAG 2.1 AA sign-off, screen reader testing is **mandatory**, not optional — see
`references/frontend/ACCESSIBILITY_WCAG_GUIDE.md`'s Verification Workflow. This 10-minute
version exists so a designer can catch obvious problems early and cheaply, before
the fuller, mandatory pass happens later; running this quick check does not mean
the AA gate's screen reader requirement has been satisfied.

**Tool:**
- macOS: VoiceOver (Cmd+F5)
- Windows: NVDA (free, https://www.nvaccess.org/)
- Chrome extension: ChromeVox

**Test:**
1. Navigate 1 critical flow (e.g., sign up → create item) with eyes closed
2. Check: Are labels read correctly? Is focus order logical?

**Blocker:** Cannot complete critical flow without vision.

---

## Design Debt Tracking

**Not every design issue blocks launch.** Track non-critical issues for future sprints.

**Template (in TASKS.md or GitHub Issues):**

```markdown
## Design Debt

- [ ] #D1: Filter UI hidden in hamburger (mobile) — move to top bar
  - **Priority:** High
  - **Sprint:** 2
  - **Est fix:** 2h
  - **Blast radius:** 2 files (Header.tsx, FilterPanel.tsx)
  - **User impact:** 40% (mobile users)

- [ ] #D2: Onboarding tooltip for first-time users
  - **Priority:** Medium
  - **Sprint:** 3
  - **Est fix:** 4h
  - **Blast radius:** 3 files (Dashboard.tsx, Tooltip.tsx, onboarding state)
  - **User impact:** 100% (all new users)

- [ ] #D3: Dark mode colors not tested thoroughly
  - **Priority:** Low
  - **Target:** Post-launch
  - **Est fix:** 6h
  - **Blast radius:** All components (token swap)
  - **User impact:** 15% (dark mode users)

- [ ] #D4: Empty state illustration placeholder (use icon for now)
  - **Priority:** Low
  - **Target:** v2.0
  - **Est fix:** 8h (design + implement)
  - **Blast radius:** 5 empty states
  - **User impact:** 5% (users hitting empty states)
```

**Priority + Estimation:**
- **High:** Blocks user task completion — fix next sprint, <4h
- **Medium:** Causes friction — backlog 1-2 months, 4-8h
- **Low:** Polish — defer 3+ months, 8h+

**Required fields:**
- `Est fix:` hours
- `Blast radius:` files/components impacted
- `User impact:` percentage affected (optional, for prioritization)

---

## When to Skip User Testing

**You can skip formal usability testing if:**

1. **Internal tool** with ≤ 5 users (just ask them directly)
2. **Exact clone** of existing UI pattern (e.g., Linear-style kanban, Notion-style editor)
3. **No novel interaction** (standard CRUD forms, no custom UX)

**But still run:**
- Accessibility audit (Lighthouse)
- Keyboard navigation test
- Responsive breakpoint test

---

## Integration with Gates

Update `engine/GATE-REGISTRY.md`:

```markdown
### gate:sprint-demo (Sprint Demo)

**Trigger:** End of sprint, before demo to stakeholders

**Evidence:**
- All sprint tasks marked Done in TASKS.md
- **Design validation checklist completed** ← NEW
- At least 1 usability test recorded (or skip justification documented)
- Accessibility score ≥ 85 for Medium (≥ 90 for Large+) (Lighthouse)
- Responsive tested (mobile/tablet/desktop)

**Blocker:** Cannot demo if task completion rate < 80% (must achieve ≥ 80% via remediation loop).

---

### gate:production-deploy (Production Deploy)

**Trigger:** Before deploying to production

**Evidence:**
- UAT passed
- Security checklist passed
- Performance budget not exceeded
- **Design validation passed** ← NEW
- Rollback plan documented

**Design validation for production:**
- Accessibility score ≥ 85 for Medium (≥ 90 for Large+)
- No critical usability blockers (from prior sprint demos)
- Error states implemented (500, 404, network error)
```

---

## Example: Design Validation Report

```markdown
# Design Validation Report — Sprint 2

**Date:** 2026-09-22
**Features:** Expense filtering, category management

## Visual QA
- ✅ Matches DESIGN.md (color, typography, spacing)
- ✅ Responsive tested (375px, 768px, 1024px)
- ⚠️ Dark mode: border contrast low in category dropdown (opened issue #D3)
- ✅ All interactive states implemented
- ✅ Loading states: skeleton for expense list
- ✅ Error states: empty state for "No expenses"

## Accessibility
- ✅ Lighthouse score: 94/100
- ✅ Keyboard navigation: all elements reachable
- ✅ Focus visible on all buttons/inputs
- ⚠️ Screen reader: category dropdown label missing (fixed before demo)
- ✅ Touch targets: all ≥ 44px

## Usability Test
- Participants: 3 (2 internal, 1 beta user)
- Critical flow: Filter expenses by category
- Task completion: 100% (after fix — moved filter to top bar)
- Average time: 12s (target: 15s)
- User feedback: "Much easier to find filter now"

## Blockers Found & Fixed
- **Blocker:** Filter UI hidden in hamburger menu (mobile) → Moved to visible top bar
- **Blocker:** Category dropdown missing `aria-label` → Added label

## Design Debt Logged
- #D3: Dark mode border contrast (Low priority, post-launch)

## Verdict
- ✅ **PASSED** — Ready for sprint demo
```

---

**Agent Instruction:**

Before any sprint demo or production deploy:

1. Run Lighthouse accessibility audit
2. Test keyboard navigation on 1 critical flow
3. Test responsive breakpoints (mobile/tablet/desktop)
4. Record at least 1 user test (3 participants, 1 critical flow)
5. Fix all critical blockers until task completion rate reaches ≥ 80% (see remediation loop above)
6. Log non-critical issues as design debt

Do not skip accessibility audit even if timeline is tight.
