# Implementation Plan: Collision and Long-Press Enhancements

## Phase 1: Collision "Continue Anyway" Functionality
- [ ] Task: Update the `TaskForm` component to replace the "Cancelar" button with "Continuar de todas formas" when a collision warning is triggered.
    - [ ] Sub-task: Modify the modal action buttons in `TaskForm.svelte` to show the new option.
    - [ ] Sub-task: Update `TaskForm.collision.spec.ts` tests to reflect the new button and expected state.
- [ ] Task: Implement the "Continue Anyway" action logic to bypass standard collision prevention.
    - [ ] Sub-task: Adjust the task saving logic to allow the task to be created/updated with an overlap.
    - [ ] Sub-task: Add or update unit tests to verify overlapping tasks are correctly stored when this action is used.
- [ ] Task: Conductor - User Manual Verification 'Collision "Continue Anyway" Functionality' (Protocol in workflow.md)

## Phase 2: Long-Press Displacement Evaluation
- [ ] Task: Integrate displacement validation checks into the long-press event handler.
    - [ ] Sub-task: Update the long-press event handler in `WeeklyView.svelte` (and Daily View if applicable).
    - [ ] Sub-task: Ensure the original "copy to recents" functionality is maintained.
    - [ ] Sub-task: Invoke the existing `suggestFillGaps` and `mergeTasks` logic on the target task without physically moving it.
    - [ ] Sub-task: Write tests to ensure long-press correctly triggers these evaluations.
- [ ] Task: Implement the confirmation dialog for applying long-press evaluations.
    - [ ] Sub-task: If gap-filling or merging is suggested, display a confirmation dialog to the user.
    - [ ] Sub-task: Apply the changes to the store upon user confirmation.
    - [ ] Sub-task: Write tests to verify the UI interaction and subsequent store updates.
- [ ] Task: Conductor - User Manual Verification 'Long-Press Displacement Evaluation' (Protocol in workflow.md)