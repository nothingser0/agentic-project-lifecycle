# VERIFY — Fleet Route Optimizer

Run these commands before committing any milestone.

---

## Gate 1: Code Quality & Linting

```bash
golangci-lint run ./...
npm --prefix web/dispatch run lint
npm --prefix web/dispatch run type-check
```

---

## Gate 2: Test Suite

```bash
go test -v -race ./...
npm --prefix web/dispatch test -- --watchAll=false
```

---

## Gate 3: Routing Engine Benchmarks

```bash
# Verify TSP solver solves 50-stop route in under 500ms
go test -bench=BenchmarkSolveRoute ./services/router/...
```

---

## Critical Path (Manual)

- [ ] Route calculation renders accurately on the MapLibre GL dispatch canvas
- [ ] Telemetry WebSocket connection reconnects automatically upon network drop
- [ ] No temporary debugging endpoints exposed in router service
