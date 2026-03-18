# AllClear — Implementation Plan

## Tech Stack
- Framework: Next.js 15 (App Router, TypeScript)
- Styling: Tailwind CSS 3.4 + tailwindcss-animate
- Database + Auth: Supabase (PostgreSQL + Google OAuth)
- PDF: jsPDF + jspdf-autotable (client-side)
- State: React Context (auth/user), component-local state (screening)
- Deployment: Vercel

## Project Setup
- Package manager: npm
- Key dependencies:
  - `@supabase/supabase-js@2` `@supabase/ssr`
  - `jspdf` `jspdf-autotable`
  - `tailwindcss-animate`
  - `clsx` `tailwind-merge`
- `.env.local` contents:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  # Stripe — optional for v1, set manually in DB for now
  STRIPE_SECRET_KEY=
  STRIPE_WEBHOOK_SECRET=
  STRIPE_PRO_PRICE_ID=
  ```

## File Structure
```
src/
├── app/
│   ├── layout.tsx                  # Root layout: fonts, AuthProvider, Toast container
│   ├── page.tsx                    # Landing page
│   ├── screen/
│   │   ├── page.tsx                # Main screening interface
│   │   └── [id]/page.tsx           # Saved screening detail
│   ├── history/page.tsx            # Screening history with filters
│   ├── settings/page.tsx           # Account + billing placeholder
│   ├── reports/[id]/page.tsx       # Print-optimized report view
│   └── api/
│       ├── screen/route.ts         # OpenSanctions proxy + 24h cache + rate limit
│       ├── vat/route.ts            # VATComply proxy + 7d cache
│       └── auth/callback/route.ts  # Supabase OAuth callback
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Toast.tsx
│   │   ├── Modal.tsx
│   │   └── Skeleton.tsx
│   └── features/
│       ├── Header.tsx              # Nav: logo, links, auth state
│       ├── SearchBar.tsx           # Controlled input with loading pulse
│       ├── ResultsList.tsx         # Results container: loading/empty/error states
│       ├── ResultCard.tsx          # Entity card: name, type, country flags, datasets
│       ├── ResultDetail.tsx        # Slide-in panel: aliases, dates, source links
│       ├── VATVerifier.tsx         # VAT input + validate + result badge
│       ├── SignupModal.tsx          # Google OAuth + magic link gate
│       ├── HistoryTable.tsx        # Filterable screening history list
│       ├── ScreeningReport.tsx     # Report layout for PDF capture
│       └── PricingCards.tsx        # Free/Pro/Business tier cards (static)
├── lib/
│   ├── api/
│   │   ├── opensanctions.ts        # searchEntities(query): fetches /search/default
│   │   ├── vatcomply.ts            # validateVat(vatNumber): fetches VATComply
│   │   └── countries.ts            # fetchCountries(): GET restcountries, localStorage cache
│   ├── supabase/
│   │   ├── client.ts               # Browser singleton: createBrowserClient()
│   │   ├── server.ts               # Server client: createServerClient() for API routes
│   │   └── types.ts                # Database row types (Profile, Screening)
│   └── utils/
│       ├── cn.ts                   # clsx + tailwind-merge
│       ├── cache.ts                # TTL Map cache: get/set/has with expiry
│       ├── pdf.ts                  # generateScreeningPDF(screening): jsPDF
│       └── anon-limit.ts           # getAnonCount / incrementAnonCount / resetAnonCount
└── types/
    ├── opensanctions.ts            # OpenSanctionsResult, OpenSanctionsResponse
    └── screening.ts                # Screening, ScreeningStatus, Country
