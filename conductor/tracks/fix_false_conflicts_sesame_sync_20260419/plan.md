# Implementation Plan: Fix False Conflicts After Sesame Sync

## Phase 1: Test & Implement Fix

- [ ] Task: Write failing tests in `src/lib/WeeklyView.spec.ts` and `src/lib/sesameSync.integration.spec.ts` asserting that tasks sharing an exact boundary (e.g., Task A ends at 10:00, Task B starts at 10:00) do not trigger an overlap error.
- [ ] Task: Modify the overlap detection logic in `src/lib/WeeklyView.svelte` (specifically `hasOverlap` assignment and `checkForCollision` function) and `src/lib/TaskForm.svelte` to ensure strict inequalities are used when comparing boundaries.
- [ ] Task: Ensure `src/lib/sesameSync.ts` handles the boundary condition correctly to prevent rejecting generated tasks unnecessarily.
- [ ] Task: Run the test suite to verify the fix and ensure no regressions in drag-and-drop collision detection.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Test & Implement Fix' (Protocol in workflow.md)