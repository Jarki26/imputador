# Implementation Plan

## Phase 1: Implement Quick Click Detection Logic

- [x] Task: TDD - Write failing tests for Quick Click detection (9cd1c8c)
  - [x] Add tests to `WeeklyView.spec.ts` to simulate a `pointerdown` followed by `pointerup` on a task.
  - [x] Assert that the edit modal opens when the time between down/up is < 200ms and movement is < 5px.
  - [x] Assert that the edit modal DOES NOT open if time is > 200ms (long press).
  - [x] Assert that the edit modal DOES NOT open if the distance between down and up is > 5px (drag).
- [x] Task: Implement Quick Click logic in `WeeklyView` / `WeeklyColumn` (9cd1c8c)
  - [x] Add state variables to track `pointerDownStartTime` and `pointerDownPosition` (x, y) when `handlePointerDown` is fired.
  - [x] Update `handlePointerUp` to calculate the elapsed time and distance moved since `pointerdown`.
  - [x] Trigger the edit modal only if the calculated time and distance fall within the allowed thresholds (Quick Click).
  - [x] Ensure existing drag and long-press behaviors remain unaffected.
- [x] Task: Refactor and Verify (9cd1c8c)
  - [x] Refactor the new state logic to be clean and readable using Svelte 5 runes.
  - [x] Verify that all tests pass.
- [ ] Task: Conductor - User Manual Verification 'Implement Quick Click Detection Logic' (Protocol in workflow.md)
