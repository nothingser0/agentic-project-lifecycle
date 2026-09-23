# Chaos Engineering Guide — Resilience Testing

**Purpose:** Test system resilience by intentionally injecting failures.

**When to use:** Large+ projects with scale target 100K+ users (Q8), or any system with uptime SLA ≥99%.

---

## When Chaos Engineering is Required

| Project Tier | Scale Target | Chaos Testing? | Scope |
|--------------|--------------|---------------|-------|
| Small/Medium | <10K users | No | Basic error handling sufficient |
| Large | 10K-100K | Optional | Test critical path failures |
| Enterprise | 100K+ | Yes | Full chaos experiments |

---

## Chaos Experiments (by Severity)

### Level 1: Component Failure (Start Here)

**Goal:** Verify graceful degradation when one component fails.

**Experiments:**

1. **Database unavailable**
   - Kill primary DB connection
   - Expected: App serves cached data, shows "limited functionality" banner
   - Fail: App crashes, 500 errors

2. **External API timeout**
   - Simulate payment gateway timeout (5s+)
   - Expected: Retry with exponential backoff, fallback to "payment pending" state
   - Fail: Checkout hangs indefinitely

3. **Cache miss**
   - Flush Redis cache mid-request
   - Expected: Query DB, repopulate cache, <500ms latency spike
   - Fail: N+1 queries, 5s+ latency

**Tools:**
- **Toxiproxy** (network conditions)
- **Chaos Monkey** (random service kills)
- **Manual:** Kill process (`kill -9 <pid>`)

---

### Level 2: Network Failure

**Goal:** Test behavior under network partition, latency, packet loss.

**Experiments:**

1. **Latency injection**
   - Add 500ms delay to DB queries
   - Expected: Requests still complete, may hit timeout (log warning)
   - Fail: Request queue backs up, memory leak

2. **Packet loss (10%)**
   - Drop 10% of packets between app and DB
   - Expected: Retry logic compensates, <5% error rate
   - Fail: Connection pool exhausted

3. **Network partition**
   - Split cluster into 2 isolated groups
   - Expected: Leader election, one group serves traffic
   - Fail: Split-brain (both groups accept writes)

**Tools:**
- **Toxiproxy** (latency, packet loss)
- **Pumba** (Docker network chaos)
- **tc** (Linux traffic control)

```bash
# Add 500ms latency with tc
sudo tc qdisc add dev eth0 root netem delay 500ms

# Remove
sudo tc qdisc del dev eth0 root
```

---

### Level 3: Resource Exhaustion

**Goal:** Test behavior when resources (CPU, memory, disk) are exhausted.

**Experiments:**

1. **CPU spike (90%)**
   - Simulate compute-heavy load
   - Expected: Auto-scaling triggered, <30s recovery
   - Fail: Requests queue up, cascade failure

2. **Memory leak**
   - Gradually increase memory usage (100MB/min)
   - Expected: OOM killer restarts process, <10s downtime
   - Fail: Entire node crashes

3. **Disk full**
   - Fill disk to 100%
   - Expected: Log rotation, alert fired, read-only mode
   - Fail: App crashes, data loss

**Tools:**
- **stress-ng** (CPU, memory, disk stress)
- **Gremlin** (commercial, easy UI)

```bash
# Stress CPU (4 cores, 60s)
stress-ng --cpu 4 --timeout 60s

# Fill memory (2GB)
stress-ng --vm 1 --vm-bytes 2G --timeout 60s
```

---

### Level 4: Regional Failure

**Goal:** Test multi-region failover.

**Experiments:**

1. **Region outage**
   - Shut down entire us-east-1 region
   - Expected: Traffic routes to us-west-2, <5min recovery
   - Fail: Manual intervention required

2. **Cross-region replication lag**
   - Delay replication by 30s
   - Expected: Reads from lagged replica show stale data (acceptable)
   - Fail: Writes fail due to replication conflict

**Requirement:** Multi-region deployment (DR environment from Q46).

---

## Chaos Testing Workflow

```
DEFINE HYPOTHESIS
  ↓
"System serves cached data when DB is unavailable"
  ↓
SETUP EXPERIMENT
  ↓
- Target: Production-like staging
- Blast radius: 10% of traffic
- Duration: 5 minutes
- Rollback: Automated (if error rate >5%)
  ↓
RUN EXPERIMENT
  ↓
- Inject failure (kill DB connection)
- Monitor metrics (error rate, latency, throughput)
- Observe: Does app serve cached data?
  ↓
ANALYZE RESULTS
  ↓
PASS: Cache served, <1% error rate
FAIL: 500 errors, no cache fallback
  ↓
IMPROVE SYSTEM
  ↓
- Add cache fallback logic
- Add circuit breaker
- Re-run experiment
  ↓
DOCUMENT FINDINGS
  ↓
Record in `docs/testing/CHAOS-REPORT.md`
```

