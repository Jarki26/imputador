# Implementation Plan: Fix Editing Blocked by Movement Lock

## Phase 1: Test & Implement Fix

- [ ] Task: Write failing test in `src/lib/WeeklyView.spec.ts` asserting that clicking a task opens the edit modal even when `locks.move` is true.
- [ ] Task: Modify `src/lib/WeeklyView.svelte` to ensure the `locks.move` state does not prevent the click event from triggering the edit action, while still preventing dragging.
- [ ] Task: Run tests to verify the fix works and doesn't break dragging behavior.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Test & Implement Fix' (Protocol in workflow.md)