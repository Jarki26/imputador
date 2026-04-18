# Track Specification: Project Management and Recent Tasks

## Overview

This track implements Section 2 of the pending tasks document. It introduces a "Recent Tasks" system to quickly populate the task form, a history purger to maintain a clean database, and parametrizable task types via configuration. It ensures special task types like "Rest" are handled appropriately.

## Functional Requirements

### 1. Recent Tasks System

- **Storage:** The system will track and store the last 10 unique tasks created by the user.
- **UI Integration:** A dedicated dropdown field will be added to `TaskForm.svelte`. Selecting a recent task from this dropdown will automatically populate the form's fields (Title, Description, Project, Task Type) with the details of the selected task.

### 2. History Purger

- **Logic:** A mechanism to clean up the recent tasks history. Any task in the recent history that has not been used (selected or re-saved) in the last 2 weeks (14 days) will be deleted.
- **Trigger:** The purger will run automatically every time a new task is successfully saved.

### 3. Parametrizable Task Types

- **Configuration:** The available task types (e.g., 'General', 'Feature', 'Bug', 'Rest', 'Meeting') will be defined in a configuration file or constants file (e.g., `src/lib/config.ts`), making it easy for the user to modify manually without diving into component code.
- **"Rest" Type Handling:** The configuration will support a flag (e.g., `isBillable: boolean`) to distinguish standard tasks from special tasks like "Rest". This ensures "Rest" can be appropriately filtered or styled later.

## Non-Functional Requirements

- **Performance:** The history purger should run efficiently in the background (or after save) without blocking the UI or noticeably delaying the task saving process.

## Acceptance Criteria

- [ ] A dedicated dropdown for "Recent Tasks" appears in the `TaskForm`.
- [ ] Selecting a recent task correctly populates all relevant form fields.
- [ ] The system accurately maintains the list of the 10 most recent unique tasks.
- [ ] The history purger correctly removes tasks older than 14 days upon saving a new task.
- [ ] Task types are loaded from a central configuration and no longer hardcoded in the `TaskForm`.
- [ ] The "Rest" task type has a distinct configuration flag (e.g., non-billable).

## Out of Scope

- A dedicated UI for managing Task Types (this remains manual configuration).
- Weekly Goals and Comparative Computation (Section 3).
