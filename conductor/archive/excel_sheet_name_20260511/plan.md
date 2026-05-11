# Implementation Plan: Parameterizable Excel Sheet Name

## Phase 1: Configuration Store Updates [checkpoint: 02c6216]
- [x] Task: Update `configStore` to include `excelSheetName` with a default of "Hoja1". [2798cfc]
    - [x] Update `src/lib/configStore.ts` types and default values.
    - [x] Add unit tests in `src/lib/configStore.spec.ts` for the new setting.
- [-] Task: Update `exportConfigStore` to use the new setting. (Not needed, integrated into ConfigStore for consistency)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Configuration Store Updates' (Protocol in workflow.md) [02c6216]

## Phase 2: UI Implementation
- [x] Task: Add the configuration field to the UI. [e177bd7]
    - [x] Modify `src/lib/ExportSettings.svelte` to include a text input labeled "Nombre hoja".
    - [x] Bind the input to the `excelSheetName` config value.
    - [x] Add UI tests in `src/lib/ExportSettings.spec.ts` for the new field.
- [x] Task: Conductor - User Manual Verification 'Phase 2: UI Implementation' (Protocol in workflow.md) [e177bd7]

## Phase 3: Export Logic Update
- [x] Task: Update `exportService` to use the configured sheet name. [d0c0c9c]
    - [x] Modify `src/lib/exportService.ts` to pass the `excelSheetName` from config when generating the Excel file.
    - [x] Add/update unit tests in `src/lib/exportService.spec.ts` to verify the sheet name is applied correctly.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Export Logic Update' (Protocol in workflow.md) [d0c0c9c]