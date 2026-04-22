# Implementation Plan: Configurable Excel Export Filename Format [checkpoint: d910ad3]

## Phase 1: Data Layer & Formatting Logic
- [x] Task: Write tests for saving/loading the export filename format in `configStore` and formatting logic in `exportService` (Red Phase). (5e68938)
- [x] Task: Implement `getExcelFilenameFormat` and `setExcelFilenameFormat` in `configStore` with the default value fallback (Green Phase). (5e68938)
- [x] Task: Implement token replacement logic (`{START_YYYY}`, `{END_MM}`, etc.) in `exportService` to generate the correct filename based on the date range (Green Phase). (5e68938)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Data Layer & Formatting Logic' (Protocol in workflow.md) (d910ad3)

## Phase 2: Settings UI Integration
- [ ] Task: Write tests for the new filename format input field and real-time validation in `ExportSettings` (Red Phase).
- [ ] Task: Add the text input to `ExportSettings.svelte`, including validation for invalid OS characters (`/ \ : * ? " < > |`) that shows an error message and disables saving (Green Phase).
- [ ] Task: Integrate the new setting into the `save` workflow and ensure it's passed down from `+page.svelte` (Green Phase).
- [ ] Task: Add i18n translation keys for the new label, help text, and validation error message (Green Phase).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Settings UI Integration' (Protocol in workflow.md)