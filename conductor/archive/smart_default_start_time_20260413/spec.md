# Specification: Smart Default Start Time for New Tasks

## 1. Overview
The goal of this track is to improve the user experience when creating new tasks by automatically defaulting the "Start Time" field to the end time of the most relevant preceding task. This minimizes manual data entry and helps maintain a gapless time log.

## 2. Functional Requirements
- **Weekly View Context:** When a user clicks an empty slot in the Weekly View grid to add a task, the system must identify the task that immediately precedes the clicked time slot on that specific day.
- **Daily View Context:** When a user clicks the "Add Task" button in the Daily View, the system must identify the task with the absolute latest chronological end time for that day.
- **Default Start Time Logic:**
  - If a relevant preceding task is found (based on the view context), the new task's Start Time must default to the End Time of that preceding task.
  - This adjustment occurs regardless of the duration/gap between the preceding task and the clicked time slot.
  - If no preceding task exists on that day, the Start Time must default to the time of the clicked slot (in Weekly View) or 00:00 (if no specific time context is available).
- **End Time Logic:** The default End Time should continue to follow the existing logic (e.g., maintaining a default duration or snapping to the next block), ensuring it remains chronologically valid relative to the newly calculated Start Time.

## 3. Non-Functional Requirements
- The calculation of the default start time must be performant and happen instantly upon triggering the task creation modal.

## 4. Acceptance Criteria
- **AC1:** In the Weekly View, clicking an empty slot below an existing task automatically sets the modal's Start Time to that existing task's End Time.
- **AC2:** In the Daily View, clicking "Add Task" automatically sets the modal's Start Time to the End Time of the latest task recorded for that day.
- **AC3:** If no tasks exist on the target day, the Start Time defaults to the clicked slot's time (Weekly View) or 00:00 (Daily View).
- **AC4:** The adjustment happens unconditionally, even if the clicked slot is several hours after the previous task.