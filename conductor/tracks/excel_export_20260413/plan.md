# Implementation Plan: Configurable Excel Export & Import Foundation

## Phase 1: Setup & Core Stores
- [ ] Task: Evaluate and install an Excel manipulation library (e.g., `xlsx` / SheetJS).
- [ ] Task: Create tests for `exportConfigStore` to handle bidirectional template mapping and task type exclusions.
- [ ] Task: Implement `exportConfigStore` with local persistence (IndexedDB/localStorage) to save the template configuration.
- [ ] Task: Create tests for the core Excel export service (filtering tasks, mapping to template).
- [ ] Task: Implement the core Excel export service logic (without UI).
- [ ] Task: Conductor - User Manual Verification 'Setup & Core Stores' (Protocol in workflow.md)

## Phase 2: Configuration UI
- [ ] Task: Create tests for Export Settings UI components (Template builder, Task Type filter).
- [ ] Task: Implement Export Settings section to allow users to define column mappings (dynamic fields, fixed values).
- [ ] Task: Implement Task Type exclusion filter UI within Export Settings.
- [ ] Task: Conductor - User Manual Verification 'Configuration UI' (Protocol in workflow.md)

## Phase 3: Export Trigger UI & Integration
- [ ] Task: Create tests for the Date Range Selection dialog and Export trigger button.
- [ ] Task: Implement Export button in the application (e.g., Header or Settings).
- [ ] Task: Implement Date Range Selection dialog that appears when Export is clicked.
- [ ] Task: Integrate Date Range dialog with the core Excel export service to generate and download the `.xlsx` file.
- [ ] Task: Conductor - User Manual Verification 'Export Trigger UI & Integration' (Protocol in workflow.md)