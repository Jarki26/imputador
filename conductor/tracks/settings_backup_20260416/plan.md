# Implementation Plan: Settings Backup & Restore (JSON)

## Phase 1: Core Logic & Service
Implement the underlying service to handle JSON generation and parsing, and integrate it with the existing stores.

- [ ] **Task: Create `settingsService.ts` and Basic Tests**
    - [ ] Write unit tests for `settingsService.exportData()` to ensure it collects data from all stores.
    - [ ] Write unit tests for `settingsService.importData(json)` to ensure it validates the schema.
    - [ ] Implement `settingsService.ts` with `exportData` and `importData` functions.
- [ ] **Task: Implement Store Integration for Import**
    - [ ] Write tests for `importData` to ensure it correctly calls `set` or `update` on `configStore`, `companyStore`, `projectStore`, and `exportConfigStore`.
    - [ ] Implement the store updates in `settingsService.ts`.
- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Core Logic' (Protocol in workflow.md)**

## Phase 2: UI Integration
Add the export/import controls to the Settings modal.

- [ ] **Task: Update `Settings.svelte` with Backup & Restore Section**
    - [ ] Add the "Backup & Restore" heading.
    - [ ] Add the "Export Settings" button and link it to the service.
    - [ ] Add a hidden file input and an "Import Settings" button to trigger it.
- [ ] **Task: Add Import Confirmation & Feedback**
    - [ ] Implement a confirmation prompt before overwriting settings (since it's a destructive "Full Overwrite").
    - [ ] Add success/error notifications using the existing UI patterns (if any, otherwise standard alerts for now).
- [ ] **Task: Conductor - User Manual Verification 'Phase 2: UI Integration' (Protocol in workflow.md)**
