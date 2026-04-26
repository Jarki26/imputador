# Specification: Tooltip to Set Current Time in Task Forms

## Overview

This feature introduces a quick-action icon button adjacent to the "Start Time" (Hora Inicio) and "End Time" (Hora Fin) input fields in both the task creation and task update forms. This button allows users to instantly populate the field with the exact current time, streamlining the logging process.

## Functional Requirements

- **UI Element:** A small, recognizable icon button (e.g., a clock or target icon) must be placed inside or immediately next to the time input fields (`start_time` and `end_time`).
- **Tooltip:** When hovering over the icon button, a native browser tooltip (`title` attribute) or a custom styled tooltip displaying the text "Ahora" must appear.
- **Action:** Clicking the icon button must update the associated time input field with the exact current system time in `HH:MM` format.
- **Scope:** This functionality must be available in both the Task Creation form and the Task Update (Edit) form.
- **Reactivity:** Updating the time via this button should trigger the same validation and recalculation logic (e.g., duration updates) as if the user had manually typed the time.

## Non-Functional Requirements

- **Styling:** The icon button must align with the existing Material Design 3 aesthetic of the application (Svelte 5/Vanilla CSS). It should be unobtrusive but easily clickable.
- **Accessibility:** The button must have an `aria-label` attribute (e.g., "Establecer hora actual") for screen readers, and must be accessible via keyboard navigation.

## Acceptance Criteria

- [ ] An icon button is visible next to the "Start Time" input in the Create Task form.
- [ ] An icon button is visible next to the "End Time" input in the Create Task form.
- [ ] An icon button is visible next to the "Start Time" input in the Edit Task form.
- [ ] An icon button is visible next to the "End Time" input in the Edit Task form.
- [ ] Hovering over any of these buttons displays the tooltip "Ahora".
- [ ] Clicking the button accurately sets the corresponding input field to the current exact time (e.g., "14:37").
- [ ] Clicking the button correctly updates the internal state, triggering any dependent calculations (like total duration).

## Out of Scope

- Time rounding (the exact current time is always used).
- Adding this button to other forms or views outside of the main task create/update forms.
