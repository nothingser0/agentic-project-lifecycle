# ARCHITECTURE — Nexus Settlement Engine

**Tier:** Enterprise | **Pattern:** Event-Driven Distributed Microservices (Rust + Go + TypeScript)
**Classification:** Confidential / Restricted-Financial
**Last updated:** 2026-09-21 | **Latest ADR:** ADR-0012-deterministic-order-matching

---

## 1. System Topology & Subsystems

| Subsystem | Path | Technology | Responsibility |
|---|---|---|---|
| Ingestion Gateway | `/services/ingest` | Go 1.25 / gRPC | ISO-20022 message validation, HMAC authentication, rate limiting |
| Matching & Clearing | `/services/clearing` | Rust / Tokio | Deterministic order matching, FX rate locking, liquidity checks |
| Double-Entry Ledger | `/services/ledger` | Rust / PostgreSQL | Immutable transaction posting, account state, cryptographic hashing |
| SWIFT / Fedwire Bridge | `/services/bridge` | Go 1.25 / mTLS | External settlement network integration, MT103/pacs.008 generation |
| Audit & Compliance | `/services/audit` | Python / ClickHouse | Real-time AML pattern detection, immutable log streaming, SOC2 exports |
| Operations Console | `/web/ops-portal` | Next.js / React 19 | Settlement monitoring, manual exception clearing, compliance dashboard |

---

## 2. Invariants & Regulatory Boundaries

1. **Double-Entry Balance Guarantee:** Every financial transaction must satisfy `Sum(Debits) == Sum(Credits)`. Transactions failing this equation fail at the database constraint level before persistence.
2. **Immutable Audit Trail:** Ledger entries are append-only. Updates and deletions are strictly prohibited at the database schema level (`REVOKE UPDATE, DELETE ON ALL TABLES`). Corrections require explicit compensating reversals.
3. **Data Residency & Encryption:** Customer PII and banking coordinates are encrypted at rest using AES-256-GCM with customer-managed keys (AWS KMS). Clear-text account numbers are never emitted to application logs.
4. **Deterministic Settlement:** Orders must be executed in strict timestamp order using hybrid logical clocks (HLC) to guarantee replay fidelity during financial audits.

---

## 3. Interfaces & Contracts

- **External Gateway:** OpenAPI 3.1 and Protobuf v3 definitions stored in `/contracts/financial-gateway.proto`.
- **ISO 20022 Schema:** Strict XSD/JSON schema enforcement in `/contracts/iso20022/` for pacs.008, pacs.009, and camt.053 message types.
- **Ledger Invariant Contract:** Formal mathematical specification in `/contracts/ledger-invariants.json`.

---

## 4. Key Architectural Decisions (ADR Summary)

- **ADR-0001:** Rust for clearing and ledger core to prevent garbage collection pauses from causing settlement timing drift.
- **ADR-0003:** Dedicated event stream using Redpanda/Kafka with retention policy of 7 years in cold object storage for regulatory compliance.
- **ADR-0007:** Zero-knowledge cryptographic proofs for cross-border transaction confidentiality between regional banking nodes.
- **ADR-0012:** Single-partition deterministic matching engine per currency pair to avoid distributed transaction lock contention.
