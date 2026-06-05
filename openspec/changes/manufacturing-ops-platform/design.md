## Context

Greenfield Next.js 16 application for specialty industrial manufacturers. Factory floor operators log production jobs and complete task checklists from iOS/Android tablets (installed as PWA). Managers monitor live production from a desktop browser dashboard. Single Vercel deployment, single Supabase project.

**Deploy-First Constraint**: The full deploy pipeline (local dev → Vercel → Supabase) MUST be verified before any feature code is written. This is a hard gate, not a suggestion.

## Goals / Non-Goals

**Goals:**
- Prove full stack works end-to-end locally and on Vercel before feature work
- Operator UX: zero friction, touch-only (no keyboard), PWA fullscreen on iOS + Android
- Manager UX: real-time production view with < 3s lag from operator action
- All P0 features complete and manually tested
- Clean codebase suitable for portfolio review

**Non-Goals:**
- Native distribution (App Store, Google Play)
- Offline sync, background sync, push notifications
- Multi-tenant, inventory management, barcode scanning
- Manager login gate (P2 only — skip unless Week 3 has spare time)

## Decisions

### 1. Single Next.js App with Route Groups over Monorepo

Two route groups (`app/(operator)` and `app/(dashboard)`) share `lib/supabase/` and `lib/types/` directly — no Turborepo, no package boundaries. One `package.json`, one `vercel deploy`.

**Why not monorepo**: Justified only when separate frameworks need shared code. Single framework makes it overhead.

### 2. Deploy-First Gate Before Any Feature Work

Sequence:
1. Init Next.js 16 project locally → confirm `npm run dev` works
2. Configure Tailwind 4, verify styles render
3. Create Supabase project → run schema migrations → insert seed data
4. Set up `.env.local` with Supabase URL + anon key
5. Deploy to Vercel → set env vars → confirm Vercel build passes
6. Set up UptimeRobot on Supabase `/health` (5-min interval)
7. **VERIFY**: Hit `/` on Vercel URL → see Next.js app → confirm Supabase query succeeds

Only after step 7 passes: begin feature work.

**Why**: Supabase RLS, env var injection, serwist service worker — all have Vercel-specific quirks that surface late. Finding them after 2 weeks of feature work is painful. Finding them on Day 1 is trivial.

### 3. Operator Auth: PIN in operators table, not Supabase Auth

Operators use name selection + 4-digit PIN. PIN stored hashed (bcrypt) in `operators` table. Session stored in `localStorage`. No Supabase Auth session for operators.

**Why**: No keyboard needed. Shared tablet workflows. Supabase Auth requires email/password — wrong UX for factory floor.

**Trade-off**: Less secure than JWT sessions. Acceptable for internal factory tooling.

### 4. Supabase Realtime on job_logs only (dashboard-side)

Manager dashboard subscribes to `postgres_changes` on `job_logs` table. Operator UI does NOT subscribe to any realtime channels.

**Why**: Operators don't need to see each other's activity. Minimizing realtime connections on operator devices reduces battery and connection overhead on shared tablets.

### 5. PWA via serwist over next-pwa / @ducanh2912/next-pwa

`serwist` + `@serwist/next` — actively maintained, App Router native, TypeScript first.

**Why not next-pwa**: Abandoned. **Why not @ducanh2912/next-pwa**: Fork with limited App Router support. serwist is the maintained path.

### 6. Tailwind 4 (not 3)

PRD specifies Tailwind 4. Configuration is via CSS `@import "tailwindcss"` in `globals.css`, not `tailwind.config.js`. No `content` array needed — Tailwind 4 auto-detects source files.

**Why mention this**: Tailwind 4 config is materially different from v3. Mixing them causes silent failures.

### 7. Supabase over Neon for Free Tier

Supabase: 7-day pause preventable with UptimeRobot HTTP ping (no compute-hour cost). Neon: compute-hour billing makes constant pinging exhaust 100hr/month free tier in ~4 days.

## Risks / Trade-offs

- **Serwist + Next.js 16 compatibility** → Mitigation: Use `@serwist/next` exact version from official docs, test service worker registration on first deploy.
- **iOS PWA quirks** (Safari doesn't support `beforeinstallprompt`) → Mitigation: Use `apple-mobile-web-app-capable` meta tag, test on real device on Day 13.
- **Tailwind 4 breaking changes** (no `tailwind.config.js`, new `@theme` syntax) → Mitigation: Follow Tailwind 4 docs exactly; don't port v3 config patterns.
- **Supabase RLS blocking queries** → Mitigation: Disable RLS in development, enable with permissive policies for demo, document in README.
- **Realtime subscription not firing on Vercel** → Mitigation: Confirm Supabase Realtime is enabled on the project; test on deployed URL not just localhost.
- **PIN hashing strategy** → bcrypt via `bcryptjs` (browser-compatible). Do NOT use Node-only `bcrypt` package — it breaks on Vercel Edge.

## Migration Plan

Greenfield — no migration needed. Deployment sequence:

1. `npx create-next-app@latest` → push to GitHub
2. Import GitHub repo to Vercel → set env vars → verify build
3. Create Supabase project → run SQL migrations in Supabase SQL editor → verify tables
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env vars
5. Redeploy → confirm Supabase queries work in production
6. Configure UptimeRobot on `https://<supabase-project>.supabase.co/health`
7. Begin feature implementation

Rollback: Not applicable for greenfield. Each feature can be reverted via git revert.

## Open Questions

- App name to replace `[APP_NAME]` in manifest.json and layout metadata — use "IPI Packers" or a custom brand name?
- PIN hashing: use `bcryptjs` client-side or hash server-side via Server Action? (Recommendation: Server Action to avoid exposing hash logic in client bundle)
- Supabase RLS for demo: leave disabled or add permissive read policy? (Recommendation: add `SELECT` policy for `anon` role on all tables for public dashboard demo)
