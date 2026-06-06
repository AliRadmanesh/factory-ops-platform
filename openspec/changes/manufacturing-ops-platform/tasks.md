## 1. Infra & Deploy Foundation — GATE (no feature work until this group is verified complete)

- [x] 1.1 Init Next.js 16 project with TypeScript 5 and Tailwind 4 (`npx create-next-app@latest`) — verify `npm run dev` starts clean at localhost:3000 and a Tailwind utility class renders correctly
- [x] 1.2 Create Supabase project — run all 6 SQL table migrations (sections, operators, work_orders, job_logs, tasks, task_completions) in Supabase SQL editor — verify all tables visible in table editor
- [x] 1.3 Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — add `lib/supabase/client.ts` (browser client) — verify a `SELECT * FROM sections` query returns data locally
- [x] 1.4 Install `serwist` + `@serwist/next` — create `sw.ts` entry file — configure `next.config.ts` with `withSerwist` — verify `npm run build` completes and `public/sw.js` is generated
- [x] 1.5 Create `public/manifest.json` (`display: standalone`, `start_url: /`, `theme_color: #0f172a`) — add placeholder icon files at `public/icons/192.png`, `512.png`, `apple-touch-icon.png` — add manifest link and iOS meta tags to root `app/layout.tsx`
- [ ] 1.6 Push project to GitHub — import to Vercel — set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel environment variables — trigger deploy — verify Vercel build passes
- [ ] 1.7 Set up UptimeRobot HTTP monitor on `https://<project>.supabase.co/health` with 5-minute interval — verify monitor shows "Up"
- [ ] 1.8 **END-TO-END VERIFY GATE**: Open Vercel production URL in browser — confirm page loads (HTTP 200) — confirm a Supabase query (e.g., sections list) returns data in production — only proceed to Group 2 after this passes

## 2. Data Layer — Seed & Types

- [ ] 2.1 Insert seed data — sections: 5 rows (Rubber Lab, Vulcanization, Assembly, Testing & QC, Shipping) each with a unique hex color — verify via Supabase table editor
- [ ] 2.2 Insert seed data — operators: 8–10 rows with realistic names, one per section (distribute evenly), `is_active = true`, bcrypt-hashed 4-digit PINs — record plaintext PINs in a local scratchpad for testing — verify hashes start with `$2b$`
- [ ] 2.3 Insert seed data — work_orders: 8–10 rows with industrial product names (HP Straddle Packer, Single Element Packer, Geotechnical Test Packer, Casing Shoe Packer, etc.), job numbers `WO-2026-XXXX`, product types (Oil & Gas, Mining, Geotechnical) — at least 5 with `status = 'open'`
- [ ] 2.4 Insert seed data — tasks: 3–5 per section with realistic manufacturing titles, mix of `frequency = 'daily'` and `frequency = 'per_job'`, `order_index` set correctly — verify via `SELECT count(*) FROM tasks GROUP BY section_id`
- [ ] 2.5 Create `lib/types/index.ts` with TypeScript interfaces for all 6 tables (Section, Operator, WorkOrder, JobLog, Task, TaskCompletion) — types available app-wide with no `any` usage
- [ ] 2.6 Create `lib/supabase/server.ts` (server-side Supabase client for RSC/Server Actions) — create `lib/supabase/queries/operators.ts`, `jobs.ts`, `tasks.ts` with typed query functions for all data access patterns needed by features

## 3. Operator Auth [P0 — F-01]

- [ ] 3.1 Create `app/(operator)/layout.tsx` — fullscreen touch PWA shell (viewport fills screen, `overflow: hidden`, no scrollbars on layout, safe-area insets handled)
- [ ] 3.2 Create `app/(operator)/page.tsx` — operator selection screen: fetch active operators, render as full-width tap cards (min 64px height), sorted by name — verify names appear from DB
- [ ] 3.3 Create `app/(operator)/auth/page.tsx` — PIN entry screen: show selected operator name, render custom 4-digit numpad (0–9, backspace, submit), mask PIN as dots, NO system keyboard triggered — verify on a real touch device or mobile emulator
- [ ] 3.4 Implement Server Action for PIN validation: accept operator ID + raw PIN, bcrypt-compare against stored hash, return success/failure — verify correct PIN authenticates, wrong PIN returns error
- [ ] 3.5 On successful PIN validation: save operator session to `localStorage` (`{id, name, sectionId}`) — on next app load, read session and redirect to `/job-log` (skipping selection + PIN) — verify session survives browser close

## 4. Job Logging [P0 — F-02, F-03]

- [ ] 4.1 Create `app/(operator)/job-log/page.tsx` — work order list: fetch `status = 'open'` orders, render as full-width tap rows (min 64px, job number + product name) — verify from DB on operator device
- [ ] 4.2 Implement "Start Job" flow: tapping a work order shows a brief confirm or immediately inserts a `job_logs` row (`operator_id`, `work_order_id`, `section_id`, `start_time = now()`, `status = 'active'`, `parts_completed = 0`) — show active job banner after insert
- [ ] 4.3 Create `app/(operator)/job-log/[id]/page.tsx` — active job screen: fetch the job log, display job number + product name, show parts counter with current count prominently displayed
- [ ] 4.4 Implement parts counter: + button increments, − button decrements (not below 0), both min 64px touch targets, optimistic UI update (count updates instantly, DB write async)
- [ ] 4.5 Persist parts count to DB: on each tap, debounce 500ms then write `parts_completed` to `job_logs` — verify count survives browser close (re-open shows last saved count)
- [ ] 4.6 Implement "End Job": show confirmation bottom sheet with final parts count and confirm/cancel — on confirm, write `end_time = now()`, `status = 'completed'`, final `parts_completed` — redirect to work order list — verify active job banner disappears