```

## Tailwind Config (`tailwind.config.ts`)
```ts
theme: {
  extend: {
    colors: {
      primary: '#1E3A5F',
      surface: '#F8FAFC',
      'border-col': '#E2E8F0',
      'text-primary': '#0F172A',
      'text-secondary': '#64748B',
      accent: '#2563EB',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
    },
    fontFamily: {
      heading: ['DM Sans', 'sans-serif'],
      body: ['Source Sans 3', 'sans-serif'],
    },
    borderRadius: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
    transitionDuration: { fast: '120ms', normal: '200ms', slow: '350ms' },
    transitionTimingFunction: { DEFAULT: 'ease-out' },
  },
},
plugins: [require('tailwindcss-animate')],
```
Default font on `<body>`: `font-body`. Headings use `font-heading`.

## Pages & Routes (build priority order)

1. **Landing** `/` — Hero: large search bar "Screen names against 40+ global sanctions lists" with placeholder "e.g., Viktor Bout". Below hero: 3-step how-it-works, PricingCards (Free $0/Pro $19/Business $49), trust signals row (40+ lists, logos). CTA "Start screening free" → `/screen`. First 3 searches work without account (proxied through same `/api/screen`).

2. **Screen** `/screen` — Auto-focused SearchBar. On submit: `POST /api/screen` → ResultsList. Anon: check localStorage count; at 3, show SignupModal instead. Auth users: show `X screenings remaining today` badge. Loading state: pulse on search bar. API failure: full-width red banner "Screening service temporarily unavailable — please retry." Never show "all clear" on error.

3. **Screening Detail** `/screen/[id]` — Auth required. Fetch screening by ID from Supabase. Top section: query + status badge + timestamp. ResultDetail for each match: aliases, birth date, sanctioning authorities, source document links. Right panel: VATVerifier (shown if any result has EU country code). Actions: "Re-screen" button (POST new screen for same query, creates new record, shows diff if status changed), "Download Report" (jsPDF from ScreeningReport).

4. **History** `/history` — Auth required. Table columns: name, status badge, date, "View" + "Re-screen" + "Download" actions. Filters: status (all/clear/flagged), text search on query. Free tier: query with `WHERE created_at >= now() - interval '7 days'` + show upgrade banner for older records. Pro: no filter.

5. **Settings** `/settings` — Auth required. Sections: Profile (email from auth, read-only), Plan (current tier badge, usage bar for today's screenings, "Upgrade to Pro" button → Stripe checkout link or placeholder), Danger Zone (sign out button, delete account).

6. **Report** `/reports/[id]` — Auth required. Print-optimized view: AllClear logo header, "Sanctions Screening Report" title, query + timestamp + user email, results table (entity, type, countries, datasets), footer listing all datasets checked. `@media print` hides nav. "Print / Save as PDF" button uses `window.print()`.

## Components Inventory

| Component | Props | Data | Key Interactions |
|---|---|---|---|
| `Button` | variant, size, loading, onClick | — | click, loading spinner |
| `Input` | value, onChange, error, prefix, suffix | — | type, focus |
| `Badge` | variant: clear\|flagged\|warning\|neutral\|info | — | static |
| `Card` | className, children | — | optional hover |
| `Toast` | type, message, duration | — | auto-dismiss 4s |
| `Modal` | open, onClose, children | — | ESC, backdrop click |
| `Skeleton` | variant: text\|card\|row, count | — | pulse animation |
| `Header` | — | Supabase auth state | nav links, sign in/out |
| `SearchBar` | onSearch, loading, disabled | — | submit on Enter or button |
| `ResultsList` | results, loading, error, query | — | render cards |
| `ResultCard` | result, countries | Countries[] | click to expand detail |
| `ResultDetail` | result | — | source link clicks |
| `VATVerifier` | countryCode, screeningId | VATComply API | submit VAT, show badge |
| `SignupModal` | onClose, onSuccess | — | Google OAuth click |
| `HistoryTable` | screenings, isPro | Supabase | filter, re-screen, download |
| `ScreeningReport` | screening, user | — | PDF capture target |
| `PricingCards` | — | static | CTA buttons |

## API Integration Plan

### OpenSanctions — Core Screening Engine
- **Endpoint:** `GET https://api.opensanctions.org/search/default?q={encodedQuery}&limit=20`
- **Auth:** None
- **App route:** `POST /api/screen` body `{query: string}`
  1. Authenticate user (or allow anon pass-through)
  2. Check+enforce rate limit from `profiles.screenings_today`
  3. Cache key: `query.toLowerCase().trim().replace(/\s+/g, ' ')`
  4. Check `cache.get(key)` — if hit + not expired: return cached
  5. Fetch OpenSanctions; on error: return 503 `{error: 'service_unavailable', cached: null}`
  6. Store in cache with 24h TTL; increment user's daily counter
  7. Return `{results, total, datasets, cached: false, cachedAt: null}`
