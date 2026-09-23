# ADR-001: Session Cookies Instead of JWT

Date: 2026-09-15

Decision: Use Auth.js session cookies (httpOnly, secure, sameSite=lax)

Because: Simpler for server-side rendering in Next.js App Router, tokens never exposed to client JavaScript, automatic CSRF protection

Instead of: JWT in localStorage (XSS vulnerable) or Authorization header (requires manual refresh logic)

Reverses by: Moderate cost — change auth provider in lib/auth.ts, update all API route auth checks. Not reversible after production users exist without session migration script.
