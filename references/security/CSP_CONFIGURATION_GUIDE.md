# Content Security Policy (CSP) Configuration Guide

**Purpose:** Provide production-ready Content Security Policy (CSP) configurations to eliminate Cross-Site Scripting (XSS), malicious script injection, and clickjacking.

**When to use:** Mandatory for all Medium+ web applications before production deployment.

---

## 1. Core Directives & Baseline Policy

A robust baseline policy blocks unexpected domains, inline scripts without nonces, and embedding within iframes:

| Directive | Recommended Value | Purpose |
|---|---|---|
| `default-src` | `'self'` | Fallback for any resource type not explicitly specified. |
| `script-src` | `'self' 'nonce-{RANDOM}' 'strict-dynamic'` | Restricts executable scripts. Disallows arbitrary `'unsafe-inline'`. |
| `style-src` | `'self' 'unsafe-inline'` | Allows local styles. (`'unsafe-inline'` is often necessary for CSS-in-JS/Tailwind runtime injection). |
| `img-src` | `'self' data: https:` | Restricts image sources to self, data URIs, and HTTPS. |
| `connect-src` | `'self' https://api.example.com wss://ws.example.com` | Whitelists destinations for `fetch`, XHR, and WebSocket connections. |
| `font-src` | `'self' https://fonts.gstatic.com` | Restricts web font downloads. |
| `object-src` | `'none'` | Blocks legacy plugins (Flash, Java Applets). |
| `base-uri` | `'self'` | Prevents malicious `<base>` tag injection altering relative URLs. |
| `form-action` | `'self'` | Restricts where HTML `<form>` tags can submit data. |
| `frame-ancestors` | `'none'` | Prevents the site from being framed inside an iframe (modern replacement for `X-Frame-Options: DENY`). |

---

## 2. Framework Implementation Patterns

### Pattern A: Next.js App Router (Nonce-Based CSP in Middleware)

In Next.js, use dynamic nonces generated per-request in `middleware.ts`:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  // In development, Next.js hot-reload requires 'unsafe-eval'
  const scriptSrc = isDev
    ? `'self' 'unsafe-eval' 'nonce-${nonce}'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const cspHeader = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // Set request headers so Server Components can read the nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set response header
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    // Apply to all application routes, exclude static files / api
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
```

---

### Pattern B: Express.js with Helmet

```typescript
import helmet from 'helmet';
import express from 'express';

const app = express();

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);
```

---

## 3. Safe Rollout Workflow (Report-Only Phase)

Deploying a strict CSP without testing can immediately break third-party scripts, analytics, or UI styles. Follow this three-phase rollout:

### Phase 1: Deploy in Report-Only Mode (1–2 Weeks)
Send violations to an endpoint without blocking execution:

```http
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'; report-uri /api/csp-report;
```

**Violation Logger Endpoint (`app/api/csp-report/route.ts`):**

```typescript
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const report = await req.json();
    console.warn('⚠️ CSP Violation Report:', JSON.stringify(report['csp-report']));
    // Forward to Sentry or Datadog
  } catch (err) {
    // Ignore invalid bodies
  }
  return new NextResponse(null, { status: 204 });
}
```

### Phase 2: Audit & Refine
- Group violations by domain.
- Verify whether the blocked resource is legitimate (e.g. Google Analytics, Stripe SDK) or malicious.
- Add required third-party origins to the allowlist (e.g. `https://js.stripe.com` in `script-src`).

### Phase 3: Enforce
Switch header from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`.
