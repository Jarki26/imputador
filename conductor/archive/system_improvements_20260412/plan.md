# Implementation Plan: System Improvements (Section 4.3)

## Phase 1: "Ausencia Facturable" Task Type [checkpoint: a93dd6d]
- [x] Task: Update task types to include "Ausencia Facturable". 5781f28
- [x] Task: Write tests verifying that "Ausencia Facturable" hours are correctly calculated (counting towards weekly goal, but not daily work hours). 5781f28
- [x] Task: Implement calculation logic in the stores. 5781f28
- [x] Task: Write tests verifying the striped pattern rendering for this task type. 5781f28
- [x] Task: Implement the patterned/striped styling in UI components for the new task type. 5781f28
- [x] Task: Conductor - User Manual Verification 'Phase 1: "Ausencia Facturable" Task Type' (Protocol in workflow.md)

## Phase 2: Undo/Redo System [checkpoint: 6b8f266]
- [x] Task: Define the History Stack state structure (past, present, future) in a new store or extend existing ones. 4ac7823
- [x] Task: Write tests for the Undo/Redo logic (recording state, undoing an action, redoing an action, clearing future on new action). 4ac7823
- [x] Task: Implement the granular Undo/Redo stack logic. 4ac7823
- [x] Task: Write tests for UI integration (Undo/Redo buttons or keyboard shortcuts). 4ac7823
- [x] Task: Implement UI controls for Undo/Redo. 4ac7823
- [x] Task: Conductor - User Manual Verification 'Phase 2: Undo/Redo System' (Protocol in workflow.md)

## Phase 3: Interactive Tutorial [checkpoint: 23eae6d]
- [x] Task: Create a new `Tutorial.svelte` component to act as the overlay/step-by-step guide. 4a764b6
- [x] Task: Write tests verifying the state and navigation of the tutorial steps. 4a764b6
- [x] Task: Implement the tutorial content, covering Basic Entry, Advanced Manipulation, Weekly View, Settings & Undo/Redo. 4a764b6
- [x] Task: Write tests verifying the tutorial can be triggered from Settings/Help. 4a764b6
- [x] Task: Implement the trigger mechanism for the tutorial. 4a764b6
- [x] Task: Conductor - User Manual Verification 'Phase 3: Interactive Tutorial' (Protocol in workflow.md)

## Phase 4: Finalization [checkpoint: a775cdb]
- [x] Task: Update `conductor/tareas_pendientes.md` section 4.3 to mark all items as complete. 89e76ac
- [x] Task: Conductor - User Manual Verification 'Phase 4: Finalization' (Protocol in workflow.md)