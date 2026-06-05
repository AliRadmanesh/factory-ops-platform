## Why

Specialty industrial manufacturers (inflatable packers, downhole tools, geotechnical equipment) lack purpose-built digital tooling for factory floor operations — operators track jobs on paper or in generic tools that don't fit glove-friendly tablet workflows. This project delivers a web-first platform to replace that gap, demonstrating real-time production visibility and ISO 9001-traceable task compliance in a single deployable application.

## What Changes

This is a greenfield build — no existing codebase to modify.

- New Next.js 16 application with two route groups: `app/(operator)` (touch PWA) and `app/(dashboard)` (desktop web)
- Supabase project with 6 tables: `sections`, `operators`, `work_orders`, `job_logs`, `tasks`, `task_completions`
- Operator authentication via name selection + 4-digit PIN (no keyboard required, stored in `operators` table)
- Job logging: operators start/end work orders, track parts completed per session
- Section task checklists: daily + per-job tasks with completion timestamps
- Manager dashboard: real-time production overview via Supabase Realtime websockets
- PWA manifest + serwist service worker enabling fullscreen install on iOS Safari and Android Chrome
- Vercel deployment with UptimeRobot health monitor on Supabase free tier

**DEPLOY-FIRST GATE**: Local dev skeleton + Vercel deploy + Supabase live connection must be verified before any feature work begins.

## Capabilities

### New Capabilities

- `infra-and-deploy`: Bare-minimum Next.js app skeleton wired to Supabase, deployed to Vercel and verified end-to-end before feature work starts. Includes env vars, UptimeRobot monitor, and PWA manifest scaffold.
- `operator-auth`: Operator selection (name cards) + 4-digit PIN pad authentication. Session persistence via localStorage. No keyboard input — custom numpad UI only.
- `job-logging`: Work order list, start job (timestamp), active job parts counter (+/−), end job with confirmation. Active job banner across operator screens.
- `task-checklists`: Per-section task list (daily + per-job frequency). Tap to complete with timestamp. Daily tasks auto-reset at midnight.
- `manager-dashboard`: Real-time production overview: stats bar (active jobs, operators, parts today), active jobs table, per-section task completion progress bars. Supabase Realtime subscription — updates within 3 seconds of operator action.
- `pwa-support`: PWA manifest (`display: standalone`), serwist service worker, iOS/Android meta tags. Enables fullscreen home-screen install on both platforms.
- `seed-data`: Realistic seed data — sections (Rubber Lab, Vulcanization, Assembly, Testing & QC, Shipping), 8–10 operators, 8–10 industrial work orders, 3–5 tasks per section.

### Modified Capabilities

_(none — greenfield project)_

## Non-goals (v1)

- Offline sync or background sync — connection required for all operations
- Native iOS/Android distribution (App Store / Google Play)
- Push notifications
- Admin UI for managing operators, sections, tasks
- Inventory, CSV/PDF export, barcode scanning, dark mode
- Manager login gate (P2 — dashboard publicly accessible for demo)

## Impact

- **New dependencies**: `next@^16.2.2`, `typescript@^5`, `tailwindcss@^4`, `@supabase/supabase-js@^2`, `serwist`, `@serwist/next`
- **Hosting**: Vercel (free tier), Supabase (free tier)
- **Data**: All data lives in Supabase PostgreSQL — no local persistence except operator session token in localStorage
- **Realtime**: Supabase websocket subscription active only on manager dashboard to minimize connection overhead
