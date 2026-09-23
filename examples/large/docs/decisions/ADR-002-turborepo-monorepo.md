# ADR-002: Monorepo with Turborepo

Date: 2026-09-12

Decision: Use Turborepo monorepo with separate Next.js apps for storefront and admin, plus standalone Fastify API

Because: Shared packages (ui, schema, database, email) eliminate duplication. Independent deployment of web/admin/api. Type-safe contract enforcement via shared schemas.

Instead of: Separate repositories (increases drift, duplicates schemas), or single Next.js app with role-based routing (admin and customer have different performance profiles — admin needs low latency for dashboard, customer needs fast product pages)

Reverses by: High cost after production. Would require splitting database client, migrating shared code to npm packages, coordinating deployments across repos. Practically irreversible once multiple teams own different workspaces.
