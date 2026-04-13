# Implementation Plan: Configurable Excel Export & Import Foundation

## Phase 1: Setup & Core Stores
- [x] Task: Evaluate and install an Excel manipulation library (e.g., `xlsx` / SheetJS). [3a705c5]
- [x] Task: Create tests for `exportConfigStore` to handle bidirectional template mapping and task type exclusions. [9045eee]
- [x] Task: Implement `exportConfigStore` with local persistence (IndexedDB/localStorage) to save the template configuration. [9045eee]
- [x] Task: Create tests for the core Excel export service (filtering tasks, mapping to template). [e101e9b]
- [x] Task: Implement the core Excel export service logic (without UI). [e101e9b]
- [x] Task: Conductor - User Manual Verification 'Setup & Core Stores' (Protocol in workflow.md) [c1d344a]

## Phase 2: Configuration UI
- [x] Task: Create tests for Export Settings UI components (Template builder, Task Type filter). [c48c9fe]
- [x] Task: Implement Export Settings section to allow users to define column mappings (dynamic fields, fixed values). [76c5ae3]
- [x] Task: Implement Task Type exclusion filter UI within Export Settings. [76c5ae3]
- [x] Task: Conductor - User Manual Verification 'Configuration UI' (Protocol in workflow.md) [20eb56c]

## Phase 3: Export Trigger UI & Integration [checkpoint: aad24e5]
- [x] Task: Create tests for the Date Range Selection dialog and Export trigger button. [a2d1074]
- [x] Task: Implement Export button in the application (e.g., Header or Settings). [3c65b98]
- [x] Task: Implement Date Range Selection dialog that appears when Export is clicked. [3c65b98]
- [x] Task: Integrate Date Range dialog with the core Excel export service to generate and download the `.xlsx` file. [3c65b98]
- [x] Task: Conductor - User Manual Verification 'Export Trigger UI & Integration' (Protocol in workflow.md) [aad24e5]