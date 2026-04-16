# Implementation Plan: Bulk Task & Project Editor

## Phase 1: Foundation & Data Layer [checkpoint: 7363392]
- [x] Task: Extend `taskStore` with `bulkUpdate` logic. (9527fd0)
    - [x] Create `src/lib/taskStore.bulk.spec.ts` for TDD.
    - [x] Implement `taskStore.bulkUpdate(filter, updates)` to modify multiple tasks in a single transaction.
    - [x] Ensure it supports the Undo/Redo system.
- [x] Task: Extend `projectStore` with `renameProject` logic. (cc41abc)
    - [x] Create `src/lib/projectStore.rename.spec.ts` for TDD.
    - [x] Implement `projectStore.renameProject(oldName, newName)` to update the projects list.
    - [x] Coordinate with `taskStore` to update tasks when a project is renamed.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Foundation & Data Layer' (7363392)

## Phase 2: UI Components
- [x] Task: Create `BulkEdit` base component. (e8a4600)
    - [ ] Create `src/lib/BulkEdit.svelte` and `src/lib/BulkEdit.spec.ts`.
    - [ ] Implement the layout with tabs or sections for "Rename Project" and "Mass Update".
- [ ] Task: Implement Calendar-based Date Range Selector.
    - [ ] Add start and end date pickers to `BulkEdit`.
    - [ ] Ensure dates are formatted correctly for store queries.
- [ ] Task: Implement "Rename Project" UI.
    - [ ] Source project dropdown (from history).
    - [ ] Target project text input.
    - [ ] "Calculate" button to preview changes.
- [ ] Task: Implement "Mass Update Identical Tasks" UI.
    - [ ] Multi-field source template (Title, Project, Company, Type).
    - [ ] Multi-field target inputs.
    - [ ] "Calculate" button to preview changes.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Components' (Protocol in workflow.md)

## Phase 3: Integration & Safety
- [ ] Task: Integrate into Settings View.
    - [ ] Add a new navigation item or section in `Settings.svelte`.
    - [ ] Ensure `BulkEdit` is accessible and properly styled.
- [ ] Task: Implement Preview & Confirmation.
    - [ ] Show a modal or inline summary with the count of tasks to be modified.
    - [ ] Implement the final "Apply" action with a confirmation prompt.
- [ ] Task: Final Validation & UX Polish.
    - [ ] Verify Undo/Redo works for the entire bulk operation.
    - [ ] Ensure mobile responsiveness.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Integration & Safety' (Protocol in workflow.md)
