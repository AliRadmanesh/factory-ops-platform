## ADDED Requirements

### Requirement: Task checklist shows section-specific tasks
The system SHALL display all active tasks (`is_active = true`) for the authenticated operator's section at `/tasks`, ordered by `order_index`. Each task row SHALL show the task title and a completion indicator. Rows SHALL have minimum 44px height.

#### Scenario: Tasks listed for operator's section
- **WHEN** authenticated operator navigates to `/tasks`
- **THEN** only tasks whose `section_id` matches the operator's `section_id` are shown

#### Scenario: No tasks for section
- **WHEN** the operator's section has no active tasks
- **THEN** a message is shown indicating no tasks for this section

#### Scenario: Tasks ordered correctly
- **WHEN** tasks are rendered
- **THEN** tasks appear in ascending `order_index` order

### Requirement: Daily tasks filter to today's completions
The system SHALL show daily tasks (`frequency = 'daily'`) as completed only if a `task_completions` record exists for that task AND the current operator AND `completed_at >= today's date (midnight local time)`. Tasks without a matching completion SHALL appear as incomplete.

#### Scenario: Completed daily task shows as done today
- **WHEN** a daily task has a `task_completions` record with `completed_at` from today
- **THEN** the task row shows a checkmark and is visually distinct (strikethrough or greyed)

#### Scenario: Daily task resets at midnight
- **WHEN** a new day begins (midnight local time)
- **THEN** daily tasks that were completed yesterday appear as incomplete again

#### Scenario: Another operator's completion does not affect current operator's view
- **WHEN** a different operator completed the same daily task today
- **THEN** the current operator's task still shows as incomplete (per-operator completion tracking)

### Requirement: Per-job tasks link to the active job
The system SHALL display per-job tasks (`frequency = 'per_job'`) and associate completions with the current active `job_log_id`. If no job is active, per-job tasks SHALL still be visible but their completion state MAY be shown without a job association.

#### Scenario: Per-job task completed during active job
- **WHEN** operator taps a per-job task while a job is active
- **THEN** `task_completions` record is created with the active `job_log_id`

#### Scenario: Per-job task visible without active job
- **WHEN** operator views tasks with no active job
- **THEN** per-job tasks are visible and can be completed (job_log_id stored as null)

### Requirement: Tapping a task row marks it complete
The system SHALL allow operators to complete a task by tapping the task row. On tap, a `task_completions` record SHALL be inserted with `task_id`, `operator_id`, `completed_at = now()`, and `job_log_id` (if applicable). The row SHALL immediately update to show the completed state (optimistic UI).

#### Scenario: Tap completes task and shows checkmark
- **WHEN** operator taps an incomplete task row
- **THEN** a `task_completions` record is inserted and the row immediately shows a checkmark and completed styling

#### Scenario: Completed task shows timestamp
- **WHEN** a task is completed
- **THEN** the completion time (e.g., "Completed 09:32") is visible on the row

#### Scenario: Already-completed task cannot be double-completed
- **WHEN** operator taps a task that is already completed today
- **THEN** no duplicate `task_completions` record is created (idempotent)

### Requirement: Completed tasks are visually distinct
The system SHALL visually differentiate completed tasks from incomplete ones using at minimum one of: strikethrough text, greyed colour, or a filled checkmark icon. The distinction SHALL be immediately perceptible without requiring reading the text.

#### Scenario: Visual distinction is clear
- **WHEN** a mix of complete and incomplete tasks are shown
- **THEN** completed tasks are visually distinguishable from incomplete ones at a glance
