# Product Requirements Document
## [APP_NAME] — Manufacturing Operations Platform

**Version:** 2.0  
**Date:** 2026-05-16  
**Timeline:** 3 weeks (15 working days)  
**Status:** Draft

---

## Tech Stack Versions

| Package | Version |
|---|---|
| Next.js | ^16.2.2 |
| TypeScript | ^5 |
| Tailwind CSS | ^4 |
| @supabase/supabase-js | ^2 |
| serwist + @serwist/next | latest |

---

## 1. Product Vision

A manufacturing operations platform for specialty industrial manufacturers. Operators on the factory floor log production jobs and complete section-specific task checklists from a browser on iOS or Android tablets — installed as a PWA for fullscreen use. Managers monitor live production output from a web dashboard on desktop, tablet, or mobile.

Single Next.js application. One URL. Two interfaces. No app stores, no native builds, no installation friction.

**Target industry:** Specialty manufacturers with custom-order workflows, ISO 9001 compliance requirements, and mixed-device factory floors (iOS + Android tablets and phones).

---

## 2. Users

### Operator (Tablet / Phone — PWA)
- Factory floor worker assigned to a section (rubber lab, vulcanization, assembly, QC, testing, shipping)
- Uses iOS or Android tablet at workstation; may use phone
- May wear gloves — UI must use min 44px touch targets, minimal text input
- Not technical — zero training required, self-explanatory UI
- Accesses via browser URL, adds to home screen as PWA for fullscreen experience
- Logs job start/end, parts completed, section task checklists

### Manager (Desktop / Tablet / Phone — Web)
- Senior staff reviewing production from desktop browser (primary); occasionally tablet or phone
- Wants live overview: who is working, on what, parts output, per-section task completion
- Does not need to be on factory floor

---

## 3. Platforms

| User | Platform | Requirement |
|---|---|---|
| Operator | iOS Safari (iPad + iPhone) — PWA | Full support, fullscreen via manifest |
| Operator | Android Chrome (tablet + phone) — PWA | Full support, fullscreen via manifest |
| Manager | Desktop browser (primary) | Optimized for 1280px+ |
| Manager | Tablet browser (secondary) | Responsive, good enough |
| Manager | Mobile browser (secondary) | Responsive, good enough |

---

## 4. Feature Requirements

### P0 — Core (platform ships these or nothing ships)

#### F-01: Operator Login
- List of operator names as large tap cards (full-width, min 64px height)
- Tap name → 4-digit PIN pad (no keyboard, custom numpad UI)
- Success → operator's section home or job list
- Wrong PIN → clear error, immediate retry
- Session persists in localStorage (no re-login on next browser open)

#### F-02: Job Log — Start Job
- List of open work orders (job number + product name, large tap rows)
- Tap work order → "Start Job" → timestamp auto-recorded
- Active job shown as persistent banner while in progress

#### F-03: Job Log — Log Parts & End Job
- Active job screen: large +/− buttons for parts count, current count prominent
- "End Job" → confirm sheet → records end time + final parts count
- Completed job removed from active view

#### F-04: Section Task Checklist
- Shows tasks for operator's assigned section (daily + per-job)
- Tap row to complete → checkmark + timestamp shown
- Completed tasks visually distinct (strikethrough or greyed)
- Daily tasks filter by today's date (reset automatically at midnight)

#### F-05: Manager Dashboard — Production Overview
- Summary cards: active jobs count, operators working, total parts today
- Live table of active job logs: operator, work order, section, elapsed time, parts
- Realtime updates via Supabase subscription (no manual refresh)
- **Desktop:** full-width table, all columns visible
- **Tablet:** condensed columns or horizontal scroll
- **Mobile:** card list replacing table

#### F-06: Manager Dashboard — Task Completion
- Per-section progress bar showing today's task completion %
- **Desktop:** section grid (2–3 columns)
- **Tablet / mobile:** single-column stacked list

---

### P1 — Important, but platform functional without them

#### F-07: Operator Home Screen
- After login: operator name + section shown
- Quick-access buttons: "Start Job" and "My Tasks"
- Active job banner if a job is currently in progress

#### F-08: Work Order Detail
- Tap work order to expand: product name, product type, quantity required
- Gives operator context before starting

#### F-09: Job History
- Last 5 completed jobs for logged-in operator
- Shows work order, parts completed, duration

