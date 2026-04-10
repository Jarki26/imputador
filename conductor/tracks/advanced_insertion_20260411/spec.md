# Track Specification: Advanced Insertion and Editing Logic

## Overview
This track implements the core task insertion capabilities outlined in the project description (Section 1). It focuses on resolving time slot collisions through "Overwrite" (splitting) and "Displacement" (shifting) algorithms. It also introduces a "Smart Fill" mode for distributing large durations across empty slots and adds duration-based editing for tasks.

## Functional Requirements

### 1. Collision Handling (Reactive Modal)
*   When a user attempts to save a new task or edit an existing one that collides with an already logged task, the system must intercept the save operation.
*   A modal dialog must appear presenting the collision and offering two resolution paths: "Insert with Overwrite" or "Insert with Displacement", along with an option to "Cancel" and adjust the times manually.

### 2. Insertion with Overwrite (Splitting)
*   **Logic:** The original conflicting task is divided to accommodate the new task exactly within the specified time range.
*   **Example:** Task A (09:00-11:00) + New Task B (10:00-10:30) results in:
    *   Task A (09:00-10:00)
    *   Task B (10:00-10:30)
    *   Task A (10:30-11:00)

### 3. Insertion with Displacement (Shifting)
*   **Logic:** The new task is inserted, and all subsequent conflicting tasks are shifted forward in time, preserving their original durations. The start time of the conflicting task is pushed to the end time of the newly inserted task.
*   **Example:** Task A (09:00-11:00) + New Task B (10:00-10:30) results in:
    *   Task A (09:00-10:00) (1h duration)
    *   Task B (10:00-10:30) (30m duration)
    *   Task A (10:30-11:30) (1h duration shifted)

### 4. Smart Fill Mode (Gap Filling)
*   **Trigger:** A checkbox/toggle in the TaskForm enables "Smart Fill" mode.
*   **Input:** The user provides a total required duration and a starting date.
*   **Logic:** The system automatically creates multiple task records, filling available empty gaps in the day until the total duration is met.
*   **Overflow Handling:** If the required duration exceeds the available gaps in the current day, the system automatically carries over to the next day, filling gaps there until complete.

### 5. Editing by Duration
*   **Input Mechanism:** Replace strict string parsing with separate numerical input fields for "Hours" and "Minutes" in the TaskForm when editing duration.
*   **Calculation:** Editing the duration automatically updates the Task's "End Time" based on its current "Start Time".

## Non-Functional Requirements
*   Performance: Collision detection and array manipulation (splitting/shifting) should handle days with numerous tasks without noticeable lag.
*   Unit Testing: Rigorous TDD must be applied to the core algorithms (overwrite, displacement, smart fill) in isolation before UI integration.

## Acceptance Criteria
*   [ ] Attempting to overlap tasks triggers a modal asking for the resolution method.
*   [ ] Selecting "Overwrite" successfully splits the existing task(s) and inserts the new one.
*   [ ] Selecting "Displacement" successfully inserts the new task and shifts subsequent tasks, maintaining their durations.
*   [ ] "Smart Fill" mode correctly populates available gaps.
*   [ ] "Smart Fill" successfully carries over to subsequent days if the duration exceeds single-day capacity.
*   [ ] Duration can be edited via separate Hour/Minute inputs, correctly updating the End Time.

## Out of Scope
*   Managing total weekly hours (Section 3 of pending tasks).
*   Recent tasks history (Section 2 of pending tasks).