---

## Chaos Experiment Template

```markdown
# Chaos Experiment — DB Failure

**Date:** 2026-09-22  
**Engineer:** [contributor]  
**Environment:** Staging  

## Hypothesis

"When primary DB is unavailable, app serves cached data with <1% error rate."

## Steady State

- Error rate: 0.01%
- p95 latency: 250ms
- Throughput: 500 rps

## Experiment Design

- **Failure:** Kill primary DB connection
- **Blast radius:** 10% of traffic (50 rps)
- **Duration:** 5 minutes
- **Rollback:** Automated if error rate >5%

## Results

| Metric | Before | During Failure | After Recovery |
|--------|--------|----------------|----------------|
| Error rate | 0.01% | **12%** ❌ | 0.02% |
| p95 latency | 250ms | 890ms | 280ms |
| Throughput | 500 rps | 440 rps | 495 rps |

## Outcome

❌ **FAILED** — Error rate 12% (target: <1%)

**Root cause:** Cache fallback logic not implemented.

## Improvements

1. Add Redis cache for read-heavy queries
2. Implement circuit breaker (fail fast after 3 consecutive errors)
3. Add "limited functionality" banner when DB unavailable

**Re-test:** Scheduled for Sprint 5 (after fixes deployed)

---

**Next experiment:** External API timeout (payment gateway)
```

---

## Chaos Tools Comparison

| Tool | Best For | Complexity | Cost |
|------|----------|------------|------|
| **Chaos Monkey** (Netflix) | Random service kills | Low | Free |
| **Toxiproxy** (Shopify) | Network conditions | Low | Free |
| **Pumba** | Docker chaos | Medium | Free |
| **Gremlin** | Full chaos platform (UI, RBAC, scheduling) | Low | Paid |
| **Chaos Mesh** (K8s) | Kubernetes chaos | High | Free |
| **AWS FIS** | AWS infra chaos | Medium | Pay-per-experiment |

**Recommendation:**
- **Start:** Toxiproxy (network) + manual kills
- **Scale:** Gremlin (if budget allows) or Chaos Mesh (K8s)

---

## Safety Rules

1. **Never run chaos on production** (unless Game Day, see below)
2. **Start small:** 1% traffic, 1 minute, rollback ready
3. **Monitor everything:** Error rate, latency, saturation, traffic (RED/USE metrics)
4. **Automate rollback:** If error rate >5%, stop experiment
5. **Blameless postmortem:** Focus on system, not person

---

## Game Day (Production Chaos)

**When to run:** After 3+ successful staging experiments, Large+ projects only.

**Requirements:**
- All hands on deck (eng, DevOps, PM)
- Monitoring dashboards live
- Rollback plan rehearsed
- Customer notification draft ready
- Off-hours (low traffic)

**Example Game Day:**

```
10:00 AM: Kickoff (all join war room)
10:05 AM: Inject failure (kill 1 app server, 5% traffic)
10:10 AM: Monitor metrics (error rate, latency)
10:15 AM: Rollback (restore server)
10:20 AM: Debrief (what worked, what didn't)
10:30 AM: Document findings
```

**Outcome:** Confidence that system can handle real outages.

---

## Integration with Gates

Update `engine/GATE-REGISTRY.md`:

```markdown
### gate:production-deploy (Large+ projects only)

**Evidence:**
- **Chaos experiments passed** — at least 3 experiments, all <1% error rate,
  **spanning at least 3 distinct failure categories** (a count of 3 alone does not
  satisfy this gate if all 3 are the same category, e.g. three separate DB-failure
  variants — that tests one failure mode three times, not three failure modes once
  each). Cover, at minimum, one from each of:
  - **Component failure** (e.g. DB failure, service crash)
  - **Network degradation** (e.g. external API timeout/latency injection, network
    partition between services)
  - **Resource exhaustion** (e.g. CPU/memory saturation, connection pool exhaustion)

  Example satisfying set: DB failure (component), External API timeout (network),
  Latency injection under load (resource). A set of three DB-failure variants does
  not satisfy this gate even though it is technically "3 experiments passed."
- Chaos report documented (`docs/testing/CHAOS-REPORT.md`), naming which category
  each experiment covered
- Circuit breakers implemented
- Monitoring alerts configured
```

---

**Version:** 1.0.0  
**Part of:** MAINTAIN phase, gate:production-deploy (Large+ only)  
**Integrated with:** Q8 (Scale Target), MONITORING_OBSERVABILITY.md
