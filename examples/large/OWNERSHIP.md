# OWNERSHIP — Fleet Route Optimizer

**Generated:** 2026-09-21
**Rule:** An agent may write ONLY to paths listed in its column. Writing outside assigned paths fails the commit gate.

---

## 1. Path-to-Agent Write Permissions

| Path | Allowed Writers | Read-Only For | Notes |
|---|---|---|---|
| `/cmd/gateway/**` | `be-agent` | `fe-agent` | Entry points and route registration |
| `/services/router/**` | `be-agent` | `fe-agent` | TSP solver, route calculation |
| `/services/fleet/**` | `be-agent` | `fe-agent` | Telemetry ingest, vehicle state |
| `/web/dispatch/**` | `fe-agent` | `be-agent` | Next.js dispatch console |
| `/contracts/**` | Human only | All agents | Interface lock — no agent may modify contracts unilaterally |
| `ARCHITECTURE.md` | Human only | All agents | Architecture baseline |
| `CONTEXT.md` | Orchestrator only | All agents | State tracking |
| `VERIFY.md` | Human only | All agents | Gate definitions |

---

## 2. Contract-Change Protocol

If `be-agent` needs to change an API shape in `/contracts/openapi.yaml`:
1. Do NOT edit the contract file directly.
2. Post a contract change proposal in the session ledger with: endpoint, old shape, new shape, rationale.
3. Wait for orchestrator/human approval before modifying code that depends on the change.
