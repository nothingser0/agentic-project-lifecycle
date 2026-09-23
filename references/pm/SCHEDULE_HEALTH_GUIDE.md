# Schedule Health Guide — Slip Detection & Correction

**Purpose:** Provide AI agents with a concrete mechanism to detect projects that are consistently slipping and surface them to the user — not merely record and continue.

**When to use:** At every checkpoint in the Build Loop (Medium+), and whenever `TASKS.md` is updated with a completed or rescheduled milestone.

---

## When Health Checks Run

| Event | Trigger |
|---|---|
| Milestone completed | Record actual vs. planned date, calculate slip |
| Milestone shifted | Run health check before updating `TIMELINE.md` |
| Every 3 completed milestones | Run rolling automated health check |
| User adds scope | Run before accepting new scope |

---

## How to Calculate Schedule Health

### Step 1 — Collect data from TASKS.md / TIMELINE.md

For each completed milestone, record:

```
Milestone | Planned Date | Actual Date | Slip (days)
M1        | 2026-09-10   | 2026-09-10  | 0
M2        | 2026-09-17   | 2026-09-19  | +2
M3        | 2026-09-24   | 2026-09-29  | +5
```

### Step 2 — Calculate average slip

```
Average slip = total slip days / number of completed milestones
Example: (0 + 2 + 5) / 3 = 2.3 days average slip per milestone
```

### Step 3 — Apply thresholds

| Condition | Status | Action |
|---|---|---|
| Average slip = 0, no milestone slipped > 20% | 🟢 **On Track** | Proceed normally |
| 1–2 consecutive slipped milestones, OR average slip 1–3 days | 🟡 **At Risk** | Surface to user, offer scope trim |
| 3+ consecutive slipped milestones, OR average slip > 3 days, OR cumulative slip > 20% total timeline | 🔴 **Off Track** | Halt build, mandatory user escalation before proceeding |

---

## Action by Status

### 🟢 On Track
No special action. Record in checkpoint ledger:
```
Schedule health: 🟢 On track (0 slipped milestones)
```

### 🟡 At Risk

Surface to user using this template — do not silently log to a file and proceed:

```
⚠️ Schedule health: AT RISK

Slipped milestones: M2 (+2 days), M3 (+5 days)
Average slip: 2.3 days per milestone
Projection: if this trend continues, target completion will shift +[N] days from baseline

Options:
A) Trim scope — which feature can be deferred to the next session/release?
B) Extend timeline — officially shift the completion date (create CR)
C) Add capacity — are additional resources available?

Please choose one before I proceed to the next milestone.
```

Do not continue building until the user selects an option.

### 🔴 Off Track

Stop build. Surface to user with this template:

```
🔴 Schedule health: OFF TRACK — decision required before proceeding

3 consecutive milestones slipped:
- M2: +2 days
- M3: +5 days  
- M4: +4 days
Average slip: 3.7 days per milestone
Cumulative slip: +11 days (from baseline total [N] days)

This is a recurring pattern, not a one-off anomaly. Root cause identification required:
- Were estimates overly optimistic?
- Is scope larger than anticipated?
- Are persistent technical blockers emerging?

A formal Change Request (CR) is mandatory before proceeding — use template
templates/pm/CHANGE_REQUEST_TEMPLATE.md.

Once the CR is approved, I will update TIMELINE.md and resume.
```

The agent **must not continue building** until the user responds and the CR is formally created.

---

## Integration with CONTEXT.md

Whenever a health check runs, update these fields in `CONTEXT.md`:

```
schedule_health: [green | yellow | red]
last_health_check: [YYYY-MM-DD]
cumulative_slip_days: [N]
slipped_milestones: [N out of total M completed]
```

If `schedule_health: red` and no CR is recorded in `docs/pm/changes/`, the agent must refuse to continue building even if requested by the user — this is non-negotiable.

---

## Example Checkpoint Ledger with Health Check (Medium+)

```
Done: M1-auth, M2-dashboard.
Building: M3-employee-CRUD.
Queued: M4-role-nav, M5-CSV-export.
Added this session: CSV export (pushed role-nav to next milestone).

Schedule health: 🟡 AT RISK
- M2 completed +2 days behind plan
- Projection: M3 likely +2-3 days late if pattern holds
- Surfaced to user → user elected to trim scope (defer CSV export to Phase 2)
- CR-001 drafted and approved
```

---

## Notes for Solo Projects / Small Tier

- Small tier: formal health checks are not mandatory, but the agent should flag if tasks take significantly longer than expected.
- Solo developer Medium+: run health check with simplified output — formal CR not required; a single decision paragraph in `docs/dev-docs/DECISIONS.md` is sufficient.
