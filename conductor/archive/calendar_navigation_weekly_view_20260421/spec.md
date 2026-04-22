# Specification: Calendar Navigation Icon for Weekly View

## Overview
This feature introduces a new "Calendar" icon button positioned between the "Previous Week" and "Next Week" navigation arrows in the Weekly View header. Clicking this icon opens a custom-built calendar modal, allowing users to select a specific date. Upon selection, the modal instantly closes, and the Weekly View updates to display the week containing the chosen date.

## Functional Requirements
- **UI Placement:** A new icon button (e.g., a calendar or date icon) must be added horizontally between the `<` (Previous Week) and `>` (Next Week) buttons in the `WeeklyView` header.
- **Modal Trigger:** Clicking the calendar icon must open a modal overlay containing a custom-built calendar interface.
- **Custom Calendar UI:**
  - The calendar must visually match the application's Material Design 3 theme.
  - It must display a standard monthly grid (days of the week, dates).
  - It must include controls to navigate between months and years within the modal itself.
  - The currently selected/active date must be visually highlighted.
  - The current day (today) must have a distinct visual indicator.
  - **Today Shortcut:** The calendar UI must include a distinct shortcut button (e.g., "Hoy" or "Today") to instantly navigate back to the current day.
- **Selection Behavior (Instant Update):** Clicking any date cell (or the "Today" shortcut) within the custom calendar must:
  1. Immediately close the modal overlay.
  2. Update the application's central `selectedDate` state to the chosen date.
  3. Trigger the `WeeklyView` to re-render, displaying the full week that includes the newly selected date.

## Non-Functional Requirements
- **Accessibility:** 
  - The calendar icon must have a descriptive `aria-label` (e.g., "Seleccionar fecha" / "Select date").
  - The custom calendar modal must be keyboard accessible (tab navigation, Enter/Space to select).
- **Internationalization (i18n):** The aria-labels, modal title, any text within the calendar (month names, day initials), and the "Today" button must be localized using the existing i18n system.

## Acceptance Criteria
- [ ] A calendar icon button is visible between the navigation arrows in the Weekly View.
- [ ] Clicking the icon opens a custom-styled calendar modal.
- [ ] The calendar modal allows navigation through months/years.
- [ ] The calendar modal includes a functional "Today" shortcut button.
- [ ] Clicking a specific date (or "Today") in the modal instantly closes it and updates the Weekly View to show that date's week.
- [ ] The new UI components are fully localized and accessible.

## Out of Scope
- A full-page monthly calendar view (this is strictly a navigation modal).
- Selecting ranges (start/end dates) within the modal (only single-date selection is needed to jump to a week).