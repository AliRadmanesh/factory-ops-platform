## ADDED Requirements

### Requirement: Sections seeded with correct factory departments
The system SHALL have 5 sections inserted into the `sections` table: Raw Materials, Fabrication, Assembly, Quality Control, and Dispatch. Each section SHALL have a unique hex color for UI badge display.

#### Scenario: All 5 sections present
- **WHEN** developer queries `SELECT name FROM sections ORDER BY name`
- **THEN** exactly 5 rows are returned: Assembly, Dispatch, Fabrication, Quality Control, Raw Materials

#### Scenario: Each section has a unique color
- **WHEN** sections are fetched
- **THEN** no two sections share the same `color` hex value

### Requirement: Operators seeded across all sections
The system SHALL have 8–10 operators in the `operators` table, distributed across all 5 sections. Each operator SHALL have a realistic first+last name, a valid `section_id`, `is_active = true`, and a bcrypt-hashed 4-digit PIN.

#### Scenario: Operators distributed across sections
- **WHEN** developer queries operators grouped by section
- **THEN** each section has at least 1 operator assigned

#### Scenario: All operators are active
- **WHEN** developer queries `SELECT COUNT(*) FROM operators WHERE is_active = true`
- **THEN** count is between 8 and 10

#### Scenario: PINs are hashed, not plaintext
- **WHEN** developer inspects the `pin` column
- **THEN** values are bcrypt hashes (starting with `$2b$` or `$2a$`) not raw digits

### Requirement: Work orders seeded with realistic manufacturing data
The system SHALL have 8–10 work orders in `work_orders` with product names, product types, and job numbers appropriate for a precision parts manufacturer. A mix of `status` values SHALL be present (primarily `open`, with some `in_progress` or `completed` to show history). Job numbers SHALL follow a consistent format (e.g., `WO-2026-XXXX`).

#### Scenario: Work orders have realistic product names
- **WHEN** developer views the `work_orders` table
- **THEN** product names use generic manufacturing terminology (e.g., "Hydraulic Cylinder Assembly", "Flanged Coupling Unit", "Precision Valve Body")

#### Scenario: Work orders span multiple product types
- **WHEN** `product_type` column is inspected
- **THEN** at least 2 distinct product types are present (e.g., "Hydraulics", "Mechanical", "Fluid Control")

#### Scenario: At least 5 open work orders available
- **WHEN** operator navigates to work order list
- **THEN** at least 5 work orders are visible with `status = 'open'`

### Requirement: Tasks seeded per section with correct frequency mix
The system SHALL have 3–5 tasks per section in the `tasks` table, with a mix of `frequency = 'daily'` and `frequency = 'per_job'` tasks. Task titles SHALL be realistic for a manufacturing context (e.g., "Inspect incoming materials against purchase order", "Torque fasteners to specified values").

#### Scenario: Each section has 3–5 tasks
- **WHEN** developer queries tasks grouped by section
- **THEN** each section has between 3 and 5 active tasks

#### Scenario: Both daily and per-job frequencies present per section
- **WHEN** tasks for any section are inspected
- **THEN** at least 1 `daily` task and 1 `per_job` task exist for each section

#### Scenario: Task titles are industry-appropriate
- **WHEN** developer views task titles in the UI
- **THEN** titles use manufacturing domain language, not placeholder text like "Task 1" or "Lorem ipsum"
