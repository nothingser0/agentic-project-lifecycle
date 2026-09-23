# DESIGN — Team Expense Tracker

**Version:** 0.3 | **Updated:** 2026-09-16
**Vibe:** Linear-like internal tool — dense, quiet, one primary action per screen.
**Bridge:** Tailwind v4 `@theme` in `app/globals.css`. Components use semantic classes only (`bg-surface`, `text-muted`, `border-subtle`, `ring-focus`). No `bg-slate-*`, no raw hex in TSX.

Reference: Linear issues table (density, muted secondary text, one accent).

## Color

```css
:root {
  --color-bg: #f4f1ea;
  --color-surface: #fffdf8;
  --color-surface-raised: #ffffff;
  --color-border: #e4ddd0;
  --color-border-strong: #c9c0b0;
  --color-text: #1c1915;
  --color-text-muted: #6b6458;
  --color-text-subtle: #938b7e;
  --color-primary: #0f6e56;
  --color-primary-hover: #0c5a46;
  --color-on-primary: #f4f1ea;
  --color-success: #0f6e56;
  --color-warning: #b45309;
  --color-danger: #b42318;
  --color-info: #185fa5;
  --color-focus-ring: #0f6e56;
}

.dark {
  --color-bg: #161410;
  --color-surface: #1e1b16;
  --color-surface-raised: #2a261f;
  --color-border: #3a342a;
  --color-border-strong: #524a3d;
  --color-text: #f4f1ea;
  --color-text-muted: #b7b09f;
  --color-text-subtle: #8a8376;
  --color-primary: #3dd6a5;
  --color-primary-hover: #6ee7b7;
  --color-on-primary: #052e24;
  --color-success: #3dd6a5;
  --color-warning: #fbbf24;
  --color-danger: #f97066;
  --color-info: #7ab7ff;
  --color-focus-ring: #3dd6a5;
}
```

Contrast (checked): `--color-text` on `--color-bg` 12.4:1 light / 12.1:1 dark. `--color-text-muted` on `--color-bg` 5.1:1 / 4.8:1. `--color-on-primary` on `--color-primary` 7.2:1 / 8.1:1.

## Type

- `--font-family`: "IBM Plex Sans", ui-sans-serif, system-ui
- `--font-family-mono`: "IBM Plex Mono", ui-monospace
- `--text-xs` 12px / `--text-sm` 14px / `--text-base` 16px / `--text-lg` 20px / `--text-xl` 28px
- `--leading-tight` 1.2 / `--leading-normal` 1.45
- `--weight-normal` 400 / `--weight-medium` 500 / `--weight-semibold` 600

Money and IDs use mono. UI chrome uses sm. Page title uses xl.

## Space / radius / elevation

- `--space-1` 4px, `--space-2` 8px, `--space-3` 12px, `--space-4` 16px, `--space-6` 24px, `--space-8` 32px
- `--radius-sm` 4px (inputs) / `--radius-md` 8px (cards) / `--radius-lg` 12px (modals)
- `--shadow-sm` 0 1px 2px rgb(28 25 21 / 0.06)
- `--shadow-md` 0 8px 24px rgb(28 25 21 / 0.08)
- `--z-dropdown` 20 / `--z-modal` 40 / `--z-toast` 50

Primary button: `bg-primary text-on-primary hover:bg-primary-hover`. Tables: `text-sm`, row hover `bg-surface-raised`, numeric cols `font-mono tabular-nums`.
