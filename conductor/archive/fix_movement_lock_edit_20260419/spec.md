# Specification: Fix Editing Blocked by Movement Lock

## Overview
Currently, activating the "Movement Lock" (`locks.move`) unintentionally prevents users from opening the task edit form by clicking on a task block. The movement lock should strictly prevent dragging the entire task to a new time or day, without interfering with the ability to click and edit the task's properties.

## Functional Requirements
- **Click to Edit:** Clicking on a task block in the Weekly View MUST open the edit form, even if the "Movement Lock" is active.
- **Movement Lock:** The "Movement Lock" MUST continue to prevent dragging the entire task block to a different time or day.
- **Edit Lock:** The "Edit Lock" (`locks.edit`) MUST continue to be the sole lock that prevents opening the edit form via click.

## Acceptance Criteria
1. Given the Movement Lock is active, when a user clicks on a task block, the edit modal opens.
2. Given the Movement Lock is active, when a user attempts to drag a task block to a new time, the task does not move.
3. Given the Edit Lock is active, when a user clicks on a task block, the edit modal does not open.

## Out of Scope
- Modifying the behavior of the "Create Lock" or "Duration Lock".
- Changing the visual design of the lock buttons.