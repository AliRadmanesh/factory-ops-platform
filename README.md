# FloorOps

A manufacturing operations platform for factory floor teams. Operators log production jobs and complete section checklists from iOS/Android tablets (installed as PWA). Managers monitor live production from a desktop dashboard.

## Features

- **Operator PWA** — fullscreen install on iOS Safari and Android Chrome, touch-optimised with no keyboard required
- **Job logging** — start/end work orders, track parts completed with optimistic +/− counter
- **Task checklists** — per-section daily and per-job tasks with tap-to-complete and automatic daily reset
- **Manager dashboard** — real-time active jobs table via Supabase Realtime, stats bar, per-section task progress
- **PIN authentication** — name selection + 4-digit PIN, session persisted in localStorage

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL + Realtime) |
| PWA | serwist + @serwist/next |
| Hosting | Vercel |

## Local Setup

**1. Clone and install**
```bash
git clone <repo-url>
cd <project-folder>
npm install
```

**2. Environment variables**

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**3. Database**

Run the schema migrations in the Supabase SQL editor, then run `supabase/seed.sql` to populate sections, operators, work orders, and tasks.

**4. Start dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key (server-side only) |

Both variables are server-side only — no `NEXT_PUBLIC_` prefix. The anon key is passed as a server component prop to the Realtime client only.

## Database Schema

| Table | Description |
|---|---|
| `sections` | Factory departments (Raw Materials, Fabrication, Assembly, Quality Control, Dispatch) |
| `operators` | Factory floor workers with bcrypt-hashed PINs |
| `work_orders` | Production jobs with job number, product name, type, and status |
| `job_logs` | Active and completed job sessions per operator |
| `tasks` | Section-specific checklists with `daily` or `per_job` frequency |
| `task_completions` | Per-operator task completion records with timestamps |

## Route Structure

```
app/
├── page.tsx                    # Operator selection
├── (operator)/
│   ├── auth/page.tsx           # PIN entry
│   ├── home/page.tsx           # Operator home
│   ├── job-log/page.tsx        # Work order list
│   ├── job-log/[id]/page.tsx   # Active job + parts counter
│   ├── tasks/page.tsx          # Section task checklist
│   └── history/page.tsx        # Recent completed jobs
└── (dashboard)/
    └── dashboard/page.tsx      # Manager production overview
```

## Deployment

Deployed on Vercel. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the Vercel project environment variables.

[Live Demo →](https://your-vercel-url.vercel.app)
