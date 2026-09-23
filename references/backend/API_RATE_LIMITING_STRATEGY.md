# API Rate Limiting Strategy

**Purpose:** Prevent abuse and resource exhaustion from identifiable clients (a given
IP, user, or API key sending too many requests).

**What this is not:** rate limiting is not DDoS protection. A distributed attack
spreads requests across many IPs, each staying under the per-IP threshold below — rate
limiting alone will not blunt it. For DDoS mitigation (volumetric attacks, botnets),
use the DDoS Protection tiers in `references/security/SECURITY_HARDENING_GUIDE.md` §Q39a
(platform-provided protection at minimum, Cloudflare in front of origin once
public-facing, AWS Shield Advanced only for high-value targets). Apply both — rate
limiting for abuse from identifiable clients, DDoS protection for volumetric attacks —
they solve different problems and neither substitutes for the other.

**Credential stuffing is a related but distinct threat the per-IP limits below don't
fully cover:** a credential-stuffing attack uses many different IPs, each making only a
few attempts — well under the 5 req/15 min auth-endpoint threshold per IP. The auth
rate limit slows a single-source brute force; it does not stop a distributed one. Add
at least one of: a breached-password check at signup/login (e.g. the HaveIBeenPwned
range API, checked without ever sending the full password or a reversible hash off-box),
progressive friction after N failed attempts *per account* (not just per IP) — e.g.
CAPTCHA after 3 failures, temporary account lock after 10 — or a bot-detection layer
(Cloudflare Turnstile, Arkose) in front of the login endpoint. Rate limiting is the
floor here, not the ceiling.

**Applies to:** All tiers with API endpoints. Mandatory Medium+.

---

## Rate Limit Tiers

| Endpoint Type | Limit | Window | Identifier |
|---------------|-------|--------|------------|
| **Public (unauthenticated)** | 100 req | 15 min | IP address |
| **Authenticated** | 1000 req | 15 min | User ID |
| **Auth endpoints** (login, signup) | 5 req | 15 min | IP address |
| **Sensitive** (password reset, OTP) | 3 req | 15 min | IP + User ID |
| **Admin endpoints** | 10000 req | 15 min | User ID |

---

## Implementation

### Next.js App Router (Vercel)

**Install:**

```bash
npm install @upstash/ratelimit @upstash/redis
```

**Setup Upstash Redis:**

