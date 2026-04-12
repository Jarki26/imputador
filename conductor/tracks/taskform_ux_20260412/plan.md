# Implementation Plan: TaskForm UX Improvements (Section 4.2)

## Phase 1: Duration Lock UI and Logic [checkpoint: b64716a]
- [x] Task: Write failing tests for Duration Lock UI state and interactions in `src/lib/TaskForm.duration.spec.ts`.
- [x] Task: Implement Duration Lock padlock icon in `TaskForm.svelte`.
- [x] Task: Implement state management for the lock (active/inactive).
- [x] Task: Implement logic: changing start time adjusts end time when locked.
- [x] Task: Implement logic: changing start time adjusts duration when unlocked.
- [x] Task: Ensure all duration lock tests pass.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Duration Lock UI and Logic' (Protocol in workflow.md)

## Phase 2: Default Date Selection
- [x] Task: Write failing tests for default date behavior in `src/lib/TaskForm.spec.ts`.
- [x] Task: Update `TaskForm.svelte` to default the date input to today's date if no specific date is provided on mount.
- [x] Task: Ensure the date remains accurate when opened from `WeeklyView` context.
- [x] Task: Ensure all default date selection tests pass.
- [~] Task: Conductor - User Manual Verification 'Phase 2: Default Date Selection' (Protocol in workflow.md)

## Phase 3: Single-Day Restriction
- [ ] Task: Write failing tests for cross-day validation in `src/lib/TaskForm.spec.ts`.
- [ ] Task: Update the date selector in `TaskForm.svelte` to ensure only a single day can be selected.
- [ ] Task: Implement validation logic to check if `startTime + duration` crosses 23:59 of the selected date.
- [ ] Task: Display a validation error in the UI when a cross-day boundary is breached.
- [ ] Task: Prevent form submission if the cross-day validation fails.
- [ ] Task: Ensure all cross-day restriction tests pass.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Single-Day Restriction' (Protocol in workflow.md)