## ADDED Requirements

### Requirement: Local dev environment boots correctly
The system SHALL have a Next.js 16 project initialised with TypeScript 5, Tailwind CSS 4, and all required npm packages installed. Running `npm run dev` SHALL start the dev server without errors and render the root page at `localhost:3000`.

#### Scenario: Dev server starts
- **WHEN** developer runs `npm run dev` from project root
- **THEN** Next.js dev server starts at `localhost:3000` with no TypeScript or module errors

#### Scenario: Tailwind styles render
- **WHEN** a Tailwind utility class is added to any page component
- **THEN** the corresponding CSS style is applied visibly in the browser

### Requirement: Supabase project connected locally
The system SHALL connect to Supabase from the local dev environment using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables defined in `.env.local`. A test query to any Supabase table SHALL succeed without error.

#### Scenario: Supabase client initialises
- **WHEN** the app loads at `localhost:3000`
- **THEN** the Supabase browser client initialises without throwing a missing-env-var error

#### Scenario: Test query succeeds
- **WHEN** a server component or API route queries the `sections` table
- **THEN** a non-error response with data is returned from Supabase

### Requirement: Database schema created and seeded
All 6 tables (`sections`, `operators`, `work_orders`, `job_logs`, `tasks`, `task_completions`) SHALL exist in the Supabase PostgreSQL database with correct column definitions, foreign keys, and default values as specified in the ARD data model. Seed data SHALL be present before any UI work begins.

#### Scenario: All tables exist
- **WHEN** developer opens Supabase table editor
- **THEN** all 6 tables are visible with correct columns

#### Scenario: Seed data visible
- **WHEN** developer queries `SELECT * FROM sections`
- **THEN** at least 5 rows are returned (Rubber Lab, Vulcanization, Assembly, Testing & QC, Shipping)

### Requirement: Skeleton deployed to Vercel
The skeleton Next.js application (no feature UI, just the framework booting) SHALL be deployed to Vercel and publicly accessible via a Vercel URL. The Vercel build SHALL pass without errors.

#### Scenario: Vercel build passes
- **WHEN** code is pushed to the main GitHub branch
- **THEN** Vercel build completes successfully with no build errors

#### Scenario: Deployed URL responds
- **WHEN** the Vercel production URL is opened in a browser
- **THEN** the page loads (HTTP 200) within 3 seconds

### Requirement: Supabase queries work in Vercel production
The Vercel-deployed app SHALL successfully query Supabase in production. Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) SHALL be configured in Vercel project settings.

#### Scenario: Production Supabase query succeeds
- **WHEN** the Vercel-deployed app loads any page that fetches from Supabase
- **THEN** data is returned without a network or auth error

#### Scenario: Missing env var caught early
- **WHEN** a required env var is missing from Vercel settings
- **THEN** the Next.js app throws an explicit error at startup, not a silent runtime failure

### Requirement: UptimeRobot monitor active
An UptimeRobot HTTP monitor SHALL be configured to ping the Supabase project health endpoint every 5 minutes, preventing the free-tier 7-day inactivity pause.

#### Scenario: Monitor configured
- **WHEN** developer opens UptimeRobot dashboard
- **THEN** a monitor exists for `https://<project>.supabase.co/health` with 5-minute interval

#### Scenario: Health endpoint responds
- **WHEN** a GET request is made to the Supabase `/health` endpoint
- **THEN** HTTP 200 is returned
