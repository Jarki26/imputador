# Specification: Fix False Conflicts After Sesame Sync

## Overview

After synchronizing with Sesame, the system automatically generates OFFLINE and REST tasks. These generated tasks often have start and end times that perfectly align with existing tasks (e.g., Task A ends at 10:00 and Task B starts at 10:00). Currently, the system incorrectly flags these perfectly sequential tasks as conflicting or overlapping. This track aims to fix the overlap detection logic so that tasks sharing an exact start/end boundary are recognized as a valid sequence, not an overlap.

## Functional Requirements

- **Accurate Overlap Detection:** The core overlap checking logic MUST correctly evaluate tasks that share a boundary (end time of Task A == start time of Task B) as non-overlapping.
- **Sesame Sync Compatibility:** The fix MUST ensure that after a successful synchronization with Sesame, automatically generated OFFLINE and REST tasks that abut existing user-created tasks do not trigger the `has-overlap` error state.
- **Global Application:** This accurate overlap detection MUST apply consistently across all views (Weekly View, Daily View) and during task manipulation (Drag & Drop, Editing).

## Acceptance Criteria

1. Given a work task that ends at 14:00, when a REST task starts exactly at 14:00 (e.g., via Sesame sync), neither task is marked with an overlap error.
2. Given an OFFLINE task that ends at 09:00, when a work task starts exactly at 09:00, neither task is marked with an overlap error.
3. The system continues to correctly identify and flag true overlaps (e.g., Task A ends at 10:15, Task B starts at 10:00).

## Out of Scope

- Modifying the underlying logic of the Sesame synchronization process itself (data retrieval or task generation logic).
- Changing the visual styling of the `has-overlap` error state.
