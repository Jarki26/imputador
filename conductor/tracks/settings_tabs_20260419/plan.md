# Implementation Plan: Tabbed Settings Menu

## Phase 1: Infrastructure and Layout
- [x] Task: Create Vertical Tabs Layout Component 9237a76
    - [x] Create a `Tabs` component or structure within `Settings.svelte`.
    - [x] Implement state management to track the active tab.
    - [x] Add basic styling for the vertical sidebar and content area based on Material Design 3 guidelines.
- [x] Task: Refactor Settings.svelte Structure 9237a76
    - [x] Move existing `form-group` and components into logical tab content sections.
    - [x] Ensure the main 'Save' button and state behavior works gracefully with the new layout.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure and Layout' (Protocol in workflow.md) 9237a76

## Phase 2: Category Integration
- [x] Task: Integrate "General" Category 9237a76
    - [x] Move Weekly Target, Language select, and Task Color Settings into the General tab.
- [x] Task: Integrate "Task Options" Category 9237a76
    - [x] Move `CompanySettings` and `BulkEdit` into this tab.
- [x] Task: Integrate "Data Management" Category 9237a76
    - [x] Move `ExportSettings` and `BackupSettings` into this tab.
- [x] Task: Integrate "Integrations" Category 9237a76
    - [x] Move `SesameSettings` into this tab.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Category Integration' (Protocol in workflow.md) 9237a76

## Phase 3: Polish and Verification
- [x] Task: Design and Responsiveness Polish 9237a76
    - [x] Ensure visual consistency across all newly created tab contents (margins, paddings).
    - [x] Test and fix layout issues on smaller screens (e.g., stacking or scrolling for the sidebar).
- [x] Task: Update Unit Tests 9237a76
    - [x] Update `Settings.spec.ts` to reflect the new tabbed structure and ensure components render correctly based on the active tab.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Polish and Verification' (Protocol in workflow.md) 9237a76