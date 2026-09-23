# Internationalization (i18n) & Localization Guide

**Purpose:** Add multi-language support to your app.

**When to use:** International user base, expansion to new markets.

---

## Contents

- [i18n vs. l10n](#i18n-vs-l10n)
- [When to Add i18n](#when-to-add-i18n)
- [i18n Libraries by Stack](#i18n-libraries-by-stack)
- [Implementation Guide (Next.js example)](#implementation-guide-nextjs-example)
- [Translation Workflow](#translation-workflow)
- [Testing i18n](#testing-i18n)
- [Common Pitfalls](#common-pitfalls)

---

## i18n vs. l10n

**Internationalization (i18n):** Build app to support multiple languages (technical foundation).

**Localization (l10n):** Translate content + adapt to culture (actual translation work).

**Example:**
- **i18n:** Use `t('welcome')` instead of hardcoded "Welcome"
- **l10n:** Translate `welcome` to Spanish "Bienvenido", Indonesian "Selamat datang"

---

## When to Add i18n

**Add i18n if:**
- ✅ Target users speak different languages (>10% non-English)
- ✅ Expanding to international markets (EU, Asia, LATAM)
- ✅ Required by customer/compliance (government contracts)

**Don't add i18n if:**
- ❌ 100% English-speaking user base
- ❌ Small internal tool (team speaks one language)
- ❌ MVP/prototype (add later when validated)

**Rule:** Don't add i18n speculatively. Wait until you have real international users.

---

## i18n Libraries by Stack

| Stack | Library | Features | Price |
|-------|---------|----------|-------|
| **Next.js** | next-intl | App Router native, type-safe | Free |
| **Next.js** | next-i18next | Pages Router, react-i18next wrapper | Free |
| **React** | react-i18next | Industry standard, pluralization, interpolation | Free |
| **Vue** | vue-i18n | Official Vue i18n, composition API support | Free |
| **Svelte** | svelte-i18n | Minimal, reactive | Free |
| **React Native** | react-native-i18n | Mobile-optimized, device locale | Free |
| **Laravel** | Laravel Lang | Built-in, Blade template support | Free |

**Recommendation:** Use framework-native library (next-intl for Next.js, vue-i18n for Vue).

---

## Implementation Guide (Next.js example)

### Setup (next-intl)

```bash
npm install next-intl
```

**Project structure:**

```
my-app/
├── messages/              # Translation files
│   ├── en.json
│   ├── id.json           # Indonesian
│   └── es.json           # Spanish
├── middleware.ts         # Locale detection
├── i18n.ts               # i18n config
└── app/
    └── [locale]/         # Locale-based routing
        ├── layout.tsx
        └── page.tsx
```

**Translation files:**

```json
// messages/en.json
{
  "common": {
    "welcome": "Welcome",
    "login": "Log in",
    "logout": "Log out"
  },
  "dashboard": {
    "title": "Dashboard",
    "greeting": "Hello, {name}!",
    "employeeCount": "You have {count, plural, =0 {no employees} one {1 employee} other {# employees}}."
  }
}

// messages/id.json
{
  "common": {
    "welcome": "Selamat datang",
    "login": "Masuk",
    "logout": "Keluar"
  },
  "dashboard": {
    "title": "Dasbor",
    "greeting": "Halo, {name}!",
    "employeeCount": "Anda memiliki {count, plural, =0 {tidak ada karyawan} one {1 karyawan} other {# karyawan}}."
  }
}
```

**Config (i18n.ts):**

```typescript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));
```

**Middleware (locale detection):**

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'id', 'es'],
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
```

**Usage (app/[locale]/page.tsx):**

```typescript
import { useTranslations } from 'next-intl';

export default function Dashboard() {
  const t = useTranslations('dashboard');
  const userName = '[contributor]';
  const employeeCount = 42;

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('greeting', { name: userName })}</p>
      <p>{t('employeeCount', { count: employeeCount })}</p>
    </div>
  );
}

// Output (English):
// Dashboard
// Hello, [contributor]!
// You have 42 employees.

// Output (Indonesian, URL: /id):
// Dasbor
// Halo, [contributor]!
// Anda memiliki 42 karyawan.
```

**Language switcher:**

```typescript
// components/language-switcher.tsx
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'id', name: 'Indonesia' },
    { code: 'es', name: 'Español' }
  ];

  const switchLanguage = (newLocale: string) => {
    router.push(`/${newLocale}`);
  };

  return (
    <select value={locale} onChange={(e) => switchLanguage(e.target.value)}>
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

---

## Translation Workflow

### DIY Translation (Small Projects)

1. **Developer writes English strings** (`messages/en.json`)
2. **Use Google Translate for initial translations** (Indonesian, Spanish)
3. **Native speaker reviews** (1-2 hours, freelancer on Upwork $20-50)
4. **Deploy**

**Cost:** $20-50 per language (one-time)

---

### Professional Translation (Medium+ Projects)

**Services:**
- **Lokalise** ($120/month, translation management + CAT tools)
- **Crowdin** ($50/month, community translation)
- **Gengo** ($0.06/word, professional human translators)
- **DeepL API** ($5/500k chars, machine translation + post-editing)

**Workflow:**

1. Export strings to Lokalise/Crowdin
2. Assign to translators (in-house or freelance)
3. Review translations (QA process)
4. Import back to codebase (API or manual download)
5. Deploy

**Cost:** $0.06-0.12 per word (professional), $0.01-0.02 per word (machine + editing)

**Example:**
- App has 5,000 words
- 3 languages (Spanish, Indonesian, French)
- Cost: 5,000 × 3 × $0.06 = $900 (one-time)
- Updates: ~500 words/month × 3 × $0.06 = $90/month

**Translator handoff context — required, not optional, for step 1 above:** a raw key
like `messages/en.json`'s `"btn1": "Submit"` gives a translator no way to know if
"Submit" is a button that submits a form, starts a payment, or submits an application
for review — ambiguous source strings produce wrong translations that nobody catches
until a user reports them in production. Every extracted string handed to a translator
must carry: (1) a descriptive key (`checkout.submitPaymentButton`, not `btn1`), (2) a
translator comment where the key alone doesn't disambiguate (`// Context: label on the
final button of the checkout flow, max ~15 chars to fit the button width`), and (3) a
character-length constraint when the UI has a fixed-width container the translation
must fit. Most translation-management tools (Lokalise, Crowdin) have a dedicated
"context/notes" field for exactly this — use it, don't leave it blank because the
English string "seems obvious."

**Pseudo-localization testing — run before sending real strings to translators, not
after:** before paying for translation, run a pseudo-localization pass that expands
every string (é.g. `Šûƀmĩŧ Pâŷmēŉŧ` — accented characters, ~30% longer than the
original) and renders the UI with it. This catches layout breakage (truncated
buttons, overlapping labels, fixed-width containers that only "worked" because
English happened to be short) for the cost of a build, instead of discovering the
same breakage after paying a translator for German or Finnish — languages that
routinely run 30-40% longer than English and will hit exactly the same fixed-width
containers pseudo-localization already tested for free.

```bash
# next-intl example: generate a pseudo-locale for layout testing
npx next-intl-pseudo messages/en.json > messages/pseudo.json
# then run the app with NEXT_PUBLIC_LOCALE=pseudo and visually check every screen
```

---

### Continuous Localization (Large+ Projects)

**Tool: Lokalise + GitHub Integration**

```yaml
# .github/workflows/i18n-sync.yml
name: Sync Translations
on:
  push:
    branches: [main]
    paths:
      - 'messages/en.json'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Upload to Lokalise
        run: |
          curl -X POST "https://api.lokalise.com/api2/projects/$PROJECT_ID/files/upload" \
            -H "X-Api-Token: $LOKALISE_TOKEN" \
            -F "data=@messages/en.json" \
            -F "filename=en.json" \
            -F "lang_iso=en"
      - name: Download translations
        run: |
          curl "https://api.lokalise.com/api2/projects/$PROJECT_ID/files/download" \
            -H "X-Api-Token: $LOKALISE_TOKEN" \
            -o translations.zip
          unzip translations.zip -d messages/
      - name: Commit translations
        run: |
          git add messages/
          git commit -m "chore: update translations"
          git push
```

**Process:**
1. Developer adds new string in `en.json`
2. GitHub Action uploads to Lokalise
3. Translator translates (notified via email/Slack)
4. GitHub Action downloads completed translations
5. Auto-commit to repo
6. Deploy

---

## Date, Number, Currency Formatting

**Use Intl API (built-in JavaScript):**

```typescript
// Date formatting
const date = new Date('2026-09-22');

const enDate = new Intl.DateTimeFormat('en-US').format(date);
// Output: 9/22/2026

const idDate = new Intl.DateTimeFormat('id-ID').format(date);
// Output: 22/9/2026

// Currency formatting
const price = 1500000;  // Rupiah

const enCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'IDR'
}).format(price);
// Output: IDR 1,500,000.00

const idCurrency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR'
}).format(price);
// Output: Rp 1.500.000,00

