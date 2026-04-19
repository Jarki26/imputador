# Implementation Plan: UI/UX Improvements for Weekly Mode and Modals

## Phase 1: Task Block Text Selection [checkpoint: c8fc385]
- [x] Task: Disable text selection on task blocks (e643633)
    - [ ] Locate the CSS classes for task blocks in the Weekly View (e.g., `WeeklyColumn.svelte` or `WeeklyView.svelte`).
    - [ ] Apply `user-select: none;` to the relevant task block styles.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Task Block Text Selection' (Protocol in workflow.md) (c8fc385)

## Phase 2: Modal Closing Behavior
- [ ] Task: Update Modal component backdrop click logic
    - [ ] Modify `Modal.svelte` to correctly handle `mousedown` and `mouseup` events.
    - [ ] Ensure the modal only closes when the user intentionally clicks the backdrop (starting and ending the click outside the modal content).
- [ ] Task: Update Modal tests
    - [ ] Add/update unit tests in `Modal.spec.ts` to verify the new robust closing behavior.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Modal Closing Behavior' (Protocol in workflow.md)