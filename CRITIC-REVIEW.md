# Critic Review — AllClear

## Score Summary
| Dimension        | Score | Notes |
|-----------------|-------|-------|
| Market          | 7/10  | Real compliance pain, realistic pricing, strong consultant persona |
| Differentiation | 6/10  | Underserved niche but thin moat — UX layer over free public data |
| Product Flow    | 8/10  | Type name, get result. No signup for first 3. Excellent |
| Technical       | 7/10  | All 4 APIs verified in catalog. Unknown rate limit on core API is the real risk |
| Design          | 7/10  | Intentional light-mode compliance aesthetic. Not generic |
| **TOTAL**       | **35/50** | |

## Detailed Findings

### Market (7/10)

The buyer is real. Sanctions screening is a legal requirement for businesses in international trade, fintech, and real estate. Enterprise tools (ComplyAdvantage, Dow Jones Risk & Compliance, Refinitiv World-Check) charge $500–$15,000/mo. There is a genuine pricing gap for small businesses.

The strongest persona is the freelance compliance consultant — they have immediate, quantifiable ROI ($150–300/hr billing rate, 16 hours saved per month, tool costs $49/mo). That's a slam-dunk value proposition they'd buy today.

The weakest persona is the "currently spending $0" crowd (real estate agents, small importers who ignore compliance). Converting people from $0 to $19/mo requires them to first *care* about compliance, then find AllClear. That's a two-step conversion with no existing budget line item. Not impossible, but harder than the spec implies.

Distribution channels are identifiable: compliance-focused content marketing, trade association partnerships, LinkedIn targeting compliance job titles. Not mass-market but findable.

Price point at $19/mo is realistic. Not scoring higher because the hardest part — getting small businesses to *start* paying for compliance at all — is underexplored.

### Differentiation (6/10)

**Vs. enterprise competitors:** Clear differentiation on price (100x cheaper) and simplicity (no contracts, no sales calls, instant access). This is the "Stripe of sanctions screening" angle and it's legitimate.

**Vs. OpenSanctions directly:** OpenSanctions.org is a free, open project. The raw data and API are publicly accessible. AllClear is a UX and workflow layer on top of free data. Any developer who finds OpenSanctions can build this in a weekend. The moat is convenience + PDF reports + history management — real but thin.

**Vs. portfolio:** No overlap with DemoSeed (test data), IsItUp (uptime), TeamZones (timezones), or LabelReady (nutrition labels). Different APIs entirely — OpenSanctions is unused elsewhere. No deduplication concern.

**Specific competitors to watch:**
- opensanctions.org itself (they could add a simple search UI anytime)
- sanctions.io (~$99/mo, already targeting SMBs)
- Various "free OFAC search" tools that do single-list screening

Not scoring higher because the core value (searching a free public dataset) is commoditizable. The spec would benefit from identifying a defensible wedge — screening history as audit trail, PDF reports as legal documentation, or consultant-specific multi-client management.

### Product Flow (8/10)

Onboarding steps to value: **3**

1. Land on homepage
2. Type a name
3. Press Enter → results displayed

This is excellent. No signup wall for first 3 screenings. The progressive disclosure (signup on 4th attempt) is well-designed. The search bar with placeholder text ("e.g., Viktor Bout") is a clever choice — it's a famous arms dealer, so the user immediately understands the product's purpose AND gets a result with actual matches.

The screening detail flow (click match → expanded detail → save → download PDF) is logical and linear. No unnecessary branching.

The error states are thoughtfully specified — particularly the critical rule of never showing a false "all clear" when the API is unreachable. This is the single most important UX decision in a compliance tool and the spec gets it right.

Not scoring 9+ because the spec doesn't address: how are the "3 free screenings" tracked for anonymous users? IP-based rate limiting is easily circumvented. localStorage tokens can be cleared. This needs to be specified — it affects the conversion funnel.

### Technical Feasibility (7/10)

**API verification against catalog:**

