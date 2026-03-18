# Optimizer Notes — AllClear

## Performance
- Images optimized: 0 (country flags are external SVGs from REST Countries CDN, cached via localStorage — not suited for next/image)
- Dynamic imports added: 1 (jsPDF + jspdf-autotable loaded on-demand, saving ~300KB from initial bundle)
- Server Components converted: 0 (all pages require client-side hooks for auth/state — architecture is appropriate)
- Font optimization: ✅ (DM Sans + Source Sans 3 via next/font/google)

## SEO
- Root metadata: ✅ (title, description, keywords, OpenGraph, Twitter cards)
- Per-page titles: ⚠️ (all pages are client components — cannot export metadata; root layout title covers all routes)
- OG tags: ✅
- Sitemap: ✅ (`/sitemap.xml` — lists `/` and `/screen` as public routes)
- Robots: ✅ (`/robots.txt` — allows all, disallows `/api/` and `/settings`)

## Accessibility
- Semantic HTML: ✅ (added `<main>` wrapper to landing page; inner pages already use `<main>`)
- ARIA labels: ✅ (added `role="dialog"` and `aria-label` to ResultDetail panel; close button labeled)
- Keyboard nav: ✅ (added Escape key handler for detail panel; hamburger menu already had aria-label)
- Color contrast: ✅ (spec colors #0F172A on #FFFFFF = 15.4:1; #64748B on #FFFFFF = 4.6:1)

## Error Handling
- Global error boundary: ✅ (`src/app/error.tsx` with "Try again" button)
- 404 page: ✅ (`src/app/not-found.tsx` with branded design and navigation links)
- Loading UI: ✅ (`src/app/loading.tsx` with spinner for route transitions)
- API fallbacks: ✅ (already existed — OpenSanctions shows error state, never false "all clear"; REST Countries degrades to ISO codes; VAT shows "unavailable")

## Deployment Ready
- .env.example complete: ✅ (all variables documented with descriptions)
- README exists: ✅ (project name, description, setup instructions, spec link)
- Build passes: ✅

## Build Output
- Total pages: 12 (7 static, 5 dynamic)
- Build time: ~2.1s compile + ~100ms static generation
- Any warnings: none (lockfile inference warning from Next.js — cosmetic, does not affect build)

## Code Cleanup (Plugin-Assisted)
- Code simplifier: ran (reviewed all src/ files)
- Comment analyzer: ran (reviewed all comments)
- Code reviewer: ran (final quality pass)

### Applied cleanup:
- Removed 7 stale `// QA: fixed -` comments across 4 files
- Consolidated split React imports in `page.tsx` (`useState` + `useEffect` into one import)
- Merged duplicate import paths in `ScreeningReport.tsx`
- Fixed open redirect in auth callback (`next` param now validated to prevent `//evil.com` redirects)
- Fixed rate-limit UI bug: previous screening results are now restored when rate limit is hit (instead of showing blank state)

### Noted but not applied (would require refactoring beyond optimizer scope):
- Duplicated Supabase server client construction in 2 API routes (could use shared `server.ts` helper)
- Duplicated `handleSearch` logic between landing page and screen page (could extract shared hook)
- Duplicated country flag rendering in ResultCard/ResultDetail (could extract `CountryLabel` component)
