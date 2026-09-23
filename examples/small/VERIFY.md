# VERIFY — Markdown to PDF CLI
# Run all of these before committing a milestone.

## Gate: runnable

```bash
npm run build
npm test
node dist/cli.js fixtures/sample.md --out /tmp/sample.pdf
test -s /tmp/sample.pdf
```

Exit 0 on all = gate pass.

## Critical path (manual)

- [x] `node dist/cli.js fixtures/sample.md --out out.pdf` produces a readable A4 PDF
- [x] Headings, lists, fenced code, and the sample table survive print CSS
- [x] Missing input file exits 1 with `md2pdf: file not found`
- [ ] `--theme fixtures/compact.css` changes h1 color in the rendered PDF
- [x] No leftover `console.log` debug in src/

## Commands that must stay green

```bash
node dist/cli.js --help
node dist/cli.js fixtures/empty.md --out /tmp/empty.pdf
```

`--help` prints usage. Empty markdown still writes a one-page PDF (cover + blank body).
