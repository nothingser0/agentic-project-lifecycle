# Tech Stack Examples — 2026 Modern Stacks

**Purpose:** Reference architectures for common project types (Phase 1 recommendations).

**Version:** 1.0.0 (2026 edition)

**Verify before recommending — do not apply version numbers below from memory.**
Every framework/library version named in this file (Next.js 15, React 19, Prisma 6,
Tailwind v4, PostgreSQL 17, etc.) is a snapshot as of this file's last edit and will go
stale — these are exactly the facts most likely to drift silently. Before recommending
a specific version to a user, check the framework's own release notes or npm/package
registry for the current stable major version, and prefer "the current stable release
of X" over hardcoding a version number that this file may not have kept in sync with.
If verification isn't possible in the moment, say so explicitly to the user rather than
presenting a possibly-stale version as current fact.

---


## Contents

- [Stack 1: Modern Full-Stack (Next.js 15)](#stack-1-modern-full-stack-nextjs-15)
- [Stack 2: High Performance (Go + React)](#stack-2-high-performance-go-react)
- [Stack 3: Monolith CRUD-Heavy (Laravel 11)](#stack-3-monolith-crud-heavy-laravel-11)
- [Stack 4: Edge-First $0 Hosting (Remix + Cloudflare)](#stack-4-edge-first-0-hosting-remix-cloudflare)
- [Stack 5: Mobile-First (React Native + Supabase)](#stack-5-mobile-first-react-native-supabase)
- [Comparison Matrix](#comparison-matrix)
- [Decision Tree](#decision-tree)

## Stack 1: Modern Full-Stack (Next.js 15)

**Best For:** Solo dev, 4-8 weeks timeline, standard performance, $0-20 budget

### Tech Stack
- **Framework:** Next.js 15 (React 19, App Router, Server Components, Turbopack)
- **Database:** PostgreSQL 17 (Supabase free tier 500MB or Vercel Postgres)
- **Auth:** NextAuth v5 (email/password, OAuth)
- **ORM:** Drizzle ORM (type-safe SQL) or Prisma 6
- **UI:** shadcn/ui (Radix primitives + Tailwind v4)
- **Storage:** Cloudflare R2 (S3-compatible, cheap)
- **Deployment:** Vercel ($0 hobby, $20 pro)
- **Monitoring:** Vercel Analytics + Sentry (free tier)

### Why This Stack
- ✅ Single codebase (frontend + backend)
- ✅ Type-safe end-to-end (TypeScript)
- ✅ Server Components (fast initial load)
- ✅ Zero-config deployment (git push → deploy)
- ✅ Generous free tier ($0 start possible)

### Project Structure
```
my-app/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Sidebar + navbar
│   │   ├── page.tsx            # Dashboard
│   │   └── [resource]/
│   │       ├── page.tsx        # List
│   │       └── [id]/page.tsx   # Detail
│   └── api/
│       └── [...]/route.ts      # API routes (Server Actions preferred)
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── custom/                 # Project-specific
├── lib/
│   ├── db.ts                   # Drizzle/Prisma client
│   ├── auth.ts                 # NextAuth config
│   └── utils.ts
├── drizzle/                    # Database schema
│   └── schema.ts
└── public/
```

### When to Use
- Solo or 2-person team
- Timeline < 8 weeks
- Standard CRUD app (CRM, HRIS, dashboard)
- Budget $0-50/month

### When NOT to Use
- Extreme performance needs (>10K RPS → use Go/Rust)
- Large team (>5 devs → separated frontend/backend easier)
- Non-React preference (use Nuxt/SvelteKit)

---

## Stack 2: High Performance (Go + React)

**Best For:** Team 2-5, high traffic (1K+ concurrent), $50+ budget

### Tech Stack
- **Backend:** Go 1.23 + Fiber v3 (Express-like API framework)
- **Frontend:** React 19 (Vite 6 build)
- **Database:** PostgreSQL 17 + Redis 7 (caching)
- **ORM:** SQLC (compile-time SQL → Go code)
- **API:** REST (or tRPC for type-safety)
- **UI:** React + Tailwind v4 + shadcn/ui
- **Deployment:** Fly.io multi-region (backend + DB), Cloudflare Pages (frontend)
- **Monitoring:** Grafana + Prometheus

### Why This Stack
- ✅ 5-10x faster than Node/PHP (Go compiled)
- ✅ Low memory usage (efficient at scale)
- ✅ Type-safe API (SQLC generates Go from SQL)
- ✅ Handles 10K+ RPS single server
- ✅ Easy horizontal scaling

### Project Structure
```
my-app/
├── backend/                    # Go API
│   ├── cmd/server/main.go
│   ├── internal/
│   │   ├── handlers/           # HTTP handlers
│   │   ├── models/             # SQLC generated
│   │   ├── middleware/         # Auth, CORS, logging
│   │   └── db/                 # PostgreSQL connection
│   ├── sql/                    # SQL queries (SQLC source)
│   └── go.mod
├── frontend/                   # React app
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/                # Fetch functions
│   ├── vite.config.ts
│   └── package.json
└── docker-compose.yml          # Local dev (Postgres + Redis)
```

### When to Use
- High traffic expected (1K+ concurrent users)
- Performance critical (fintech, real-time)
- Team familiar with Go (or willing to learn)
- Budget allows dedicated infra ($50-200/month)

### When NOT to Use
- Solo dev + tight timeline (Go slower to write than JS)
- Simple CRUD (overkill, Next.js faster development)
- Team only knows JavaScript (learning curve)

---

## Stack 3: Monolith CRUD-Heavy (Laravel 11)

**Best For:** CRUD-heavy, multi-tenant, admin panels, solo dev, 4-6 weeks

### Tech Stack
- **Framework:** Laravel 11 + Livewire 3 (reactive components)
- **Database:** MySQL 8 or PostgreSQL 17
- **Multi-Tenant:** stancl/tenancy (battle-tested package)
- **UI:** Tailwind v4 + DaisyUI v5 or Alpine.js
- **Admin:** Filament v3 (optional, pre-built admin panel)
- **Queue:** Redis (background jobs)
- **Deployment:** Railway ($5/month) or Laravel Forge

### Why This Stack
- ✅ Mature ecosystem (15+ years, solved problems)
- ✅ Multi-tenant proven (stancl/tenancy package)
- ✅ Fast CRUD development (Eloquent ORM magic)
- ✅ Admin panels easy (Filament pre-built)
- ✅ Single codebase (Livewire = SPA feel, no separate frontend)

### Project Structure
```
my-app/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Livewire/           # Livewire components
│   ├── Models/
│   └── Services/
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   ├── views/
│   │   ├── layouts/
│   │   └── livewire/           # Blade templates
│   └── css/
│       └── app.css             # Tailwind
├── routes/
│   └── web.php
└── config/
    └── tenancy.php             # stancl/tenancy config
```

### When to Use
- Multi-tenant SaaS (CRM, HRIS, project management)
- CRUD-heavy (lots of forms, tables, reports)
- Admin panel needed (Filament saves weeks)
- Timeline tight (Laravel scaffolding fast)

### When NOT to Use
- Mobile app primary (Laravel API-only mode works, but Next.js/Supabase easier for mobile)
- Microservices (monolith not suitable)
- Team prefers JavaScript (Laravel is PHP)

---

## Stack 4: Edge-First $0 Hosting (Remix + Cloudflare)

**Best For:** Global low-latency, $0 budget, serverless

### Tech Stack
- **Framework:** Remix 2 (React Router 7, Vite-native)
- **Database:** Cloudflare D1 (SQLite edge) or Turso
- **Auth:** Remix Auth (session-based)
- **Storage:** Cloudflare R2 (S3-compatible)
- **Deployment:** Cloudflare Pages + Workers (free tier generous)
- **Monitoring:** Cloudflare Analytics (built-in)

### Why This Stack
- ✅ $0 hosting (Cloudflare free tier: 100K req/day)
- ✅ <50ms latency global (300+ edge locations)
- ✅ Unlimited scale (serverless auto-scale)
- ✅ D1 database included (SQLite replicated globally)
- ✅ No cold starts (Workers instant)

### Project Structure
```
my-app/
├── app/
│   ├── routes/                 # File-based routing
│   │   ├── _index.tsx          # Home
│   │   ├── login.tsx
│   │   └── dashboard/
│   │       └── $id.tsx
│   ├── components/
│   └── lib/
│       └── db.server.ts        # D1 client
├── wrangler.toml               # Cloudflare config
└── package.json
```

### When to Use
- $0 budget strict
- Global audience (low latency worldwide)
- Read-heavy workload (D1 eventually consistent)
- Serverless benefits (no server management)

### When NOT to Use
- Write-heavy (D1 has write limits, use PostgreSQL)
- Complex queries (SQLite less powerful than PostgreSQL)
- Real-time features (D1 replication lag ~seconds)

---

## Stack 6: Vue Ecosystem (Nuxt 4 + Supabase)

**Best For:** Vue developers, SSR/SSG needs, content-heavy sites

### Tech Stack
- **Framework:** Nuxt 4 (Vue 3, Auto-imports, File-based routing)
- **Database:** Supabase (PostgreSQL + realtime + auth)
- **UI:** Nuxt UI (Tailwind + Headless UI components)
- **State:** Pinia (official Vue state management)
- **Deployment:** Vercel, Netlify, or Cloudflare Pages
- **Monitoring:** Sentry Vue SDK

### Why This Stack
- ✅ Excellent SEO (SSR/SSG built-in)
- ✅ Auto-imports (components, composables, utils)
- ✅ File-based routing (like Next.js)
- ✅ Smaller bundle size vs React (faster page loads)
- ✅ Better TypeScript DX than React (Vue 3 TS-first)

### Project Structure
```
my-app/
├── pages/                      # File-based routes
│   ├── index.vue              # Home
│   ├── login.vue
│   └── dashboard/
│       ├── index.vue
│       └── [id].vue           # Dynamic route
├── components/                # Auto-imported
│   ├── ui/
│   └── layout/
├── composables/               # Reusable logic
│   └── useSupabase.ts
├── layouts/
│   └── default.vue
└── nuxt.config.ts
```

### When to Use
- Team prefers Vue over React
- Content-heavy (blog, docs, marketing site) needing SEO
- Need SSR/SSG out of box
- Smaller bundle size critical (slow networks)

### When NOT to Use
- Team only knows React (learning curve)
- Ecosystem smaller than React (fewer libraries)
- Mobile app primary (React Native more mature)

---

## Stack 7: Svelte Ecosystem (SvelteKit + Supabase)

**Best For:** Performance-first, minimal JS, progressive enhancement

### Tech Stack
- **Framework:** SvelteKit 2 (Svelte 5, Runes reactivity)
- **Database:** Supabase or Turso (edge SQLite)
- **UI:** Skeleton UI or shadcn-svelte
- **State:** Svelte stores (built-in, no library needed)
- **Deployment:** Vercel, Netlify, or Cloudflare Pages
- **Monitoring:** Sentry Svelte SDK

### Why This Stack
- ✅ Smallest JS bundle (compiler, not runtime framework)
- ✅ Fastest page loads (no virtual DOM overhead)
- ✅ Less code vs React/Vue (less boilerplate)
- ✅ Built-in animations/transitions
- ✅ Progressive enhancement (works without JS)

### Project Structure
```
my-app/
├── src/
│   ├── routes/                # File-based routing
│   │   ├── +page.svelte      # Home
│   │   ├── +page.server.ts   # Server load
│   │   ├── login/
│   │   │   └── +page.svelte
│   │   └── dashboard/
│   │       ├── +layout.svelte
│   │       └── [id]/
│   ├── lib/
│   │   ├── components/
│   │   └── supabase.ts
│   └── app.html
└── svelte.config.js
```

### When to Use
- Performance critical (slow networks, low-end devices)
- Want minimal JS shipped to browser
- Team values simplicity over ecosystem size
- Progressive enhancement important (accessibility)

### When NOT to Use
- Team unfamiliar with Svelte (steeper initial learning)
- Need massive ecosystem (React/Vue have more libs)
- Enterprise requirements (fewer Svelte experts to hire)

---

## Stack 5: Mobile-First (React Native + Supabase)

**Best For:** Mobile app, cross-platform (iOS+Android), backend-as-service

### Tech Stack
- **Mobile:** React Native (Expo SDK 52, Expo Router)
- **Backend:** Supabase (PostgreSQL + realtime + auth + storage + edge functions)
- **State:** Zustand or Jotai (lightweight)
- **UI:** React Native Paper or NativeBase
- **Deployment:** EAS (Expo Application Services)
- **Monitoring:** Sentry (React Native SDK)

### Why This Stack
- ✅ Single codebase iOS+Android (shared 95% code)
- ✅ Backend included (Supabase = no backend coding)
- ✅ Real-time built-in (WebSocket subscriptions)
- ✅ Auth built-in (email, OAuth, magic link)
- ✅ Fast development (Expo hot reload)

### Project Structure
```
my-app/
├── app/                        # Expo Router (file-based)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Home tab
│   │   └── profile.tsx
│   └── [id].tsx                # Dynamic route
├── components/
├── lib/
│   └── supabase.ts             # Supabase client
├── app.json                    # Expo config
└── eas.json                    # Build config
```

### When to Use
- Mobile-first product
- Need iOS + Android
- Backend simple (CRUD + auth + storage)
- Budget $0-25/month (Supabase free tier → $25 pro)

### When NOT to Use
- Web app primary (React Native Web exists but clunky, use Next.js)
- Complex backend logic (Supabase edge functions limited, use dedicated backend)
- Native performance critical (games, AR/VR → Flutter or native Swift/Kotlin)

---

## API Documentation Tools

**When to use:** Phase 5 (Build) when building REST/GraphQL/gRPC APIs for external/internal consumers.

### REST API Documentation

| Tool | Best For | Auto-Generate | Cost | Integration |
|------|----------|---------------|------|-------------|
| **OpenAPI/Swagger** | REST APIs, industry standard | Yes (from code annotations) | Free | All languages |
| **Postman** | Team collaboration, testing + docs | Yes (from collections) | Free-$49/user/mo | Cloud-based |
| **Redoc** | Beautiful static docs from OpenAPI | Yes (from OpenAPI spec) | Free | Static site |
| **Stoplight** | Design-first API workflows | Yes (visual editor) | Free-$79/user/mo | OpenAPI native |

**Recommendation:** OpenAPI + Redoc (free, static, standard).

**Setup (Next.js example):**

```typescript
// lib/openapi.ts
import { createDocument } from 'zod-openapi';

export const apiSpec = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
  },
  servers: [{ url: 'https://api.example.com' }],
});

// app/api/openapi/route.ts
import { apiSpec } from '@/lib/openapi';

export async function GET() {
  return Response.json(apiSpec);
}
```

**Deploy docs:**

```bash
npx @redocly/cli build-docs https://api.example.com/api/openapi -o docs/api.html
# Host at /docs/api
```

### GraphQL Documentation

| Tool | Best For | Auto-Generate | Cost |
|------|----------|---------------|------|
| **GraphQL Playground** | Built-in explorer | Yes (from schema) | Free |
| **Apollo Studio** | Production monitoring + docs | Yes (schema registry) | Free-$250/mo |
| **GraphiQL** | Embedded in-app explorer | Yes (from schema) | Free |

**Recommendation:** GraphQL Playground (development), Apollo Studio (production).

### gRPC Documentation

| Tool | Best For | Auto-Generate | Cost |
|------|----------|---------------|------|
| **gRPC Gateway** | REST proxy + OpenAPI gen | Yes (from .proto) | Free |
| **Buf Schema Registry** | Protobuf schema management | Yes (from .proto) | Free-$50/mo |

**Recommendation:** gRPC Gateway (generates REST + OpenAPI from proto).

---

## Comparison Matrix

| Stack | Dev Speed | Performance | Scale | Cost/Month | Team Size | Learning Curve |
|-------|-----------|-------------|-------|------------|-----------|----------------|
| **Next.js 15** | ⚡⚡⚡ Fast | ⚡⚡ Good | 1K users | $0-20 | 1-3 | Easy (JS/React) |
| **Go + React** | ⚡⚡ Medium | ⚡⚡⚡ Excellent | 10K+ users | $50-200 | 2-5 | Medium (Go + React) |
| **Laravel 11** | ⚡⚡⚡ Very Fast | ⚡⚡ Good | 1K users | $5-50 | 1-3 | Easy (PHP) |
| **Remix + CF** | ⚡⚡⚡ Fast | ⚡⚡⚡ Excellent | Unlimited | $0 | 1-2 | Medium (Remix) |
| **Nuxt 4** | ⚡⚡⚡ Fast | ⚡⚡ Good | 1K users | $0-20 | 1-3 | Easy (Vue) |
| **SvelteKit 2** | ⚡⚡⚡ Fast | ⚡⚡⚡ Excellent | 5K users | $0-20 | 1-2 | Medium (Svelte) |
| **RN + Supabase** | ⚡⚡⚡ Fast | ⚡⚡ Good | 5K users | $0-25 | 1-2 | Easy (React) |

---

## Decision Tree

```
Start
  │
  ├─ Domain-specific project?
  │   (eCommerce / ERP / CRM / HRIS / Inventory / Booking / Hotel /
  │    Fintech / GIS / Real-time / CMS / Analytics / AI Web /
  │    SaaS / Web Scraping / Portfolio & Interactive)
  │   └─ Yes → See references/backend/DOMAIN_STACK_GUIDE.md
  │             (read domain section, then confirm with Q16–Q22)
  │
  ├─ Mobile app? 
  │   └─ Yes → React Native + Supabase (Stack 5)
  │
  ├─ Extreme performance (>10K RPS)?
  │   └─ Yes → Go + React (Stack 2)
  │
  ├─ $0 budget strict?
  │   └─ Yes → Remix + Cloudflare (Stack 4)
  │
  ├─ Multi-tenant SaaS + CRUD-heavy?
  │   └─ Yes → Laravel + Livewire (Stack 3)
  │
  └─ General web app / none of the above?
      └─ Yes → Next.js 15 (Stack 1) ← Default recommendation
```

---

**Agent: Check Q15 (domain classifier) first. If domain matches `DOMAIN_STACK_GUIDE.md`, use that guide before falling through to this decision tree.**

**Last Updated:** September 2026  
**Version:** 1.0.0
