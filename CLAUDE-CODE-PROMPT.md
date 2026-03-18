# Build Constraints — AllClear

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database for screening history and user accounts)

## Design System

```
Colors:
  primary:       #1E3A5F
  bg:            #FFFFFF
  surface:       #F8FAFC
  border:        #E2E8F0
  text-primary:  #0F172A
  text-secondary:#64748B
  accent:        #2563EB
  success:       #10B981
  error:         #EF4444
  warning:       #F59E0B

Typography:
  heading-font:  DM Sans
  body-font:     Source Sans 3
  h1: 32px/2rem, weight 700
  h2: 24px/1.5rem, weight 600
  h3: 18px/1.125rem, weight 600
  body: 16px/1rem, line-height 1.5

Spacing:
  base-unit: 4px
  scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px

Border Radius:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px

Animation:
  fast:   120ms ease-out
  normal: 200ms ease-out
  slow:   350ms ease-out

Mode: light
```

Design rationale: Light mode with muted navy and clean whites — this is a trust and compliance tool, not developer tooling. The palette communicates authority and transparency (banking/legal register). Accent blue for CTAs. Green = cleared, red = flagged, amber = warning.

## API Integrations

| API | Base URL | Auth | Purpose |
|-----|---------|------|---------|
| OpenSanctions | `https://api.opensanctions.org` | None | Core screening — search `/search/default?q={name}&limit=20` |
| REST Countries | `https://restcountries.com/v3.1` | None | Country flags + metadata for result enrichment |
| VATComply | `https://api.vatcomply.com` | None | EU VAT number validation |
| Frankfurter | `https://api.frankfurter.app` | None | Currency conversion for transaction context (v2) |

All API calls to OpenSanctions and VATComply must be proxied through Next.js API routes — never call them directly from the client.

## Build Rules
- npm run build MUST pass before you consider any agent done
- No placeholder content (lorem ipsum, "coming soon", fake data)
- No external images unless from a free CDN — use SVG icons
- Error states must be visible in the UI, not just console.log
- Mobile-responsive by default
- CRITICAL: Never show a false "All Clear" result when the API is unreachable. Screening failures must be unmistakably displayed as failures.
- Cache OpenSanctions results server-side for 24 hours (keyed by normalized lowercase query). Cache REST Countries in localStorage for 30 days. Cache VATComply results for 7 days.
- Use DM Sans (Google Fonts) for headings, Source Sans 3 (Google Fonts) for body text
- PDF generation must happen client-side (use a browser-compatible library like jspdf or @react-pdf/renderer)

## v1 Scope Boundary
- Single name screening against OpenSanctions with match display
- Results showing entity name, type, country flags, source sanctions lists, match confidence
- Expanded detail view (aliases, dates, sanctioning bodies, source links)
- User accounts via Google OAuth (Supabase Auth)
- Screening history — save, search by name, filter by status (clear/flagged)
- PDF screening report generation (timestamped, lists all datasets checked)
- EU VAT validation enrichment (VATComply)
- 24-hour server-side result caching for OpenSanctions
- Client-side REST Countries caching (flags, country data)
- Free tier (5 screenings/day, 7-day history) + Pro tier ($19/mo, 50/day, unlimited history)
- Responsive design — fully usable on mobile
- Landing page with live demo search (3 free screenings, no signup)
