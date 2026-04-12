# Implementation Plan: System Improvements (Section 4.3)

## Phase 1: "Ausencia Facturable" Task Type
- [ ] Task: Update task types to include "Ausencia Facturable".
- [ ] Task: Write tests verifying that "Ausencia Facturable" hours are correctly calculated (counting towards weekly goal, but not daily work hours).
- [ ] Task: Implement calculation logic in the stores.
- [ ] Task: Write tests verifying the striped pattern rendering for this task type.
- [ ] Task: Implement the patterned/striped styling in UI components for the new task type.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: "Ausencia Facturable" Task Type' (Protocol in workflow.md)

## Phase 2: Undo/Redo System
- [ ] Task: Define the History Stack state structure (past, present, future) in a new store or extend existing ones.
- [ ] Task: Write tests for the Undo/Redo logic (recording state, undoing an action, redoing an action, clearing future on new action).
- [ ] Task: Implement the granular Undo/Redo stack logic.
- [ ] Task: Write tests for UI integration (Undo/Redo buttons or keyboard shortcuts).
- [ ] Task: Implement UI controls for Undo/Redo.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Undo/Redo System' (Protocol in workflow.md)

## Phase 3: Interactive Tutorial
- [ ] Task: Create a new `Tutorial.svelte` component to act as the overlay/step-by-step guide.
- [ ] Task: Write tests verifying the state and navigation of the tutorial steps.
- [ ] Task: Implement the tutorial content, covering Basic Entry, Advanced Manipulation, Weekly View, Settings & Undo/Redo.
- [ ] Task: Write tests verifying the tutorial can be triggered from Settings/Help.
- [ ] Task: Implement the trigger mechanism for the tutorial.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Interactive Tutorial' (Protocol in workflow.md)

## Phase 4: Finalization
- [ ] Task: Update `conductor/tareas_pendientes.md` section 4.3 to mark all items as complete.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Finalization' (Protocol in workflow.md)