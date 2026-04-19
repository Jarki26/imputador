# Implementation Plan: Task Form Snap Buttons

## Phase 1: Core Logic and Store Updates
- [x] Task: Write tests for store helpers that find the previous/next task's end/start time on the same day. 0b10012
- [x] Task: Implement `getPreviousTaskEndTime` and `getNextTaskStartTime` logic in `taskStore` or a related utility. cb2bfcf
- [~] Task: Conductor - User Manual Verification 'Phase 1: Core Logic and Store Updates' (Protocol in workflow.md)

## Phase 2: UI Component Implementation (TaskForm)
- [ ] Task: Write tests for `TaskForm.svelte` to ensure snap buttons are rendered and call the correct update functions.
- [ ] Task: Write tests for `TaskForm.svelte` to ensure snap buttons are disabled when no adjacent task exists.
- [ ] Task: Update `TaskForm.svelte` to include the snap buttons adjacent to the time inputs.
- [ ] Task: Implement the click handlers in `TaskForm.svelte` to update the time inputs using the new store helpers.
- [ ] Task: Add visual feedback (e.g., CSS transition/highlight) when a snap occurs.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Component Implementation (TaskForm)' (Protocol in workflow.md)