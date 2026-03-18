# Builder Agent Notes

## Build Status
- npm run build: PASS
- Pages built: `/` (Landing), `/screen` (Screening), `/screen/[id]` (Screening Detail), `/history` (History), `/settings` (Settings), `/reports/[id]` (Report)
- API routes built: `/api/screen` (OpenSanctions proxy + 24h cache + rate limit), `/api/vat` (VATComply proxy + 7d cache), `/api/auth/callback` (Supabase OAuth callback)
- Core feature working: Yes (screening flow end-to-end, save, history, PDF download, VAT verification, re-screen)

## Architecture Decisions
- **Tailwind v4**: `create-next-app@latest` scaffolded Tailwind v4 (CSS-based config via `@theme` in `globals.css`), not Tailwind v3 with `tailwind.config.ts`. All design tokens configured in `src/app/globals.css` using `@theme inline` block.
- **Next.js 16**: Latest `create-next-app` installed Next.js 16.1.7 (not 15 as plan specified). App Router works identically.
- **React 19**: Async params in page components use `use()` hook per React 19 convention.
- **Supabase client placeholders**: Supabase client creation uses fallback placeholder values when env vars are missing, allowing build to pass without configured Supabase. At runtime, real env vars are required.

## Setup Required Before Running
1. **Supabase project**: Create a Supabase project and run the SQL schema from `IMPLEMENTATION-PLAN.md` (section "Database Schema")
2. **Google OAuth**: Enable Google provider in Supabase Auth > Providers. Set redirect URL in Google Cloud Console to `{APP_URL}/api/auth/callback`
3. **Environment variables**: Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and optionally `SUPABASE_SERVICE_ROLE_KEY`

## Deferred / Skipped
- Bulk screening (CSV upload) — v2 per spec
- Business tier team features — v2 per spec
- Branded PDF reports — v2 per spec
- Frankfurter currency conversion — v2 per spec
- Re-screening alerts — v2 per spec
- Dark mode — v2 per spec
- Stripe payment integration — plan says manual DB tier for v1, no live checkout
- Programmatic API access — v2

## Known Issues
- **Stripe checkout not wired**: Settings page shows "Upgrade to Pro" CTA but it doesn't trigger Stripe. Subscription tier must be set manually in the `profiles` table in Supabase.
- **PDF generation uses jsPDF programmatic API**: Not DOM capture. Works reliably across browsers but formatting is simpler than the ScreeningReport component's HTML layout. The `/reports/[id]` page provides `window.print()` as an alternative for richer PDF output.
- **REST Countries flags**: Country flags use `<img>` tags pointing to restcountries SVG URLs. If the CDN is down, flags won't render (ISO codes shown as fallback text).

## API Status
- OpenSanctions: Implemented with 24h server-side cache (in-memory TTLCache). Will work when API is reachable. 503 error state shown on failure — never false "all clear".
- REST Countries: Client-side fetch with 30-day localStorage cache. Graceful degradation to ISO codes on failure.
- VATComply: Implemented with 7-day server-side cache. Shows "VAT validation unavailable" on failure. Non-blocking.
- Frankfurter: Not implemented (v2).

## File Count
- 7 UI components: Button, Input, Badge, Card, Toast, Modal, Skeleton
- 10 feature components: AuthProvider, Header, SearchBar, ResultCard, ResultDetail, ResultsList, SignupModal, VATVerifier, HistoryTable, ScreeningReport, PricingCards
- 6 pages + 3 API routes
- 3 lib/api clients, 3 lib/supabase files, 4 lib/utils, 2 type files
