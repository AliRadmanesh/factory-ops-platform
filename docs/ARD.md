# Architecture Requirements Document
## [APP_NAME] — Manufacturing Operations Platform

**Version:** 2.0  
**Date:** 2026-05-16  
**Status:** Draft

---

## 1. Context

Specialty manufacturing companies — particularly those producing custom-engineered industrial components such as inflatable sealing devices, downhole tools, and geotechnical equipment — rely on accurate, real-time tracking of operator activity, production output, and section-level task compliance. These environments typically involve:

- Mixed device fleets (iOS tablets, Android tablets, phones) on the factory floor
- ISO 9001 requirements for documented, traceable workflows
- Managers who need a live production view from desktop, tablet, or phone
- High job variability due to custom-order workflows

This document describes the architecture for a portfolio project demonstrating a modern, web-first operations management platform purpose-built for this class of manufacturer. The platform covers operator job logging, per-section task checklists, and a real-time manager dashboard — all from a single Next.js application delivered via browser with a PWA wrapper for tablet home-screen installation.

---

## 2. Goals

- Single web app serving both operator (touch-optimized) and manager (desktop-first) interfaces
- Operator UI installable as PWA on iOS and Android tablets/phones — fullscreen, no browser chrome
- Manager dashboard optimized for desktop, responsive to tablet and mobile
- Real-time production updates from operator actions to manager view
- Clean, well-documented public codebase suitable for portfolio review

## 3. Non-Goals (v1 scope)

- Native iOS/Android app distribution (App Store / Google Play)
- True offline-first sync with conflict resolution
- Inventory management module
- Multi-tenant support
- Push notifications

---

## 4. Why Web Instead of Native

The primary performance argument for native (React Native) is rendering pipeline — native components vs WebView. For this application (forms, lists, checklists), that distinction is marginal. The real performance problem with existing low-code platforms on tablets is **platform runtime overhead** — loading an entire third-party application framework before your own code runs. A lean Next.js app ships only what it needs, making it noticeably faster on the same device without native code.

Web-only also eliminates: Apple Developer account ($99/year), EAS Build pipeline, TestFlight setup, APK sideloading, and platform-specific debugging — all significant friction on a 3-week solo build.

For features that would genuinely require native (offline sync, push notifications, camera/barcode scanning), native can be revisited in v2 with a real client requirement and budget to justify it.

---

## 5. System Architecture

```
┌──────────────────────────────────────────────────┐
│              Single Next.js 16 App               │
│                                                  │
│  ┌─────────────────────┐  ┌────────────────────┐ │
│  │  app/(operator)     │  │  app/(dashboard)   │ │
│  │                     │  │                    │ │
│  │  Touch-optimized    │  │  Desktop-first     │ │
│  │  PWA on tablets     │  │  Responsive to     │ │
│  │  iOS + Android      │  │  tablet + mobile   │ │
│  └──────────┬──────────┘  └─────────┬──────────┘ │
│             │                       │            │
│             └───────────┬───────────┘            │
│                         │                        │
│              ┌──────────▼──────────┐             │
│              │   lib/supabase/     │             │
│              │   lib/types/        │             │
│              └──────────┬──────────┘             │
└─────────────────────────│────────────────────────┘
                          │
             ┌────────────▼────────────┐
             │        SUPABASE         │
             │                         │
             │  PostgreSQL (data)       │
             │  Auth (managers)         │
             │  Realtime (websockets)   │
             │  PostgREST (auto API)    │
             └─────────────────────────┘
```

---

## 6. Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | ^16.2.2 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Backend / DB | Supabase | platform v1.26.x |
| Supabase JS client | @supabase/supabase-js | ^2 |
| PWA | serwist + @serwist/next | latest |
| Hosting | Vercel | — |

---

## 7. Tech Stack Decisions

### 7.1 Single Next.js App (Two Route Groups) over Separate Apps

**Decision:** One Next.js app with `app/(operator)` and `app/(dashboard)` route groups.

**Rationale:**
- Shared `lib/supabase/` and `lib/types/` with zero duplication — no monorepo tooling needed
- One deployment, one URL base, one Vercel project
- Route groups allow completely separate layouts: operator gets touch-optimized fullscreen layout, dashboard gets desktop-first sidebar layout
- Single `package.json`, single `npm install`, no Turborepo complexity

**Rejected alternative:**
- *Turborepo monorepo with separate apps*: Justified when two separate frameworks need shared code. With a single framework, unnecessary overhead.

### 7.2 PWA via Serwist over Native Distribution

**Decision:** `serwist` + `@serwist/next` for service worker and PWA manifest. Installed on devices via "Add to Home Screen."

