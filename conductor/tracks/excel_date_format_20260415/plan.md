# Implementation Plan: Custom Excel Date Format

## Phase 1: State Management (Configuration Store) [checkpoint: a6c8a6c]
- [x] Task: Write failing tests for extending the configuration store with `excelDateFormat` property. 8b332c8
- [x] Task: Implement the `excelDateFormat` property in the configuration store, defaulting to `DD/MM/YYYY`. bca1175
- [x] Task: Conductor - User Manual Verification 'Phase 1: State Management (Configuration Store)' (Protocol in workflow.md) a6c8a6c

## Phase 2: UI Implementation (Settings Screen) [checkpoint: 37dc5d9]
- [x] Task: Write failing tests for adding a new text input for Date Format in the Excel Settings UI. 601373d
- [x] Task: Implement the Date Format input field, binding it to the `excelDateFormat` state, and showing a hint/placeholder. e98acb5
- [x] Task: Conductor - User Manual Verification 'Phase 2: UI Implementation (Settings Screen)' (Protocol in workflow.md) 37dc5d9

## Phase 3: Integration (Export Logic) [checkpoint: f2c8b35]
- [x] Task: Write failing tests for the Excel export service to utilize the configured `excelDateFormat` when serializing dates. 5eba35c
- [x] Task: Update the Excel export service logic to format output dates using the `dayjs` instance with the `excelDateFormat` string. f941a45
- [x] Task: Conductor - User Manual Verification 'Phase 3: Integration (Export Logic)' (Protocol in workflow.md) f2c8b35

## Phase 4: Integration (Import Logic & Error Handling)
- [x] Task: Write failing tests for the Excel import service to parse incoming dates using the configured `excelDateFormat`. 30cc614
- [x] Task: Update the Excel import service to strictly parse dates using `excelDateFormat`. 30cc614
- [x] Task: Write failing tests for adding a warning message to the import result window when date parsing fails. fbc33bc
- [x] Task: Implement the warning message logic, displaying the configured format as a reminder ONLY when a date fails to parse. fbc33bc
- [~] Task: Conductor - User Manual Verification 'Phase 4: Integration (Import Logic & Error Handling)' (Protocol in workflow.md)