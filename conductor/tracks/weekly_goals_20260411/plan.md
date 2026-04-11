# Implementation Plan: Weekly Goals and Visualization

## Phase 1: Core Configuration and Persistence
- [ ] Task: Create Settings UI to accept weekly hours target (1-60).
    - [ ] Write failing tests for UI input validation and default value (41h).
    - [ ] Implement Settings UI component with input validation.
    - [ ] Refactor and verify tests pass.
- [ ] Task: Integrate Settings UI with IndexedDB for persistence.
    - [ ] Write failing tests for loading/saving weekly target to/from IndexedDB.
    - [ ] Implement IndexedDB integration for the weekly target.
    - [ ] Refactor and verify tests pass.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core Configuration and Persistence' (Protocol in workflow.md)

## Phase 2: Weekly View Integration
- [ ] Task: Calculate total logged hours for the current week.
    - [ ] Write failing tests for the hour calculation logic.
    - [ ] Implement calculation logic aggregating durations of all tasks in the current week.
    - [ ] Refactor and verify tests pass.
- [ ] Task: Display comparative computation in the Weekly View.
    - [ ] Write failing tests ensuring the correct simple text format (e.g., "Logged / Target") is rendered.
    - [ ] Implement the text display in the Weekly View component, making it reactive to target/task changes.
    - [ ] Refactor and verify tests pass.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Weekly View Integration' (Protocol in workflow.md)

## Phase 3: Finalizing track
- [ ] Task: Update the `conductor/tareas_pendientes.md` file to mark section 3 tasks as completed.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Finalizing track' (Protocol in workflow.md)