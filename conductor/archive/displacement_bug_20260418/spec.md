# Specification: Fix Extra Task Generation on Displacement Drag

## Overview

When dragging a task upwards to an earlier time slot and resolving the resulting overlap using the "Displacement" (Desplazamiento) mode, the system incorrectly generates an extra replica of the dragged task. This replica's duration corresponds to the time difference between the original end time and the new end time after the displacement.

## Scope

- **Track Type:** Bug Fix
- **Affected Views:** Weekly View
- **Affected Operations:** Drag and Drop (Task movement)
- **Affected Modes:** Displacement (Desplazamiento) insertion mode

## Steps to Reproduce

1. Create Task A from 09:00 to 10:00.
2. Create Task B from 10:00 to 11:00.
3. Drag Task B upwards so its new start time is 09:45 and end time is 10:45 (overlapping with Task A).
4. Select the "Displacement" (Desplazamiento) mode to resolve the conflict.
5. **Expected Result:** Task A is adjusted, Task B occupies 09:45-10:45, and any subsequent tasks are pushed down appropriately. No duplicate of Task B should be created.
6. **Actual Result:** The system generates an extra replica of Task B from 11:00 to 11:15 (a duration of 15 minutes, matching the shift amount).

## Functional Requirements

- Dragging a task to overlap with another and selecting "Displacement" must correctly shift the start and end times of the affected/subsequent tasks.
- No duplicate tasks or "ghost" replicas should be created during the displacement operation.
- The displacement logic must correctly calculate the shift and apply it without re-inserting the dragged task's "tail".

## Acceptance Criteria

- [ ] Reproducing the exact steps above results in Task B existing only once from 09:45 to 10:45, and no extra task is created from 11:00 to 11:15.
- [ ] The fix is validated with automated tests covering the displacement scenario during drag-and-drop.
