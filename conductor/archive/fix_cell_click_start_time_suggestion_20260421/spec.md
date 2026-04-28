# Specification: Fix Task Start Time Suggestion on Cell Click

## Overview

In the Weekly View, when a user clicks on the empty space within a time cell that already contains one or more tasks, the system incorrectly suggests the start time for the new task based on the last task _before_ the clicked cell. It should instead use the most recent task _within_ the clicked cell. This bug requires the user to manually correct the start time to maintain a gapless log.

## Bug Description

- **Current Behavior:** Clicking an empty space in a cell (e.g., the 10:00 AM cell) that has an existing task (e.g., 10:00 - 10:30) suggests a start time based on a task prior to 10:00 AM, ignoring the task that ends at 10:30 within the cell.
- **Expected Behavior:** The system should evaluate all tasks up to the clicked point or within the clicked cell. The suggested start time for the new task should be the exact end time of the most recent task in that cell (e.g., 10:30).

## Functional Requirements

- **Scope:** Weekly View calendar grid.
- **Trigger:** User clicks on the empty space of a cell to create a new task.
- **Logic Update:** The function responsible for determining the default start time upon cell click must correctly identify the latest task that ends at or before the clicked time within the cell, or simply the latest task in the cell, and use its end time as the start time for the new task.

## Acceptance Criteria

- [ ] In the Weekly View, click the empty space of a cell that contains a task.
- [ ] Verify that the "Start Time" (Hora Inicio) in the task creation modal is correctly pre-filled with the end time of the most recent task in that cell.
- [ ] Verify that clicking a completely empty cell still functions as expected.

## Out of Scope

- Modifications to the Daily View or other creation methods.
- Changes to drag-and-drop or resize logic.
