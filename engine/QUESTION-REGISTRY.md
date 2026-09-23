# Question Registry

This is the only source of truth for prompt interview identity and its activation. `SKILL.md` explains behavior; this file holds the registry count and capability ID.

## Question Count Rules

- One **prompt unit** = one independent decision prompt.
- Range like `Q45-Q50` = six prompt units.
- Repeated patterns like `Q5a-e × N user types` are **dynamic** and must not be treated as fixed global question count.
- Sub-questions are counted only when the activation condition is true.
- Core IDs are preserved for compatibility.
- Capability IDs use namespace to prevent collisions.

## Phase Registry

| Phase | Core units | Conditional / dynamic units | Notes |
|-------|------------|-----------------------------|-------|
| Phase 0 | 10 | 11 | Q0a-i, Q0c-i/ii, Q0d-i, Q0e-i/ii/iii, Q0g-i/ii/iii = 11 probes |
| Phase 1a | 8 | 0 | QR1–QR8 |
| Phase 1 | 10 | 15+dynamic | Q3a-c (3), Q5a-e (5 × user type), Q7a-d (4), Q8b (1), Q10a-b (2) |
| Phase 2 | 5 | 4 | Q11a, Q12a, Q15a-b |
| Phase 2a | 8 | 0 | QT1–QT8 |
| Phase 3 | 8 | 5 | Q15 (domain classifier, always first), Q16a-b, Q17a, Q18a-b |
| Phase 4 | 11 | 3 | Q33a-c; whole phase may be skipped when design is already supplied |
| Phase 5 | 38 | 67 | 38 core + capability registry below |
| Phase 6 | 6 | 4 | QD2-i/ii, QD5-i/ii; QD3/QD5 may be skipped by role model |
| Phase 7 | 9 | 5 | QC2-i/ii, QC3-i, QC7-i, QC8-i; QC1 can block the phase before QC2–QC9 |

Deliberately **no global minimum/maximum question count**. The registry contains prompt units;
actual turn depends on project entities, existing evidence, and skip rules.

## Phase 5 capability namespaces

| Namespace | Units | Activation |
|-----------|-------|------------|
| SD1–SD6 | 6 | Frontend / stateful UI |
| RT1–RT6 | 6 | Real-time/collaboration/notifications |
| EDGE1–EDGE10 | 10 | Extreme performance / edge requirement |
| ENT1–ENT10 | 10 | Q12 = 21+ developers |
| DS1–DS8 | 8 | Q12 = 6+ developers and a shared design system is needed |
| COMP1–COMP2 | 2 | Enterprise or regulated healthcare/fintech context |
| MOB1–MOB4 | 4 | Mobile scope |
| AI1–AI6 | 6 | Q10 != None |
| DATA1–DATA3 | 3 | Data-heavy / pipeline scope |
| PAY1–PAY5 | 5 | Payments are actually in scope |
| EMAIL1–EMAIL4 | 4 | Transactional/marketing email is actually in scope |
| CMS1–CMS3 | 3 | Content management is actually in scope |
| **Total** | **67** | Full activation only |

## Capability prompt definitions

### State & Data — SD1–SD6

- SD1 State management
- SD2 Form library
- SD3 Data fetching/cache
- SD4 Table/data-grid strategy
- SD5 Validation strategy
- SD6 File upload/storage

### Real-Time — RT1–RT6

- RT1 Real-time provider/transport
- RT2 Collaboration model
- RT3 Notification delivery
- RT4 Presence
- RT5 Conflict resolution
- RT6 WebRTC/video

### Edge & WebAssembly — EDGE1–EDGE10

Edge computing, edge data, WebAssembly, global routing, cold-start strategy, cache topology,
regional data placement, edge observability, failure fallback, and runtime constraints.

### Enterprise DevOps — ENT1–ENT10

GitOps, chaos engineering, feature flags, experimentation, distributed tracing, service mesh,
load balancing, autoscaling, multi-tenancy, and disaster recovery.

### Design Systems at Scale — DS1–DS8

Design tokens, Storybook/component inventory, visual regression, design-to-code, multi-brand,
versioning, governance, and design handoff.

### Compliance — COMP1–COMP2

Required framework/control set and data residency/location requirements.

### Mobile — MOB1–MOB4

Push notifications, offline strategy, native modules, and distribution/release channels.

### AI/LLM — AI1–AI6

Provider, architecture, vector/retrieval layer, safety, cost budget, and observability.

### Data Pipeline — DATA1–DATA3

Pipeline architecture, analytics tooling, and BI/reporting tooling.

### Payments — PAY1–PAY5

Payment need, provider, payment model, payment methods, and multi-currency/tax considerations.

### Email — EMAIL1–EMAIL4

Email need, provider, templates/delivery, and marketing/lifecycle tooling.

### CMS — CMS1–CMS3

CMS need, content model/type, and provider.

## Evidence Schema

Every material answer must be normalized to:

```yaml
id: PAY2
status: DECIDED | PROVISIONAL | ASSUMED | UNKNOWN | BLOCKED
answer: <normalized value>
source: user | existing-doc | external-source | inferred
owner: <person/role>
confidence: high | medium | low
recorded_at: <ISO-8601>
artifact_targets:
  - docs/...
```

The agent must not change `UNKNOWN` to invented answers merely to complete artifacts.