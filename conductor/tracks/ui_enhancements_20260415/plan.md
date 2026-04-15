# Implementation Plan: Daily Enhancements & Weekly Goal UI

## Phase 1: Excel Import Auto-Reload [checkpoint: a5b7eb7]
- [x] Task: Update `Settings.svelte` (or relevant import component) to emit an `importComplete` event upon successful Excel import. cbe7f13
- [x] Task: Update `+page.svelte` to listen for the `importComplete` event and trigger a data reload (e.g., calling `loadTasks()`) to refresh the active view immediately. cbe7f13
- [x] Task: Write/update tests (e.g., `page.integration.spec.ts` or component tests) to verify the auto-reload behavior. cbe7f13
- [x] Task: Conductor - User Manual Verification 'Phase 1: Excel Import Auto-Reload' (Protocol in workflow.md) a5b7eb7

## Phase 2: Daily View Enhancements
- [x] Task: Update `TaskList.svelte` header to include "Previous Day" (`<`) and "Next Day" (`>`) navigation arrows alongside the date. 64a30e6
- [x] Task: Dispatch `previousDay` and `nextDay` events from `TaskList.svelte` when arrows are clicked. 64a30e6
- [x] Task: Update `+page.svelte` to handle the navigation events by adjusting the `selectedDate` (+/- 1 day) and reloading the tasks. 64a30e6
- [x] Task: Make task blocks in `TaskList.svelte` clickable and dispatch an `editTask` event with the task payload. 64a30e6
- [x] Task: Update `+page.svelte` to handle the `editTask` event by setting `editingTask` and opening the `TaskForm` modal. 64a30e6
- [x] Task: Write unit tests in `TaskList.spec.ts` to verify navigation arrows and edit triggers. 64a30e6
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Daily View Enhancements' (Protocol in workflow.md)

## Phase 3: Weekly View Remaining Time
- [ ] Task: Update `WeeklyView.svelte` to calculate `remainingTime` as `weeklyTarget - totalBillableHours` (ensuring billable absences are accounted for correctly).
- [ ] Task: Add a visual text indicator (e.g., "Remaining: Xh Ym") to the `WeeklyView.svelte` header.
- [ ] Task: Add a visual progress bar to the `WeeklyView.svelte` header, mapping the logged billable hours against the `weeklyTarget`.
- [ ] Task: Write/update unit tests in `WeeklyView.spec.ts` to verify the remaining time calculation and correct rendering.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Weekly View Remaining Time' (Protocol in workflow.md)