#### F-10: Connection Status Banner
- Banner on operator screens when offline: "No connection — reconnect to continue"
- No offline sync — just UX feedback

---

### P2 — Build only if Week 3 has spare time

#### F-11: Dashboard — Filter by Section
- Filter active jobs table by section

#### F-12: Operator — Job Notes
- Optional free-text field when ending a job

#### F-13: Manager Login Gate
- Email + password via Supabase Auth protecting `/(dashboard)` routes
- Default for v1: dashboard accessible without auth (acceptable for portfolio demo)

---

### Out of Scope (v1)

- Inventory / stock management
- True offline sync with conflict resolution
- Push notifications
- Admin panel (manage operators, sections, tasks via UI)
- Reports, CSV/PDF export
- Barcode / QR scanning
- Dark mode
- File attachments on jobs
- Customer / order management

---

## 5. Screen Inventory

### Operator UI — `app/(operator)/`

| Screen | Route | Priority |
|---|---|---|
| Operator selection | `/` | P0 |
| PIN entry | `/auth` | P0 |
| Operator home | `/home` | P1 |
| Work order list | `/job-log` | P0 |
| Active job | `/job-log/[id]` | P0 |
| Task checklist | `/tasks` | P0 |
| Job history | `/history` | P1 |

### Manager Dashboard — `app/(dashboard)/`

| Screen | Route | Priority |
|---|---|---|
| Production overview | `/dashboard` | P0 |
| Active jobs | `/dashboard/jobs` | P0 |
| Task completion | `/dashboard/tasks` | P0 |
| Login | `/dashboard/login` | P2 |

---

## 6. Three-Week Build Plan

### Week 1 — Foundation (Days 1–5)
*Goal: App boots, auth works, DB connected, data flows.*

| Day | Task | Output |
|---|---|---|
| 1 | Next.js 16 project init. Tailwind 4 configured. Folder structure created per §8 of ARD. | App boots at localhost |
| 1 | Supabase project created. All 6 tables migrated. Seed data inserted. | DB live with demo data |
| 2 | `lib/types/index.ts` — TypeScript interfaces for all DB tables | Types available app-wide |
| 2 | `lib/supabase/client.ts` + `server.ts` + all query functions | Typed DB queries ready |
| 3 | `(operator)` layout: fullscreen, touch shell. PWA manifest + serwist wired up. | Installable as PWA |
| 3 | Operator selection screen (F-01 — name cards) | Names render from DB |
| 4 | PIN entry screen — custom numpad UI, validation against DB, hashed comparison | Login works end-to-end |
| 4 | Operator session persistence (localStorage cookie) | Stay logged in on reopen |
| 5 | `(dashboard)` layout: desktop sidebar. Basic routing. Supabase client connected. | Dashboard loads, queries DB |
| 5 | UptimeRobot monitor on Supabase `/health`, 5-min interval | Free tier won't pause |

**Week 1 done when:** Operator logs in on a tablet browser. Dashboard loads on desktop. PWA installable.

---

### Week 2 — Core Features (Days 6–10)
*Goal: All P0 features working end-to-end.*

