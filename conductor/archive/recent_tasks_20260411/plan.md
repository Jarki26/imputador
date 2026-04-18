# Implementation Plan - Project Management and Recent Tasks

## Phase 1: Core Configuration and Store Logic (TDD) [checkpoint: 20037b4]

- [x] **Task: Parametrizable Task Types** 63c7992
  - [x] Create a `src/lib/config.ts` to define the array of available task types and their properties (e.g., `isBillable`).
  - [x] Write unit tests to ensure the configuration is structured correctly and "Rest" is identifiable.
- [x] **Task: History Purger Logic** 5fdd4ba
  - [x] Write failing tests in `taskStore.spec.ts` for a function that identifies and deletes recent tasks not used in the last 14 days.
  - [x] Implement the purger function in `TaskStore`.
  - [x] Integrate the purger to run automatically upon saving a new task.
- [x] **Task: Conductor - User Manual Verification 'Core Configuration and Store Logic (TDD)' (Protocol in workflow.md)**

## Phase 2: UI Integration [checkpoint: d66f88f]

- [x] **Task: Task Types UI Update** 96b2e51
  - [x] Update `TaskForm.svelte` to dynamically render the task type `<select>` options from `src/lib/config.ts`.
- [x] **Task: Recent Tasks UI** 6f172f5
  - [x] Write failing tests for rendering a dedicated "Recent Tasks" dropdown in `TaskForm.svelte`.
  - [x] Implement logic in `TaskStore` to fetch the last 10 unique used tasks.
  - [x] Implement the dropdown UI in `TaskForm.svelte`.
  - [x] Add an event handler so that selecting a recent task populates the Title, Description, Project, and Task Type fields.
- [x] **Task: Conductor - User Manual Verification 'UI Integration' (Protocol in workflow.md)**

## Phase 3: Finalization [checkpoint: 3dfde12]

- [x] **Task: Update Pending Tasks Document** b0cbf57
  - [x] Open `conductor/tareas_pendientes.md`.
  - [x] Mark the items under "2. Gestión de Proyectos y Tareas Recientes" as completed (change `[ ]` to `[x]`).
- [x] **Task: Conductor - User Manual Verification 'Finalization' (Protocol in workflow.md)**
