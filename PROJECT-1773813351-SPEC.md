# AllClear — Product Specification

> Know who you're doing business with. Instant sanctions and due diligence screening for small businesses — at 1/100th the price of enterprise compliance tools.

---

## 1. Product Overview

AllClear is an instant sanctions and due diligence screening tool for small businesses that trade internationally. Users paste a person or company name and get an immediate screening result against 40+ global sanctions lists, politically exposed persons (PEP) databases, and regulatory watchlists. Import/export companies, freelance compliance consultants, small fintech startups, and real estate professionals currently either ignore compliance requirements (risky and illegal), manually Google names across government websites (slow and unreliable), or pay $500–$15,000/month for enterprise tools they can't afford. AllClear delivers the same underlying public data through a clean interface at $19/month — making compliance accessible to every business, not just enterprises.

---

## 2. Target Personas

### Persona 1: Small Import/Export Business Owner
- **Role:** Owner of a trading company with 5–20 employees and <$5M annual revenue
- **Core pain:** "I need to screen every new supplier and buyer against sanctions lists, but compliance tools cost more than my monthly rent."
- **Price sensitivity:** Currently spends $0 (ignoring the requirement) or $200+/mo on a tool they hate. Would pay $19–49/mo without hesitation.
- **First "aha" moment:** Types a supplier's name → sees "No matches found across 28 sanctions datasets" with a green checkmark and list of every database checked — realizes this replaces a 30-minute manual process.

### Persona 2: Freelance Compliance Consultant
- **Role:** Independent consultant serving 5–10 small business clients on trade compliance
- **Core pain:** "I manually screen names against OFAC, EU, and UN lists in separate browser tabs. It takes me 2 hours per client per month."
- **Price sensitivity:** Bills clients $150–300/hr. A $49/mo tool that saves 16+ hours/month is a no-brainer — and they expense it.
- **First "aha" moment:** Screens 3 names in 30 seconds, saves the results, realizes they can serve twice as many clients with the time saved.

### Persona 3: Small Crypto/Fintech Compliance Officer
- **Role:** Compliance lead at a 10–30 person crypto exchange or fintech startup
- **Core pain:** "Regulators require KYC screening but we're a tiny startup. ComplyAdvantage wants $500/mo minimum and a 12-month contract."
- **Price sensitivity:** Currently paying $500+/mo for overkill enterprise tools or $0 and sweating during audits. $49/mo is 90% savings.
- **First "aha" moment:** Screens a name, sees it flagged on 2 sanctions lists with detailed source references and dates — "This is exactly what the auditor asks for."

### Persona 4: Real Estate Agent
- **Role:** Licensed real estate agent handling international buyer transactions
- **Core pain:** "I'm supposed to screen buyers per anti-money laundering rules but I have no idea how. I just Google their name and hope for the best."
- **Price sensitivity:** Spends $0 currently. Would pay $19/mo if it takes the legal anxiety away.
- **First "aha" moment:** Types a buyer's name, gets a clean result, downloads a timestamped PDF to attach to the transaction file.

---

## 3. API Integrations

### 3.1 OpenSanctions
- **Base URL:** `https://api.opensanctions.org`
- **Auth:** None
- **Rate Limits:** Unknown (mitigated by aggressive result caching — see strategy below)
- **Data provided:** Entity search against a consolidated database of global sanctions lists, PEP registries, and regulatory watchlists sourced from 40+ authorities worldwide (OFAC SDN, EU Consolidated List, UN Security Council, UK HMT, plus national lists from Australia, Canada, Japan, Switzerland, and more). Returns entity names, aliases, entity types (person/company/vessel/aircraft), countries, sanctioning datasets, and source URLs.
- **Product usage:** Core screening engine. User enters a name → API route queries `/search/default?q={name}&limit=20` → results displayed with match scoring. Each result shows which specific sanctions lists the entity appears on, enabling users to assess relevance (e.g., OFAC match vs. a national-only list).
- **Failure mode:** Show cached results if available for that query (with "Last checked: X hours ago" badge). If no cache, display: "Screening service temporarily unavailable — please retry in a few minutes" with a retry button. **Never display a false "all clear" when the API is unreachable.** The UI must make the failure state unmistakable.