| Day | Task | Output |
|---|---|---|
| 6 | Operator: work order list screen — open orders, large tap rows (F-02) | Orders render from DB |
| 6 | Operator: "Start Job" → inserts job_log with timestamp | Job saved to DB |
| 7 | Operator: active job screen — job banner, +/− parts counter (F-03) | Parts update in DB |
| 7 | Operator: "End Job" → confirm sheet, writes end_time + final parts | Job completes |
| 8 | Operator: task checklist — fetch section tasks, render list (F-04) | Tasks render |
| 8 | Operator: tap to complete task → inserts task_completion record | Completion saved |
| 8 | Operator: daily task filter (only show today's completions as done) | Reset logic works |
| 9 | Dashboard: stats bar — active jobs, operators, parts today (F-05) | Stats correct |
| 9 | Dashboard: active jobs table — operator, work order, section, elapsed, parts | Table renders |
| 10 | Dashboard: Supabase Realtime on job_logs → live update without refresh | Realtime confirmed |
| 10 | Dashboard: task completion section — per-section progress bars (F-06) | Progress visible |

**Week 2 done when:** Full flow works: login → start job → complete tasks → log parts → end job → dashboard updates live.

---

### Week 3 — Polish + Responsive + Demo Prep (Days 11–15)
*Goal: Looks professional on all target screens. Installable and stable.*

| Day | Task | Output |
|---|---|---|
| 11 | Operator UI: full polish pass — spacing, typography, color system, section color badges | Intentional, not prototype-y |
| 11 | Operator UI: touch audit — all interactive elements ≥ 44px, no hover-only states | Glove-friendly |
| 11 | Operator UI: industry-appropriate terminology throughout ("work order", "production run", "section") | Feels purpose-built |
| 12 | Dashboard: desktop layout polish — table, stats bar, live indicator dot | Professional on 1280px+ |
| 12 | Dashboard: tablet responsive pass (condensed table / horizontal scroll) | Acceptable on tablet |
| 12 | Dashboard: mobile responsive pass (card list replaces table) | Acceptable on phone |
| 12 | Operator home screen (F-07) | Smoother post-login flow |
| 13 | **Install PWA on real iOS device (iPad preferred)** — fix any Safari quirks | Confirmed iOS PWA |
| 13 | **Install PWA on real Android device (tablet preferred)** — fix any Chrome quirks | Confirmed Android PWA |
| 13 | **Open dashboard on tablet browser** — confirm responsive layout acceptable | Confirmed tablet dashboard |
| 13 | Connection status banner (F-10) | Graceful offline UX |
| 14 | Seed data final pass — realistic job numbers, product names for industrial packer manufacturing | Data looks authentic |
| 14 | Full end-to-end walkthrough (Flows A + B from §7) — no issues | Demo-ready |
| 15 | Buffer: fix anything from Day 13–14 | — |
| 15 | Buffer: P1 features if time permits (F-08, F-09) | — |

**Week 3 done when:** PWA installs and runs fullscreen on iOS and Android. Dashboard correct on desktop, acceptable on tablet/mobile. Deployed to Vercel. Supabase live with realistic data.

---

## 7. Feature Walkthrough

*End-to-end flows for testing and demonstration.*

**Flow A — Operator logs a job (tablet, PWA)**
1. Open PWA from home screen → operator selection loads instantly, fullscreen
2. Tap operator name → PIN pad appears → enter PIN → authenticated
3. View open work orders → tap one → "Start Job" → active job banner appears
4. Navigate to tasks → tap through section checklist items to complete them
5. Return to active job → tap + to increment parts count
6. Tap "End Job" → confirm → job complete, removed from active view

**Flow B — Manager monitors production (desktop browser)**
1. Open dashboard → stats bar shows: active jobs, operators working, parts today
2. Active jobs table: each row shows operator, work order, section, elapsed time, parts
3. Task completion section: per-section progress bars for today's shift
4. After operator completes Flow A: dashboard updates within ~3 seconds, no refresh

**Flow C — Shift handover**
1. All daily task checklists show complete across sections
2. Manager sees total parts output per work order for the day
3. Following morning: daily task completions reset, checklists fresh for new shift

---

## 8. Success Criteria

| Criteria | Target |
|---|---|
| PWA install on iOS (Safari) | Installs, opens fullscreen, no browser chrome |
| PWA install on Android (Chrome) | Installs, opens fullscreen, no browser chrome |
| Operator app cold open (PWA) | < 2 seconds to interactive |
| Full job log flow (start → end) | Completable in < 5 taps |
| Complete one task | < 2 taps |
| Dashboard realtime lag | < 3 seconds from operator submit to dashboard update |
| Stability | No crashes or blank screens over 30 minutes of use |
| Dashboard — desktop | Fully usable, looks polished at 1280px+ |
| Dashboard — tablet | Usable, no broken layout |
| Dashboard — mobile | Usable, no broken layout |

---

## 9. Definition of Done (v1)

- [ ] All P0 features implemented and manually tested
- [ ] PWA installed and tested on physical iOS device
- [ ] PWA installed and tested on physical Android device (or emulator)
- [ ] Dashboard responsive pass completed and tested on tablet viewport
- [ ] App deployed to Vercel and publicly accessible
- [ ] Supabase project live with realistic industry-appropriate seed data
- [ ] UptimeRobot monitor active on Supabase health endpoint
- [ ] Full walkthrough (Flow A + B) completed without issues
- [ ] README covers: project purpose, local setup, env vars, DB schema summary