- **Response types:**
  ```ts
  interface OpenSanctionsEntity {
    id: string
    caption: string
    schema: 'Person' | 'Company' | 'Vessel' | 'Aircraft' | 'LegalEntity'
    properties: {
      name: string[]; alias?: string[]; country?: string[]
      birthDate?: string[]; topics?: string[]
    }
    datasets: string[]  // ['us_ofac_sdn', 'eu_fsf', 'un_sc_sanctions', ...]
    score: number       // 0–1
  }
  interface OpenSanctionsResponse {
    results: OpenSanctionsEntity[]
    total: { value: number }
    datasets: Array<{ name: string; title: string }>
  }
  ```
- **Status logic:** `results.length === 0` → `clear`; `results.length > 0` → `flagged`

### REST Countries — Flag Enrichment
- **Endpoint:** `GET https://restcountries.com/v3.1/all?fields=name,flags,cca2,cca3,region`
- **Auth:** None; client-side only
- **Usage:** `useCountries` hook on mount: check `localStorage.allclear_countries_v1` (JSON with `expires` field, 30d TTL). If missing/expired: fetch → store. Return `Map<cca2, Country>` for O(1) lookup by ISO code.
- **Error:** show ISO codes as text, no flags

### VATComply — EU VAT Validation
- **Endpoint:** `GET https://api.vatcomply.com/vat?vat_number={vatNumber}`
- **Auth:** None
- **App route:** `GET /api/vat?number={vatNumber}`
  - Cache key: VAT number normalized (uppercase, no spaces); 7d TTL
  - On VATComply error: return `{error: 'vat_unavailable'}`
- **Response:** `{valid, country_code, country_name, company_name?, company_address?}`

## Data Flow

- **Screening:** User → `SearchBar` → `POST /api/screen` → cache/OpenSanctions → `ResultsList` → user saves → Supabase `screenings` insert
- **Rate limiting:** Server reads `profiles`, checks `screenings_today < limit`, resets if `screenings_reset_at < today midnight`, increments on success
- **Anonymous limit:** `anon-limit.ts` reads/writes `localStorage.allclear_anon_count`. `SearchBar` checks before firing. ≥3 + no session → `SignupModal`. After signup: `resetAnonCount()`
- **Countries:** `useCountries` → localStorage → `ResultCard` consumes `Map<cca2, Country>` for flags
- **PDF:** "Download Report" → render `ScreeningReport` ref into jsPDF → `doc.save('screening-{id}.pdf')`
- **VAT result:** `VATVerifier` → `GET /api/vat` → Supabase UPDATE `screenings.result_snapshot` (append `vatResult` field)

## Database Schema (run in Supabase SQL Editor)

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'pro')),
  screenings_today integer not null default 0,
  screenings_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.screenings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  query text not null,
  result_snapshot jsonb not null,
  status text not null check (status in ('clear', 'flagged', 'error')),
  datasets_checked text[] not null default '{}',
  match_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.screenings enable row level security;
create policy "own_profile" on public.profiles for all using (auth.uid() = id);
create policy "own_screenings" on public.screenings for all using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Build Order (step-by-step)