**API cost per user:**
- Free tier (5 screenings/day): 5 API calls/day per user
- Pro tier (50 screenings/day): ~35 effective calls/day per user (with 24h cache reducing repeat queries by ~30%)
- Conservative scenario (if OpenSanctions limits at 500 req/day): serves ~14 Pro users. At ~$266 MRR, self-hosting the open dataset ($0 marginal cost) becomes viable, eliminating API dependency entirely.

### 3.2 REST Countries
- **Base URL:** `https://restcountries.com/v3.1`
- **Auth:** None
- **Rate Limits:** Unknown (static dataset, fetched once and cached)
- **Data provided:** Country names, flags (SVG/PNG URLs), ISO alpha-2/3 codes, regions, sub-regions, currencies, calling codes
- **Product usage:** Enriches screening results with country context. Flags displayed next to country names in results. Country grouping in batch results (e.g., "3 matches in Russia, 1 in Iran"). Pre-fetched at app load (~250KB) and cached in localStorage for 30 days.
- **Failure mode:** Country ISO codes shown without flags. Fully functional but less visual. Pre-cached data serves as permanent fallback after first successful load.

**API cost per user:** Effectively 0 ongoing calls. One fetch per 30 days, cached client-side.

### 3.3 VATComply
- **Base URL:** `https://api.vatcomply.com`
- **Auth:** None
- **Rate Limits:** Unknown
- **Data provided:** EU VAT number validation (format + existence check via VIES), country-level VAT rates
- **Product usage:** Optional enrichment during EU company screenings. After viewing a sanctions result linked to an EU country, users can enter the entity's VAT number to validate it. A valid, active VAT number adds confidence to legitimacy; an invalid number is a red flag worth investigating. Results appended to the screening record.
- **Failure mode:** "VAT validation unavailable" message in the enrichment panel. Does not block or affect core sanctions screening. Non-critical feature.

**API cost per user:** ~10% of screenings trigger VAT checks. Pro user: ~5 calls/day. Negligible volume.

### 3.4 Frankfurter
- **Base URL:** `https://api.frankfurter.app`
- **Auth:** None
- **Rate Limits:** Unlimited
- **Data provided:** Real-time and historical exchange rates for 30+ currencies (ECB source)
- **Product usage:** When users add a transaction amount to a screening context (e.g., "this deal is worth €250,000"), Frankfurter converts to USD and EUR equivalents. Many sanctions thresholds and reporting requirements are denominated in USD — showing the USD equivalent helps users assess whether a transaction triggers reporting obligations.
- **Failure mode:** Currency conversion section omitted from the screening report. Core screening completely unaffected.

**API cost per user:** 1–2 calls per screening session that involves a transaction amount. Unlimited API, zero cost concern.

---

## 4. Core User Flows

### Onboarding Flow (sub-60 seconds)

1. **User lands on homepage** → sees a large search bar front and center: "Screen a name against global sanctions lists" with an example placeholder ("e.g., Viktor Bout"). No signup wall.
2. **User types a name and hits Enter** → system queries OpenSanctions via API route → results appear in <2 seconds showing matches (or a green "All Clear" badge with the list of datasets checked).
3. **Value delivered.** The user has completed a sanctions screening. First 3 screenings require no account. On the 4th attempt, a signup modal appears (Google OAuth or email magic link — one click).

### Flow 1: Single Name Screening
1. User types a person or company name in the search bar on `/screen`
2. System sends query to API route → OpenSanctions search → results returned
3. Results page shows: match count badge, list of matching entities — each with name, entity type (person/company/vessel), country flags, source sanctions lists, and match confidence indicator
4. User clicks a match → expanded detail panel: all known aliases, date of listing, sanctioning bodies with direct links to source, entity description
5. User clicks "Save Screening" → screening record saved to their history with timestamp, query text, and full result snapshot
6. User clicks "Download Report" → browser generates a timestamped PDF with the screening query, results, and datasets checked

### Flow 2: EU Company Due Diligence
1. User screens a company name → results show entities linked to EU countries
2. User clicks "Verify VAT" in the enrichment panel for an EU-based result
3. User enters the company's VAT number (e.g., DE123456789)
4. System validates via VATComply → shows valid/invalid status with registered company name and address
5. If valid: green badge added to the screening record ("VAT Verified")
6. If invalid: amber warning badge ("VAT Invalid — investigate further")
7. VAT result appended to the saved screening record and included in PDF reports

