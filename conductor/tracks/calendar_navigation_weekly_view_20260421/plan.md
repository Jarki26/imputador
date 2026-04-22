# Implementation Plan: Calendar Navigation Icon for Weekly View

## Phase 1: Custom Calendar UI Component (DatePicker) [checkpoint: abe375a]
- [x] Task: Write tests for a new `DatePicker.svelte` component ensuring it renders the grid, navigation, and 'Today' shortcut (Red Phase). eadd716
- [x] Task: Implement `DatePicker.svelte` with Material Design 3 styling and localized date formatting (Green Phase). a5ec9b3
- [x] Task: Implement the "Today" shortcut logic within `DatePicker.svelte` (Green Phase). a5ec9b3
- [x] Task: Add i18n translation keys for the calendar UI (e.g., month names, "Today" button, aria-labels) across supported languages (Green Phase). b663af8
- [x] Task: Conductor - User Manual Verification 'Phase 1: Custom Calendar UI Component' (Protocol in workflow.md) abe375a

## Phase 2: Integration with Weekly View
- [x] Task: Write tests in `WeeklyView.spec.ts` for the new calendar icon button and modal interaction (Red Phase). 2031375 (Update: in WeeklyView.navigation.spec.ts)
- [x] Task: Add the calendar icon button to the `WeeklyView` header, horizontally positioned between the prev/next arrows (Green Phase). bf0dd28
- [x] Task: Integrate the `DatePicker` component inside a `Modal` overlay in `WeeklyView`, triggered by the new icon button (Green Phase). ed9a080
- [x] Task: Connect the `DatePicker` selection events (including "Today") to instantly update the central `selectedDate` state and close the modal (Green Phase). ed9a080
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Integration with Weekly View' (Protocol in workflow.md)