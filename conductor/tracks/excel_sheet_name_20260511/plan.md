# Implementation Plan: Parameterizable Excel Sheet Name

## Phase 1: Configuration Store Updates
- [ ] Task: Update `configStore` to include `excelSheetName` with a default of "Hoja1".
    - [ ] Update `src/lib/configStore.ts` types and default values.
    - [ ] Add unit tests in `src/lib/configStore.spec.ts` for the new setting.
- [ ] Task: Update `exportConfigStore` to use the new setting.
    - [ ] Update `src/lib/exportConfigStore.ts` to expose `excelSheetName`.
    - [ ] Add unit tests in `src/lib/exportConfigStore.spec.ts`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Configuration Store Updates' (Protocol in workflow.md)

## Phase 2: UI Implementation
- [ ] Task: Add the configuration field to the UI.
    - [ ] Modify `src/lib/ExportSettings.svelte` to include a text input labeled "Nombre hoja".
    - [ ] Bind the input to the `excelSheetName` config value.
    - [ ] Add UI tests in `src/lib/ExportSettings.spec.ts` for the new field.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Implementation' (Protocol in workflow.md)

## Phase 3: Export Logic Update
- [ ] Task: Update `exportService` to use the configured sheet name.
    - [ ] Modify `src/lib/exportService.ts` to pass the `excelSheetName` from config when generating the Excel file.
    - [ ] Add/update unit tests in `src/lib/exportService.spec.ts` to verify the sheet name is applied correctly.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Export Logic Update' (Protocol in workflow.md)