// Number formatting (thousands separator)
const count = 1234567;

const enNumber = new Intl.NumberFormat('en-US').format(count);
// Output: 1,234,567

const idNumber = new Intl.NumberFormat('id-ID').format(count);
// Output: 1.234.567
```

**next-intl integration:**

```typescript
import { useFormatter } from 'next-intl';

export function PayrollSummary() {
  const format = useFormatter();
  
  const salary = 5000000;  // Rupiah
  const date = new Date('2026-09-22');

  return (
    <div>
      <p>Salary: {format.number(salary, { style: 'currency', currency: 'IDR' })}</p>
      <p>Date: {format.dateTime(date, { dateStyle: 'long' })}</p>
    </div>
  );
}

// Output (en-US):
// Salary: IDR 5,000,000.00
// Date: September 22, 2026

// Output (id-ID):
// Salary: Rp 5.000.000,00
// Date: 22 September 2026
```

---

## Right-to-Left (RTL) Languages

**Languages:** Arabic, Hebrew, Persian, Urdu

**CSS setup:**

```css
/* Detect RTL via [dir] attribute */
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .navbar {
  flex-direction: row-reverse;
}

/* Use logical properties (auto RTL-aware) */
.button {
  margin-inline-start: 1rem;  /* margin-left in LTR, margin-right in RTL */
  padding-inline: 1rem;       /* padding-left + padding-right */
}
```

**HTML setup:**

```typescript
// app/[locale]/layout.tsx
import { getLocale } from 'next-intl/server';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const direction = ['ar', 'he', 'fa', 'ur'].includes(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction}>
      <body>{children}</body>
    </html>
  );
}
```

**Icon mirroring — a common miss that CSS logical properties don't cover:**
flipping layout direction is not enough; icons need a case-by-case decision, because
mirroring the wrong ones is as broken as not mirroring the right ones.

```css
/* Directional icons (imply motion/order) MUST mirror in RTL: */
/* back/forward arrows, chevrons, "next/previous" carets, undo/redo,
   reply/forward (email), progress/breadcrumb separators */