**Why serwist:**
- Actively maintained modern rewrite of Workbox-based solutions
- `@serwist/next` has first-class Next.js App Router support
- Replaces abandoned `next-pwa` and outdated `@ducanh2912/next-pwa`
- Full TypeScript support, clean API

**Why PWA over native:**
- Fullscreen PWA on iOS Safari and Android Chrome is visually indistinguishable from native for this UI category
- Zero installation friction — share a URL, tap "Add to Home Screen"
- No Apple Developer account, no TestFlight, no APK sideloading
- Instant updates: deploy to Vercel → all devices get it on next open

**What PWA cannot do (irrelevant for v1):**
- Background sync (offline not in scope)
- Push notifications (not in scope)
- Camera access (not in scope)

### 7.3 Supabase for Backend

**Version:** `@supabase/supabase-js`: ^2 (platform v1.26.x)

**Rationale:**
- PostgreSQL — relational model fits manufacturing data (operators → sections → work orders → job logs)
- Auth built in (email/password for managers, custom PIN flow for operators)
- Realtime via websockets — manager dashboard live updates without polling
- PostgREST auto-generates typed REST API from schema — no custom API server needed
- Row Level Security (RLS) handles authorization at DB level
- Free tier sufficient; UptimeRobot pings `/health` every 5 minutes to prevent 7-day inactivity pause

**Why not Neon:** Neon bills active compute hours. UptimeRobot pinging prevents scale-to-zero, exhausting the 100hr/month free tier in ~4 days. Supabase has no equivalent compute-hour limit.

**Rejected alternatives:**
- *Firebase*: NoSQL doesn't suit relational manufacturing data
- *Custom API server*: Unnecessary overhead for this scope

---

## 8. Project Structure

```
[APP_NAME]/
├── app/
│   ├── (operator)/
│   │   ├── layout.tsx              # Fullscreen touch layout, PWA shell
│   │   ├── page.tsx                # Operator selection (name cards)
│   │   ├── auth/page.tsx           # PIN entry
│   │   ├── home/page.tsx           # Operator home + active job banner
│   │   ├── job-log/
│   │   │   ├── page.tsx            # Work order list → start job
│   │   │   └── [id]/page.tsx       # Active job: parts count + end job
│   │   └── tasks/page.tsx          # Section task checklist
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Desktop sidebar layout
│   │   ├── page.tsx                # Production overview (stats + live jobs)
│   │   ├── jobs/page.tsx           # Active jobs list
│   │   ├── tasks/page.tsx          # Per-section task completion
│   │   └── login/page.tsx          # Manager auth (P2)
│   │
│   ├── layout.tsx                  # Root layout (fonts, PWA meta tags)
│   └── globals.css
│
├── components/
│   ├── operator/                   # Touch-optimized (min 44px targets)
│   │   ├── OperatorCard.tsx
│   │   ├── JobCard.tsx
│   │   ├── TaskRow.tsx
│   │   └── PartsCounter.tsx
│   └── dashboard/                  # Desktop-first
│       ├── StatsBar.tsx
│       ├── JobsTable.tsx
│       └── SectionProgress.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   ├── server.ts               # Server Supabase client (RSC / Server Actions)
│   │   └── queries/
│   │       ├── operators.ts
│   │       ├── jobs.ts
│   │       └── tasks.ts
│   └── types/
│       └── index.ts                # All shared TypeScript interfaces
│
├── public/
│   ├── manifest.json               # PWA manifest (display: standalone)
│   └── icons/                      # 192x192, 512x512, apple-touch-icon
│
├── sw.ts                           # Serwist service worker entry
├── next.config.ts                  # @serwist/next plugin wired here
├── tailwind.config.ts
└── package.json
```

---

## 9. Data Model