| API | In Catalog? | URL Match | Auth Match | Rate Limit |
|-----|------------|-----------|------------|------------|
| OpenSanctions | YES (Government & Open Data) | `https://api.opensanctions.org` ✅ | None ✅ | Unknown ⚠️ |
| REST Countries | YES (Geocoding & Location) | `https://restcountries.com/v3.1` ✅ | None ✅ | Unknown ✅ |
| VATComply | YES (Currency & Finance + Data Validation) | `https://api.vatcomply.com` ✅ | None ✅ | Unknown ✅ |
| Frankfurter | YES (Currency & Finance) | `https://api.frankfurter.app` ✅ | None ✅ | Unlimited ✅ |

All four APIs present in the catalog. URLs, auth methods all match. No invented endpoints or fabricated capabilities.

**Risk:** The core API (OpenSanctions) has an unknown rate limit. The spec's mitigation strategy is sound — 24h server-side cache keyed by normalized query, reducing effective API calls by ~30%. The v2 escape hatch (self-host the bulk dataset) is realistic since OpenSanctions publishes their full dataset as open data. But if OpenSanctions imposes a hard limit of, say, 100 req/day before v2 ships, AllClear can serve at most ~3 Pro users. The spec acknowledges this scenario at 500 req/day but doesn't address what happens below that.

**Spec inconsistency:** Frankfurter is listed as a v1 API integration (Section 3.4) but currency conversion is explicitly deferred to v2 (Section 10). The spec should clarify: is Frankfurter in v1 or not? If v2, remove it from the v1 API integrations section or mark it clearly.

**Minor gaps:**
- Anonymous usage tracking (3 free screenings) mechanism not specified
- PDF generation is client-side — acceptable for v1 but formatting will vary across browsers
- Supabase free tier limits not discussed (sufficient for early stage but worth noting)

### Design Coherence (7/10)

The design choices are intentional and audience-appropriate:

- **Light mode** — correct for a compliance/trust tool. Dark mode would signal "developer tool" and alienate the target personas (business owners, consultants, real estate agents).
- **Primary #1E3A5F (muted navy)** — reads as "banking software" which is exactly the right register. Communicates authority without being cold.
- **Accent #2563EB** — standard Tailwind blue-600. Effective for CTAs. Not distinctive but appropriate.
- **Success green / Error red / Warning amber** — standard semantic colors. In a compliance context, these carry specific legal meaning (cleared / flagged / review needed) which the spec maps correctly.
- **DM Sans + Source Sans 3** — better than Inter. DM Sans has slightly more personality in headings. Source Sans 3 is highly legible for body text. Both are Google Fonts (free). Not a distinctive pairing but a competent one.

The design rationale paragraph in Section 5 demonstrates genuine thought — the spec explains *why* these choices match the audience rather than just listing hex codes. This is above average.

Not scoring higher because: the palette is safe. Navy + white + blue is the default "trustworthy SaaS" palette. It won't offend anyone but it also won't stand out. A compliance tool that looked like it was designed by someone who actually works in compliance (document-heavy, table-focused, print-friendly) could score higher on intentionality.

## Issues to Address

1. **Specify anonymous usage tracking mechanism.** How are the "3 free screenings without account" enforced? IP? localStorage? Fingerprinting? This affects the conversion funnel and abuse prevention. Needs a concrete answer.

2. **Clarify Frankfurter v1/v2 boundary.** Section 3.4 describes Frankfurter as a current integration. Section 10 defers currency conversion to v2. Pick one and make both sections consistent.

3. **Add a contingency for OpenSanctions rate limiting below 500 req/day.** The spec models a 500 req/day scenario but doesn't address what happens at 100 or 200 req/day. At those levels the product is functionally broken before it has users. The v2 self-hosting plan should have a trigger threshold defined.

4. **Strengthen the moat narrative.** The spec should articulate why AllClear won't be displaced by a competitor building the same OpenSanctions wrapper in a weekend. Screening history as legal audit trail? PDF reports as compliance documentation? Multi-source enrichment? The spec has the pieces but doesn't frame them as defensibility.

## Verdict Rationale

AllClear targets a real compliance gap with verified APIs, a tight onboarding flow, and intentional design choices. All five dimensions score at or above the threshold. The weakest link is differentiation — it's a convenience layer over free public data, and the moat needs strengthening. But the niche is genuinely underserved at the $19/mo price point, the technical approach is sound with all APIs verified in the catalog, and the product flow is one of the cleanest I've reviewed. The four issues above are all fixable without rethinking the core product. This is a solid spec that deserves to be built.

VERDICT: PROCEED