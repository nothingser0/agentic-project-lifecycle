# Domain Stack Guide

**Purpose:** Domain-specific stack recommendations for project types not covered by the generic 5 stacks in `TECH_STACK_EXAMPLES.md`.

**How to use:** Read the section that matches the project domain from Q15 (Phase 3 domain classifier). After picking a domain stack, return to Phase 3 Q16–Q22 to confirm or override individual choices.

**Last Updated:** September 2026

**Verify before recommending:** as with `TECH_STACK_EXAMPLES.md`, any specific
framework/library version named in this guide is a snapshot from the "Last Updated"
date above and may be stale by the time this is read — check current stable versions
before presenting one as fact, and say so if verification isn't possible in the moment.

---

## Domain Index

1. [eCommerce](#1-ecommerce)
2. [ERP (Enterprise Resource Planning)](#2-erp)
3. [CRM (Customer Relationship Management)](#3-crm)
4. [HRIS (Human Resource Information System)](#4-hris)
5. [Inventory Management](#5-inventory-management)
6. [Booking & Reservation System](#6-booking--reservation-system)
7. [Hotel Management System (HMS / PMS)](#7-hotel-management-system)
8. [Financial Web / Fintech](#8-financial-web--fintech)
9. [GIS / Map-Based App](#9-gis--map-based-app)
10. [Real-time Web App](#10-real-time-web-app)
11. [CMS (Content Management System)](#11-cms)
12. [Web Dashboard & Analytics](#12-web-dashboard--analytics)
13. [AI-Powered Web App](#13-ai-powered-web-app)
14. [SaaS (Multi-Tenant)](#14-saas-multi-tenant)
15. [Web Scraping & Data Pipeline](#15-web-scraping--data-pipeline)
16. [Portfolio & Interactive Entertainment Web](#16-portfolio--interactive-entertainment-web)

---

## 1. eCommerce

**Signals:** cart, checkout, payment gateway, product catalog, order management, SKU, stock, multivendor (optional).

### Recommended Stacks

**Solo / Small Store (< 1K orders/day)**
```
Frontend:   Next.js 15 (App Router)
Backend:    Next.js API Routes / Server Actions
Database:   PostgreSQL (Supabase or Neon)
Payment:    Midtrans (ID) / Stripe / Xendit
Auth:       NextAuth v5
Search:     Meilisearch (self-host) or Algolia (managed)
Storage:    Cloudflare R2 (product images)
Cart:       Redis (Upstash serverless)
Deploy:     Vercel + Railway (Redis)
```

**Multi-vendor / High Volume (> 1K orders/day)**
```
Frontend:   Next.js 15
Backend:    NestJS (Node.js) or Laravel 11
Database:   PostgreSQL + Redis (cache/session)
Payment:    Midtrans / Xendit (multi-channel)
Search:     Elasticsearch or Typesense
Queue:      BullMQ (Node) / Laravel Queue (PHP)
Storage:    MinIO (self-host S3-compat) or Cloudflare R2
Deploy:     Coolify (self-host) / Railway / Fly.io
```

### Critical Modules to Plan
- Product catalog (variants, SKU, pricing tiers)
- Cart & session persistence
- Order lifecycle (pending → paid → shipped → complete → refund)
- Payment gateway integration + webhook handler
- Stock management (decrement on order, restore on cancel)
- Invoice & receipt generation

### Domain-Specific Tech
| Need | Options |
|---|---|
| Payment (ID) | Midtrans, Xendit, DOKU, iPaymu |
| Payment (Global) | Stripe, PayPal, Paddle |
| Search | Meilisearch, Typesense, Algolia |
| Queue (jobs) | BullMQ, Inngest, Laravel Queue |
| PDF Invoice | Puppeteer, PDFKit, wkhtmltopdf |

---

## 2. ERP

**Signals:** multi-module (finance, procurement, inventory, HR, production), multi-org or multi-branch, inter-module data flow, audit trail, role-based access per module.

### Recommended Stack
```
Framework:  Laravel 11 (Filament v3 for admin modules)
OR          NestJS + React (if team prefers TypeScript end-to-end)
Database:   PostgreSQL (multi-schema per org/module)
Queue:      Laravel Queue + Horizon / BullMQ
Auth:       Spatie Permission (Laravel) / CASL (frontend)
Reporting:  Laravel Excel / Apache POI (export) + ECharts / Recharts (charts)
Deploy:     Coolify (self-host) / Hetzner VPS
```

### Architecture Pattern
```
Modular monolith (preferred for small team):
  modules/
    finance/
    procurement/
    inventory/
    hr/
    production/
  Each module: own migration, own service, shared auth layer

Microservice (only if team > 10 and modules need independent deploy):
  → Adds API gateway, inter-service messaging (Kafka/RabbitMQ), distributed tracing
  → Avoid for first version
```

### Critical Modules to Plan
- Chart of Accounts + double-entry ledger (Finance)
- Purchase Order → GRN → AP invoice flow (Procurement)
- Stock In / Stock Out / Stock Opname (Inventory)
- Payroll computation + tax calculation (HR)
- BOM + Work Order + Production Report (Manufacturing — if needed)
- Audit log: every write is traceable to user + timestamp

### Domain-Specific Tech
| Need | Options |
|---|---|
| Permission per module | Spatie Laravel Permission, Bouncer, CASL |
| Report export | Laravel Excel, PhpSpreadsheet, Puppeteer PDF |
| Background jobs | Laravel Horizon, BullMQ |
| Audit trail | Laravel Auditing package, custom event sourcing |

---

## 3. CRM

**Signals:** contact/lead management, sales pipeline, deal stages, activity log, email integration, reports.

### Recommended Stack
```
Framework:  Laravel 11 + Livewire 3 (fast CRUD, real-time updates)
OR          Next.js 15 (if client prefers React)
Database:   PostgreSQL
Auth:       Spatie Permission (role: admin / sales / manager)
Email:      Resend or Mailgun (activity emails, follow-up automation)
Queue:      Laravel Queue (email jobs, reminder scheduling)
Deploy:     Railway / Render / Coolify
```

### Critical Modules to Plan
- Contact & Company entity with custom fields
- Lead → Qualified → Proposal → Won/Lost pipeline
- Activity log (calls, emails, meetings) linked to contact
- Task & reminder system
- Email sending + tracking (opened/clicked)
- Dashboard: conversion rate, pipeline value, rep performance

---

## 4. HRIS

**Signals:** employee master data, attendance, leave management, payroll, organizational structure, performance review.

### Recommended Stack
```
Framework:  Laravel 11 + Filament v3
OR          Next.js 15 + tRPC (TypeScript preference)
Database:   PostgreSQL
Auth:       Multi-role (HR admin / manager / employee self-service)
Queue:      Laravel Queue (payslip generation, bulk email)
Storage:    R2 / MinIO (document uploads: contracts, certificates)
Deploy:     Coolify / Railway
```

### Critical Modules to Plan
- Employee master (personal data, contract, org chart position)
- Attendance (clock-in/out, GPS optional, shift schedule)
- Leave management (quota, approval flow, calendar view)
- Payroll (basic salary + allowances + deductions + BPJS + PPh 21 if Indonesia)
- Payslip generation (PDF)
- Performance review cycle

### Indonesia-Specific
| Component | Note |
|---|---|
| BPJS Ketenagakerjaan | JKK, JKM, JHT, JP — calculate per employee grade |
| PPh 21 | TER method (2024+) — use official DJP formula |
| Payslip format | Must match company letterhead + digital signature |

---

## 5. Inventory Management

**Signals:** stock tracking, warehouse, goods in/out, stock opname, reorder point, multi-location.

### Recommended Stack
```
Framework:  Laravel 11 + Livewire 3 (or Filament)
OR          Next.js 15 (if SPA feel needed)
Database:   PostgreSQL
Queue:      Laravel Queue (low stock alert, reorder jobs)
Barcode:    ZXing (JS) / php-barcode-generator
Deploy:     Coolify / Railway
```

### Inventory Patterns to Decide Early
| Decision | Options | Default |
|---|---|---|
| Costing method | FIFO / LIFO / Average / Specific ID | Average (most common in Indonesia) |
| Location | Single warehouse / Multi-warehouse / Multi-bin | Ask client |
| Unit of measure | Single UoM / Multi-UoM conversion | Single for MVP |
| Batch/Serial tracking | None / Batch / Serial | None for MVP |
| Reorder trigger | Manual / Reorder point / Min-max | Reorder point |

### Critical Modules to Plan
- Item master (code, name, category, UoM, cost, reorder point)
- Goods Receipt (GR) and Goods Issue (GI)
- Stock transfer between locations
- Stock opname / physical count reconciliation
- Stock movement report (FIFO ledger or average cost ledger)
- Low stock alert

---

## 6. Booking & Reservation System

**Signals:** calendar availability, slot/resource booking, confirmation email, payment (optional), cancellation/reschedule.

### Recommended Stack
```
Framework:  Next.js 15 (real-time slot availability via SSE or polling)
OR          Laravel 11 + Livewire (if admin-heavy)
Database:   PostgreSQL (availability slots as time range, use tsrange)
Queue:      BullMQ / Laravel Queue (confirmation email, reminder)
Email:      Resend / Mailgun
Calendar:   FullCalendar (UI) or custom slot grid
Payment:    Midtrans / Stripe (if paid booking)
Deploy:     Railway / Vercel
```

### Slot Availability Pattern
```sql
-- Avoid row-per-minute. Use exclusion constraints:
CREATE TABLE bookings (
  id uuid PRIMARY KEY,
  resource_id uuid,
  slot tsrange NOT NULL,
  EXCLUDE USING gist (resource_id WITH =, slot WITH &&)
);
-- The EXCLUDE constraint prevents double-booking at DB level.
```

### Critical Modules to Plan
- Resource definition (room, therapist, court, seat — depends on domain)
- Availability calendar with real-time slot update
- Booking flow: select → hold (5 min lock) → confirm → pay → done
- Cancellation & reschedule policy
- Reminder notification (D-1, H-2 before slot)
- Admin: calendar view, bulk block dates, utilization report

---

## 7. Hotel Management System

**Signals:** room management, front desk (check-in/out), reservation, housekeeping, F&B (optional), billing/folio, channel manager (OTA integration optional).

### Recommended Stack
```
Framework:  Laravel 11 + Filament v3 (PMS admin) + Livewire (front desk)
OR          NestJS + React (if multi-property SaaS PMS)
Database:   PostgreSQL
Queue:      Laravel Queue (housekeeping tasks, night audit, email)
Real-time:  Laravel Echo + Pusher / Soketi (room status updates)
Payment:    Midtrans / Stripe (direct booking)
Deploy:     Coolify (self-host) / Railway
```

### Critical Modules to Plan
- Room master (type, floor, features, status: available/occupied/dirty/maintenance)
- Reservation (direct + OTA import via Channel Manager API if needed)
- Front desk: check-in → assign room → check-out → bill settlement
- Folio/billing (room charge + extras: minibar, laundry, F&B)
- Housekeeping task queue (dirty → cleaning → inspected → clean)
- Night audit (auto close-of-day, post room charges)
- Reporting: occupancy rate, RevPAR, ADR

### OTA Channel Manager (if needed)
- SiteMinder, Cloudbeds, or custom XML/JSON feed to Booking.com / Airbnb / Traveloka
- Scope this as Phase 2 — not MVP

---

## 8. Financial Web / Fintech

**Signals:** transactions, balances, ledger, reconciliation, payment processing, compliance, audit trail, PCI-DSS or OJK regulation.

### Recommended Stack

**General Financial Dashboard / Accounting**
```
Framework:  Next.js 15 or Laravel 11
Database:   PostgreSQL (double-entry ledger pattern)
Auth:       Multi-role with MFA mandatory
Audit:      Immutable event log (append-only table or event sourcing)
Export:     PDF statements (Puppeteer), Excel (SheetJS / Laravel Excel)
Deploy:     Hetzner / Coolify (avoid serverless for stateful financial ops)
```

**Fintech / Payment Product (OJK-licensed)**
```
Backend:    Go 1.23 + Fiber (performance + auditability)
Database:   PostgreSQL (ACID transactions mandatory — no NoSQL for ledger)
Queue:      Kafka (event streaming for transaction log)
Cache:      Redis (rate limiting, idempotency keys)
Security:   mTLS for service-to-service, HSM for key storage
Compliance: OJK PSPR / BI SNAP for Indonesian payment products
Deploy:     Dedicated VPS or private cloud (not shared hosting)
```

### Ledger Pattern (non-negotiable)
```sql
-- Double-entry: every transaction has debit + credit
-- Never UPDATE a balance. Always INSERT a new entry.
CREATE TABLE ledger_entries (
  id           uuid PRIMARY KEY,
  txn_id       uuid NOT NULL,
  account_id   uuid NOT NULL,
  type         text CHECK (type IN ('debit','credit')),
  amount       numeric(18,2) NOT NULL CHECK (amount > 0),
  currency     char(3) NOT NULL DEFAULT 'IDR',
  created_at   timestamptz NOT NULL DEFAULT now()
);
-- Balance = SUM(credit) - SUM(debit) per account_id
```

### Domain-Specific Concerns
| Concern | Approach |
|---|---|
| Idempotency | Every payment API call carries idempotency key — prevents double charge |
| Reconciliation | Daily reconciliation job: internal ledger vs payment gateway settlement |
| Audit trail | WORM-equivalent: append-only, no UPDATE/DELETE on financial tables |
| Currency | Store as integer (cents/sen), never float |
| Timezone | All timestamps in UTC, display in local tz |
| Regulatory (ID) | OJK PSPR, BI SNAP, PBI 23/2021 for e-money |

---

## 9. GIS / Map-Based App

**Signals:** map display, geographic data, location search, routing, spatial queries, heatmap, polygon/zone management.

### Recommended Stack
```
Frontend:   Next.js 15 + MapLibre GL JS (open-source, no API key cost)
            OR Leaflet (simpler, less performant for large datasets)
Backend:    Next.js API Routes or FastAPI (Python — if heavy spatial analysis)
Database:   PostgreSQL + PostGIS extension (spatial queries, indexing)
Tiles:      Protomaps (self-host PMTiles) or OpenStreetMap + tile proxy
Geocoding:  Nominatim (self-host) or OpenCage (managed, cheap)
Routing:    OSRM (self-host) or GraphHopper for route calculation
Deploy:     Railway / Fly.io (PostGIS), Cloudflare R2 (tile hosting)
```

### When to Use Each Map Library
| Library | Use When |
|---|---|
| MapLibre GL JS | Large datasets, custom vector tiles, high performance |
| Leaflet | Simple maps, few markers, fast setup |
| Google Maps API | Client insists, budget allows ($200/month free then paid) |
| Deck.gl | Big data visualization (100K+ points, WebGL rendering) |

### PostGIS Essentials
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Store point location
ALTER TABLE locations ADD COLUMN geom geometry(Point, 4326);

-- Spatial index (mandatory for performance)
CREATE INDEX idx_locations_geom ON locations USING GIST (geom);

-- Find locations within 5km of a point
SELECT * FROM locations
WHERE ST_DWithin(
  geom::geography,
  ST_MakePoint(112.7521, -7.2575)::geography,
  5000
);
```

### Critical Modules to Plan
- Base map display with layer control
- Point/Polygon data management (CRUD with map UI)
- Spatial search (radius, within polygon, nearest N)
- Clustering for large datasets (Supercluster)
- Export: GeoJSON / Shapefile / KML

---

## 10. Real-time Web App

**Signals:** live updates, collaborative editing, live chat, notifications push, live dashboard, multiplayer.

### Recommended Stack by Use Case

**Live Notifications / Status Updates**
```
Backend:    Next.js 15 + SSE (Server-Sent Events) — simpler than WebSocket for one-way
OR          Supabase Realtime (if already using Supabase)
Frontend:   EventSource API (native browser)
```

**Bidirectional Real-time (chat, collaboration, live cursor)**
```
Backend:    Node.js + Socket.io (easiest) or uWebSockets.js (performance)
            OR Hono + Cloudflare Durable Objects (edge WebSocket)
Frontend:   Socket.io client or native WebSocket
Database:   PostgreSQL + Redis pub/sub (fan-out to multiple server instances)
```

**Collaborative Editing (Google Docs style)**
```
CRDT:       Yjs (most mature) or Automerge
Transport:  y-websocket server (Node.js)
Persistence: y-indexeddb (client) + PostgreSQL snapshot (server)
```

### Real-time Pattern Decision
```
One-way updates (server → client):     SSE
Bidirectional (low frequency):         WebSocket (Socket.io)
Bidirectional (high frequency):        WebSocket (uWebSockets.js) + Redis pub/sub
Collaborative state (multi-user edit): CRDT (Yjs) + WebSocket
Serverless real-time:                  Pusher / Ably / Soketi (self-host Pusher compat)
```

### Scaling Real-time
- Single server: Socket.io in-memory is fine
- Multi-instance: Redis adapter for Socket.io (pub/sub fan-out across instances)
- STB / resource-constrained: use SSE over WebSocket (lower server memory per connection)

---

## 11. CMS

**Signals:** content authoring, rich text editor, media library, structured content, multi-language (optional), headless (API-first) or traditional.

### Recommended Stack by Approach

**Headless CMS (API delivers content to separate frontend)**
```
CMS:        Payload CMS v3 (self-host, TypeScript, no vendor lock-in)
            OR Directus (REST+GraphQL, admin UI out of the box)
Database:   PostgreSQL (Payload) / Any SQL or Mongo (Directus)
Frontend:   Next.js 15 (fetches from CMS API)
Media:      Cloudflare R2 or MinIO
Deploy:     Railway (CMS) + Vercel (frontend)
```

**Traditional CMS (all-in-one)**
```
CMS:        WordPress + ACF Pro (if client knows WP)
            OR Craft CMS (developer-friendly, PHP)
Database:   MySQL 8
Deploy:     Closte / Kinsta / WP Engine (managed WP)
```

**When to choose Payload vs Directus:**
| | Payload CMS | Directus |
|---|---|---|
| Code-first config | ✅ TypeScript collections | ❌ GUI-based |
| Self-host | ✅ | ✅ |
| Built-in auth | ✅ | ✅ |
| GraphQL | Plugin | ✅ built-in |
| Best for | Devs who want full control | Non-devs who manage content |

---

## 12. Web Dashboard & Analytics

**Signals:** data visualization, KPI cards, charts, filters, date range, export, large dataset.

### Recommended Stack
```
Frontend:   Next.js 15 + Recharts (simple) or ECharts (complex/large data)
            OR React + Tremor (pre-built dashboard components)
Backend:    Next.js API Routes or FastAPI (Python — if heavy aggregation)
Database:   PostgreSQL (< 10M rows, standard queries)
            OR ClickHouse (> 10M rows, OLAP queries — self-host or ClickHouse Cloud)
Cache:      Redis (cache expensive aggregation queries, TTL 5-60 min)
Export:     SheetJS (Excel), Puppeteer (PDF report)
Deploy:     Railway / Vercel
```

### When to Use ClickHouse
- Queries scan millions of rows (time-series, event logs, analytics events)
- GROUP BY + aggregate on large datasets is slow on PostgreSQL
- PostgreSQL struggles → add ClickHouse as a read replica for analytics queries only
- Write to PostgreSQL (OLTP), sync to ClickHouse (OLAP)

### Chart Library Decision
| Library | Use When |
|---|---|
| Recharts | Simple charts, React-native, quick setup |
| ECharts | Complex charts, large data, rich interaction |
| Chart.js | Lightweight, non-React, canvas-based |
| Tremor | Pre-built dashboard UI components (React) |
| Observable Plot | Data-science style, custom visualizations |
| D3.js | Fully custom, maximum control, steep learning curve |

---

## 13. AI-Powered Web App

**Signals:** LLM integration, chat interface, RAG, AI agents, vector search, image/audio processing, AI-generated content.

### Recommended Stack

**LLM Chat / AI Assistant**
```
Frontend:   Next.js 15 + Vercel AI SDK (streaming responses, useChat hook)
Backend:    Next.js API Routes (edge-compatible streaming)
LLM:        OpenAI GPT-4o / Anthropic Claude / Gemini via wyxrouter (Rock's setup)
            OR Ollama (local LLM, self-host)
Auth:       NextAuth v5
Deploy:     Vercel (edge streaming) or Railway
```

**RAG (Retrieval-Augmented Generation)**
```
Vector DB:  pgvector (PostgreSQL extension — simplest, already using PG)
            OR Qdrant (self-host, better performance at scale)
            OR Chroma (local, good for prototyping)
Embedding:  text-embedding-3-small (OpenAI) or nomic-embed-text (Ollama local)
Chunking:   LangChain.js / LlamaIndex (document splitting + retrieval)
```

**AI Agent / Tool-calling**
```
Framework:  Vercel AI SDK (tool calling, multi-step) — JavaScript
            OR LangGraph (Python) — complex agent graphs
            OR custom orchestration with wyxrouter (Rock's multi-provider setup)
```

### Streaming Pattern (mandatory for UX)
```typescript
// Next.js API Route — streaming response
export async function POST(req: Request) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [...]
  });
  return new StreamingTextResponse(OpenAIStream(stream));
}
```

### Domain-Specific Concerns
| Concern | Approach |
|---|---|
| Token cost | Cache repeated queries (Redis, semantic cache) |
| Latency | Stream tokens — never wait for full response |
| Hallucination | RAG + source citation in response |
| Context window | Chunk documents, summarize history |
| Multi-provider | wyxrouter handles fallback + cost optimization |
| Local LLM | Ollama + llama3.2 / qwen2.5 for private data |

---

## 14. SaaS (Multi-Tenant)

**Signals:** multiple organizations, isolated data per tenant, subscription billing, admin per tenant, usage limits.

### Recommended Stack
```
Framework:  Laravel 11 + stancl/tenancy (most mature multi-tenant solution)
            OR Next.js 15 + Prisma (schema-per-tenant or row-level isolation)
Database:   PostgreSQL
Billing:    Stripe (global) or Xendit (ID) + subscription webhook handler
Auth:       Multi-tenant aware (tenant subdomain or org slug in JWT)
Queue:      Laravel Horizon / BullMQ (per-tenant job isolation)
Deploy:     Coolify (self-host) / Railway / Fly.io
```

### Multi-tenancy Strategy
| Strategy | Isolation | Cost | Complexity | Use When |
|---|---|---|---|---|
| Row-level (shared DB, shared schema) | Low | Cheapest | Simple | Early SaaS, < 100 tenants |
| Schema-per-tenant (shared DB) | Medium | Low | Medium | Compliance needs, < 1K tenants |
| DB-per-tenant | High | Expensive | High | Enterprise, strict data isolation |

**Default recommendation:** Row-level with `tenant_id` on every table + RLS (Row Level Security) in PostgreSQL. Scale to schema-per-tenant only when needed.

### Critical Modules to Plan
- Tenant registration + onboarding flow
- Subdomain routing (`tenant.app.com`) or path routing (`app.com/tenant`)
- Per-tenant settings (branding, feature flags, limits)
- Subscription plan + usage metering
- Tenant admin panel (manage users within org)
- Super admin panel (manage all tenants)

---

## 15. Web Scraping & Data Pipeline

**Signals:** crawl external websites, extract structured data, scheduled jobs, data transformation, storage, export.

### Recommended Stack

**Simple Scraper (few sites, scheduled)**
```
Runtime:    Node.js + Playwright (handles JS-rendered pages)
            OR Python + Playwright / BeautifulSoup (static sites)
Schedule:   node-cron / GitHub Actions schedule / Inngest
Storage:    PostgreSQL (structured) + S3/R2 (raw HTML archive)
Queue:      BullMQ (Node) / Celery (Python) for large crawls
Deploy:     Railway (always-on) / Fly.io
```

**Large-Scale Crawler**
```
Framework:  Scrapy (Python) — battle-tested, middleware ecosystem
Proxy:      Rotating residential proxy (BrightData, Oxylabs, or self-managed)
Anti-bot:   Playwright-stealth or Puppeteer-extra-stealth
Queue:      Redis + Scrapy-Redis (distributed crawl)
Storage:    PostgreSQL + ClickHouse (for analytics on scraped data)
Deploy:     Hetzner VPS + Coolify
```

### Anti-Detection Essentials
```
- Rotate User-Agent per request
- Randomize request delay (2–8 seconds, not fixed)
- Use real browser fingerprint (Playwright-stealth)
- Rotate proxies (residential > datacenter for tough sites)
- Respect robots.txt unless client explicitly instructs otherwise
- Handle CAPTCHAs: 2captcha / anti-captcha service
```

### ETL Pipeline Pattern
```
Extract:    Scraper (Playwright / Scrapy)
Transform:  Data cleaning service (normalize, deduplicate, validate)
Load:       PostgreSQL (structured) + trigger downstream jobs
Export:     Scheduled CSV/Excel export or API endpoint
```

### Legal / Ethical Note
- Always check `robots.txt` and site ToS before scraping
- Do not scrape personal data without legal basis (GDPR / UU PDP Indonesia)
- Rate-limit requests to avoid harming target server

---

## 16. Portfolio & Interactive Entertainment Web

**Signals:** visual-first, animations, 3D, scroll effects, personal branding, interactive storytelling, game-like UI.

### Recommended Stack

**Standard Portfolio (clean, fast)**
```
Framework:  Astro 5 (zero JS by default, fastest load)
            OR Next.js 15 (if needs dynamic content / CMS)
Animation:  Framer Motion (React) or CSS animations
UI:         Custom CSS or Tailwind v4 (minimal component library)
Deploy:     Vercel / Cloudflare Pages ($0)
```

**Interactive / 3D Portfolio**
```
Framework:  Next.js 15 or Astro (static shell)
3D:         Three.js + React Three Fiber (R3F) — most mature
            OR Spline (no-code 3D, export to React)
Animation:  GSAP (ScrollTrigger) — best scroll animation
Scroll:     Lenis (smooth scroll library)
Shader:     GLSL (via Three.js ShaderMaterial) for custom visual effects
Deploy:     Vercel
```

**Game / WebGL Experience**
```
Engine:     Phaser 3 (2D games) or Three.js (3D interactive)
Physics:    Rapier (via @dimforge/rapier2d-compat) or Matter.js
Audio:      Howler.js or Tone.js
Deploy:     Cloudflare Pages / Vercel
```

### Performance Rules for Visual-Heavy Sites
- Target < 3s LCP on mobile — compress assets aggressively
- Use `loading="lazy"` on all images below the fold
- 3D scenes: LOD (Level of Detail) — reduce poly at distance
- GSAP: use `will-change: transform` sparingly
- Test on mid-range Android (not just M1 MacBook)

---

## Domain Routing Table (for Q15)

| User describes | Domain |
|---|---|
| Online shop, cart, checkout, payment | → eCommerce |
| Finance, procurement, inventory, HR in one system | → ERP |
| Leads, pipeline, sales tracking, contact management | → CRM |
| Employees, attendance, leave, payroll | → HRIS |
| Stock, warehouse, goods in/out, opname | → Inventory Management |
| Booking, reservation, slot, schedule | → Booking & Reservation |
| Hotel, rooms, check-in, front desk, housekeeping | → Hotel Management |
| Fintech, payment, ledger, transaction, OJK, PCI | → Financial / Fintech |
| Map, location, geospatial, polygon, routing | → GIS |
| Live chat, real-time update, collaboration, WebSocket | → Real-time Web |
| Blog, articles, content editor, media library | → CMS |
| KPI, charts, metrics, data viz, analytics | → Web Dashboard & Analytics |
| AI chat, LLM, RAG, vector search, agents | → AI-Powered Web |
| Multi-tenant, SaaS, subscription, per-org billing | → SaaS |
| Crawl, scrape, extract data from websites | → Web Scraping & Data Pipeline |
| Portfolio, 3D, animation, interactive, creative | → Portfolio & Interactive |
| Standard web app / does not match above | → Use generic stacks in `TECH_STACK_EXAMPLES.md` |
