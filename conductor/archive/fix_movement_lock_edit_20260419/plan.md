# Implementation Plan: Fix Editing Blocked by Movement Lock

## Phase 1: Test & Implement Fix [checkpoint: 2b2c1d2]

- [x] Task: Write failing test in `src/lib/WeeklyView.spec.ts` asserting that clicking a task opens the edit modal even when `locks.move` is true. [2b2c1d2]
- [x] Task: Modify `src/lib/WeeklyView.svelte` to ensure the `locks.move` state does not prevent the click event from triggering the edit action, while still preventing dragging. [2b2c1d2]
- [x] Task: Run tests to verify the fix works and doesn't break dragging behavior. [2b2c1d2]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Test & Implement Fix' (Protocol in workflow.md) [2b2c1d2]