1. Create account: [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env`

**Middleware:**

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export const rateLimitPublic = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '15 m'),
  analytics: true,
  prefix: 'ratelimit:public'
})

export const rateLimitAuth = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, '15 m'),
  analytics: true,
  prefix: 'ratelimit:auth'
})

export const rateLimitSensitive = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:sensitive'
})
```

**Apply to API route:**

```typescript
// app/api/employees/route.ts
import { rateLimitAuth } from '@/lib/rate-limit'
import { auth } from '@/lib/auth'

export async function GET(req: Request) {
  // Get user ID from session
  const session = await auth()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit by user ID
  const { success, limit, remaining, reset } = await rateLimitAuth.limit(session.user.id)
  
  if (!success) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      }
    )
  }

  // Process request
  const employees = await db.query.employees.findMany()
  return Response.json(employees)
}
```

**Login endpoint (IP-based):**

```typescript
// app/api/auth/login/route.ts
import { rateLimitSensitive } from '@/lib/rate-limit'

export async function POST(req: Request) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success } = await rateLimitSensitive.limit(ip)
  
  if (!success) {
    return Response.json(
      { error: 'Too many login attempts. Try again in 15 minutes.' },
      { status: 429 }
    )
  }

  // Process login
  const { email, password } = await req.json()
  // ...
}
```

---

### Express.js

**Install:**

```bash
npm install express-rate-limit redis
```

**Setup:**

```typescript
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL
})
await redisClient.connect()

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'ratelimit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false
})

// Apply to all routes
app.use('/api/', limiter)

// Or specific route
app.post('/api/auth/login', 
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  async (req, res) => {
    // Login logic
  }
)
```

---

## Response Headers

**Standard headers:**

```
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1695384000
```

**Rate limit exceeded:**

```
HTTP/1.1 429 Too Many Requests
Retry-After: 600
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1695384000

{
  "error": "Rate limit exceeded. Try again in 10 minutes."
}
```

---

## Strategy by Endpoint

### Public API (no auth)

**Example:** `/api/status`, `/api/health`

**Limit:** 100 req / 15 min per IP

**Why:** Prevent DDoS, scraping.

---

### Authenticated API

**Example:** `/api/employees`, `/api/payroll`

**Limit:** 1000 req / 15 min per user

**Why:** Prevent abuse by single user, allow normal usage.

---

### Auth Endpoints

**Example:** `/api/auth/login`, `/api/auth/signup`

**Limit:** 5 req / 15 min per IP

**Why:** Prevent brute force, credential stuffing.

**Additional:** Account lockout after 10 failed attempts (separate from rate limit).

---

### Sensitive Endpoints

**Example:** `/api/auth/reset-password`, `/api/auth/verify-otp`

**Limit:** 3 req / 15 min per IP + user

**Why:** OTP bruteforce, password reset abuse.

---

### Admin Endpoints

**Example:** `/api/admin/users`, `/api/admin/settings`

**Limit:** 10000 req / 15 min per admin user

**Why:** Admins need higher limits for bulk operations.

---

## Cost Considerations

**Free options:**

| Service | Free Tier | Sufficient For |
|---------|-----------|----------------|
| **Upstash Redis** | 10K commands/day | Small (< 1K users) |
| **Vercel KV** | 30K commands/month | Small (< 1K users) |
| **In-memory (no Redis)** | Unlimited | Development only (resets on deploy) |

**Paid:**

- **Upstash Pro:** $10/month, 1M commands
- **Redis Cloud:** $5/month, 30MB

**Recommendation:**
- Small: In-memory (development), Upstash free (production)
- Medium: Upstash Pro
- Large: Redis Cloud or self-hosted

---

## Bypass for Testing

**Do not hardcode any literal test identifier (email, user ID, API key) into a bypass
branch.** A string like `identifier === 'test@example.com'` sitting in the same file as
production rate-limiting logic is a shippable backdoor pattern — it survives refactors
and copy-paste far more often than the accompanying "don't deploy this" comment
survives. If a bypass check is ever reused as scaffolding for a different project, the
literal identifier goes with it, silently.

**Environment variable only — gate on environment, never on identity:**

```typescript
// lib/rate-limit.ts
export async function checkRateLimit(identifier: string) {
  // Skip only when explicitly enabled for local/test environments.
  // RATE_LIMIT_BYPASS must never be set to 'true' in any deployed
  // environment (staging or production) — see CI check below.
  if (process.env.NODE_ENV !== 'production' && process.env.RATE_LIMIT_BYPASS === 'true') {
    return { success: true, limit: 999, remaining: 999, reset: 0 }
  }

  return await rateLimitAuth.limit(identifier)
}
```

**CI safeguard (do not skip this):** add a deploy-time check that fails the build if
`RATE_LIMIT_BYPASS` is set to `'true'` in the production or staging environment
variable configuration (Vercel/AWS/whatever the project uses), so a bypass left enabled
after a testing session cannot reach a deployed environment even if someone forgets to
unset it manually:

```bash
# scripts/check-no-rate-limit-bypass.sh — run in CI before deploy
if [ "$RATE_LIMIT_BYPASS" = "true" ] && [ "$DEPLOY_ENV" != "local" ]; then
  echo "ERROR: RATE_LIMIT_BYPASS=true is set for a deployed environment. Aborting deploy."
  exit 1
fi
```

**Do not deploy bypass to production.**

---

## Monitoring

**Dashboard (Upstash):**

Upstash Console → Analytics → See:
- Total requests
- Rate-limited requests
- Top IPs
- Top users

**Alert rule:**

If rate limit hit rate > 10% → investigate (possible attack or legit user hitting limit).

---

## Pre-Deploy Checklist

**Before production deploy (Medium+):**

- [ ] Rate limiting library installed (@upstash/ratelimit)
- [ ] Upstash Redis account created
- [ ] Env vars set (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
- [ ] Public endpoints: 100 req / 15 min per IP
- [ ] Authenticated endpoints: 1000 req / 15 min per user
- [ ] Auth endpoints: 5 req / 15 min per IP
- [ ] Response headers include X-RateLimit-* headers
- [ ] 429 error message clear ("Try again in X minutes")
- [ ] Tested: trigger rate limit, verify 429 response

---

**Agent Instruction:**

Before production deploy Medium+:
1. Install @upstash/ratelimit
2. Create Upstash Redis account
3. Add rate limiting to all API routes
4. Test: send 101 requests to public endpoint, verify 429 on 101st
5. Deploy

Do not deploy API without rate limiting. Abuse will happen.

---

**Last Updated:** 2026-09-22  
**Version:** 1.0.0
