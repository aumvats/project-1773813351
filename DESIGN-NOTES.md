# Design Notes — AllClear

## Design System Applied
- Color tokens: All 10 spec colors match exactly (#1E3A5F primary, #2563EB accent, #10B981 success, #EF4444 error, #F59E0B warning, #F8FAFC surface, #E2E8F0 border, #0F172A text-primary, #64748B text-secondary, #FFFFFF bg)
- Typography: DM Sans (heading) + Source Sans 3 (body) loaded via next/font/google. h1 corrected to spec's 32px (was 30px). h3 corrected to 18px (`text-lg`) where used as step titles.
- Spacing: 4px base unit respected throughout. Scale matches spec (4/8/16/24/32/48/64).
- Border radii: sm=4px, md=8px, lg=12px, full=9999px — all match spec.
- Animations: fast=120ms, normal=200ms, slow=350ms, all ease-out — match spec. Custom `fade-in-up` and `fade-in` keyframes added for page entrance animations.

## Changes Made

### Global / Theme
1. **`src/app/globals.css`** — Added smooth scroll, `fade-in-up` and `fade-in` keyframe animations, stagger delay utilities (`.stagger-1` through `.stagger-5`), print styles.

### UI Components
2. **`src/components/ui/Button.tsx`** — Changed to `transition-all` (from `transition-colors`) to support `active:scale-[0.97]` pressed feedback. Changed `focus:` to `focus-visible:` for cleaner keyboard-only focus rings. Added disabled guard on active scale.
3. **`src/components/ui/Card.tsx`** — Added `hover:shadow-sm hover:-translate-y-px` lift effect on hover cards. Changed to `transition-all`. Added keyboard handler (Enter/Space) for clickable cards.
4. **`src/components/ui/Input.tsx`** — Added `hover:border-text-secondary/40` hover state. Changed to `transition-all`.
5. **`src/components/ui/Toast.tsx`** — Improved dismiss button with padding, rounded corners, hover background, and `transition-opacity`.
6. **`src/components/ui/Modal.tsx`** — Added `animate-in fade-in` to backdrop. Added `px-4` to container for mobile edge spacing.

### Header
7. **`src/components/features/Header.tsx`** — Added mobile hamburger menu with slide-down drawer (was hidden on mobile). Added active route indication (accent color + bg tint) using `usePathname`. Made header sticky (`sticky top-0 z-20`). Nav links use rounded pill style with `px-3 py-1.5` instead of raw text links.

### Landing Page
8. **`src/app/page.tsx`** — Fixed h1 to `text-[2rem]` matching spec's 32px. Increased hero padding (`py-20 sm:py-24`). Added `max-w-xl mx-auto` to subtitle for better line length. Added staggered `animate-fade-in-up` entrance to hero elements (h1, subtitle, search bar, hint text). "How it works" h3 corrected to `text-lg` (18px). Steps have staggered entrance animation. CTA button gets `active:scale-[0.97]`.

### Feature Components
9. **`src/components/features/SearchBar.tsx`** — Added `focus-within:shadow` glow on the search wrapper for focus depth. Screen button gets `active:scale-[0.97]`.
10. **`src/components/features/ResultDetail.tsx`** — Close button improved with `hover:bg-surface` background and rounded padding. Dataset rows get `hover:bg-surface` on hover. Match score bar gets `transition-all duration-slow`.
11. **`src/components/features/ResultsList.tsx`** — Added `animate-fade-in-up` to "All Clear" and error states. Added `animate-fade-in` to results count badge. Backdrop overlay gets `animate-in fade-in`. Details summary gets `transition-colors`.
12. **`src/components/features/PricingCards.tsx`** — Added `hover:shadow-sm` / `hover:shadow-md` (Pro card) transition on pricing cards.
13. **`src/components/features/HistoryTable.tsx`** — Filter pills get `hover:border-text-secondary/30` for hover depth. Table name links get `transition-colors`.

### Inner Pages
14. **`src/app/screen/[id]/page.tsx`** — Detail panel backdrop gets `animate-in fade-in`. Datasets summary gets `transition-colors`.

## Responsive Status
| Page | Desktop | Mobile (390px) |
|------|---------|----------------|
| `/` | OK | OK — hero scales, search bar full-width, pricing cards stack |
| `/screen` | OK | OK — search bar full-width, results stack |
| `/screen/[id]` | OK | OK — action buttons wrap via flex-col, detail panel full-width |
| `/history` | OK | OK — table scrolls via overflow-x-auto, filters stack |
| `/settings` | OK | OK — cards stack, danger zone buttons stack |
| `/reports/[id]` | OK | OK — print styles hide header |

Mobile navigation: Hamburger menu added for authenticated users (was previously hidden). Drawer slides down with nav links + sign out + email display. All tap targets min 44px via `py-2.5`.

## Microinteractions Added
- **Page entrance (landing):** Staggered fade-in-up on hero h1, subtitle, search bar, and hint text (0ms/80ms/160ms/240ms delays)
- **"How it works" steps:** Staggered fade-in-up entrance per step
- **Button pressed state:** `active:scale-[0.97]` on all Button components + CTA buttons
- **Card hover lift:** `hover:shadow-sm hover:-translate-y-px` on interactive cards
- **Input hover:** Border color shift to `text-secondary/40` on hover
- **Search bar focus:** Outer glow shadow (`focus-within:shadow`) around search wrapper
- **Result states:** "All Clear" and error panels fade-in-up on appear
- **Results badge:** Fade-in animation when results count appears
- **Overlay backdrop:** All backdrop overlays fade-in (ResultDetail panel, ResultsList panel)
- **Detail panel datasets:** Row hover state with `bg-surface`
- **Pricing cards:** Shadow lift on hover (stronger for Pro tier)
- **Header mobile menu:** `slide-in-from-top-2 fade-in` animation on open
- **Nav links:** Active route highlighted with accent color + subtle bg tint
- **Toast dismiss:** Improved hover state with bg tint
- **Modal backdrop:** Separate fade-in animation

## Build Status
- After design pass: PASS (`next build` — exit 0, 10 routes generated)
