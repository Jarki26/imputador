# Specification: Task Form Snap Buttons

## 1. Overview

Introduce "snap" buttons adjacent to the start and end time inputs in the Task Form. These buttons allow users to quickly align the task's start time with the end time of the preceding task, and the end time with the start time of the succeeding task, eliminating gaps between tasks on the same day.

## 2. Functional Requirements

- **Start Time Snap:** A button adjacent to the 'Start Time' input. Clicking it sets the start time to the end time of the chronologically preceding task on the _same day_.
- **End Time Snap:** A button adjacent to the 'End Time' input. Clicking it sets the end time to the start time of the chronologically succeeding task on the _same day_.
- **Visibility & State:** Both buttons must be permanently visible. However, they should be disabled (unclickable/greyed out) if no adjacent task exists in that direction on the same day.
- **Visual Feedback:** Provide a clear visual indicator (e.g., a momentary highlight or transition effect on the time input field) when a snap action is performed.

## 3. UI/UX Details

- **Placement:** Icons/buttons should be placed directly inside or immediately next to the time input fields.
- **Iconography:** Use standard, intuitive icons (e.g., arrows pointing left/right or up/down depending on layout, or a 'magnet' symbol). Use tooltips on hover to explain the action ("Snap to previous task", "Snap to next task").

## 4. Edge Cases

- **No Adjacent Task:** If there is no previous/next task, the corresponding button is disabled, and clicking has no effect.
- **Cross-day constraints:** Snapping must strictly look for tasks on the same date. It cannot snap to the end of a task on the previous day.

## 5. Out of Scope

- Snapping across different days.
- Bulk snapping of multiple tasks.
- Automatically resolving existing overlaps.