[dir="rtl"] .icon-chevron-forward,
[dir="rtl"] .icon-arrow-back {
  transform: scaleX(-1);
}

/* Non-directional icons MUST NOT mirror: */
/* play/pause buttons, clocks, checkmarks, search/magnifying glass,
   most brand/status icons, text-alignment icons that already encode
   a specific direction (e.g. an icon literally depicting left-aligned text) */
```

Build the icon set with this distinction recorded once (e.g. a `mirrorInRtl: boolean`
flag per icon in the design system), not decided ad hoc per usage — an icon library
without this flag forces every consumer of the icon to re-derive the right answer,
and inconsistent answers across a codebase are exactly how this bug ships silently on
some screens and not others.

---

## Testing i18n

### Manual Testing

```markdown
# i18n Test Checklist

- [ ] Language switcher changes UI language
- [ ] All pages translated (no English fallback in production)
- [ ] Pluralization works (0 items, 1 item, 2+ items)
- [ ] Date format correct per locale (US: MM/DD/YYYY, ID: DD/MM/YYYY)
- [ ] Currency format correct per locale
- [ ] Number format correct (thousands separator)
- [ ] Long strings don't break layout (German words are long)
- [ ] RTL languages display correctly (if supported)
- [ ] Directional icons mirror correctly in RTL; non-directional icons do not
- [ ] Form validation messages translated
- [ ] Error messages translated
- [ ] Email templates translated (if applicable)
```

### Automated Testing

```typescript
// __tests__/i18n.test.ts
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import Dashboard from '@/app/[locale]/dashboard/page';
import en from '@/messages/en.json';
import id from '@/messages/id.json';