1. `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias`
2. `npm install @supabase/supabase-js @supabase/ssr jspdf jspdf-autotable tailwindcss-animate clsx tailwind-merge`
3. Configure `tailwind.config.ts` with design tokens above; add Google Fonts imports in `layout.tsx`
4. Create `.env.local` from env vars list; create `.env.example` (same keys, empty values)
5. Create Supabase project; run SQL schema; enable Google provider in Auth → Providers
6. Set Google OAuth callback URL in Google Cloud Console: `{APP_URL}/api/auth/callback`
7. `src/lib/utils/cn.ts`, `cache.ts`, `anon-limit.ts`
8. `src/lib/supabase/client.ts`, `server.ts`, `types.ts`
9. `src/types/opensanctions.ts`, `screening.ts`
10. `src/app/api/auth/callback/route.ts` — exchange code, set session cookie, redirect to `/screen`
11. `src/app/api/screen/route.ts` — full implementation with cache + rate limit
12. `src/app/api/vat/route.ts` — full implementation with cache
13. `src/lib/api/opensanctions.ts`, `vatcomply.ts`, `countries.ts`
14. `src/lib/utils/pdf.ts`
15. Build all UI components (`Button`, `Input`, `Badge`, `Card`, `Toast`, `Modal`, `Skeleton`)
16. `src/app/layout.tsx` — fonts, metadata, providers
17. Feature components: `Header`, `SearchBar`, `ResultCard`, `ResultDetail`, `ResultsList`
18. `src/app/page.tsx` — landing page
19. `src/app/screen/page.tsx` with `SignupModal`
20. `src/app/screen/[id]/page.tsx` with `VATVerifier`
21. `src/components/features/HistoryTable.tsx`
22. `src/app/history/page.tsx`
23. `src/app/settings/page.tsx`
24. `src/components/features/ScreeningReport.tsx`
25. `src/app/reports/[id]/page.tsx`
26. Wire navigation in `Header`; add toast calls throughout
27. `npm run build` — fix all TypeScript/lint errors

## Known Risks

1. **OpenSanctions rate limits unknown.** 24h server-side cache mitigates. If 429 received, surface explicit error state — never false "all clear." Monitor request volume in production.
2. **No Stripe payment in v1.** `subscription_tier` is set manually in Supabase profiles table. Settings page shows upgrade CTA but no live checkout. Add `STRIPE_*` env vars and checkout route post-launch.
3. **jsPDF mobile rendering.** DOM capture approach can be unreliable on mobile Safari. Fallback: `window.print()` with print-only CSS on `/reports/[id]`. Ship jsPDF first, fallback if issues arise.
4. **Supabase Google OAuth setup** requires coordinating 3 places: Google Cloud Console (OAuth client), Supabase Auth settings, and the redirect URL. Flag this in `BUILDER-NOTES.md`.
5. **Anonymous screening gate** stored in localStorage only — resets on private browsing. Acceptable for MVP; not a security gate, just an onboarding nudge.
6. **VATComply `company_name`/`company_address`** may be null for some EU countries (VIES doesn't always return full info). Handle missing fields gracefully with "—" fallback.
7. **OpenSanctions `schema` field** may return values beyond Person/Company/Vessel/Aircraft (e.g., `LegalEntity`, `Organization`). Treat unknown schemas as "Entity" in the UI type badge.

## Plugin Usage Notes

- **Builder**: Use `/feature-dev` for `src/app/screen/[id]/page.tsx` (VAT enrichment + re-screen diff flow) and `src/app/history/page.tsx` (filtering + pagination)
- **Builder**: Use `/frontend-design` for `src/components/ui/` — aesthetic direction: **light-first institutional compliance software**. Muted navy (#1E3A5F) header, white body, sharp 1px borders, no gradients, no rounded-xl. Accent blue (#2563EB) CTAs only. Status colors full semantic weight.
- **QA**: Run `silent-failure-hunter` on `src/app/api/screen/route.ts` and `src/lib/utils/pdf.ts`
- **QA**: Run `code-reviewer` on `src/app/api/screen/route.ts` (cache + rate limit logic)
- **Designer**: Aesthetic is **light, institutional, compliance-grade** — the visual register of banking or legal software. No playfulness. DM Sans headings feel authoritative. Source Sans 3 body is highly legible at small sizes.
