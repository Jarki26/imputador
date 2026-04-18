# Implementation Plan: Code Segmentation and Complexity Reduction

## Phase 1: Sub-component Extraction for WeeklyView [checkpoint: 2ea4921]

- [x] Task: Extract Weekly Header Component (213c7ea)
  - [x] Sub-task: Identify and isolate the header section (navigation, goal progress, totals) in `src/lib/WeeklyView.svelte`.
  - [x] Sub-task: Create a new test file `src/lib/WeeklyHeader.spec.ts` with failing tests for the extracted component's properties and events (Red Phase).
  - [x] Sub-task: Create `src/lib/WeeklyHeader.svelte` and implement the logic to pass tests (Green Phase).
  - [x] Sub-task: Refactor `src/lib/WeeklyView.svelte` to use the new component.
- [x] Task: Extract Weekly Grid and Columns (5e9230f)
  - [x] Sub-task: Isolate the main grid and daily column logic from `src/lib/WeeklyView.svelte`.
  - [x] Sub-task: Write tests for a new `WeeklyColumn` component in `src/lib/WeeklyColumn.spec.ts` (Red Phase).
  - [x] Sub-task: Create `src/lib/WeeklyColumn.svelte` handling task rendering within a day (Green Phase).
  - [x] Sub-task: Update `src/lib/WeeklyView.svelte` to integrate the column component.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Sub-component Extraction for WeeklyView' (Protocol in workflow.md) (62c042f)

## Phase 2: Modularize Store Logic [checkpoint: 4edbdad]

- [x] Task: Segment Task Store (7f2bcc0)
  - [x] Sub-task: Analyze `src/lib/taskStore.ts` to identify distinct domains (e.g., core state, collision logic, smart fill).
  - [x] Sub-task: Create new test files for extracted helper modules (e.g., `taskStore.collision.spec.ts`) (Red Phase).
  - [x] Sub-task: Extract logic into pure functions or sub-stores (e.g., `src/lib/taskStore.collision.ts`) (Green Phase).
  - [x] Sub-task: Refactor `src/lib/taskStore.ts` to compose these new modules.
- [x] Task: Segment History Store (2910e1d)
  - [x] Sub-task: Extract pure undo/redo state management from Svelte-specific logic in `src/lib/historyStore.svelte.ts`.
  - [x] Sub-task: Ensure tests in `historyStore.spec.ts` pass with the new segmented structure.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Modularize Store Logic' (Protocol in workflow.md) (4edbdad)

## Phase 3: Services and Database Layer Refactoring [checkpoint: 68ff6ad]

- [x] Task: Organize Utility Functions (6175b7a)
  - [x] Sub-task: Review `src/lib/utils.ts` and categorize functions (date manipulation, DOM helpers, etc.).
  - [x] Sub-task: Split into specific utility files (e.g., `src/lib/dateUtils.ts`) and update imports project-wide.
  - [x] Sub-task: Ensure existing utility tests pass.
- [x] Task: Refactor Database Interactivity (96e7507)
  - [x] Sub-task: Abstract IndexedDB interactions in `src/lib/db.ts` to separate query construction from execution.
  - [x] Sub-task: Ensure database tests in `db.spec.ts` remain robust and passing.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Services and Database Layer Refactoring' (Protocol in workflow.md) (68ff6ad)
