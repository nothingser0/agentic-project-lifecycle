# Resource Leveling Guide — Resolving Schedule Conflicts

**Purpose:** Handle milestone deadline collisions when team capacity is limited.

**When to use:** Phase 2a (Timeline baseline), or when two milestones with hard deadlines compete for the same critical resource.

---

## Problem

Resource leveling solves: **same person needed in two places at once**.

Example:
- Milestone M2 (API integration) due Week 3
- Milestone M3 (Payment flow) due Week 3
- Both need the same senior backend dev (80% allocation)
- Collision: 160% demand on 80% capacity

---

## Leveling Decision Matrix

When milestones collide, apply this order:

### 1. Check Critical Path

**Question:** Which milestone blocks more downstream work?

- **Critical path milestone wins** — delay the non-critical one
- Both critical? → escalate to sponsor for priority call

**Tool:** Dependency map from `docs/pm/TIMELINE.md` — trace which milestone has more dependents.

---

### 2. Check External Dependency

**Question:** Does one milestone have a hard external deadline (client go-live, regulatory, contract penalty)?

- **External deadline wins** — absorb internal slip
- Both external? → escalate + request deadline extension from stakeholder

---

### 3. Check Business Value

**Question:** Which delivers higher value if forced to choose?

- Revenue-generating > cost-saving > internal tooling
- If unclear, ask sponsor: "M2 or M3 first?"

---

### 4. Resource Reallocation Options

Before delaying a milestone, try:

#### Option A: Split the Task
- Can M2 be split into M2a (critical) + M2b (deferred)?
- Deliver M2a on time, push M2b after M3

#### Option B: Reassign
- Can a mid-level dev handle part of M3 under supervision?
- Pair junior + senior for knowledge transfer

#### Option C: Increase Capacity (Temporary)
- Hire contractor for 2-4 weeks (Large+ budget)
- Borrow resource from another team (requires VP approval)

#### Option D: Reduce Scope
- Can M3 ship with 80% features and patch the rest post-launch?
- Requires Product Owner sign-off

---

## Leveling Workflow

```
COLLISION DETECTED (same resource, overlapping dates)
  ↓
CHECK CRITICAL PATH
  ├─ One is critical → prioritize critical
  └─ Both critical → check external dependency
          ↓
      CHECK EXTERNAL DEPENDENCY
        ├─ One external → prioritize external
        └─ Both external/internal → check business value
                ↓
            ASK SPONSOR: M2 or M3 first?
                ↓
            REALLOCATION OPTIONS (A/B/C/D)
                ↓
            UPDATE TIMELINE.md + NOTIFY STAKEHOLDERS
                ↓
            LOG DECISION in docs/pm/DECISIONS.md
```

---

## Recording the Decision

In `docs/pm/DECISIONS.md`:

```markdown
## Decision: Resource Leveling — M2 vs M3 Collision

**Date:** 2026-09-22  
**Decided by:** PM + Sponsor  

**Conflict:**
- M2 (API integration) due Week 3, needs Senior Backend Dev (4d)
- M3 (Payment flow) due Week 3, needs same dev (3d)
- Total: 7d demand, 4d capacity (80% allocation)

**Analysis:**
- Critical path: M2 blocks M4, M5, M6 (3 dependents). M3 blocks only M7.
- External deadline: None
- Business value: M2 > M3 (M2 unblocks client UAT)

**Decision:** Prioritize M2, delay M3 to Week 4.

**Mitigation:**
- Split M3 into M3a (checkout UI, 1d, assign to Frontend) + M3b (Stripe integration, 3d, Senior Backend after M2)
- M3a can start Week 3 parallel to M2
- Total slip: 0 days (M3 split absorbed the conflict)

**Stakeholders notified:**
- Client: M3 full delivery moved to Week 4 (acceptable per 2026-09-20 call)
- QA: M3 test window adjusted

**Updated:** `docs/pm/TIMELINE.md` M3 → Week 4, `TASKS.md` M3 split into M3a/M3b
```

---

## Integration with Timeline Baseline

In `docs/pm/TIMELINE.md`, add a "Resource Allocation" section:

```markdown
## Resource Allocation (Week-by-Week)

| Week | Dev A (80%) | Dev B (100%) | Designer (50%) | QA (100%) |
|------|-------------|--------------|----------------|----------|
| W1 | M1 (4d) | M1 (2d) | Onboarding | - |
| W2 | M1 (1d), M2 (3d) | M2 (4d) | M2 mockup (2d) | - |
| W3 | **M2 (4d)** ⚠️ collision resolved | M4 (5d) | M3a UI (2d) | M1 test (3d) |
| W4 | M3b (3d) | M5 (5d) | - | M2 test (4d) |

⚠️ **W3 Collision:** M2 + M3 both needed Dev A. Resolution: M2 prioritized (critical path), M3 split and delayed.
```

---

## When to Escalate

Escalate to sponsor/steering committee if:

1. **Both milestones are critical path + external deadline** (no safe choice)
2. **Resource is unavailable for >1 week** (sick leave, resignation)
3. **Collision impacts >20% of total project timeline** (systemic under-resourcing)
4. **Client refuses deadline extension** + internal capacity exhausted

---

## Anti-Patterns

❌ **Silent overload:** Assign 160% work to 80% capacity and hope for overtime  
✅ **Explicit trade-off:** "M2 or M3 first?" with impact stated

❌ **Scope creep absorption:** Add features mid-sprint without leveling  
✅ **Change control:** Every scope addition triggers leveling check

❌ **Invisible slack removal:** Consume all buffer without recording  
✅ **Buffer tracking:** Log buffer usage in `docs/pm/TIMELINE.md`

---

**Version:** 1.0.0  
**Part of:** Phase 2a (Detailed Timeline)  
**Integrated with:** PM Fundamentals (Q65c stakeholders, Q65d risks, Q65g change control)