```sql
-- Factory sections / departments
CREATE TABLE sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,           -- e.g. "Rubber Lab", "Vulcanization", "Assembly", "Testing & QC", "Shipping"
  color       text NOT NULL,           -- hex color for UI badges
  created_at  timestamptz DEFAULT now()
);

-- Factory floor operators
CREATE TABLE operators (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  section_id  uuid REFERENCES sections(id),
  pin         text NOT NULL,           -- 4-digit PIN, hashed
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- Production work orders
CREATE TABLE work_orders (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number   text NOT NULL UNIQUE,   -- e.g. "WO-2026-0042"
  product_name text NOT NULL,          -- e.g. "HP Straddle Packer"
  product_type text,                   -- e.g. "Mining", "Oil & Gas", "Geotechnical"
  customer     text,
  quantity     int NOT NULL DEFAULT 1,
  status       text NOT NULL DEFAULT 'open',  -- open | in_progress | complete
  created_at   timestamptz DEFAULT now()
);

-- Operator time + output on a work order
CREATE TABLE job_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id      uuid REFERENCES operators(id),
  work_order_id    uuid REFERENCES work_orders(id),
  section_id       uuid REFERENCES sections(id),
  start_time       timestamptz NOT NULL DEFAULT now(),
  end_time         timestamptz,
  parts_completed  int DEFAULT 0,
  notes            text,
  status           text NOT NULL DEFAULT 'active',  -- active | completed
  created_at       timestamptz DEFAULT now()
);

-- Reusable task definitions per section
CREATE TABLE tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  uuid REFERENCES sections(id),
  title       text NOT NULL,
  description text,
  frequency   text NOT NULL DEFAULT 'daily',  -- daily | per_job
  order_index int NOT NULL DEFAULT 0,
  is_active   boolean DEFAULT true
);

-- Task completion records
CREATE TABLE task_completions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      uuid REFERENCES tasks(id),
  operator_id  uuid REFERENCES operators(id),
  job_log_id   uuid REFERENCES job_logs(id),  -- nullable for daily tasks
  completed_at timestamptz DEFAULT now(),
  notes        text
);
```

### Seed Data

- Sections: Rubber Lab, Vulcanization, Assembly, Testing & QC, Shipping
- Work Orders: 8–10 representative jobs with product names typical of inflatable packer manufacturing
- Operators: 8–10 names spread across sections
- Tasks: 3–5 per section (mix of daily and per-job)

---

## 10. Auth Design

| Role | Method | Why |
|---|---|---|
| Operator (tablet/phone) | Select name → 4-digit PIN | No keyboard needed. Fast on shared touch devices. Stored in `operators` table, not Supabase Auth. |
| Manager (web) | Email + password via Supabase Auth | Standard secure login. Protected via Next.js middleware on `/(dashboard)` routes. |

- Operator session stored in `localStorage` / cookie (persists across browser close)
- Manager session via Supabase Auth cookie (Next.js middleware guards dashboard routes)

---

## 11. Realtime Strategy

Supabase Realtime subscription on `job_logs` table, active on manager dashboard only.

```
Operator submits job update (browser → Supabase via supabase-js)
  → Supabase broadcasts postgres_changes event
    → Manager dashboard receives via websocket
      → React state update → UI reflects change, no page refresh
```

No realtime on operator side — operators don't need to see each other's activity.

---

## 12. PWA Setup

**`public/manifest.json`:**
```json
{
  "name": "[APP_NAME]",
  "short_name": "[APP_NAME]",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Root `layout.tsx` meta tags:**
```html
<link rel="manifest" href="/manifest.json" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
```

**`sw.ts` (serwist service worker):**
```ts
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()
```

**`next.config.ts`:**
```ts
import withSerwist from '@serwist/next'

const withPWA = withSerwist({
  swSrc: 'sw.ts',
  swDest: 'public/sw.js',
})

export default withPWA({
  // next config here
})
```

---

## 13. Offline Strategy

Not implemented in v1. Connection status banner shown when offline. All operations require connectivity. UptimeRobot keeps Supabase alive.

---

## 14. Deployment

| Target | Platform | Notes |
|---|---|---|
| Web app (both UIs) | Vercel free tier | Single `vercel deploy`. Preview deployments on every push. |
| Database | Supabase free tier | UptimeRobot HTTP monitor on `/health`, 5-min interval. No compute-hour drain unlike Neon. |
| Operator install | PWA via browser | Share URL → "Add to Home Screen" on iOS Safari or Android Chrome. |

---

## 15. Key Architectural Decisions Log

| # | Decision | Reason | Trade-off |
|---|---|---|---|
| 1 | Web-only over React Native | Eliminates native build pipeline, Apple account, platform debugging; lean web faster than low-code platforms | No native offline sync or push notifications; acceptable for v1 |
| 2 | Single Next.js app over monorepo | One framework = shared lib/ directly, one deployment, no Turborepo needed | Operator and dashboard layouts coexist in one app; route groups handle cleanly |
| 3 | PWA (serwist) over native distribution | Zero install friction, instant updates, no app store accounts | iOS PWA limits (no background sync, no push); none affect v1 scope |
| 4 | Supabase over custom backend | Auth + realtime + DB + REST in one, zero server ops | Vendor dependency; Postgres portable if migration needed |
| 5 | Operator PIN over full auth | Fast on shared tablets, no per-user email setup | Less secure; acceptable for internal factory tooling |
| 6 | Supabase over Neon for demo | Supabase 7-day pause preventable with UptimeRobot at zero cost; Neon compute-hour billing makes constant pinging unsustainable on free tier | — |