---

## 5. Design System

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

Design rationale: AllClear is a trust and compliance tool. The light mode with muted navy and clean whites communicates transparency and authority — the emotional register of banking and legal software, not developer tooling. The accent blue (#2563EB) is vivid enough for clear CTAs without feeling playful. Success green and error red carry their standard compliance meanings: "cleared" and "flagged."

---

## 6. Routes

| Path | Page Name | Auth Required | Description |
|------|-----------|---------------|-------------|
| `/` | Landing | No | Marketing page with a live demo search bar — first 3 screenings free, no account needed |
| `/screen` | Screening | No (first 3) / Yes | Main search interface for single name screening with results display |
| `/screen/:id` | Screening Detail | Yes | Expanded view of a saved screening — full match details, VAT enrichment, report download |
| `/history` | Screening History | Yes | Chronological list of all past screenings with search, date filter, and status filter |
| `/settings` | Account Settings | Yes | Profile, subscription plan, billing, and preferences |
| `/reports/:id` | Screening Report | Yes | Printable/downloadable PDF view of a specific screening report |

---

## 7. Pricing

### Free — $0/mo
- 5 screenings per day
- Single name search only
- 7-day screening history (older records deleted)
- Basic results (match/no match with source lists)
- No PDF reports
- **Who it's for:** Occasional users, tire-kickers, real estate agents with low volume
- **Upgrade trigger:** Hits daily screening limit, needs PDF reports for audit trail, or wants screening history beyond 7 days

### Pro — $19/mo
- 50 screenings per day
- Single name screening with full detail
- Unlimited screening history
- PDF screening reports (timestamped, showing all datasets checked)
- EU VAT validation enrichment
- Currency conversion context (Frankfurter)
- Email support (48h response)
- **Who it's for:** Small import/export businesses, real estate agents with regular international deals, solo compliance consultants

### Business — $49/mo
- 200 screenings per day
- Everything in Pro
- Bulk screening via CSV upload (up to 500 names per batch) — v2
- Team accounts (up to 5 members) — v2
- Branded PDF reports (company logo) — v2
- Priority re-screening alerts when sanctions lists update — v2
- Priority support (4h response)
- **Who it's for:** Compliance consultants serving multiple clients, small fintech/crypto companies, multi-person trade compliance teams

Annual billing: 2 months free ($15.83/mo Pro, $40.83/mo Business).

---

## 8. Key User Flows (Detailed)

### Flow 1: First-Time Visitor → First Screening

1. Visitor lands on `/` → hero section: "Screen names against 40+ global sanctions lists in seconds"
2. Sees the search bar with placeholder text: "Enter a person or company name…"
3. Types a name (e.g., "Gennady Timchenko") and presses Enter
4. Loading state: search bar shows a subtle pulse animation (<2s)
5. Results appear below the search bar: "3 potential matches found" with amber badge
6. Each result card shows: entity name, type badge (Person), country flag(s), and source list count ("Listed on 4 datasets")
7. Visitor clicks a result → detail panel slides in from right: full name, aliases, date of listing, sanctioning authorities (OFAC, EU, etc.), direct links to source documents
8. Visitor clicks "Save this screening" → signup modal: Google OAuth button + email magic link field
9. After signup (one click): screening saved, visitor redirected to `/history` showing their first record
10. Toast notification: "Screening saved. You have 4 free screenings remaining today."
11. **Error state — API down:** Replace results area with a clear message: "We couldn't complete this screening right now. The sanctions database is temporarily unreachable. Please try again in a few minutes." Retry button visible. No misleading "all clear" state.
12. **Error state — no results:** Green checkmark badge: "No matches found." Below it: list of all 40+ datasets that were checked, so the user trusts the thoroughness.

### Flow 2: Returning User — Daily Screening Routine

1. Pro user logs in → lands on `/screen` (their default after first visit)
2. Search bar is focused automatically — they start typing immediately
3. Screens a new supplier: "Almaz-Antey" → 2 matches found (flagged entity)
4. Reviews the match details — sees it's on OFAC SDN and EU sanctions list
5. Clicks "Save Screening" → saved with a red "Flagged" status badge
6. Types next name: "Chen Wei Trading Co." → 0 matches → green "All Clear" badge
7. Saves this one too → green "Clear" badge in history
8. Opens `/history` at end of session → sees today's screenings: 1 flagged, 4 clear
9. Clicks "Download Report" on the flagged screening → PDF generates in <3s with timestamp, query, full results, and list of datasets checked
10. Attaches PDF to their compliance file for the rejected supplier

### Flow 3: Re-Screening a Previously Cleared Entity

1. User opens `/history` → searches for a name they screened 60 days ago
2. Finds the record with a "Clear" badge from March 1st
3. Clicks "Re-screen" button on the record
4. System runs the same query against the current OpenSanctions data
5. **Scenario A — Still clear:** Green badge updates to today's date. Toast: "Still clear as of today. No new matches found."
6. **Scenario B — New match:** Red alert banner at the top of the result: "⚠ New match detected since your last screening on March 1. Review the changes below." Changed/new results highlighted with a yellow left-border. A new history entry is created, linked to the original.
7. **Error state:** If the re-screen fails (API timeout), the original record is unchanged. Toast: "Re-screening failed. Your original result from March 1 is still on file. Please try again."

---

## 9. Technical Constraints

### Performance Targets
- Single name screening: results displayed in <2 seconds (including network round-trip to API route + OpenSanctions)
- Initial page load: <1.5 seconds (static assets cached, fonts preloaded)
- PDF report generation: <3 seconds (client-side using browser PDF library)
- Bulk screening (v2): <1 second per name with streaming progress updates

### Data Handling
- **Client-side:** UI rendering, REST Countries cache (localStorage), PDF generation, CSV parsing (v2)
- **Server-side (Next.js API routes):** OpenSanctions queries (proxied to prevent direct client→API exposure), VATComply validation, Frankfurter conversion, result caching (in-memory or Redis-compatible), screening history read/write to Supabase
- **Privacy:** No PII stored beyond what the user explicitly screens. Users own their screening records and can delete them. We never share screening queries with third parties.

### Rate Limit Strategy
- **OpenSanctions:** Cache all query results server-side for 24 hours, keyed by normalized lowercase query string. Sanctions data is updated weekly at most — 24h cache is fresh enough for compliance purposes. Repeated queries for the same name within 24h serve from cache instantly (0 API calls). For v2, download the full OpenSanctions bulk dataset and query a local database, eliminating the API dependency entirely.
- **REST Countries:** Fetch full dataset once per client, store in localStorage for 30 days (~250KB). Zero ongoing API calls.
- **VATComply:** Cache VAT validation results server-side for 7 days per VAT number. VAT registrations change rarely.
- **Frankfurter:** Cache exchange rates for 1 hour. Rates update daily. Unlimited API — caching is for performance, not necessity.

### Persistence
- **Supabase:** User accounts (auth), screening history (records), subscription status
- **localStorage:** REST Countries cache, user UI preferences (last search, dark/light if added later)
- **Server-side cache:** OpenSanctions results (24h TTL), VATComply results (7d TTL), Frankfurter rates (1h TTL)

---

## 10. v1 vs v2 Scope

### v1: Build This
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

### v2: Deferred
- Bulk screening (CSV upload, batch processing with progress bar)
- Business tier ($49/mo, 200/day, team accounts)
- Team features (multi-user accounts, shared screening history)
- Branded PDF reports (company logo upload)
- Frankfurter currency conversion context in screening reports
- Re-screening alerts (email notification when sanctions lists update for previously screened entities)
- Self-hosted OpenSanctions dataset (eliminate API dependency, unlock unlimited screenings)
- Programmatic API access (API keys for integrating screening into user workflows)
- Webhook notifications for ongoing monitoring
- Dark mode toggle

### Boundary Statement
**v1 ships when:** A user can search a name, see sanctions screening results with match details and source lists, save the screening to their history, and download a PDF report — with functioning Google OAuth, free/pro tier enforcement, and 24-hour result caching.

**v2 begins when:** 50+ users have completed at least one screening and at least 5 users have upgraded to Pro, validating that the core screening flow delivers enough value to pay for.
