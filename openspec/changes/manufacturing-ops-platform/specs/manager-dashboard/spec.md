## ADDED Requirements

### Requirement: Stats bar shows live production summary
The system SHALL display a stats bar at the top of the dashboard (`/dashboard`) with three summary cards: (1) count of active job logs (`status = 'active'`), (2) count of unique operators with active jobs, (3) total `parts_completed` across all job logs where `DATE(start_time) = today`.

#### Scenario: Stats bar shows correct counts
- **WHEN** manager opens the dashboard
- **THEN** all three stat cards show accurate values reflecting current database state

#### Scenario: Stats update in real time
- **WHEN** an operator starts or ends a job
- **THEN** the stats bar updates within 3 seconds without page refresh

#### Scenario: Stats bar at zero when no active jobs
- **WHEN** no operators are currently working
- **THEN** stats show 0 active jobs, 0 operators, and today's completed parts total

### Requirement: Active jobs table shows all in-progress work
The system SHALL display a table of all job logs with `status = 'active'`. Each row SHALL show: operator name, work order job number + product name, section name, elapsed time (derived from `start_time` to now), and `parts_completed`. The table SHALL update in real time.

#### Scenario: Active jobs rendered in table
- **WHEN** manager views the dashboard
- **THEN** each active job log appears as a table row with all required columns

#### Scenario: Elapsed time updates live
- **WHEN** a job log row is visible in the table
- **THEN** the elapsed time column updates at least every 60 seconds without page refresh

#### Scenario: Completed job disappears from table
- **WHEN** an operator ends a job
- **THEN** that row is removed from the active jobs table within 3 seconds

#### Scenario: Desktop shows all columns
- **WHEN** dashboard is viewed at 1280px or wider
- **THEN** all columns (operator, work order, section, elapsed, parts) are visible without horizontal scroll

#### Scenario: Mobile shows card list instead of table
- **WHEN** dashboard is viewed at mobile viewport (< 768px)
- **THEN** the table is replaced with a card list showing each job's key info

### Requirement: Realtime updates via Supabase subscription
The system SHALL maintain a Supabase Realtime subscription to `postgres_changes` on the `job_logs` table on the manager dashboard. UI state SHALL update within 3 seconds of any insert, update, or delete on `job_logs` — without a manual page refresh.

#### Scenario: New job appears without refresh
- **WHEN** an operator starts a new job
- **THEN** the active jobs table and stats bar update within 3 seconds on the dashboard

#### Scenario: Subscription survives tab visibility change
- **WHEN** manager switches away from the dashboard tab and returns
- **THEN** the Realtime subscription resumes and shows current state

#### Scenario: Subscription active only on dashboard
- **WHEN** operator navigates any operator screen
- **THEN** no Realtime subscription is active on the operator side

### Requirement: Per-section task completion progress bars
The system SHALL display a progress bar for each section showing today's task completion percentage: `(completed tasks today across all operators in section) / (total active tasks for section) * 100`. Both daily and per-job completions count.

#### Scenario: Progress bar shows correct percentage
- **WHEN** 3 of 5 tasks for a section are completed today
- **THEN** that section's progress bar shows 60%

#### Scenario: Fully completed section shows 100%
- **WHEN** all tasks for a section are completed today
- **THEN** the section progress bar shows 100% with a visual completion indicator

#### Scenario: Desktop shows section grid
- **WHEN** dashboard is viewed at 1280px or wider
- **THEN** sections are shown in a 2–3 column grid layout

#### Scenario: Mobile shows stacked list
- **WHEN** dashboard is viewed at mobile viewport
- **THEN** sections are shown as a single-column stacked list
