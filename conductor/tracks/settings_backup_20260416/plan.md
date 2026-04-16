# Implementation Plan: Settings Backup & Restore (JSON)

## Phase 1: Core Logic & Service
Implement the underlying service to handle JSON generation and parsing, and integrate it with the existing stores.

- [x] **Task: Create `settingsService.ts` and Basic Tests** (d3051e9)
    - [ ] Write unit tests for `settingsService.exportData()` to ensure it collects data from all stores.
    - [ ] Write unit tests for `settingsService.importData(json)` to ensure it validates the schema.
    - [ ] Implement `settingsService.ts` with `exportData` and `importData` functions.
- [x] **Task: Implement Store Integration for Import** (d3051e9)
    - [x] Write tests for `importData` to ensure it correctly calls `set` or `update` on `configStore`, `companyStore`, `projectStore`, and `exportConfigStore`.
    - [x] Implement the store updates in `settingsService.ts`.
- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Core Logic' (Protocol in workflow.md)**

## Phase 2: UI Integration
Add the export/import controls to the Settings modal.

- [x] **Task: Update `Settings.svelte` with Backup & Restore Section** (edcc516)
    - [x] Add the "Backup & Restore" heading.
    - [x] Add the "Export Settings" button and link it to the service.
    - [x] Add a hidden file input and an "Import Settings" button to trigger it.
- [x] **Task: Add Import Confirmation & Feedback** (edcc516)
    - [x] Implement a confirmation prompt before overwriting settings (since it's a destructive "Full Overwrite").
    - [x] Add success/error notifications using the existing UI patterns (if any, otherwise standard alerts for now).
- [ ] **Task: Conductor - User Manual Verification 'Phase 2: UI Integration' (Protocol in workflow.md)**
