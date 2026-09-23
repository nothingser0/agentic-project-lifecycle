# Information Architecture Guide — 7+ Pages

**Purpose:** Prevent navigation chaos in multi-page projects.

**Applies to:** Medium+ projects with 7+ pages. Small: skip.

---

## Why IA Matters

**Problem without IA:**
- 10+ pages with no hierarchy → flat nav menu chaos
- Users can't find features
- Developer adds pages randomly
- Navigation structure inconsistent

**Solution:**
Design IA before building navigation components.

**Core Principles (Strong Defaults, Not Rigid Blockers):**
- **Target hierarchy:** Max 3 levels deep (Home → Section → Page).
- **Target primary nav:** ≤ 7 top-level items (Miller's Law cognitive chunking).
- **Enterprise / Complex Domain Exception:** Applications with extensive functional breadth (ERPs, multi-tenant B2B portals, deep e-commerce taxonomies) may legitimately require 8+ top-level sections or 4 levels of depth. Exceeding these thresholds is permitted when documented in `INFORMATION-ARCHITECTURE.md` with an `ia_exception` rationale and verified via a 3-click task completion test.

---

## IA Document Template

**Create:** `docs/planning/INFORMATION-ARCHITECTURE.md`

```markdown
# Information Architecture — [Project Name]

**Date:** 2026-09-22  
**Pages:** 12  
**Navigation Pattern:** Sidebar (primary) + Breadcrumbs (secondary)

---

## Site Map (Hierarchy)

```
Home (Dashboard)
├── Employees
│   ├── Employee List
│   ├── Add Employee
│   └── Employee Detail
│       └── Edit Employee
├── Attendance
│   ├── Clock In/Out
│   ├── Attendance History
│   └── Leave Requests
│       ├── Request Leave
│       └── Approve Leave (Manager only)
├── Payroll
│   ├── Payroll List
│   ├── Generate Payroll (HR only)
│   └── Payslip Detail
└── Settings
    ├── Profile
    ├── Company Settings (Admin only)
    └── Integrations
```

---

## Navigation Patterns

### Primary Navigation: Sidebar

**Top-level items (always visible):**
- Dashboard
- Employees
- Attendance
- Payroll
- Settings

**Sub-items (expand on click):**
- Employees → Employee List, Add Employee
- Attendance → Clock In/Out, History, Leave Requests
- Payroll → Payroll List, Generate Payroll
- Settings → Profile, Company Settings, Integrations

### Secondary Navigation: Breadcrumbs

**Example:**
```
Home > Employees > John Doe > Edit
```

**Show on:** All pages except Dashboard

---

## Page Inventory

| Page | Path | Role Access | Parent | Nav Label |
|------|------|-------------|--------|------------|
| Dashboard | `/` | All | - | Dashboard |
| Employee List | `/employees` | All | Employees | Employees |
| Add Employee | `/employees/new` | HR, Admin | Employees | Add Employee |
| Employee Detail | `/employees/[id]` | All | Employees | (Employee Name) |
| Edit Employee | `/employees/[id]/edit` | HR, Admin | Employee Detail | Edit |
| Clock In/Out | `/attendance` | All | Attendance | Clock In/Out |
| Attendance History | `/attendance/history` | All | Attendance | History |
| Leave Requests | `/attendance/leave` | All | Attendance | Leave Requests |
| Request Leave | `/attendance/leave/new` | All | Leave Requests | Request Leave |
| Approve Leave | `/attendance/leave/approve` | Manager, Admin | Leave Requests | Approve (Manager) |
| Payroll List | `/payroll` | HR, Admin | Payroll | Payroll |
| Generate Payroll | `/payroll/generate` | HR, Admin | Payroll | Generate Payroll |
| Payslip Detail | `/payroll/[id]` | All (own), HR (all) | Payroll | (Month) |
| Profile | `/settings` | All | Settings | Profile |
| Company Settings | `/settings/company` | Admin | Settings | Company Settings |
| Integrations | `/settings/integrations` | Admin | Settings | Integrations |

**Total:** 16 pages

---

## Navigation Rules

### Role-Based Menu

**Employee (base role):**
- Dashboard
- Employees → Employee List only (view)
- Attendance → Clock In/Out, History, Leave Requests
- Payroll → Own payslip only
- Settings → Profile only

**Manager:**
- Employee + Attendance → Approve Leave

**HR:**
- Manager + Employees → Add Employee, Edit Employee
- Payroll → All payrolls, Generate Payroll

**Admin:**
- HR + Settings → Company Settings, Integrations

### Mobile Navigation

**Pattern:** Bottom tab bar (5 items max) + hamburger menu (overflow)

**Bottom tabs:**
1. Dashboard
2. Employees
3. Attendance
4. Payroll
5. More (hamburger)

**Hamburger menu (More):**
- Settings
- Help
- Logout

---

## Search Strategy

**Global search (Cmd+K):**
- Search employees by name
- Search attendance records by date
- Search payroll by month
- Search pages by title

**Search scope by context:**
- On `/employees`: search employees only
- On `/attendance`: search attendance records only
- On `/payroll`: search payroll records only

---

## Empty States

| Page | Empty State Message | CTA |
|------|---------------------|-----|
| Employee List (0 employees) | "No employees yet. Add your first employee to get started." | "Add Employee" button |
| Attendance History (0 records) | "No attendance records yet. Clock in to start tracking." | "Clock In" button |
| Leave Requests (0 requests) | "No leave requests. Request your first leave." | "Request Leave" button |
| Payroll List (0 payrolls) | "No payroll generated yet. Generate payroll for this month." | "Generate Payroll" button (HR only) |

---

## User Flows

### Flow 1: Clock In (Employee)

```
Dashboard → Click "Clock In" → Attendance page → 
Capture GPS + Photo → Submit → Success → Return to Dashboard
```

**Pages visited:** 2 (Dashboard, Attendance)

### Flow 2: Approve Leave (Manager)

```
Dashboard → Attendance → Leave Requests → Approve Leave tab → 
See pending requests → Click "Approve" → Confirm → Success
```

**Pages visited:** 3 (Dashboard, Attendance, Leave Requests)

### Flow 3: Generate Payroll (HR)

```
Dashboard → Payroll → Generate Payroll → 
Select month → Review employees → Click "Generate" → 
Confirm → Processing → Success → Payroll List
```

**Pages visited:** 3 (Dashboard, Payroll, Generate Payroll)

---

## IA Validation Checklist

**Before building navigation:**

- [ ] All pages listed in page inventory
- [ ] Hierarchy max 3 levels deep (Home → Section → Page) — **default, not an absolute
      ceiling.** This is the right target for most product UIs (dashboards, internal
      tools, SaaS apps), where deep nesting genuinely hurts findability. A
      content-heavy site with a legitimately large, well-established taxonomy
      (documentation portals, government sites, large e-commerce catalogs) may need
      4+ levels — if so, don't force-flatten it just to satisfy this checkbox; instead
      validate the deeper hierarchy with actual users (can they still find things in
      3-5 clicks?) and record the justification: `ia_exception: { depth: [N], reason:
      [content volume / established taxonomy], validated_with_users: [yes/no] }`.
- [ ] No orphan pages (every page has a parent or is top-level)
- [ ] Primary nav items ≤ 7 (cognitive limit) — same caveat: a documentation site with
      12 genuinely distinct top-level topic areas shouldn't be artificially merged into
      7 buckets that no longer map to how users think about the content. Prefer
      grouping into ≤7 only when the grouping is itself meaningful to users, not when
      it's forced.
- [ ] Role-based access defined per page
- [ ] Mobile nav pattern chosen (tabs/hamburger/hybrid)
- [ ] Search scope defined
- [ ] Empty states written for all list pages
- [ ] Top 3 user flows documented

---

## Anti-Patterns (Avoid)

❌ **Flat nav menu with 15 items:**
```
Dashboard | Employees | Add Employee | Edit Employee | 
Attendance | Clock In | Clock Out | History | Leave Requests | 
Request Leave | Approve Leave | Payroll | Generate Payroll | 
Settings | Company Settings
```

Too many choices = decision paralysis.

✅ **Hierarchical nav (max 7 top-level):**
```
Dashboard | Employees | Attendance | Payroll | Settings
```

Each expands to sub-items.

---

❌ **Deep hierarchy (4+ levels):**
```
Home > HR > Payroll > Monthly > 2026 > September > Employee > John Doe
```

Too many clicks.

✅ **Max 3 levels:**
```
Home > Payroll > September 2026
```

Click employee name → modal/drawer (not new page).

---

## Integration with Design

**After IA approved:**
1. Update `DESIGN.md` with navigation component specs
2. Add IA diagram to Figma/design file
3. Build reusable `<Sidebar>` and `<Breadcrumbs>` components
4. Implement role-based menu filtering
5. Add mobile nav (bottom tabs + hamburger)

---

## When to Create IA Document

**Mandatory trigger (Medium+):**
- Project has 7+ pages
- Navigation pattern not yet defined

**Do this BEFORE:**
- Building navigation components
- Wireframing pages
- Sprint planning for navigation work

**Gate:** Cannot start navigation component build until IA document exists and is reviewed.

---

**Agent Instruction:**

When project reaches 7 pages:
1. Pause feature work
2. Create `docs/planning/INFORMATION-ARCHITECTURE.md`
3. Fill page inventory (all current + planned pages)
4. Design hierarchy (max 3 levels, max 7 top-level)
5. Choose navigation pattern (sidebar/tabs/breadcrumbs)
6. Define role-based menu filtering
7. Document top 3 user flows
8. Get user approval
9. Only then: build navigation components

Do not build nav without IA. Random nav = bad UX.

---

**Last Updated:** 2026-09-22  
**Version:** 1.0.0
