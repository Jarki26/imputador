# Implementation Plan: Weekly Goals and Visualization

## Phase 1: Core Configuration and Persistence [checkpoint: daf6f4d]
- [x] Task: Create Settings UI to accept weekly hours target (1-60). 288bd27
    - [x] Write failing tests for UI input validation and default value (41h).
    - [x] Implement Settings UI component with input validation.
    - [x] Refactor and verify tests pass.
- [x] Task: Integrate Settings UI with IndexedDB for persistence. 9ab0fe2
    - [x] Write failing tests for loading/saving weekly target to/from IndexedDB.
    - [x] Implement IndexedDB integration for the weekly target.
    - [x] Refactor and verify tests pass.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Core Configuration and Persistence' (Protocol in workflow.md) daf6f4d

## Phase 2: Weekly View Integration [checkpoint: 97507bb]
- [x] Task: Calculate total logged hours for the current week. 1d3ac8a
    - [x] Write failing tests for the hour calculation logic.
    - [x] Implement calculation logic aggregating durations of all tasks in the current week.
    - [x] Refactor and verify tests pass.
- [x] Task: Display comparative computation in the Weekly View. c05e8e8
    - [x] Write failing tests ensuring the correct simple text format (e.g., "Logged / Target") is rendered.
    - [x] Implement the text display in the Weekly View component, making it reactive to target/task changes.
    - [x] Refactor and verify tests pass.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Weekly View Integration' (Protocol in workflow.md) 97507bb

## Phase 3: Finalizing track [checkpoint: e2f35e7]
- [x] Task: Update the `conductor/tareas_pendientes.md` file to mark section 3 tasks as completed. ebf4054
- [x] Task: Conductor - User Manual Verification 'Phase 3: Finalizing track' (Protocol in workflow.md) e2f35e7