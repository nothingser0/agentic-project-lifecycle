# VERIFY — Nexus Settlement Engine

Run all gates before committing any milestone. In Enterprise tier, all automated gates must exit 0, and security scans must show zero high or critical findings.

---

## Gate 1: Code Quality & Type Safety

```bash
cargo check --all-targets --workspace
cargo clippy --workspace --all-targets -- -D warnings
npm --prefix web/ops-portal run lint
npm --prefix web/ops-portal run type-check
```

---

## Gate 2: Core Unit & Invariant Testing

```bash
# Execute double-entry balance verification tests
cargo test --workspace --test ledger_invariants
cargo test --workspace --test clearing_engine
npm --prefix web/ops-portal test -- --watchAll=false
```

---

## Gate 3: Security, Credentials & Static Analysis

```bash
# Secret detection & vulnerability audit
gitleaks detect --verbose --no-git
cargo audit
npm audit --prefix web/ops-portal --audit-level=high
```

---

## Gate 4: Regulatory Contract & Schema Conformance

```bash
# Verify Protobuf interfaces and OpenAPI specifications
buf lint contracts/
spectral lint contracts/openapi.yaml
```

---

## Critical Path Verification (Pre-Deployment Manual Check)

- [ ] Dual-signoff confirmed in Change Request ticket before production database migration
- [ ] Staging end-to-end payment settlement transaction verified against external bank simulator
- [ ] No uncommitted files or development debug logs present in git tree
