## ADDED Requirements

### Requirement: Operator selection screen shows name cards
The system SHALL display all active operators as large, full-width tap cards on the root route (`/`). Each card SHALL show the operator's name. Cards SHALL have a minimum height of 64px and be easily tappable with or without gloves.

#### Scenario: Operators listed
- **WHEN** user navigates to `/`
- **THEN** all active operators (where `is_active = true`) are listed as individual tap cards sorted by name

#### Scenario: Tap card advances to PIN entry
- **WHEN** user taps an operator card
- **THEN** user is navigated to the PIN entry screen with that operator's context

#### Scenario: No active operators
- **WHEN** no operators have `is_active = true`
- **THEN** a message is shown indicating no operators are available

### Requirement: PIN entry uses custom numpad — no system keyboard
The system SHALL display a 4-digit PIN entry screen with a custom on-screen numpad (0–9 + backspace + submit). The system keyboard SHALL NOT be triggered. The PIN SHALL be masked (dots) as it is entered.

#### Scenario: PIN pad renders without system keyboard
- **WHEN** user arrives at PIN entry screen
- **THEN** a custom numpad is visible and the device system keyboard does NOT appear

#### Scenario: PIN masked during entry
- **WHEN** user taps digits on the numpad
- **THEN** each digit is shown as a filled dot (•), not the actual digit

#### Scenario: Backspace removes last digit
- **WHEN** user taps backspace on the numpad
- **THEN** the last entered digit is removed

#### Scenario: Submit triggers validation
- **WHEN** user has entered 4 digits and taps submit (or 4th digit auto-submits)
- **THEN** the entered PIN is validated against the stored hash for the selected operator

### Requirement: PIN validation authenticates operator
The system SHALL compare the entered PIN against the bcrypt-hashed PIN stored in the `operators` table. Comparison SHALL occur server-side via a Server Action. On success, the operator session SHALL be persisted. On failure, an error is shown and the PIN field is cleared.

#### Scenario: Correct PIN authenticates
- **WHEN** operator enters the correct 4-digit PIN
- **THEN** the operator session is saved and user is redirected to `/home` (P1) or `/job-log` (P0 fallback)

#### Scenario: Wrong PIN shows error
- **WHEN** operator enters an incorrect PIN
- **THEN** an error message ("Incorrect PIN — try again") is shown, PIN field is cleared, operator can retry immediately

#### Scenario: PIN never transmitted in plaintext
- **WHEN** PIN validation occurs
- **THEN** the raw PIN is sent to a Server Action that performs bcrypt comparison — the hash is never exposed to the client

### Requirement: Operator session persists across browser reopen
The system SHALL store the authenticated operator's `id`, `name`, and `section_id` in `localStorage` after successful PIN validation. On next browser open, if a valid session exists, the operator SHALL be taken directly to their home/job screen without re-authenticating.

#### Scenario: Session survives browser close
- **WHEN** operator closes and reopens the browser (or PWA)
- **THEN** operator is already authenticated and taken to `/home` or `/job-log` without PIN entry

#### Scenario: Session cleared on explicit logout
- **WHEN** operator explicitly logs out (if logout action exists)
- **THEN** `localStorage` session data is cleared and user is returned to operator selection

#### Scenario: Invalid session ignored
- **WHEN** `localStorage` contains a session with an operator ID that no longer exists in the DB
- **THEN** the session is cleared and the user is shown the operator selection screen
