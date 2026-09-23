# Idea Brief — receipt-scanner

**Generated:** 2026-09-21
**Source:** Module 01 — Ideation
**Complexity read:** Small

---

## Pitch

A CLI tool that watches a folder of receipt images, extracts merchant name, date, and total using a local OCR model, and appends the row to an existing monthly expenses CSV.

---

## Core Loop

Drop image into `~/receipts/inbox/` → CLI picks it up → OCR runs → parsed row appended to `expenses-2026-09.csv` → image moved to `~/receipts/processed/`.

---

## For Whom

Freelancer who tracks expenses in a spreadsheet and currently types 30 receipt totals by hand every month-end.

---

## Why This (Not Existing Tools)

Existing receipt scanners require cloud accounts, monthly subscriptions, and export to proprietary formats. This tool works offline, uses the user's existing CSV format, and has zero running costs.

---

## Deliberately Not Building

- No web dashboard or GUI — strictly a folder watcher CLI
- No multi-currency conversion — logs the raw amount as read
- No categorization / tax deduction tagging — user categorizes in Excel
- No cloud sync — operates entirely on local filesystem

---

## First Slice (Ready for Build)

- **Step 0 (Foundation):** `git init`, `.gitignore`, `VERIFY.md`, Node.js CLI entry point with `commander`
- **Step 1 (Core feature):** Read one image file from path argument, extract total amount with `tesseract.js`, print to stdout
- **Acceptance criterion:** `node cli.js ./test-receipt.jpg` prints valid JSON with `{ merchant, date, total }` in under 3 seconds
