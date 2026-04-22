# Implementation Plan: Calendar Navigation Icon for Weekly View

## Phase 1: Custom Calendar UI Component (DatePicker)
- [x] Task: Write tests for a new `DatePicker.svelte` component ensuring it renders the grid, navigation, and 'Today' shortcut (Red Phase). eadd716
- [x] Task: Implement `DatePicker.svelte` with Material Design 3 styling and localized date formatting (Green Phase). a5ec9b3
- [x] Task: Implement the "Today" shortcut logic within `DatePicker.svelte` (Green Phase). a5ec9b3
- [~] Task: Add i18n translation keys for the calendar UI (e.g., month names, "Today" button, aria-labels) across supported languages (Green Phase).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Custom Calendar UI Component' (Protocol in workflow.md)

## Phase 2: Integration with Weekly View
- [ ] Task: Write tests in `WeeklyView.spec.ts` for the new calendar icon button and modal interaction (Red Phase).
- [ ] Task: Add the calendar icon button to the `WeeklyView` header, horizontally positioned between the prev/next arrows (Green Phase).
- [ ] Task: Integrate the `DatePicker` component inside a `Modal` overlay in `WeeklyView`, triggered by the new icon button (Green Phase).
- [ ] Task: Connect the `DatePicker` selection events (including "Today") to instantly update the central `selectedDate` state and close the modal (Green Phase).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Integration with Weekly View' (Protocol in workflow.md)