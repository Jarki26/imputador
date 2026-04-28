# Implementation Plan: Fix False Conflicts After Sesame Sync

## Phase 1: Test & Implement Fix [checkpoint: 9ce7f80]

- [x] Task: Write failing tests in `src/lib/WeeklyView.spec.ts` and `src/lib/sesameSync.integration.spec.ts` asserting that tasks sharing an exact boundary (e.g., Task A ends at 10:00, Task B starts at 10:00) do not trigger an overlap error. [1c79c09]
- [x] Task: Modify the overlap detection logic in `src/lib/WeeklyView.svelte` (specifically `hasOverlap` assignment and `checkForCollision` function) and `src/lib/TaskForm.svelte` to ensure strict inequalities are used when comparing boundaries. [1c79c09]
- [x] Task: Ensure `src/lib/sesameSync.ts` handles the boundary condition correctly by zeroing out seconds and milliseconds. [1c79c09]
- [x] Task: Implement a 1-minute overlap tolerance in `WeeklyView.svelte`, `TaskForm.svelte`, and `sesameSync.ts` to avoid "invisible" conflicts due to seconds. [1c79c09]
- [x] Task: Fix bug where deleting a task opens the edit modal by stopping pointerdown propagation in `WeeklyColumn.svelte`. [1c79c09]
- [x] Task: Run the test suite to verify all fixes and ensure no regressions. [1c79c09]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Test & Implement Fix' (Protocol in workflow.md) [checkpoint: 9ce7f80]
