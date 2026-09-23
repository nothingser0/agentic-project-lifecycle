# ARCHITECTURE — Fleet Route Optimizer

**Tier:** Large | **Pattern:** Modular Monolith (Go + TypeScript)
**Last updated:** 2026-09-21 | **Latest ADR:** ADR-0004-tsp-solver-algorithm

---

## 1. Module Boundaries & Write Ownership

| Module | Path | Owner Agent | Description |
|---|---|---|---|
| API Gateway | `/cmd/gateway` | `be-agent` | HTTP routing, JWT auth validation, rate limiting |
| Route Engine | `/services/router` | `be-agent` | Graph traversal, TSP solver, ETA calculation |
| Fleet Manager | `/services/fleet` | `be-agent` | Driver status, vehicle capacity, telemetry ingest |
| Dispatch UI | `/web/dispatch` | `fe-agent` | Live map, route timeline, manual override |
| Shared Contracts | `/contracts` | `lead` (human) | OpenAPI specs, protobuf definitions, shared types |

---

## 2. Hard Contracts & Invariants

1. **Routing is stateless:** `services/router` takes a list of waypoints with time windows and returns an ordered route with ETAs. It never queries the database directly — all waypoint data is passed in the request.
2. **Telemetry is append-only:** GPS pings write to a time-series log. Current vehicle position is a materialized view, not an in-place update.
3. **Map rendering is client-side:** Vector tiles rendered via MapLibre GL. Backend provides GeoJSON route geometries only, never pre-rendered raster tiles.

---

## 3. Deliberately Deferred (Not in V1)

- Dynamic re-routing during transit based on live traffic (V2)
- Multi-depot routing (V1 assumes single dispatch hub)
- Driver native mobile app (V1 uses mobile web PWA)

---

## 4. Key Decisions (ADR Summary)

- **ADR-0001:** Modular monolith in Go over microservices — single deployable binary, zero network serialization between router and fleet services.
- **ADR-0002:** OSRM for road network distance matrix instead of Google Maps API — eliminates per-query cost, runs locally in Docker.
- **ADR-0003:** WebSocket over polling for live vehicle positions — 50 vehicles at 1s intervals = 50 msgs/sec, well within single-node capacity.
- **ADR-0004:** OR-Tools (C++ binding) for TSP/VRP solver — sub-second solve for up to 100 stops per route.
