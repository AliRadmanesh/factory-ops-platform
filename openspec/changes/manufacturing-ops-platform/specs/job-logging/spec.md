## ADDED Requirements

### Requirement: Work order list shows open orders as large tap rows
The system SHALL display all work orders with `status = 'open'` as full-width tap rows at `/job-log`. Each row SHALL show the job number and product name. Rows SHALL have minimum 64px height and be easily tappable with gloves.

#### Scenario: Open work orders listed
- **WHEN** authenticated operator navigates to `/job-log`
- **THEN** all work orders with `status = 'open'` are listed, each showing job number and product name

#### Scenario: No open work orders
- **WHEN** no work orders have `status = 'open'`
- **THEN** a message is shown indicating no open work orders are available

#### Scenario: Tapping a work order navigates to start confirmation
- **WHEN** operator taps a work order row
- **THEN** the work order detail or a "Start Job" prompt is shown

### Requirement: Starting a job creates a job_log record
The system SHALL create a new `job_logs` record when an operator taps "Start Job" on a work order. The record SHALL include `operator_id`, `work_order_id`, `section_id` (from operator's section), `start_time` (server timestamp), `status = 'active'`, and `parts_completed = 0`.

#### Scenario: Job log created on start
- **WHEN** operator taps "Start Job"
- **THEN** a new row is inserted into `job_logs` with correct operator, work order, section, and start_time

#### Scenario: Active job banner appears
- **WHEN** a job log with `status = 'active'` exists for the current operator
- **THEN** a persistent banner showing the active job (job number + product name) is displayed across all operator screens

#### Scenario: Cannot start second job while one is active
- **WHEN** operator already has an active job log
- **THEN** the work order list shows the active job banner and does not allow starting another job

### Requirement: Active job screen shows parts counter with large +/− buttons
The system SHALL display the active job screen at `/job-log/[id]` with the current `parts_completed` count prominently displayed and large +/− buttons (min 64px) to increment or decrement the count. Decrement SHALL NOT go below 0.

#### Scenario: Parts counter displays current count
- **WHEN** operator navigates to `/job-log/[id]`
- **THEN** the current `parts_completed` value is displayed prominently

#### Scenario: Increment button increases count
- **WHEN** operator taps the + button
- **THEN** `parts_completed` is incremented by 1 and the displayed count updates immediately (optimistic UI)

#### Scenario: Decrement button decreases count but not below zero
- **WHEN** operator taps the − button with `parts_completed > 0`
- **THEN** `parts_completed` is decremented by 1

#### Scenario: Decrement disabled at zero
- **WHEN** `parts_completed = 0` and operator taps −
- **THEN** count stays at 0 and no DB write occurs

### Requirement: Parts count persists to database
The system SHALL write parts count changes to the `job_logs` table in Supabase. Updates SHALL happen on each tap (debounced if needed) or on a reliable save event. The count SHALL be recoverable if the operator closes the browser and returns.

#### Scenario: Parts count survives browser close
- **WHEN** operator closes the browser mid-job and reopens it
- **THEN** the parts counter shows the last saved count from the database

#### Scenario: Count updates reflected in database
- **WHEN** operator increments the parts counter
- **THEN** the `parts_completed` column in `job_logs` is updated within 2 seconds

### Requirement: Ending a job requires confirmation and writes completion data
The system SHALL show an "End Job" button on the active job screen. Tapping it SHALL present a confirmation bottom sheet or modal. On confirm, the system SHALL write `end_time` and final `parts_completed` to the `job_logs` record and set `status = 'completed'`. The completed job SHALL be removed from the active job view.

#### Scenario: End job confirmation shown
- **WHEN** operator taps "End Job"
- **THEN** a confirmation sheet is shown with the final parts count and a confirm/cancel action

#### Scenario: Confirmed end job writes completion data
- **WHEN** operator confirms "End Job"
- **THEN** `job_logs` record is updated: `end_time = now()`, `status = 'completed'`, `parts_completed = <final count>`

#### Scenario: Completed job removed from active view
- **WHEN** job is successfully ended
- **THEN** the active job banner disappears and operator is returned to the work order list

#### Scenario: Cancel keeps job active
- **WHEN** operator taps cancel on the confirmation sheet
- **THEN** the job remains active and no changes are written to the database