test('renders dashboard in English', () => {
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <Dashboard />
    </NextIntlClientProvider>
  );
  
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText(/Hello/)).toBeInTheDocument();
});

test('renders dashboard in Indonesian', () => {
  render(
    <NextIntlClientProvider locale="id" messages={id}>
      <Dashboard />
    </NextIntlClientProvider>
  );
  
  expect(screen.getByText('Dasbor')).toBeInTheDocument();
  expect(screen.getByText(/Halo/)).toBeInTheDocument();
});
```

---

## Common Pitfalls

### ❌ Pitfall 1: Hardcoded Strings

```typescript
// BAD
<button>Log in</button>

// GOOD
<button>{t('common.login')}</button>
```

### ❌ Pitfall 2: String Concatenation

```typescript
// BAD
const message = 'Hello, ' + userName + '!';

// GOOD
const message = t('greeting', { name: userName });  // "Hello, {name}!"
```

### ❌ Pitfall 3: Ignoring Pluralization

```typescript
// BAD
const message = count === 1 ? '1 item' : `${count} items`;

// GOOD
const message = t('itemCount', { count });  // "{count, plural, one {1 item} other {# items}}"
```

### ❌ Pitfall 4: Assuming Date Format

```typescript
// BAD
const dateString = `${month}/${day}/${year}`;  // US-only

// GOOD
const dateString = new Intl.DateTimeFormat(locale).format(date);
```

### ❌ Pitfall 5: Not Testing Long Translations

**Problem:** German translations are 30% longer than English → breaks UI layout.

**Solution:** Test with longest language (German, Finnish, Russian).

```css
/* Use flexible layouts */
.button {
  min-width: 100px;  /* Prevent button shrinking */
  padding: 0.5rem 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

---

## Integration with Project Lifecycle

**Mapping in `modules/02b-planning-stack-setup.md` Phase 5 (Cross-Cutting):**

```markdown
### Q61 — Internationalization (i18n)

> "Does the app need multi-language support?"

**Options:**
- **No** (Single language, default English/Indonesian)
- **Yes, 2-3 languages** (e.g., English + Indonesian + Spanish)
- **Yes, 5+ languages** (Global product)
- **Yes, with RTL** (Arabic, Hebrew)

**Sub-questions:**
- Q61-i: Which languages? (English, Indonesian, Spanish, French, German, Japanese, Arabic, etc.)
- Q61-ii: Translation workflow? (DIY + Google Translate | Professional service | Continuous localization)
- Q61-iii: RTL support needed? (Yes/No)

**Output files:**
- `messages/en.json`, `messages/id.json`, etc.
- `i18n.ts` (config)
- `middleware.ts` (locale detection)

**Mandatory for:** International products, compliance requirements (EU multilingual mandate)

**Skip for:** Single-market products, internal tools
```

---

**Agent instruction:**

When user mentions "multi-language" or "international users":

1. Ask Q61 (languages needed + translation workflow)
2. Setup i18n library (next-intl for Next.js, vue-i18n for Vue)
3. Extract all hardcoded strings to translation files
4. Implement language switcher
5. Test with longest language (German) to check layout
6. If RTL needed, implement `dir` attribute + logical CSS properties

Do not add i18n speculatively. Wait for real international users or explicit requirement.

---

**Last Updated:** 2026-09-22  
**Version:** 1.0.0
