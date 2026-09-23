# OWNERSHIP — Nexus Settlement Engine

**Rule:** Every directory has an assigned owner. Writing outside assigned boundaries is blocked by CI commit gates. Shared interface modifications require multi-party consensus.

---

## 1. Subsystem Path Allocations

| Path | Allowed Writers | Read-Only Observers | Security Level |
|---|---|---|---|
| `/services/ledger/**` | `ledger-agent` | `audit-agent`, `clearing-agent` | Tier 0: Critical Financial |
| `/services/clearing/**` | `clearing-agent` | `gateway-agent` | Tier 1: Core Engine |
| `/services/ingest/**` | `gateway-agent` | All agents | Tier 1: Network Ingestion |
| `/services/bridge/**` | `bridge-agent` | `audit-agent` | Tier 1: External Banking |
| `/services/audit/**` | `audit-agent` | `secops-lead` | Tier 0: Regulatory |
| `/web/ops-portal/**` | `frontend-agent` | `qa-agent` | Tier 2: Internal UI |
| `/contracts/**` | Human Architects only | All agents | Locked Interface |
| `ARCHITECTURE.md` | Human Architects only | All agents | Baseline Spec |
| `VERIFY.md` | SecOps / Human Lead only | All agents | Gate Authority |
| `CONTEXT.md` | Orchestrator Agent only | All agents | Session State |

---

## 2. Governance Protocol for Financial Contracts

1. No agent may unilaterally alter files under `/contracts/` or `/services/ledger/schema/`.
2. Schema revisions require a formal Change Request (CR) documented in `docs/decisions/` and dual sign-off from `Tech Lead` and `Compliance Officer`.
3. Worktree isolation: Parallel agent tasks must run in separate git worktrees (`git worktree add ../nexus-wt-[branch]`) to prevent filesystem collision.
