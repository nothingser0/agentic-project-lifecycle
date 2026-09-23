# CONTEXT — Markdown to PDF CLI
# Generated: 2026-09-14

lifecycle_phase: BUILD
complexity_tier: Small
planning_mode: n/a
lifecycle_docs: none
multi_agent: false
last_milestone: CLI converts a single .md file to A4 PDF via marked + puppeteer
next_action: Read tests/theme.test.ts to confirm current test coverage, add test for --theme flag with fixtures/compact.css asserting PDF buffer > 1KB, implement --theme flag in src/cli.ts by injecting CSS into HTML before page.pdf(), then run npm test && npm run build to verify gate runnable passes

# Rule 0
# Building: Markdown to PDF CLI. Core: one command turns a .md file into a printable PDF. Not building: a GUI, a web converter, or folder watch mode.

# Stack
# Node 20, TypeScript, commander, marked, puppeteer (headless Chrome print CSS)

# Notes
# Solo, no auth, no network calls at runtime. Chromium is a local binary via puppeteer.
# Default theme lives in src/themes/default.css — headings, tables, code blocks, page numbers.
# `--out` defaults to <input>.pdf in the same directory.
