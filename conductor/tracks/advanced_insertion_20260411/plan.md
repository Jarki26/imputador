# Implementation Plan - Advanced Insertion and Editing Logic

## Phase 1: Core Algorithms (TDD)
- [ ] **Task: Implement Overwrite Logic in TaskStore**
    - [ ] Write failing tests for splitting an existing task when a new one is inserted (start, middle, and end overlaps).
    - [ ] Implement the overwrite logic, ensuring original task data is preserved in the split segments.
- [ ] **Task: Implement Displacement Logic in TaskStore**
    - [ ] Write failing tests for shifting existing tasks forward when a new one is inserted, verifying durations remain constant.
    - [ ] Implement the displacement logic, ensuring all subsequent conflicting tasks are recursively shifted.
- [ ] **Task: Implement Smart Fill Algorithm**
    - [ ] Write failing tests for calculating available gaps in a day and distributing a total duration into them.
    - [ ] Write failing tests for carrying over remaining duration to the next day when gaps are exhausted.
    - [ ] Implement the Smart Fill logic.
- [ ] **Task: Conductor - User Manual Verification 'Core Algorithms (TDD)' (Protocol in workflow.md)**

## Phase 2: UI Integration (TaskForm & Collision)
- [ ] **Task: Duration Editing UI**
    - [ ] Write failing tests for rendering and updating separate Hours and Minutes inputs in `TaskForm`.
    - [ ] Implement the UI changes in `TaskForm.svelte`.
    - [ ] Implement logic to automatically update the 'End Time' when duration changes based on 'Start Time'.
- [ ] **Task: Collision Detection & Modal**
    - [ ] Write failing tests for intercepting a task save operation when a collision is detected.
    - [ ] Implement the collision detection check before saving in `TaskForm` or a parent component.
    - [ ] Create and integrate a generic modal component or dialog to prompt the user with "Overwrite", "Displacement", or "Cancel".
- [ ] **Task: Integrate Resolution Modes**
    - [ ] Connect the "Overwrite" modal choice to the newly implemented TaskStore overwrite logic.
    - [ ] Connect the "Displacement" modal choice to the newly implemented TaskStore displacement logic.
- [ ] **Task: Conductor - User Manual Verification 'UI Integration (TaskForm & Collision)' (Protocol in workflow.md)**

## Phase 3: Smart Fill UI
- [ ] **Task: Smart Fill Toggle**
    - [ ] Add a "Smart Fill" checkbox to the `TaskForm`.
    - [ ] Adjust form fields dynamically (e.g., hide End Time, require Total Duration) when Smart Fill is active.
- [ ] **Task: Integrate Smart Fill Flow**
    - [ ] Connect the form submission in Smart Fill mode to the backend algorithm.
    - [ ] Handle UI updates (loading state, success message, redirect to view the newly filled days).
- [ ] **Task: Conductor - User Manual Verification 'Smart Fill UI' (Protocol in workflow.md)**

## Phase 4: Finalization
- [ ] **Task: Update Pending Tasks Document**
    - [ ] Open `conductor/tareas_pendientes.md`.
    - [ ] Mark the items under "1. Lógica de Inserción y Edición Avanzada" as completed (change `[ ]` to `[x]`).
- [ ] **Task: Conductor - User Manual Verification 'Finalization' (Protocol in workflow.md)**