## 5. Task Checklists [P0 — F-04]

- [ ] 5.1 Create `app/(operator)/tasks/page.tsx` — fetch tasks for operator's section (`is_active = true`), fetch today's completions for the current operator, render list ordered by `order_index` with complete/incomplete state
- [ ] 5.2 Implement daily task filter: a task is shown as complete only if `task_completions` record exists where `operator_id` matches AND `DATE(completed_at) = today` — verify tasks reset to incomplete on next day
- [ ] 5.3 Implement tap-to-complete: tapping an incomplete task row inserts a `task_completions` record (`task_id`, `operator_id`, `completed_at = now()`, `job_log_id` if active job exists) — optimistic UI: show checkmark immediately — verify idempotency (double-tap doesn't insert duplicate)
- [ ] 5.4 Visual distinction: completed tasks show strikethrough + greyed text + filled checkmark — incomplete tasks show open circle — verify distinction is clear at a glance without reading text

## 6. Manager Dashboard [P0 — F-05, F-06]

- [ ] 6.1 Create `app/(dashboard)/layout.tsx` — desktop sidebar layout (sidebar nav + main content area), optimised for 1280px+ — create `app/(dashboard)/page.tsx` as production overview shell
- [ ] 6.2 Implement stats bar: 3 cards — active job count, unique operators with active jobs, total parts today — fetch via Supabase query — verify counts are accurate against DB state
- [ ] 6.3 Create `components/dashboard/JobsTable.tsx` — active jobs table: fetch `job_logs` where `status = 'active'` with joined operator name, work order number + product name, section name — show elapsed time (derived from `start_time`), `parts_completed` — verify all columns render correctly on desktop (1280px+)
- [ ] 6.4 Implement Supabase Realtime subscription on `job_logs` table (dashboard only): subscribe to `postgres_changes` INSERT/UPDATE/DELETE — update React state on event — verify dashboard updates within 3 seconds of operator starting/ending a job (test with two browser tabs)
- [ ] 6.5 Create `components/dashboard/SectionProgress.tsx` — per-section task completion progress bar: `(completed tasks today) / (total active tasks)` per section — verify percentages are correct
- [ ] 6.6 Responsive layout: on mobile (< 768px) replace table with card list showing operator, work order, elapsed, parts — on tablet (768px–1279px) allow horizontal scroll or condensed columns — verify all three viewport ranges manually

## 7. PWA Polish & Device Testing

- [ ] 7.1 Finalise `public/manifest.json` — set app name (replace `[APP_NAME]` throughout), correct `theme_color`, verify `start_url: "/"` and `display: "standalone"`
- [ ] 7.2 Generate production icon assets — 192x192 PNG, 512x512 PNG, apple-touch-icon PNG — place in `public/icons/` — verify icons render correctly when app is installed
- [ ] 7.3 Touch audit — check every interactive element in operator UI: minimum 44px hit target on all buttons, tap cards, numpad keys, task rows — fix any that fall below threshold — verify on mobile emulator (Chrome DevTools device mode)
- [ ] 7.4 **Install on real iOS device** (iPad preferred) via Safari "Add to Home Screen" — launch from home screen — verify fullscreen (no Safari chrome), verify PIN pad works with touch, verify no layout breaks — document and fix any Safari-specific issues
- [ ] 7.5 **Install on real Android device** (tablet preferred) via Chrome — launch from home screen — verify fullscreen, touch interactions, no layout issues — fix any Chrome-specific issues
- [ ] 7.6 Operator UI polish pass — consistent spacing, typography scale, section color badges on task rows and job cards, intentional visual hierarchy — should look purpose-built, not prototype-y
- [ ] 7.7 Dashboard desktop polish — stats bar card design, table row density, live indicator dot (pulsing green dot next to "Live" label), sidebar active state — verify looks professional at 1280px+

## 8. P1 Features (build if Week 3 has spare time)

- [ ] 8.1 [P1 — F-07] Create `app/(operator)/home/page.tsx` — operator home screen: show operator name + section, quick-access buttons ("Start Job", "My Tasks"), active job banner if job in progress
- [ ] 8.2 [P1 — F-08] Work order detail expand — tapping a work order shows product type and quantity required before confirming start
- [ ] 8.3 [P1 — F-09] Create `app/(operator)/history/page.tsx` — last 5 completed job logs for the current operator: work order, parts completed, duration
- [ ] 8.4 [P1 — F-10] Connection status banner — detect `navigator.onLine` state — show "No connection — reconnect to continue" banner on operator screens when offline

## 9. Demo Prep & Final Verification

- [ ] 9.1 Final seed data pass — ensure work order product names, job numbers, and task titles all look authentic for industrial packer manufacturing — no placeholder text anywhere in the UI
- [ ] 9.2 Complete full end-to-end walkthrough — Flow A: PWA launch → operator select → PIN → start job → complete tasks → increment parts → end job. Flow B: Dashboard → stats correct → active job appears → task progress updates — all steps complete without errors
- [ ] 9.3 Write README — project purpose, local setup steps, env vars list, DB schema summary, link to Vercel deployment
- [ ] 9.4 Confirm UptimeRobot monitor is active and Supabase health endpoint is returning 200 — confirm Vercel deployment is the latest code
