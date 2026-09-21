# The Royal Passage — Complete Project Documentation

> **Last updated:** August 31, 2026  
> **Repository:** [github.com/chethud/The-Royal-Passage](https://github.com/chethud/The-Royal-Passage)  
> **Production frontend:** [the-royal-passage.vercel.app](https://the-royal-passage.vercel.app)  
> **Production API:** `the-royal-passage.onrender.com`  
> **Latest travel-agent commit:** `2cc4ce0` — pricing, markup, customer checkout

This document is the **single source of truth** for everything built in the project: product modules, user workflows, design tokens, API surface, database schema, deployment, and recent feature work.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Design System (Complete)](#3-design-system-complete)
4. [User Roles & Access Control](#4-user-roles--access-control)
5. [Public Marketplace](#5-public-marketplace)
6. [Guest Features](#6-guest-features)
7. [Experience Host Module](#7-experience-host-module)
8. [Homestay Owner Module](#8-homestay-owner-module)
9. [VIP Module](#9-vip-module)
10. [Travel Agent Module (Full Detail)](#10-travel-agent-module-full-detail)
11. [Admin Platform](#11-admin-platform)
12. [Editor / CMS](#12-editor--cms)
13. [Booking Workflows (Step-by-Step)](#13-booking-workflows-step-by-step)
14. [Partner Onboarding Workflows](#14-partner-onboarding-workflows)
15. [Payments & Pricing Model](#15-payments--pricing-model)
16. [Email & Notifications](#16-email--notifications)
17. [Backend API Reference (Complete)](#17-backend-api-reference-complete)
18. [Database Schema & Migrations](#18-database-schema--migrations)
19. [Frontend Architecture](#19-frontend-architecture)
20. [Deployment & Environment](#20-deployment--environment)
21. [Demo Accounts, Seed Data & Scripts](#21-demo-accounts-seed-data--scripts)
22. [Project Directory Map](#22-project-directory-map)
23. [Appendix A — Complete Route Index (120 routes)](#appendix-a--complete-route-index)
24. [Appendix B — Component Inventory](#appendix-b--component-inventory)
25. [Appendix C — Hooks & Lib Reference](#appendix-c--hooks--lib-reference)
26. [Appendix D — Migration Timeline](#appendix-d--migration-timeline)
27. [Appendix E — Feature Status & Known Limits](#appendix-e--feature-status--known-limits)

---

## 1. Executive Summary

**The Royal Passage** is a luxury travel marketplace centered on **Mysuru (Mysore), Karnataka, India**. It is a full-stack product connecting seven user types across experiences, homestays, VIP packages, and travel-agent wholesale booking.

### What the platform does

| Actor | Primary value |
|-------|----------------|
| **Guest** | Browse catalog, wishlist, cart, book experiences & homestays (COD), apply for VIP membership, leave reviews |
| **Experience host** | Create/publish experiences, manage 7-day slot inventory, confirm/reject bookings, track revenue |
| **Homestay owner** | Manage properties (Home Stay / Resort / Hotel), rooms, calendar pricing, stay bookings |
| **VIP owner** | Publish premium packages, manage VIP bookings, review membership & custom package requests |
| **Travel agent** | Browse at **agent-discounted rates**, add **markup**, book for **customers** with optional confirmation email |
| **Admin** | Moderate all listings, partner applications, bookings, users, trust signals, featured content |
| **Editor** | Edit homepage hero, journal, video section, photos, Mysore Trail itinerary |

### Core product decisions

- **Payment model:** Cash-on-delivery only — experiences paid at venue after host confirms; homestays paid in cash at check-in. No Stripe/Razorpay integration (by design).
- **Visual identity:** Deep burgundy (`#3A080F`) + antique gold (`#C6A15B`) + ivory/cream panels for checkout.
- **Typography:** Cinzel (site-wide serif), Cinzel Decorative (royal headings), Libre Baskerville (editorial body on heroes).
- **Auth:** Supabase Auth (email/password + Google OAuth). Only **guests** self-register; all provider roles provisioned by admin or partner approval.
- **Multi-role:** One account can hold multiple roles (`user_roles` table); header/nav switches workspace by URL prefix.
- **API:** Connect RPC (97 methods) as primary frontend API; supplementary REST under `/api/v1/*` for host/admin/travel-agent subsets.

### Recent major work (Travel Agent module)

Built end-to-end travel agent wholesale booking:

1. Partner application form with KYC document uploads
2. Admin approval queue with configurable **discount %** (hidden from agent UI)
3. Agent sees **discounted prices only** on catalog/detail (no public discount % label, no strikethrough on homestays)
4. **Markup** controls — fixed ₹ or percent % — on homestay detail panel, checkout summary, and confirm step
5. **Customer contact** fields mandatory and **empty** for agents (not pre-filled from agent profile)
6. **Customer email** options on confirm: don't send / send with price / send without price
7. Agent dashboard with stats, recent bookings, full booking history
8. Backend pricing mirror: `apply_agent_pricing()` + booking columns on `bookings` and `homestay_bookings`

---

## 2. Tech Stack & Architecture

### Frontend

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| Framework | **TanStack Start** + **TanStack Router** | File-based routing in `src/routes/` → `routeTree.gen.ts` |
| UI library | **React** | 19.2 |
| Language | **TypeScript** | 5.8 |
| Build | **Vite** | 7.3 |
| Styling | **Tailwind CSS v4** + `src/styles.css` | ~8,300 lines of custom CSS |
| Component base | **Radix UI** + shadcn-style | `src/components/ui/` (~50 primitives) |
| Forms | **react-hook-form** + **Zod** | Validation on checkout, partner forms |
| Server state | **TanStack Query** | Caching for catalog, dashboards |
| API client | **Connect RPC** | `@connectrpc/connect-web` + generated types in `src/gen/` |
| Auth | **Supabase JS** | `src/lib/supabase/browser.ts` |
| Animation | **motion** 12, **embla-carousel**, **ogl** (WebGL) | Hero, auth cinematic, Mysore Trail |
| Charts | **recharts** | Host/owner/admin revenue |
| Face detection | **@vladmandic/human** | Partner passport photo validation |
| Dates | **date-fns** + **react-day-picker** | Booking calendars |
| Toasts | **sonner** | Global notifications |
| Icons | **lucide-react** | Throughout UI |

### Backend

| Layer | Technology | Notes |
|-------|------------|-------|
| Runtime | **Python 3.12** | Render deployment |
| HTTP | **Starlette ASGI** | `backend/app/main.py` (production entry) |
| RPC | **Connect RPC** + **Protobuf** | `proto/royalpassage/v1/service.proto` — 97 methods |
| Legacy (unmounted) | **FastAPI routers** | `backend/app/routers/` — not used in production |
| DB client | **Supabase Python SDK** | Service role for all writes |
| Email | **Resend** | Branded HTML via `royal_email_templates.py` |
| Cache | **TTL in-process cache** | Auth token/profile cache (45s) |

### Infrastructure

| Service | Purpose | Config file |
|---------|---------|-------------|
| **Vercel** | Frontend SSR + serverless | `vercel.json` |
| **Render** | FastAPI backend web service | `render.yaml` |
| **Render Cron** | Host booking reminders every 5 min | `render.yaml` (schedule `*/5 * * * *`) |
| **Supabase** | PostgreSQL, Auth, Storage, RLS | `supabase/migrations/` (46 files) |
| **Resend** | Transactional + auth SMTP | `RESEND_API_KEY` env |
| **Upstash Redis** | Optional caching | Not required for core flows |

### Vercel serverless functions

| Function | Path | Purpose |
|----------|------|---------|
| `api/server.ts` | Catch-all rewrite | TanStack Start SSR handler |
| `api/homepage-photo.ts` | `/api/homepage-photo` | Homepage photo upload/serve |
| `api/guest-review.ts` | `/api/guest-review` | Guest review submission helper |
| Sitemap | `/sitemap.xml` → `/api/sitemap` | SEO sitemap |

### Security headers (Vercel)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Static assets cached 1 year (`/assets/*`, `/_build/*`)

### High-level request flow

```
Browser (React 19)
  → TanStack Router (file route match)
  → Component renders
  → Data fetch:
      • Connect RPC (catalog, admin, host, owner, VIP, wishlist)
      • REST fetch (bookings, travel-agent, some admin)
      • Supabase direct (partner forms, homepage CMS, auth)
  → FastAPI/Starlette backend (Render)
  → Supabase PostgreSQL (service role)
  → Resend (transactional emails)
  → In-app notifications table
```

### Build pipeline

```bash
npm run build
# = vite build
# + scripts/build-homepage-photo-api.mjs
# + scripts/build-guest-review-api.mjs
```

Protobuf regeneration: `npm run proto:generate` (Buf → `src/gen/royalpassage/v1/`)

---

## 3. Design System (Complete)

**Primary source:** `src/styles.css` (~8,300 lines)  
**Secondary:** `src/styles/mysore-trail.css` (Mysore Trail-specific)  
**Fonts loaded in:** `src/routes/__root.tsx` (Google Fonts link)

### 3.1 Typography

| CSS Token | Font Family | Usage |
|-----------|-------------|--------|
| `--font-display` | **Cinzel**, ui-serif, Georgia | H1–H4, display headings |
| `--font-sans` | **Cinzel** | Body text site-wide (intentional serif aesthetic) |
| `--font-royal` | **Cinzel Decorative**, Cinzel | Decorative royal headings, auth |
| `--font-body` | **Cinzel** | Body alias |
| `--font-baskerville` | **Libre Baskerville** | Hero subcopy, editorial passages, homestay hero body |

**Google Fonts URL weights:**
- Cinzel: 400, 500, 600, 700
- Cinzel Decorative: 400, 700
- Libre Baskerville: 400, 400i, 700, 700i

**Responsive base font size (`html`):**
| Breakpoint | Size |
|------------|------|
| Default (mobile) | 15px |
| ≥640px | 16px |
| ≥768px | 17px |

**Heading defaults:** `font-weight: 600`, `letter-spacing: 0.02em`  
**Button/label:** `letter-spacing: 0.02em`  
**Selection highlight:** `background: rgba(198, 161, 91, 0.35)` on ivory text

**Utility classes:**
| Class | Purpose |
|-------|---------|
| `.font-display` | Display font family |
| `.font-body` | Body font alias |
| `.eyebrow` | Uppercase section label — 0.7rem, letter-spacing 0.24em, weight 600 |
| `.luxury-panel-heading` | Checkout/form panel titles (dark burgundy on cream) |
| `.luxury-panel-body` | Panel body copy |
| `.luxury-panel-label` | Panel field labels — uppercase tracking |

### 3.2 Color Palette — Brand Tokens

| Token | Hex | RGB | Usage |
|-------|-----|-----|--------|
| `--royal-burgundy` | `#3A080F` | 58, 8, 15 | Primary page background, primary buttons |
| `--royal-plum` | `#241017` | 36, 16, 23 | Gradient end, deep accents |
| `--antique-gold` | `#C6A15B` | 198, 161, 91 | Primary gold accent, focus rings, CTAs |
| `--soft-champagne` | `#E2C98B` | 226, 201, 139 | Lighter gold highlight |
| `--old-gold` | `#9C7A3C` | 156, 122, 60 | Dimmed gold, chart-3 |
| `--royal-ivory` | `#F5EFE3` | 245, 239, 227 | Primary text on dark backgrounds |
| `--pearl-white` | `#FCF9F3` | 252, 249, 243 | Cards, popovers, cream surfaces |
| `--royal-charcoal` | `#191719` | 25, 23, 25 | Text on light/cream panels |
| `--success-green` | `#2F6B4F` | 47, 107, 79 | Success states |
| `--error-red` | `#8C3030` | 140, 48, 48 | Destructive actions, errors |
| `--ink-soft` | `#D7CDBF` | 215, 205, 191 | Muted light text on dark |
| `--cream-warm` | `#EFE3CF` | 239, 227, 207 | Warm checkout surfaces |

### 3.3 Semantic Theme Mapping

| Token | Resolved Value | Used For |
|-------|----------------|----------|
| `--background` | `#3A080F` | Page background |
| `--foreground` | `#F5EFE3` | Default body text |
| `--ink` | `#FCF9F3` | High-contrast text on dark |
| `--primary` | burgundy | Primary filled buttons |
| `--primary-foreground` | ivory | Text on primary buttons |
| `--secondary` | `rgba(36,16,23,0.92)` | Secondary surfaces |
| `--accent` / `--ember` | `#C6A15B` | Gold accents |
| `--ember-soft` | `rgba(198,161,91,0.2)` | Soft gold backgrounds |
| `--muted` | `rgba(245,239,227,0.12)` | Muted dark surfaces |
| `--muted-foreground` | `rgba(225,210,185,0.78)` | Secondary text on **dark** backgrounds |
| `--border` | `rgba(198,161,91,0.28)` | Gold-tinted borders |
| `--ring` | antique gold | Focus rings |
| `--destructive` | `#8C3030` | Error/destructive |
| `--card` | `rgba(252,249,243,0.96)` | Card backgrounds |
| `--card-foreground` | charcoal | Text on cards |
| `--popover` | pearl-white | Dropdowns, selects |
| `--cream-border` | `rgba(198,161,91,0.32)` | Cream panel borders |
| `--cream-shadow` | `rgba(36,16,23,0.18)` | Cream panel shadows |

**Light-surface override:** On cream panels, popovers, dialogs — `--muted-foreground` switches to `#665B54` for readable helper text.

**Auth card override:** `.auth-page-card` restores ivory muted text for dark glass auth panels.

### 3.4 Chart Colors

| Token | Hex |
|-------|-----|
| `--chart-1` | `#C6A15B` (antique gold) |
| `--chart-2` | `#E2C98B` (champagne) |
| `--chart-3` | `#9C7A3C` (old gold) |
| `--chart-4` | `#7D5B4F` (warm brown) |
| `--chart-5` | `#B7A48A` (taupe) |

### 3.5 Context-Specific Colors

#### Homepage hero CTAs
| Element | Color |
|---------|-------|
| Primary CTA background | `#C9A227` |
| Primary CTA text | `#2A0B08` |
| Primary CTA hover | `#D4AD32` |
| Ghost CTA border | `rgb(201 162 39 / 0.42)` |
| Ghost CTA text | `#F3EAD6` |

#### Experience detail page (dark immersive panel)
| Usage | Hex |
|-------|-----|
| Page text | `#F7F1E8` |
| Gold accent | `#D4AF37` |
| Muted text | `#D6C8B5` (various opacities) |
| Tagline accent | `#8B6914` |

#### Checkout / cream panels (light ledger style)
| Usage | Hex / Value |
|-------|-------------|
| Panel text | `#2A0000` / `#4A0000` |
| Field borders | `rgb(74 0 0 / 0.2)` |
| Offer/sale price | `#8B1E1E` |
| Placeholder text | `#999088` |
| Markup toggle active | `#4A0000` bg, white text |
| Markup toggle inactive | `#4A0000` at 70% opacity |

#### Body background
```css
background-image:
  radial-gradient(ellipse 90% 55% at 50% -18%, rgba(198,161,91,0.16), transparent 58%),
  radial-gradient(ellipse 55% 45% at 100% 15%, rgba(226,201,139,0.08), transparent 52%),
  radial-gradient(ellipse 45% 40% at 0% 85%, rgba(36,16,23,0.3), transparent 48%),
  linear-gradient(180deg, #3A080F 0%, #241017 100%);
background-attachment: fixed; /* scroll on mobile ≤639px */
```

**PWA / meta theme-color:** `#3A080F`

### 3.6 Spacing, Radius & Shadows

| Token | Value |
|-------|-------|
| `--radius` (default) | 8px |
| `--radius-sm` | 6px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |
| `--shadow-soft` | `0 8px 30px rgba(36,16,23,0.08)` |
| `--shadow-lift` | `0 12px 40px rgba(36,16,23,0.16)` |
| `--shadow-gold` | `0 10px 28px rgba(58,8,15,0.18), inset 0 1px 0 rgba(252,249,243,0.35)` |

### 3.7 Layout Tokens

| Token | Mobile | ≥640px | ≥768px | ≥1024px |
|-------|--------|--------|--------|---------|
| `--header-height` | 4.25rem | 4.5rem | 5.25rem | 5.75rem |

**Containers:**
- `.container-page` — max-width 1280px, responsive horizontal padding (1rem → 2.5rem)
- `.glass` / `.glass-strong` — frosted glass panels (404, auth, overlays)
- `.hairline` — 1px gold-tinted divider

### 3.8 Button System

| Class | Appearance | Usage |
|-------|------------|--------|
| `.luxury-btn-primary` | Gold/burgundy filled CTA | Primary actions on dark backgrounds |
| `.luxury-btn-secondary` | Outlined gold | Secondary actions |
| `.luxury-btn-sm` | Compact padding | Checkout wizard footer |
| `.luxury-btn-panel-outline` | Outlined on cream panels | Cancel/back on checkout |
| `.luxury-btn-panel-danger` | Red outline on cream | Destructive on panels |

On `.luxury-checkout-panel`, primary buttons use dark burgundy fill with ivory text.

### 3.9 Panel & Checkout Components

| Class | Purpose |
|-------|---------|
| `.luxury-checkout-panel` | Main checkout card — warm ivory, decorative `::before` gradient |
| `.luxury-checkout-panel--ledger` | Ledger variant with corner ornaments |
| `.luxury-ledger-frame` / `.luxury-ledger-corner--*` | Decorative corner brackets |
| `.royal-split-chamber` | Two-column checkout layout |
| `.royal-split-chamber--cream` | Cream variant text colors |

### 3.10 Dashboard / Host Deck Styles

| Class | Purpose |
|-------|---------|
| `.host-bookings-deck` | Royal card deck layout for host bookings |
| `.host-overview-stack` | Stacked overview panels on host dashboard |
| `.host-bookings-table` | Fixed column widths for booking tables |
| `.host-overview-hero--bookings` | Hero banner on bookings page |

### 3.11 Component Pattern Map

| Pattern | Location | Purpose |
|---------|----------|---------|
| shadcn/ui primitives | `src/components/ui/` | Button, Dialog, Form, Select, Sheet, Sidebar, etc. |
| Marketplace cards | `MarketplaceCard`, `ExperienceCard`, `HomestayCard` | Catalog grid items |
| Detail pages | `DetailPageLayout`, `DetailPageShell`, `DetailStatGrid` | Unified detail page chrome |
| Checkout | `LuxuryCheckoutPanel`, `CheckoutWizardPrimitives`, wizards | 3-step booking flows |
| Dashboard shells | `HostDashboardShell`, `GuestDashboardShell`, `TravelAgentDashboardShell`, etc. | Role-specific page wrappers |
| Auth cinematic | `RoyalAuthExperience`, `RoyalPalaceGateway`, `AuthPageLayout` | Sign-in/sign-up UX |
| Pricing display | `OfferPrice`, `HomestayOfferRates` | Compare-at / sale pricing |
| Status chips | `BookingStatusChip` | pending / confirmed / completed / cancelled |
| Passport UX | `RoyalPassportBook`, `PassportPhotoFrame` | Partner KYC photo capture |

### 3.12 Motion & Accessibility

- `prefers-reduced-motion: reduce` — disables scroll-parallax, smooth scroll
- `usePrefersReducedMotion` hook used in animated components
- Cinematic homepage intro hides header until animation completes (`data-cinematic` attribute)

---

## 4. User Roles & Access Control

**Defined in:** `src/lib/roles.ts`  
**Backend RBAC:** `backend/app/services/user_roles.py`, `backend/app/rpc/auth.py`, `backend/app/http_auth.py`  
**Database:** `profiles.role`, `profiles.roles[]`, `user_roles` table (migration `20260710_user_roles.sql`)

### 4.1 Role Matrix

| Role ID | Label | Dashboard Home | Profile Path | Self-Register? | Can Book? |
|---------|-------|----------------|--------------|----------------|-----------|
| `guest` | Guest | `/` | `/account/profile` | ✅ Yes | ✅ Yes |
| `host` | Experience host | `/host/dashboard` | `/account/profile` | ❌ No | ❌ No |
| `homestay_owner` | Homestay owner | `/homestay/dashboard` | `/account/profile` | ❌ No | ❌ No |
| `vip_owner` | VIP owner | `/vip/dashboard` | `/account/profile` | ❌ No | ❌ No |
| `travel_agent` | Travel agent | `/travel-agent/dashboard` | `/account/profile` | ❌ No | ✅ Yes (for clients) |
| `admin` | Admin | `/admin` | `/admin/profile` | ❌ No | ❌ No |
| `editor` | Editor | `/admin/homepage-edit` | `/account/profile` | ❌ No | ❌ No |

### 4.2 Multi-Role Support

- Table: `user_roles (user_id, role)` with unique constraint
- `resolveUserRoles()` merges `user_roles` rows + `profiles.role` (profile role always included to prevent stale guest row hiding staff role)
- **Priority** (`pickPrimaryRole`): admin → host → homestay_owner → vip_owner → travel_agent → editor → guest
- **Workspace switching** (`activeWorkspaceRole`): URL prefix overrides primary role for header chrome:
  - `/host/*` → host nav
  - `/homestay/*` → homestay owner nav
  - `/vip/*` → VIP owner nav
  - `/travel-agent/*` → travel agent nav
  - `/admin/*` → admin nav (editor sub-routes for homepage tools)

### 4.3 Permission Helper Functions

| Function | Returns true when… |
|----------|-------------------|
| `isGuestAccount(role, roles)` | Not staff; includes travel agents |
| `isStaffRole(role)` | host, homestay_owner, vip_owner, admin, or editor |
| `isTravelAgentRole(role, roles)` | Has travel_agent role |
| `canSelfRegister(role)` | role === `guest` |
| `hasAdminAccess(roles, role)` | Has admin role |
| `hasEditorAccess(roles, role)` | Has editor or admin |
| `canEditHomepageAdminSections` | editor or admin |
| `canEditHomepageJournal` | editor or admin |
| `canEditHomepageJourneys` | editor or admin (heritage video) |
| `canEditMysoreTrail` | editor or admin |
| `workspaceLinksForRoles` | All staff workspaces account can open |

### 4.4 Route Guard Hooks

| Hook | File | Behavior |
|------|------|----------|
| `useGuestAccess` | `src/lib/use-guest-access.ts` | Redirects staff away from guest-only flows |
| `useHostAccess` | `src/lib/use-host-access.ts` | Requires host role |
| `useHomestayOwnerAccess` | `src/lib/use-homestay-owner-access.ts` | Requires homestay_owner |
| `useVipOwnerAccess` | `src/lib/use-vip-owner-access.ts` | Requires vip_owner |
| `useTravelAgentAccess` | `src/lib/use-travel-agent-access.ts` | Requires travel_agent; exposes `accessToken` |

### 4.5 Backend Auth Patterns

**Connect RPC** (`rpc/auth.py`):
- `resolve_current_user(ctx)` — JWT → profile bootstrap
- `require_admin`, `require_guest`, `require_host`, `require_homestay_owner`, `require_vip_owner`, `require_admin_or_vip_owner`

**REST** (`http_auth.py`):
- `require_admin_request`, `require_host_request`, `require_homestay_owner_request`, `require_travel_agent_request`, `require_guest_request`
- 45-second TTL cache on auth resolution

**Cron:** `Authorization: Bearer {CRON_SECRET}`

### 4.6 Guest Booking Abuse Protection

Migration `20260715_guest_booking_cancel_freeze.sql`:
- Guests who cancel **>3 bookings in one calendar day** (Asia/Kolkata) get frozen
- First offense: 24h freeze; repeat offense days: 3-day freeze
- Enforced server-side in `guest_booking_freeze.py`

---

## 5. Public Marketplace

### 5.1 Homepage (`/`)

**File:** `src/routes/index.tsx`  
**Components:** `HomeHero`, `HeroSlideshow`, `ExperiencesShowcase`, `HomestaysShowcase`, `VipsShowcase`, `JournalPreview`, `JourneysSplit`

Features:
- Cinematic intro animation (`useHomeIntro`) — header hidden until complete
- Hero slideshow with editable photos/headings (CMS)
- Featured experiences, homestays, VIP packages
- Journal stories preview
- Heritage video section (YouTube embed, editable title/description)

### 5.2 Experience Catalog

| Path | File | Features |
|------|------|----------|
| `/experiences/` | `experiences.index.tsx` | Search bar, category/city/price filters, grid of `ExperienceCard` |
| `/experiences/$slug/` | `experiences.$slug.index.tsx` | Gallery, description, slot picker (7-day window), reviews, add-to-cart, book CTA |
| `/experiences/$slug/book` | `experiences.$slug.book.tsx` | Direct checkout wizard |

**Experience categories:** Arts & Crafts, Food & Drink, Wellness, Nature, Culture, **Tours & Sightseeing** (added migration `20260824`)

**Card pricing for travel agents:** Shows agent-discounted price only via `travelAgentListedPrices()` — no discount % label.

**Detail page colors:** Dark immersive panel (`#F7F1E8` text, `#D4AF37` gold accents)

### 5.3 Homestay Catalog

| Path | File | Features |
|------|------|----------|
| `/homestays/` | `homestays.index.tsx` | Marketing landing with hero |
| `/homestays/browse/` | `homestays.browse.index.tsx` | Date/guest search widget, filterable grid |
| `/homestays/$slug/` | `homestays.$slug.index.tsx` | Room list, inline date picker, `#book` panel with notes + agent markup |
| `/homestays/$slug/book` | `homestays.$slug.book.tsx` | Full checkout wizard |

**Property types:** Home Stay, Resort, Hotel (migration `20260708`)

**Homestay agent pricing:** Shows **agent rate only** (e.g. ₹10,800) — **no strikethrough** of public rate on detail page.

**Pricing dimensions:**
- Weekday vs weekend nightly rates
- Per-date price overrides (holiday pricing)
- Extra bed pricing (with per-day overrides)
- GST add-on at checkout
- Compare-at offer pricing (display only)

### 5.4 VIP Public Pages

| Path | Purpose |
|------|---------|
| `/vips/` | VIP marketing landing |
| `/vips/browse/` | Member-only browse (requires approved VIP membership) |
| `/vips/$slug/` | Package detail + enquiry panel |

### 5.5 Cities & Journal

| Path | Purpose |
|------|---------|
| `/cities` | City directory (Mysuru primary) |
| `/cities/$slug` | City page with local experiences |
| `/journal` | Editorial journal stories |

### 5.6 Mysore Trail (`/mysore-trail`)

Interactive itinerary builder:
- `MysoreTrailExperience` — public-facing trail
- `TripConfigurator` — customize stops
- `CircularGallery`, `TrailCircularPanel` — visual discovery
- `StickyDestinationPanel` — pinned destination info
- Admin editor at `/admin/mysore-trail` (`MysoreTrailCatalogEditor`)
- Styles in `src/styles/mysore-trail.css`

### 5.7 Legal & Contact

| Path | Content |
|------|---------|
| `/contact` | Contact page |
| `/legal/privacy-policy` | Privacy policy document |
| `/legal/payment-policy` | Payment policy (COD model) |
| `/legal/experience-terms` | Experience booking terms |

### 5.8 Partner Application Pages (Public)

| Path | Form Component | Collects |
|------|----------------|----------|
| `/partner/experience-host` | `PartnerExperienceApplicationForm` | Business details, GSTIN, PAN, trade license, passport photo, experience draft |
| `/partner/homestay-host` | `PartnerHomestayApplicationForm` | Property details, KYC docs, room info |
| `/partner/travel-agent` | `PartnerTravelAgentApplicationForm` | Company name, GSTIN, PAN, address, passport photo, registration docs |

---

## 6. Guest Features

### 6.1 Authentication

| Path | Component | Features |
|------|-----------|----------|
| `/sign-in` | `RoyalAuthExperience` (mode: signin) | Email/password, Google OAuth, role-aware redirect |
| `/sign-up` | `RoyalAuthExperience` (mode: signup) | Guest-only self-registration |
| `/forgot-password` | `RoyalAuthExperience` (mode: forgot) | Reset email via Supabase |
| `/reset-password` | `ResetPasswordExperience` | Set new password from email link |
| `/auth/callback` | OAuth handler | Completes Google OAuth, redirects by role |

**Auth UX details:**
- Cinematic palace gateway visuals (`RoyalPalaceGateway`, dust particles)
- Terms acceptance gate before signup
- OAuth profile completion (name/phone if missing)
- Staff login messaging: credentials provided by Royal Passage
- Session cached in `localStorage` (`rp_auth_user_v1`) for fast display
- VIP signup prompt on `SIGNED_UP` event

### 6.2 Guest Dashboard

| Path | Purpose |
|------|---------|
| `/dashboard/history` | Active & upcoming experience bookings |
| `/dashboard/past` | Redirect → history (legacy) |
| `/dashboard/cancelled` | Cancelled bookings |
| `/dashboard/wishlist` | Saved experiences |
| `/dashboard/cart/` | Cart + wishlist combined view |
| `/dashboard/cart/checkout/$slug` | Checkout cart item via `BookingCheckoutWizard` |
| `/account/profile` | Edit name, phone, photo, DOB, registration number |
| `/account/vip-apply` | VIP membership application form |
| `/account/escalation` | Support escalation contacts form |

### 6.3 Booking Detail & Reviews

| Path | Purpose |
|------|---------|
| `/bookings/$bookingId/` | Experience booking detail (status, slot, payment) |
| `/bookings/$bookingId/review` | Post-stay review form (`ReviewForm`, star rating) |
| `/stays/$bookingId` | Homestay booking detail |

### 6.4 Cart & Wishlist

**Cart** (`use-experience-cart.ts`, `cart-storage.ts`):
- LocalStorage persistence
- Supports experience + homestay items
- Add from detail pages via `AddToCartButton`, `AddHomestayToCartButton`
- Cart icon in header (guests only, hidden in homestay/VIP sections)

**Wishlist** (`wishlist` table):
- Supabase-backed saved experiences
- `WishlistButton` on experience cards
- Merged display in cart UI

### 6.5 VIP Member Area

Requires `profiles.vip_membership_status = 'approved'`:

| Path | Purpose |
|------|---------|
| `/member/vip/` | VIP member hub |
| `/member/vip/packages` | Browse packages as approved member |
| `/member/vip/custom-request` | Request bespoke VIP package |

**VIP application flow:**
1. Guest applies at `/account/vip-apply`
2. Admin/VIP owner reviews at `/admin/vip/memberships`
3. On approval: unlocks `/vips/browse/` and member routes
4. `VipMembershipPrompt` may appear for eligible guests

---

## 7. Experience Host Module

### 7.1 Routes

| Path | Purpose |
|------|---------|
| `/host/dashboard` | Overview stats, today's sessions, quick actions |
| `/host/bookings/` | All bookings queue with filters |
| `/host/bookings/$bookingId` | Single booking — confirm/reject/mark paid/complete/pause |
| `/host/experiences/` | Experience list table |
| `/host/experiences/new` | `CreateExperienceWizard` — multi-step create |
| `/host/experiences/$experienceId` | Edit experience, manage slots & photos |
| `/host/revenue` | Revenue chart (`RevenueChart`) — daily/weekly/monthly |
| `/host/reviews` | Guest reviews + host reply |
| `/host/offers` | Compare-at promotional pricing per experience |
| `/host/profile` | Redirect → `/account/profile` |

### 7.2 Host Capabilities

**Experience management:**
- Title, slug, description, category, city, photos (gallery upload)
- Pricing: `price_per_person_minor`, optional `compare_at_price_per_person_minor`
- GST percent + GSTIN (when GST > 0)
- Party size min/max, duration, meeting point
- Status workflow: `draft` → `pending_review` → `published` / `rejected`
- Pause/resume bookings on experience level

**Slot management:**
- Rolling **7-day booking window** (`BOOKING_WINDOW_DAYS`)
- Per-slot: date, start time, capacity (seats)
- `SlotManager`, `WeekdaySlotBuilder`, `SlotWeekOverview` components
- Atomic seat reservation prevents overbooking (DB function in migration `20250609`)

**Booking actions:**
| Action | Effect |
|--------|--------|
| Confirm | Status → confirmed; guest email sent; requires decision contact (name + 10-digit phone) |
| Reject | Status → cancelled; rejection reason stored |
| Mark paid | Payment status → paid (COD at venue) |
| Complete | Status → completed; triggers review request |
| Pause / Resume | Temporarily pause confirmed booking without cancelling |

**Revenue:** Period-filtered charts; counts confirmed + paid bookings

**Offers:** Set compare-at ("was") price for promotional display — guests always pay selling price

### 7.3 Host Notifications & Emails

- New booking alert email immediately
- Pending reminders at **15 min, 2 hours, 24 hours** (cron every 5 min)
- Upcoming experience countdown at **10, 5, 4, 3, 2, 1 days** before slot
- In-app notification bell in header

---

## 8. Homestay Owner Module

### 8.1 Routes

| Path | Purpose |
|------|---------|
| `/homestay/dashboard` | Owner overview stats (`OwnerHomestayStatsGrid`) |
| `/homestay/properties/` | Property list (`OwnerHomestayTable`) |
| `/homestay/properties/new` | Create property (`OwnerHomestayForm`) |
| `/homestay/properties/$homestayId` | Edit property, rooms, availability calendar |
| `/homestay/bookings/` | Stay booking queue (`OwnerHomestayBookingTable`) |
| `/homestay/revenue` | Revenue analytics |
| `/homestay/reviews` | Guest reviews |
| `/homestay/offers` | Compare-at nightly rate offers |

### 8.2 Property Model

**Property fields:**
- Name, slug, description, photos, address, city
- Property type: **Home Stay**, **Resort**, **Hotel**
- License/certificate URL (required)
- GST percent + GSTIN
- Weekday/weekend compare-at prices (offer display)
- Status: draft → pending_review → published

**Room model:**
- Room name, capacity, number of units
- Weekday rate (`price_per_night_minor`)
- Weekend rate (`weekend_price_per_night_minor`) — Sat/Sun; null = same as weekday
- Extra bed count + extra bed nightly price
- Per-date overrides via `OwnerAvailabilityManager`, `OwnerHolidayPricingManager`

**Availability calendar:**
- Block dates, set custom nightly prices
- Extra bed price overrides per day

### 8.3 Owner Booking Actions

Same lifecycle as host bookings:
- Confirm (with decision contact) → Reject (with reason) → Mark paid (cash at check-in) → Complete
- Auto-complete after checkout date (server-side)

### 8.4 Homestay Pricing at Checkout

```
For each night in stay:
  rate = weekend_rate if Sat/Sun else weekday_rate
  apply date override if set on availability calendar
subtotal = sum(night_rates) × rooms + extra_bed_charges
gst = round(subtotal × gst_percent / 100)
total = subtotal + gst (+ agent_markup if travel agent)
```

---

## 9. VIP Module

### 9.1 VIP Membership (Guests)

| Step | Location | Action |
|------|----------|--------|
| 1 | `/account/vip-apply` | Guest submits application (`VipMembershipApplyForm`) |
| 2 | `/admin/vip/memberships` | Admin/VIP owner reviews queue |
| 3 | Approval | `profiles.vip_membership_status = 'approved'` |
| 4 | Access | Unlocks `/vips/browse/`, `/member/vip/*` |

### 9.2 VIP Owner Workspace

| Path | Purpose |
|------|---------|
| `/vip/dashboard` | Overview stats |
| `/vip/listings/` | Package list (`OwnerVipPackageTable`) |
| `/vip/listings/new` | Create package (`OwnerVipPackageForm`) |
| `/vip/listings/$packageId` | Edit package |
| `/vip/bookings/` | VIP booking management |
| `/vip/members/` | Approved VIP members list |
| `/vip/custom-requests/` | Custom package request queue |

### 9.3 VIP Package Lifecycle

- Owner creates package → `pending_review`
- Admin moderates at `/admin/vip-packages/`
- Publish → visible on `/vips/browse/` (members) and `/vips/$slug/` (public marketing)
- Custom package requests: guest submits at `/member/vip/custom-request` → owner/admin queue

### 9.4 Admin VIP Routes

| Path | Purpose |
|------|---------|
| `/admin/vip/` | VIP module overview |
| `/admin/vip/memberships` | Membership application queue |
| `/admin/vip/requests` | VIP-related requests |
| `/admin/vip/pending-bookings` | Pending VIP bookings |
| `/admin/vip-packages/` | Package moderation |
| `/admin/vip-packages/$packageId` | Package admin detail |
| `/admin/vip-owners/` | Manage VIP owner accounts |

---

## 10. Travel Agent Module (Full Detail)

> This is the most recently completed major feature. Commit `2cc4ce0` on `main`.

### 10.1 Overview

Travel agents are wholesale partners who:
1. Apply via public form with KYC documents
2. Get approved by admin with a **discount percentage** (admin-only, never shown to agent)
3. Browse catalog at **discounted agent rates**
4. Add optional **markup** (₹ fixed or %)
5. Book on behalf of **customers** with mandatory empty contact fields
6. Choose whether to **email the customer** (with/without price, or not at all)

### 10.2 Routes

| Path | Access | Purpose |
|------|--------|---------|
| `/partner/travel-agent` | Public | Application form |
| `/travel-agent/dashboard` | Agent | Stats, recent bookings, catalog CTA |
| `/travel-agent/catalog` | Agent | Links to browse experiences & homestays |
| `/travel-agent/bookings` | Agent | Full booking history with status filters |
| `/admin/travel-agent/` | Admin | Module overview |
| `/admin/travel-agent/requests` | Admin | Application queue — approve with discount % |
| `/admin/travel-agent/bookings` | Admin | All agent-placed bookings across platform |

### 10.3 Database Schema

**`travel_agents` table:**
- `company_name`, `contact_name`, `email`, `phone`, `city`, `address`
- `gst_number`, `pan_number`, document URLs (GST cert, company registration, passport photo)
- `discount_percent` (0–100) — **set by admin on approval**
- `approval_status`: pending | approved | rejected | suspended
- Linked to auth via `auth_user_id`; linked from `profiles.travel_agent_id`

**`partner_travel_agent_applications` table:**
- Full application payload + KYC docs
- `admin_discount_percent` — set when approving
- `created_user_id`, `created_travel_agent_id` — populated on approval
- Status: pending | approved | rejected

**Booking columns** (on both `bookings` and `homestay_bookings`):
| Column | Type | Purpose |
|--------|------|---------|
| `travel_agent_id` | uuid FK | Which agent placed the booking |
| `agent_discount_percent` | numeric | Snapshot of discount at booking time |
| `agent_markup_minor` | integer | Agent markup in paise |
| `guest_name` | text | Customer name (not agent) |
| `guest_email` | text | Customer email |
| `guest_phone` | text | Customer phone |
| `client_send_confirmation` | boolean | Whether to email customer |
| `client_email_include_price` | boolean | Include price in customer email |

Migrations: `20260901_travel_agent_module.sql`, `20260902_homestay_booking_guest_contact.sql`, `20260903_user_roles_travel_agent.sql`

### 10.4 Partner Application Flow

**Form:** `PartnerTravelAgentApplicationForm`  
**Server functions:** `src/lib/partner-travel-agent-fns.ts`

Collects:
- Full name, email, phone, city, bio
- Company name, company address
- GST number, PAN number
- Passport photo (face detection via `@vladmandic/human`)
- GST certificate upload, company registration upload

On submit → `partner_travel_agent_applications` (status: pending)  
Admin notification type: `partner_travel_agent_application`

**Admin approval** (`AdminPartnerTravelAgentApplicationsQueue`):
1. Admin sets **discount_percent** (e.g. 10%)
2. Calls `approveTravelAgentApplication()` which:
   - Creates Supabase auth user via `provider-invite.server.ts`
   - Creates `travel_agents` row with discount
   - Sets `profiles.role = 'travel_agent'`, `profiles.travel_agent_id`
   - Inserts `user_roles` row
   - Sends welcome email
3. Agent logs in → redirected to `/travel-agent/dashboard`

### 10.5 Agent Pricing Logic

**Frontend:** `src/lib/travel-agent-pricing.ts`  
**Backend:** `backend/app/services/travel_agent_booking.py` → `apply_agent_pricing()`  
**Discount fetch:** `src/hooks/use-travel-agent-discount.ts` → `fetchTravelAgentProfile()`

#### Formula
```
discounted_subtotal = subtotal × (1 - agent_discount% / 100)
gst                 = round(discounted_subtotal × gst% / 100)
agent_cost          = discounted_subtotal + gst
customer_total      = agent_cost + agent_markup
```

#### Display rules (implemented)
| Surface | What agent sees |
|---------|-----------------|
| Experience/homestay cards | Agent price only (discounted) — **no % label** |
| Experience detail | Agent price; compare-at may show public rate |
| Homestay detail | **Agent price only** — no strikethrough of public rate |
| Checkout summary | Agent rate breakdown + markup + customer price |

#### Key functions
| Function | Purpose |
|----------|---------|
| `applyTravelAgentPricing()` | Full checkout pricing with discount + GST + markup |
| `travelAgentListedPrices()` | Catalog card pricing for experiences |
| `travelAgentHomestayRates()` | Weekday/weekend rates for homestays |
| `markupFromPercent()` / `markupPercentOf()` | Convert between ₹ markup and % |
| `agentCostMinor()` | Agent cost before markup |

### 10.6 Markup Controls

**Component:** `TravelAgentMarkupControls` in `TravelAgentBookingExtras.tsx`

**Where markup appears:**
1. **Homestay detail** `#book` panel — after notes textarea in `HomestayBookingPanel`
2. **Checkout summary sidebar** — all steps via `CheckoutWizardSummaryPanel` `extras` prop
3. **Homestay checkout step 1** — same panel integration
4. **Experience checkout** — summary panel on all steps

**Markup modes:**
- **Fixed ₹** — enter rupee amount directly
- **Percent %** — percentage of agent cost; auto-calculates ₹ markup

**Live breakdown shows:**
- Your agent rate (discounted subtotal + GST)
- Your markup
- **Customer price** (what agent charges client)

**URL persistence:** Markup passed via `markup` search param in `homestay-booking-url.ts` → `HomestayCheckoutWizard` `initialMarkupMajor`

### 10.7 Customer Contact (Agent Bookings)

**Hook:** `useGuestContactDetails({ forCustomerEntry: isTravelAgent })`  
**Component:** `GuestContactFields` with `customerEntry` prop

**Behavior for travel agents:**
- Name, email, phone fields are **empty** on load (NOT pre-filled from agent profile)
- Fields are **mandatory** before submit
- Labels say "Customer name", "Customer email", "Customer phone"
- `autoComplete="off"` to prevent browser autofill

**Backend validation:** `assert_client_contact_ready()` in `travel_agent_booking.py`

### 10.8 Customer Email Options

**Component:** `TravelAgentClientEmailOptions` in `TravelAgentBookingExtras.tsx`

Three radio options on **confirm step** (step 3) of both checkout wizards:

| Option | `clientSendConfirmation` | `clientEmailIncludePrice` |
|--------|--------------------------|---------------------------|
| Don't send email to customer | `false` | — |
| Send email **with** price | `true` | `true` |
| Send email **without** price | `true` | `false` |

Agent always receives booking confirmation email regardless.

### 10.9 Agent Dashboard Components

| Component | Purpose |
|-----------|---------|
| `TravelAgentDashboardShell` | Page wrapper with royal-themed hero |
| `TravelAgentStatsGrid` | Metrics: total bookings, pending, confirmed, revenue |
| `TravelAgentRecentBookings` | Last N bookings preview on dashboard |
| `TravelAgentBookingsTable` | Full table with status filter tabs |
| `travel-agent-nav.ts` | Nav items: Overview, Book for client, My bookings |

### 10.10 Agent Booking API

**List agent bookings:** `GET /api/v1/travel-agent/bookings?status=`  
**Admin list:** `GET /api/v1/admin/travel-agent-bookings?status=&limit=`

Returns unified list of experience + homestay bookings tagged `kind: "experience" | "homestay"`.

Filters: `pending`, `confirmed`, `completed`, `cancelled`, `upcoming`, `today`

### 10.11 Key Files Reference

| File | Role |
|------|------|
| `src/lib/travel-agent-pricing.ts` | All pricing math |
| `src/hooks/use-travel-agent-discount.ts` | Fetch & cache discount % |
| `src/hooks/use-checkout-booking.ts` | Experience checkout with agent fields |
| `src/hooks/use-homestay-checkout.ts` | Homestay checkout with agent fields |
| `src/hooks/use-guest-contact-details.ts` | Customer contact state |
| `src/components/travel-agent/TravelAgentBookingExtras.tsx` | Markup + email UI |
| `src/components/homestays/HomestayCheckoutWizard.tsx` | Homestay 3-step wizard |
| `src/components/booking/BookingCheckoutWizard.tsx` | Experience 3-step wizard |
| `src/lib/partner-travel-agent-fns.ts` | Application CRUD + approval |
| `src/lib/api/travel-agent-bookings.ts` | API client |
| `backend/app/services/travel_agent_booking.py` | Server pricing + validation |
| `backend/app/services/travel_agent_bookings.py` | List queries |
| `supabase/migrations/20260901_travel_agent_module.sql` | Schema |

---

## 11. Admin Platform

Admin UI uses **4 modules** switchable via `AdminModuleNav` (`admin-nav.ts`):
1. **Experiences** — hosts, experience moderation, experience bookings
2. **Homestays** — owners, homestay moderation, stay bookings, featured stays
3. **VIP** — memberships, packages, VIP owners, pending bookings
4. **Travel Agent** — applications, agent bookings

### 11.1 Core Admin Routes

| Path | Purpose |
|------|---------|
| `/admin/` | Platform analytics dashboard (`AdminStatsGrid`) |
| `/admin/activity/` | Audit log feed (`AdminActivityFeed`) |
| `/admin/trust/` | Risk/fraud signals (`AdminRiskSignals`) |
| `/admin/bookings/` | All experience bookings |
| `/admin/bookings/$bookingId` | Booking detail |
| `/admin/experiences/` | Published experiences list |
| `/admin/experiences/$experienceId` | Experience admin review/edit |
| `/admin/experiences/requests` | Partner host applications queue |
| `/admin/experiences/pending-bookings` | Stale pending bookings (>1h alerts) |
| `/admin/hosts/` | Manage/create hosts (`CreateHostForm`) |
| `/admin/reviews/` | Reviews hub |
| `/admin/reviews/experiences/` | Experience review moderation |
| `/admin/reviews/homestays/` | Homestay review moderation |

### 11.2 Homestay Admin Routes

| Path | Purpose |
|------|---------|
| `/admin/homestay/` | Homestay module overview |
| `/admin/homestays/` | Approve/publish homestays |
| `/admin/homestays/$homestayId` | Homestay admin detail |
| `/admin/homestay/requests` | Partner homestay applications |
| `/admin/homestay/pending-bookings` | Pending stay bookings |
| `/admin/homestay-owners/` | Manage homestay owners |
| `/admin/homestay-featured` | Homepage featured homestay curation |

### 11.3 User Management

| Path | Purpose |
|------|---------|
| `/admin/profile/users` | Create platform users with roles (`CreatePlatformUserForm`) |
| `/admin/profile/my-team` | Staff team management |
| `/admin/profile/escalation` | Escalation contacts directory |

### 11.4 Admin Capabilities

- Publish/reject experiences, homestays, VIP packages
- Approve partner applications (experience host, homestay owner, travel agent)
- View all bookings across modules
- Hide inappropriate reviews
- Create host/owner/VIP owner accounts directly
- Assign multiple roles per user (`user_roles`)
- Monitor overdue pending bookings (1h admin alerts via cron)
- View platform analytics and audit logs

---

## 12. Editor / CMS

Editors have scoped access to homepage and Mysore Trail content. Admins have full platform access plus all editor tools.

| Path | Permission | Editable Content |
|------|------------|------------------|
| `/admin/homepage-edit` | editor + admin | Hero headings, eyebrow text, journal stories, heritage video title/description/YouTube URL, featured section toggles |
| `/admin/homepage-photos` | editor + admin | Homepage hero photo slideshow images |
| `/admin/profile/homepage-photos` | editor | Same photo management (editor path) |
| `/admin/mysore-trail` | editor + admin | Mysore Trail stops, descriptions, images, ordering |
| `/admin/homestay-featured` | editor + admin | Curate featured homestays on homepage |

**Components:**
- `HomepageEditView`, `EditableHomepageFields`, `HomepageEditorBar`
- `AdminHomepagePhotoEditor`
- `MysoreTrailCatalogEditor`, `MysoreTrailBuilder`

**Data storage:** Supabase tables + JSON content files via server functions (`homepage-content*.ts`, `homepage-photo*.ts`, `mysore-trail-fns.ts`)

**Inline editing:** Editors see edit bars on live homepage when authenticated with editor/admin role.

---

## 13. Booking Workflows (Step-by-Step)

### 13.1 Experience Booking — Guest

```
1. Browse /experiences/ → open /experiences/$slug/
2. Select slot from 7-day window, set guest count
3. Click Book → /experiences/$slug/book (or add to cart first)
4. Checkout wizard:
   Step 1 "Date & slot" — confirm slot + guests (ExperienceBookingPanel)
   Step 2 "Payment"     — Pay at venue (COD); PaymentMethodSelector
   Step 3 "Confirm"     — Guest contact (pre-filled from profile), notes, submit
5. POST /api/v1/bookings → status: pending, payment_method: cod
6. Emails: guest "Booking Request Received" + host "Action Required"
7. Host confirms at /host/bookings/$id → guest "Booking Confirmed"
8. Guest pays cash at venue → host marks paid
9. Host marks complete → guest can review at /bookings/$id/review
```

### 13.2 Experience Booking — Travel Agent

Same wizard with additions:
- Steps 1–3 show agent pricing (discounted) in summary sidebar
- `TravelAgentMarkupControls` in summary on all steps
- Step 3: empty customer contact fields + `TravelAgentClientEmailOptions`
- Backend stores `travel_agent_id`, `agent_markup_minor`, `agent_discount_percent`, customer contact, email prefs

### 13.3 Homestay Booking — Guest

```
1. Browse /homestays/browse/ → open /homestays/$slug/
2. Select check-in/out, guests, room on detail page OR go to /homestays/$slug/book
3. Checkout wizard:
   Step 1 "Dates & guests" — HomestayBookingPanel (dates, room, extra beds, notes)
   Step 2 "Cash payment"    — HomestayCashPaymentSelector (cash at homestay acknowledgment)
   Step 3 "Confirm"         — Guest contact, price breakdown, PayAtHomestayBadge, submit
4. POST /api/v1/homestay-bookings (or Connect RPC create_homestay_booking)
5. Owner confirms → guest pays cash at check-in → owner marks paid → complete
```

### 13.4 Homestay Booking — Travel Agent

Additional on detail page `#book` section:
- Markup controls appear **after notes textarea** in `HomestayBookingPanel`
- Agent sees **agent price only** on detail (no strikethrough public rate)
- Markup persisted in URL (`?markup=`) when navigating to checkout
- Step 3 includes customer email options

### 13.5 Booking Status Lifecycle

| Status | Meaning | Next actions |
|--------|---------|--------------|
| `pending` | Awaiting host/owner decision | Confirm or Reject |
| `confirmed` | Approved by host/owner | Mark paid → Complete |
| `completed` | Experience/stay finished | Guest can review |
| `cancelled` | Rejected or guest-cancelled | — |

| Payment Status | Meaning |
|----------------|---------|
| `pending` | COD not yet collected |
| `paid` | Host/owner marked payment received |

### 13.6 Auto-Complete

- **Experiences:** Confirmed bookings auto-complete after slot end time (Asia/Kolkata TZ)
- **Homestays:** Auto-complete after checkout date
- Triggered during API reads (admin list with throttled sweep)

### 13.7 Cart Checkout Path

```
Add to cart from detail → /dashboard/cart/ → checkout item → /dashboard/cart/checkout/$slug
Uses same BookingCheckoutWizard as direct book path
```

---

## 14. Partner Onboarding Workflows

### 14.1 Experience Host

```
Guest/visitor → /partner/experience-host
  → PartnerExperienceApplicationForm
  → partner_experience_applications (status: pending)
  → Admin notified (partner_experience_application)
  → Admin reviews at /admin/experiences/requests
  → Approve:
      • Creates auth user (provider-invite.server.ts)
      • Creates hosts row linked to auth_user_id
      • Creates draft experience from application data
      • Sets profiles.role = 'host'
      • Sends welcome email
  → Reject: status + admin_notes
  → Host logs in → /host/dashboard → completes/publishes experience
```

**KYC fields:** PAN, passport photo, trade license (+ expiry), GSTIN (if GST > 0)

### 14.2 Homestay Owner

```
Visitor → /partner/homestay-host
  → PartnerHomestayApplicationForm
  → partner_homestay_applications (status: pending)
  → Admin /admin/homestay/requests
  → Approve:
      • Creates auth user + homestay_owners row
      • Creates draft homestay + room from application
      • Sets profiles.role = 'homestay_owner'
  → Owner → /homestay/dashboard
```

### 14.3 Travel Agent

```
Visitor → /partner/travel-agent
  → PartnerTravelAgentApplicationForm (KYC docs + passport photo)
  → partner_travel_agent_applications (status: pending)
  → Admin /admin/travel-agent/requests
  → Approve with discount_percent (e.g. 10):
      • Creates auth user
      • Creates travel_agents row
      • Sets profiles.role = 'travel_agent', travel_agent_id
      • Inserts user_roles row
  → Agent → /travel-agent/dashboard
```

### 14.4 Admin Direct Provisioning

Admins can also create accounts directly (bypass partner flow):
- `/admin/hosts/` — `CreateHostForm`
- `/admin/homestay-owners/` — `CreateHomestayOwnerForm`
- `/admin/vip-owners/` — `CreateVipOwnerForm`
- `/admin/profile/users` — `CreatePlatformUserForm` (any role, multi-role)

---

## 15. Payments & Pricing Model

### 15.1 Payment Methods

| Product | Method | When paid |
|---------|--------|-----------|
| Experiences | COD — Pay at venue | After host confirms, at experience location |
| Homestays | Cash at homestay | At check-in |
| VIP packages | Enquiry-based | Outside standard checkout |

**No online payment gateway** (Stripe, Razorpay, etc.) — intentional product decision.

### 15.2 Price Components

| Component | Experiences | Homestays |
|-----------|-------------|-----------|
| Base price | `price_per_person_minor × guests` | nightly rate × nights × rooms |
| Weekend pricing | — | Higher rate Sat/Sun |
| Date overrides | — | Custom per-night via availability calendar |
| Extra beds | — | Per-night extra bed charge |
| Compare-at offers | Display-only "was" price | Display-only weekday/weekend compare-at |
| GST | `round(subtotal × gst% / 100)` | Same |
| Agent discount | `% off subtotal` (hidden from agent UI) | Same |
| Agent markup | Added to agent cost | Same |

All monetary values stored in **minor units (paise)** in database; displayed as ₹ in UI via `formatMoney()`.

### 15.3 Offer Pricing

Migration `20260716_compare_at_offer_pricing.sql`:
- `compare_at_price_per_person_minor` on experiences
- `compare_at_weekday_price_per_night_minor`, `compare_at_weekend_price_per_night_minor` on homestays
- Guests always pay the **selling price** columns; compare-at is display-only strikethrough

---

## 16. Email & Notifications

### 16.1 Email Provider

**Resend** — `backend/app/services/email.py`  
Branded HTML templates — `backend/app/services/royal_email_templates.py`  
From address: `noreplay@theroyalpassage.com` (Render config)

### 16.2 Transactional Emails

| Event | Function | Recipient |
|-------|----------|-----------|
| Welcome (first profile load) | `maybe_send_welcome_email` | New user |
| Experience booking requested | `send_experience_booking_requested_email` | Guest/customer |
| Experience booking confirmed | `send_experience_booking_confirmed_email` | Guest/customer |
| Homestay booking requested | `send_homestay_booking_requested_email` | Guest/customer |
| Homestay booking confirmed | `send_homestay_booking_confirmed_email` | Guest/customer |
| New experience booking (host action) | `send_host_new_experience_booking_email` | Host |
| Pending booking reminder | `send_host_experience_booking_reminder_email` | Host (15m/2h/24h) |
| Upcoming experience countdown | `send_host_experience_upcoming_email` | Host (10/5/4/3/2/1 days) |
| New homestay booking | `send_homestay_owner_new_booking_email` | Owner |
| Pending stay reminder | `send_host_homestay_booking_reminder_email` | Owner (15m/2h/24h) |
| Homestay owner welcome | `send_homestay_owner_welcome_email` | New owner |
| Agent booking to customer | Conditional on `client_send_confirmation` | Customer (optional price) |

### 16.3 Supabase Auth Email Templates

Located in `supabase/email-templates/`:
- `confirm-signup.html`
- `magic-link.html`
- `reset-password.html`
- `invite-user.html`
- `change-email.html`
- `royal-booking-request.html`

### 16.4 In-App Notifications

**Table:** `notifications`

| Type | Trigger |
|------|---------|
| `booking_created` | New booking placed |
| `booking_confirmed` | Host/owner confirms |
| `booking_cancelled` | Rejection or cancel |
| `booking_reminder` | Upcoming experience reminder |
| `review_request` | Post-completion review prompt |
| `host_approved` | Partner approved |
| `review_received` | New review on listing |
| `experience_submitted` | Experience submitted for review |
| `homestay_submitted` | Homestay submitted for review |
| `account_welcome` | Welcome notification |
| `booking_pending_overdue` | Admin alert: pending >1 hour |
| `partner_experience_application` | New host application |
| `partner_homestay_application` | New homestay application |
| `partner_travel_agent_application` | New agent application |

**UI:** `NotificationBell` in header (admin + host)

### 16.5 Cron Job (Render — every 5 minutes)

Endpoint: `GET/POST /internal/cron/host-booking-reminders`  
Auth: `Bearer {CRON_SECRET}`

Processes:
1. Experience pending booking reminders (initial + 15m/2h/24h)
2. Homestay pending booking reminders (same intervals)
3. Upcoming confirmed experience countdown emails
4. Admin overdue pending alerts (>1 hour)

---

## 17. Backend API Reference (Complete)

**Entry point:** `backend/app/main.py` (Starlette ASGI)  
**Connect RPC:** Mounted at `/` — 97 methods in `RoyalPassageServiceImpl`  
**REST:** `/api/v1/*` — host, admin, travel-agent, bookings subsets  
**Legacy FastAPI routers:** `backend/app/routers/` — **not mounted** in production

### 17.1 REST Endpoints (Active)

#### Health & Cron
| Method | Path | Auth |
|--------|------|------|
| GET | `/healthz` | None |
| GET/POST | `/internal/cron/host-booking-reminders` | Bearer CRON_SECRET |

#### Admin
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/admin/stats` | Platform analytics |
| GET | `/api/v1/admin/homestay-stats` | Homestay module stats |
| GET | `/api/v1/admin/bookings` | Experience bookings list |
| GET | `/api/v1/admin/bookings/{id}` | Booking detail |
| GET | `/api/v1/admin/homestay-bookings` | Homestay bookings list |
| GET | `/api/v1/admin/travel-agent-bookings` | Agent bookings list |
| GET | `/api/v1/admin/activity` | Audit log |
| GET | `/api/v1/admin/risk-signals` | Fraud/risk signals |
| GET | `/api/v1/admin/moderation-reviews` | Review moderation queue |
| POST | `/api/v1/admin/moderation-reviews/experience/{id}/hide` | Hide experience review |
| POST | `/api/v1/admin/moderation-reviews/homestay/{id}/hide` | Hide homestay review |
| GET | `/api/v1/admin/users` | Managed users |
| GET | `/api/v1/admin/experiences` | Pending experiences |
| GET | `/api/v1/admin/experiences/{id}` | Experience detail |
| POST | `/api/v1/admin/experiences/{id}/publish` | Publish |
| POST | `/api/v1/admin/experiences/{id}/reject` | Reject |
| POST | `/api/v1/admin/hosts` | Create host |

#### Guest Bookings
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/v1/bookings` | Guest/Agent | Create experience booking |
| GET | `/api/v1/bookings/me` | Guest | List my bookings |
| GET | `/api/v1/bookings/{id}` | Auth | Booking detail |
| POST | `/api/v1/bookings/{id}/cancel` | Guest | Cancel |
| POST | `/api/v1/homestay-bookings` | Guest/Agent | Create homestay booking |

#### Travel Agent
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/travel-agent/bookings` | Agent's bookings (`?status=`) |

#### Host
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/host/dashboard` | Dashboard stats |
| GET | `/api/v1/host/bookings` | List bookings |
| GET | `/api/v1/host/bookings/{id}` | Detail |
| POST | `/api/v1/host/bookings/{id}/confirm` | Confirm |
| POST | `/api/v1/host/bookings/{id}/reject` | Reject |
| POST | `/api/v1/host/bookings/{id}/mark-paid` | Mark COD paid |
| POST | `/api/v1/host/bookings/{id}/complete` | Complete |
| POST | `/api/v1/host/bookings/{id}/pause` | Pause |
| POST | `/api/v1/host/bookings/{id}/resume` | Resume |
| GET | `/api/v1/host/revenue` | Revenue (`?period=`) |
| GET | `/api/v1/host/reviews` | Reviews |
| GET | `/api/v1/host/categories` | Categories |
| GET/POST | `/api/v1/host/experiences` | List/create |
| GET/PATCH/DELETE | `/api/v1/host/experiences/{id}` | CRUD |
| POST/PATCH/DELETE | `/api/v1/host/experiences/{id}/slots/{slotId}` | Slot CRUD |

#### Homestay Owner
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/owner/homestay/revenue` | Revenue chart |
| GET | `/api/v1/owner/homestay/reviews` | Reviews |

#### Notifications
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/notifications` | List |
| POST | `/api/v1/notifications/read-all` | Mark all read |
| POST | `/api/v1/notifications/{id}/read` | Mark one read |

### 17.2 Connect RPC Methods (97 total)

Grouped by domain — all in `backend/app/rpc/servicer.py`:

| Domain | Methods (count) | Key methods |
|--------|-----------------|-------------|
| Health & Catalog | 7 | `health_check`, `get_catalog`, `get_experience_by_slug`, `list_homestays`, `get_homestay_by_slug`, `list_cities`, `get_city` |
| Guest Bookings | 8 | `create_booking`, `list_my_bookings`, `create_homestay_booking`, `list_guest_homestay_bookings`, cancel variants |
| Guest Profile & Wishlist | 5 | `get_guest_profile`, `update_guest_profile`, `list/add/remove_wishlist` |
| Host | 20 | Dashboard, experiences CRUD, slots CRUD, booking actions, revenue, reviews |
| Homestay Owner | 16 | Properties CRUD, rooms CRUD, availability, booking actions, dashboard |
| VIP | 10 | Owner packages CRUD, membership applications, custom requests, approve/reject |
| Admin | 18 | Stats, users, experience/homestay/VIP moderation, publish/reject, create accounts |
| Reviews | 5 | Public list, create, host reply, admin list/hide |
| Notifications | 3 | List, mark read, mark all read |

### 17.3 Backend Services (42 files)

| Service | Key responsibility |
|---------|-------------------|
| `bookings.py` | Experience COD booking CRUD |
| `homestay_bookings.py` | Homestay booking CRUD |
| `travel_agent_booking.py` | Agent pricing + client validation |
| `travel_agent_bookings.py` | Agent booking list queries |
| `host_bookings.py` | Host booking management + revenue |
| `host_experiences.py` | Experience + slot CRUD |
| `owner_homestays.py` | Property/room/availability CRUD |
| `owner_homestay_bookings.py` | Owner booking ops |
| `marketplace.py` | Public experience catalog |
| `homestays.py` | Public homestay catalog |
| `homestay_pricing.py` | Night rate, weekend, extra bed math |
| `homestay_availability.py` | Date-level price overrides |
| `admin_analytics.py` | Dashboard stats + booking lists |
| `admin_experiences.py` | Experience moderation |
| `admin_homestays.py` | Homestay moderation |
| `admin_vip_packages.py` | VIP package moderation |
| `admin_users.py` | User provisioning |
| `admin_risk.py` | Risk signal detection |
| `transactional_emails.py` | All email orchestration |
| `royal_email_templates.py` | Branded HTML rendering |
| `host_booking_reminders.py` | Cron reminder processor |
| `booking_auto_complete.py` | Auto-complete experience bookings |
| `homestay_auto_complete.py` | Auto-complete stay bookings |
| `guest_booking_freeze.py` | Cancel abuse protection |
| `guest_contact.py` | Contact validation before booking |
| `booking_decision.py` | Host decision contact validation |
| `reviews.py` | Review system |
| `notifications.py` | In-app notifications |
| `wishlist.py` | Guest wishlist |
| `vip_membership.py` | VIP membership + custom requests |
| `user_roles.py` | Multi-role RBAC |
| `profiles.py` | Profile bootstrap on auth |
| `audit.py` | Audit log writes |
| `cities.py` | City catalog |
| `email.py` | Resend transport |
| `revenue_periods.py` | Revenue chart bucketing |
| `supabase_query.py` | Query helpers + schema error detection |
| `ttl_cache.py` | Process-local TTL cache |

---

## 18. Database Schema & Migrations

**46 migration files** in `supabase/migrations/`  
**RLS:** Row Level Security enabled on sensitive tables; partner application tables locked to service role

### 18.1 Core Tables

| Table | Module | Key Columns |
|-------|--------|-------------|
| `profiles` | Auth | id, full_name, role, roles[], phone, photo_url, dob, registration_number, vip_membership_status, travel_agent_id, host_id, homestay_owner_id, vip_owner_id |
| `user_roles` | RBAC | user_id, role (multi-role) |
| `hosts` | Experiences | auth_user_id, business_name, contact |
| `experiences` | Experiences | host_id, slug, title, category, price_per_person_minor, compare_at_price_per_person_minor, gst_percent, status |
| `experience_slots` | Experiences | experience_id, slot_date, start_time, capacity, seats_booked |
| `bookings` | Experiences | guest_id, slot_id, status, payment_status, payment_method, travel_agent_id, agent_markup_minor, agent_discount_percent, guest_name/email/phone, client_send_confirmation, client_email_include_price |
| `homestay_owners` | Homestays | auth_user_id, business_name |
| `homestays` | Homestays | owner_id, slug, property_type, price_per_night_minor, weekend_price_per_night_minor, gst_percent, status |
| `homestay_rooms` | Homestays | homestay_id, capacity, units, extra_beds, rates |
| `homestay_availability` | Homestays | room_id, date, price_override, blocked |
| `homestay_bookings` | Homestays | Same agent columns as bookings + check_in/out, room_id |
| `vip_owners` | VIP | auth_user_id |
| `vip_packages` | VIP | owner_id, title, price, status |
| `vip_bookings` | VIP | package_id, guest_id, status |
| `vip_membership_applications` | VIP | guest_id, status, description |
| `travel_agents` | Travel Agent | auth_user_id, company_name, discount_percent, approval_status, KYC docs |
| `partner_travel_agent_applications` | Travel Agent | Application payload + admin_discount_percent |
| `partner_experience_applications` | Partner | Host application + experience draft |
| `partner_homestay_applications` | Partner | Owner application + property draft |
| `reviews` | Platform | experience_id or homestay_id, rating, comment, host_reply |
| `notifications` | Platform | user_id, type, payload, read |
| `audit_logs` | Platform | actor_id, action, entity_type, entity_id |
| `wishlist` | Guest | user_id, experience_id |
| `cities` | Catalog | slug, name, region, state |
| `escalation_contacts` | Support | name, role, contact info |
| `guest_booking_freezes` | Anti-abuse | user_id, frozen_until |

### 18.2 Key Database Functions

- **Atomic seat reservation** — prevents experience overbooking (migration `20250609`)
- **`set_updated_at`** trigger — auto-updates `updated_at` on row changes
- **Role sync on signup** — ensures guest profile + user_roles consistency

---

## 19. Frontend Architecture

### 19.1 Routing

- **120 route files** in `src/routes/`
- File-based TanStack Router → auto-generated `src/routeTree.gen.ts`
- Root layout: `src/routes/__root.tsx` — AuthProvider, fonts, Toaster, VIP prompt, 404
- Nested layouts: `dashboard.tsx`, `admin.tsx`, `host.*`, `homestay.*`, etc.

### 19.2 State & Data Patterns

| Pattern | Usage |
|---------|--------|
| TanStack Query | Server state caching (catalog, dashboards, bookings) |
| Connect RPC | Primary API — catalog, admin, host, owner, VIP, wishlist |
| REST `apiFetch` | Bookings, travel-agent lists, some admin endpoints |
| Supabase direct | Partner forms, homepage CMS, auth session |
| LocalStorage | Cart items (`cart-storage.ts`), auth cache (`rp_auth_user_v1`) |
| URL search params | Homestay booking dates, agent markup |

### 19.3 Header Navigation (`Header.tsx`)

- Workspace-aware nav via `activeWorkspaceRole()`
- Cart icon (guests only)
- Notification bell (admin + host)
- Account dropdown with multi-role workspace switcher
- Mobile sheet with full nav + workspace links
- Nav badges via `useNavBadges` (pending counts)

### 19.4 Generated Code

- `src/gen/royalpassage/v1/` — Protobuf types from `proto/royalpassage/v1/service.proto`
- Regenerate: `npm run proto:generate`

### 19.5 Key Frontend Libraries

| Path | Purpose |
|------|---------|
| `src/lib/roles.ts` | All role helpers |
| `src/lib/auth-user.tsx` | AuthProvider + useAuthUser |
| `src/lib/api/client.ts` | apiFetch wrapper |
| `src/lib/api/connect.ts` | Connect RPC client |
| `src/lib/partner-*-fns.ts` | Partner application server functions |
| `src/lib/travel-agent-pricing.ts` | Agent pricing math |
| `src/lib/homestay-booking-url.ts` | URL param builders |
| `src/hooks/use-*-checkout.ts` | Checkout state machines |
| `src/hooks/use-travel-agent-discount.ts` | Agent discount fetch |
| `src/data/` | Static fallbacks for experiences/homestays |

---

## 20. Deployment & Environment

### 20.1 Frontend (Vercel)

**Config:** `vercel.json`  
**Build:** `npm run build` → output `dist/client`  
**SSR handler:** `api/server.ts` (catch-all rewrite)

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Browser auth key |
| `VITE_API_BASE_URL` | ✅ | Backend API URL (Render) |
| `VITE_SITE_URL` | Recommended | Auth redirect URLs |

### 20.2 Backend (Render)

**Config:** `render.yaml`  
**Web service:** `the-royal-passage-api` — Python 3.12, uvicorn on `$PORT`  
**Cron:** `host-booking-reminders` — every 5 minutes

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL` | ✅ | DB + JWT validation |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Admin DB access |
| `CORS_ORIGINS` | ✅ | Allowed frontend origins |
| `RESEND_API_KEY` | For email | Transactional mail |
| `RESEND_FROM_EMAIL` | For email | Sender address |
| `SITE_URL` | For email | Link base URL in emails |
| `CRON_SECRET` | For cron | Reminder endpoint auth |

### 20.3 Local Development

```bash
# Frontend (default :5173 or :8080)
npm run dev

# Backend (:8000) — use venv Python
backend\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
# OR: npm run api:dev (requires backend deps installed)

# Database
# Apply migrations in supabase/migrations/ to your Supabase project

# Seed demo data
npm run seed:demo

# Create admin account
npm run setup:admin

# Create editor account
npm run setup:editor

# Regenerate protobuf types
npm run proto:generate

# Test email
npm run email:test

# Run cron locally
npm run cron:host-reminders

# E2E tests
npm run test:e2e
```

---

## 21. Demo Accounts, Seed Data & Scripts

Run: `npm run seed:demo` (requires migrations applied on Supabase)

### 21.1 Demo Logins

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| `guest@royalpassage.demo` | `Demo@12345` | guest | Can book experiences/homestays |
| `host@royalpassage.demo` | `Demo@12345` | host | 3 published + 2 pending experiences |
| `homestay@royalpassage.demo` | `Demo@12345` | homestay_owner | 3 published + 1 pending property |
| `vip@royalpassage.demo` | `Demo@12345` | vip_owner | 2 published + 1 pending VIP package |
| `agent@royalpassage.demo` | `Demo@12345` | travel_agent | **10% discount** in seed |
| `Admin@gmail.com` | `Admin@123` | admin | Create via `npm run setup:admin` |
| `edit@gmail.com` | `Edit@123` | editor | Create via `npm run setup:editor` |

### 21.2 Seed Data Contents (`scripts/seed-demo-data.mjs`)

Creates:
- **Cities:** Mysuru (+ others)
- **Hosts:** 3 active + 1 pending
- **Experiences:** 5 published + 2 pending (pottery, farm, wellness, coffee, palace, nature, cooking)
- **Slots:** 8 slots across experiences (rolling dates)
- **Bookings:** 3 guest experience bookings + 1 agent booking
- **Reviews:** 3 experience reviews
- **Homestay owners:** 2 active
- **Homestays:** 3 published + 1 pending (with rooms)
- **Homestay bookings:** 2 guest + 1 agent stay booking
- **VIP owner + packages:** 2 published + 1 pending
- **Travel agent:** Approved agent with 10% discount
- **Pending agent application:** 1 in queue for admin testing
- Syncs `user_roles` table for all demo accounts

### 21.3 NPM Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build + API bundles |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run setup:admin` | Create admin auth user |
| `npm run setup:editor` | Create editor auth user |
| `npm run seed:demo` | Seed comprehensive demo data |
| `npm run proto:generate` | Regenerate Connect/protobuf types |
| `npm run email:test` | Send test email via Resend |
| `npm run email:preview-all` | Preview all transactional email templates |
| `npm run cron:host-reminders` | Run reminder cron locally |
| `npm run api:dev` | Start backend dev server |
| `npm run test:e2e` | End-to-end test script |

---

## 22. Project Directory Map

```
The-Royal-Passage/
├── src/                          # Frontend source
│   ├── routes/                   # 120 TanStack Router pages
│   ├── components/
│   │   ├── ui/                   # ~50 shadcn/Radix primitives
│   │   ├── booking/              # Checkout wizards, panels, contact fields
│   │   ├── homestays/            # Homestay catalog, checkout, booking panel
│   │   ├── host/                 # Host dashboard, bookings, revenue
│   │   ├── homestay-owner/       # Owner dashboard, properties, calendar
│   │   ├── travel-agent/         # Agent dashboard, markup, bookings table
│   │   ├── admin/                # Admin queues, stats, user creation
│   │   ├── partner/              # Partner application forms
│   │   ├── auth/                 # RoyalAuthExperience, cinematic auth
│   │   ├── site/                 # Header, Footer, cards, hero, showcases
│   │   ├── experience/           # Host experience tools, slot manager
│   │   ├── experiences/          # Public catalog components
│   │   ├── guest/                # Guest dashboard shell
│   │   ├── vip/ + vip-owner/ + vips/  # VIP module UI
│   │   ├── mysore-trail/         # Trail experience + builder
│   │   ├── editor/               # Homepage CMS editor
│   │   ├── cart/ + wishlist/     # Cart and wishlist UI
│   │   ├── reviews/ + pricing/   # Reviews and offer pricing
│   │   ├── notifications/        # Notification bell
│   │   ├── legal/                # Legal document components
│   │   ├── passport/             # Passport photo UX
│   │   └── effects/              # Decorative effects (RippleGrid)
│   ├── hooks/                    # 11 custom hooks
│   ├── lib/                      # ~130 utility/API/role files
│   │   ├── api/                  # REST + Connect client layer
│   │   ├── supabase/             # Browser + admin Supabase clients
│   │   └── legal/                # Legal doc renderer
│   ├── data/                     # Static fallbacks
│   ├── gen/royalpassage/v1/      # Generated protobuf types
│   ├── styles.css                # Design system (~8,300 lines)
│   └── styles/mysore-trail.css   # Trail-specific styles
├── backend/
│   └── app/
│       ├── main.py               # Starlette ASGI entry
│       ├── rpc/                  # Connect RPC servicer + auth
│       ├── services/             # 42 business logic modules
│       ├── models/schemas.py     # ~80 Pydantic models
│       ├── http_*.py             # REST route handlers
│       └── routers/              # Legacy FastAPI (unmounted)
├── proto/royalpassage/v1/        # Protobuf service definition
├── supabase/
│   ├── migrations/               # 46 SQL migrations
│   └── email-templates/          # 6 auth email HTML templates
├── scripts/                      # seed, admin setup, e2e, build helpers
├── api/                          # Vercel serverless (SSR, photo, review)
├── vercel.json                   # Frontend deploy config
├── render.yaml                   # Backend + cron deploy config
└── PROJECT_REPORT.md             # This document
```

---

## Appendix A — Complete Route Index

**120 route files** in `src/routes/`

### Public & Marketing
| Path | File |
|------|------|
| `/` | `index.tsx` |
| `/contact` | `contact.tsx` |
| `/journal` | `journal.tsx` |
| `/cities` | `cities.tsx` |
| `/cities/$slug` | `cities.$slug.tsx` |
| `/mysore-trail` | `mysore-trail.tsx` |

### Auth
| Path | File |
|------|------|
| `/sign-in` | `sign-in.tsx` |
| `/sign-up` | `sign-up.tsx` |
| `/forgot-password` | `forgot-password.tsx` |
| `/reset-password` | `reset-password.tsx` |
| `/auth/callback` | `auth.callback.tsx` |

### Experiences
| Path | File |
|------|------|
| `/experiences/` | `experiences.index.tsx` |
| `/experiences/$slug/` | `experiences.$slug.index.tsx` |
| `/experiences/$slug/book` | `experiences.$slug.book.tsx` |

### Homestays
| Path | File |
|------|------|
| `/homestays/` | `homestays.index.tsx` |
| `/homestays/browse/` | `homestays.browse.index.tsx` |
| `/homestays/$slug/` | `homestays.$slug.index.tsx` |
| `/homestays/$slug/book` | `homestays.$slug.book.tsx` |

### VIP Public
| Path | File |
|------|------|
| `/vips/` | `vips.index.tsx` |
| `/vips/browse/` | `vips.browse.index.tsx` |
| `/vips/$slug/` | `vips.$slug.index.tsx` |

### Guest Dashboard & Account
| Path | File |
|------|------|
| `/dashboard/history` | `dashboard.history.tsx` |
| `/dashboard/cancelled` | `dashboard.cancelled.tsx` |
| `/dashboard/wishlist` | `dashboard.wishlist.tsx` |
| `/dashboard/cart/` | `dashboard.cart.index.tsx` |
| `/dashboard/cart/checkout/$slug` | `dashboard.cart.checkout.$slug.tsx` |
| `/account/profile` | `account.profile.tsx` |
| `/account/vip-apply` | `account.vip-apply.tsx` |
| `/account/escalation` | `account.escalation.tsx` |
| `/bookings/$bookingId/` | `bookings.$bookingId.index.tsx` |
| `/bookings/$bookingId/review` | `bookings.$bookingId.review.tsx` |
| `/stays/$bookingId` | `stays.$bookingId.tsx` |

### VIP Member
| Path | File |
|------|------|
| `/member/vip/` | `member.vip.index.tsx` |
| `/member/vip/packages` | `member.vip.packages.tsx` |
| `/member/vip/custom-request` | `member.vip.custom-request.tsx` |

### Partner Applications
| Path | File |
|------|------|
| `/partner/experience-host` | `partner.experience-host.tsx` |
| `/partner/homestay-host` | `partner.homestay-host.tsx` |
| `/partner/travel-agent` | `partner.travel-agent.tsx` |

### Travel Agent Workspace
| Path | File |
|------|------|
| `/travel-agent/dashboard` | `travel-agent.dashboard.tsx` |
| `/travel-agent/catalog` | `travel-agent.catalog.tsx` |
| `/travel-agent/bookings` | `travel-agent.bookings.tsx` |

### Host Workspace (9 routes)
`/host/dashboard`, `/host/bookings/`, `/host/bookings/$bookingId`, `/host/experiences/`, `/host/experiences/new`, `/host/experiences/$experienceId`, `/host/revenue`, `/host/offers`, `/host/reviews`

### Homestay Owner Workspace (8 routes)
`/homestay/dashboard`, `/homestay/properties/`, `/homestay/properties/new`, `/homestay/properties/$homestayId`, `/homestay/bookings/`, `/homestay/revenue`, `/homestay/offers`, `/homestay/reviews`

### VIP Owner Workspace (7 routes)
`/vip/dashboard`, `/vip/listings/`, `/vip/listings/new`, `/vip/listings/$packageId`, `/vip/bookings/`, `/vip/members/`, `/vip/custom-requests/`

### Admin (30+ routes)
See Section 11 for full admin route list across experiences, homestays, VIP, travel agent, content, and profile modules.

### Legal
| Path | File |
|------|------|
| `/legal/privacy-policy` | `legal.privacy-policy.tsx` |
| `/legal/payment-policy` | `legal.payment-policy.tsx` |
| `/legal/experience-terms` | `legal.experience-terms.tsx` |

---

## Appendix B — Component Inventory

**29 component folders, ~290 component files**

| Folder | Key Components |
|--------|----------------|
| `ui/` | button, dialog, sheet, table, sidebar, form, select, tabs, etc. (~50) |
| `site/` | Header, Footer, HomeHero, ExperienceCard, HomestayCard, MarketplaceCard |
| `auth/` | RoyalAuthExperience, RoyalPalaceGateway, ResetPasswordExperience, GoogleSignInButton |
| `booking/` | BookingCheckoutWizard, CheckoutWizardPrimitives, GuestContactFields, LuxuryCheckoutPanel |
| `homestays/` | HomestayCheckoutWizard, HomestayBookingPanel, HomestayCard, HomestayDateCalendar |
| `host/` | HostDashboardShell, HostBookingTable, HostStatsGrid, RevenueChart |
| `homestay-owner/` | OwnerHomestayForm, OwnerAvailabilityManager, OwnerHomestayBookingTable |
| `travel-agent/` | TravelAgentDashboardShell, TravelAgentBookingExtras, TravelAgentBookingsTable |
| `admin/` | AdminModuleNav, AdminPartner*ApplicationsQueue, AdminStatsGrid, Create*Form |
| `partner/` | PartnerExperienceApplicationForm, PartnerHomestayApplicationForm, PartnerTravelAgentApplicationForm |
| `experience/` | CreateExperienceWizard, SlotManager, HostExperienceForm |
| `mysore-trail/` | MysoreTrailExperience, TripConfigurator, CircularGallery |
| `editor/` | HomepageEditView, EditableHomepageFields |
| `vip/` + `vips/` + `vip-owner/` | VIP membership, browse, owner package management |

---

## Appendix C — Hooks & Lib Reference

### Hooks (`src/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| `useCheckoutBooking` | `use-checkout-booking.ts` | Experience checkout 3-step state machine |
| `useHomestayCheckout` | `use-homestay-checkout.ts` | Homestay checkout 3-step state machine |
| `useGuestContactDetails` | `use-guest-contact-details.ts` | Contact form; `forCustomerEntry` for agents |
| `useTravelAgentDiscount` | `use-travel-agent-discount.ts` | Cached agent discount % |
| `useExperienceCart` | `use-experience-cart.ts` | LocalStorage cart |
| `useNavBadges` | `use-nav-badges.ts` | Header pending-count badges |
| `useAdminModuleAlerts` | `use-admin-module-alerts.ts` | Admin notification counts |
| `useTodayIsoDate` | `use-today-iso-date.ts` | Rolling date for booking window |
| `useFaceDetection` | `useFaceDetection.ts` | Passport photo validation |
| `useIsMobile` | `use-mobile.tsx` | 768px breakpoint |
| `usePrefersReducedMotion` | `use-prefers-reduced-motion.ts` | Accessibility |

### Key Lib Files (`src/lib/`)

| File | Purpose |
|------|---------|
| `roles.ts` | All role enums, helpers, workspace links |
| `auth-user.tsx` | AuthProvider context |
| `travel-agent-pricing.ts` | Agent pricing math |
| `partner-travel-agent-fns.ts` | Agent application + approval |
| `partner-experience-fns.ts` | Host application + approval |
| `partner-homestay-fns.ts` | Homestay application + approval |
| `homestay-booking-url.ts` | URL params incl. markup |
| `cart-storage.ts` | LocalStorage cart persistence |
| `money.ts` | formatMoney, minor/major conversion |
| `booking-window.ts` | 7-day slot window constant |
| `provider-invite.server.ts` | Creates auth users on partner approval |
| `api/client.ts` | apiFetch REST wrapper |
| `api/connect.ts` | Connect RPC client |
| `api/bookings.ts` | Booking REST calls |
| `api/travel-agent-bookings.ts` | Agent booking list API |

---

## Appendix D — Migration Timeline

| Migration | Date prefix | Feature |
|-----------|-------------|---------|
| `20250608_profiles_roles` | Jun 2025 | Profiles + roles (guest, host, admin) |
| `20250608_guest_only_signup` | Jun 2025 | Guest-only self-registration |
| `20250609_booking_cod_model` | Jun 2025 | COD booking model + atomic seats |
| `20250610_wishlist` | Jun 2025 | Guest wishlist |
| `20250611_host_experience_fields` | Jun 2025 | Host experience management |
| `20250612_booking_pause` | Jun 2025 | Pause/resume bookings |
| `20250612_sprint5_reviews_notifications` | Jun 2025 | Reviews + notifications + audit |
| `20250613_sprint6_cities` | Jun 2025 | Multi-city support |
| `20250614_hosts_auth_user_id` | Jun 2025 | Host auth linking |
| `20250615_profile_photo_dob` | Jun 2025 | Profile photo + DOB |
| `20250615_profile_update_policy` | Jun 2025 | Profile update RLS |
| `20260612_vip_membership` | Jun 2026 | VIP membership applications |
| `20260625_homestay_weekend_pricing` | Jun 2026 | Weekend nightly rates |
| `20260627_profile_registration_number` | Jun 2026 | Royal passport registration # |
| `20260630_homestay_module` | Jun 2026 | Full homestay owner module |
| `20260701_host_booking_reminder_emails` | Jul 2026 | Host reminder email tracking |
| `20260708_*` | Jul 2026 | Property types, extra beds, day overrides |
| `20260710_user_roles` | Jul 2026 | Multi-role support |
| `20260712_*` | Jul 2026 | Query performance indexes |
| `20260714_*` | Jul 2026 | Role sync fixes, staff role repair |
| `20260715_*` | Jul 2026 | Partner applications, KYC, booking decision contact, cancel freeze, upcoming reminders |
| `20260716_compare_at_offer_pricing` | Jul 2026 | Compare-at offer pricing |
| `20260716_escalation_contacts` | Jul 2026 | Support escalation directory |
| `20260824_*` | Aug 2026 | Tours category, partner GST fields |
| `20260826_*` | Aug 2026 | Experience + homestay GST fields |
| `20260901_travel_agent_module` | Sep 2026 | **Travel agent module** |
| `20260902_homestay_booking_guest_contact` | Sep 2026 | Customer contact on stay bookings |
| `20260903_user_roles_travel_agent` | Sep 2026 | travel_agent in user_roles enum |

---

## Appendix E — Feature Status & Known Limits

### Working Features ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Experience catalog & booking | ✅ | COD, 7-day slot window |
| Homestay catalog & booking | ✅ | Cash at check-in, weekend/extra bed pricing |
| Host dashboard & slot management | ✅ | Full CRUD + booking actions |
| Homestay owner dashboard | ✅ | Properties, rooms, calendar, bookings |
| VIP membership & packages | ✅ | Apply, approve, browse, custom requests |
| Travel agent module | ✅ | Pricing, markup, customer contact, email options |
| Partner applications (all 3 types) | ✅ | KYC uploads, admin approval queues |
| Admin moderation (all modules) | ✅ | 4 admin modules with full queues |
| Reviews (experience + homestay) | ✅ | Submit, host reply, admin hide |
| Wishlist / cart | ✅ | LocalStorage cart + Supabase wishlist |
| Email notifications | ✅ | Resend + cron reminders |
| Homepage CMS | ✅ | Hero, journal, video, photos |
| Mysore Trail | ✅ | Public trail + admin editor |
| Multi-role accounts | ✅ | Workspace switching in header |
| Google OAuth | ✅ | Sign-in/sign-up |
| Guest booking abuse protection | ✅ | Cancel freeze after 3/day |
| Auto-complete bookings | ✅ | After slot end / checkout date |
| Compare-at offer pricing | ✅ | Display-only promotional pricing |
| GST on checkout | ✅ | Per listing configurable % |

### Not Implemented (By Design) ❌

| Feature | Status | Reason |
|---------|--------|--------|
| Online card/UPI payments | ❌ | COD/cash-only product model |
| Travel agent discount % in agent UI | ❌ | Admin-only; agents see resulting prices |
| Agent markup on experience detail page | ❌ | Markup only in checkout wizard + homestay detail |
| Real-time Supabase subscriptions | ❌ | Polling/query refresh used instead |
| Mobile native app | ❌ | Responsive web only |

### Known Technical Notes

- Legacy FastAPI routers exist but are **not mounted** — production uses Starlette REST + Connect RPC
- Some pre-existing TypeScript errors in unrelated files may exist in repo
- `supabase/.temp/` is intentionally untracked
- Demo seed requires migration `20260903_user_roles_travel_agent.sql` for agent role sync
- Backend local dev should use `backend/.venv` Python, not system Python

---

*This document reflects the full codebase as of August 31, 2026. For live behavior, verify against running migrations and environment configuration. Travel agent features are on commit `2cc4ce0` on branch `main`.*
