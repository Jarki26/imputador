# Track Specification: Core Task Registration and IndexedDB Persistence

## Overview
This track focuses on setting up the fundamental infrastructure of the Imputador application. This includes the project scaffolding, the data persistence layer using IndexedDB, and the core UI components for registering tasks.

## Objectives
- Initialize a Svelte + TypeScript project with a robust testing environment.
- Implement a reliable persistence layer using IndexedDB for tasks and projects.
- Build the core UI for task entry, ensuring high usability and immediate feedback.

## Requirements

### Technical Foundation
- **Frontend:** Svelte with TypeScript.
- **Testing:** Vitest for unit and component testing.
- **Styling:** Vanilla CSS following Material Design 3.

### Data Model
- **Task:**
  - `id`: Unique identifier (auto-generated).
  - `title`: String.
  - `description`: String (defaults to title).
  - `project`: String (linked to project autocomplete).
  - `type`: String (selected from a closed list).
  - `startTime`: Date/Time.
  - `endTime`: Date/Time.
- **Project:**
  - `id`: Unique identifier.
  - `name`: String (unique).
  - `lastUsedAt`: Date/Time.

### Persistence Layer
- **IndexedDB Store:**
  - `tasks` store: Indexed by date for fast daily/weekly queries.
  - `projects` store: To support autocomplete and recent project lists.
- **Task Store API:**
  - `addTask(task)`: Persist a new task.
  - `getTasksForDay(date)`: Retrieve all tasks for a specific day.
  - `updateTask(id, updates)`: Update an existing task.
  - `deleteTask(id)`: Remove a task.

### UI Components
- **TaskForm:**
  - Input fields for Title, Description, Project (Autocomplete), and Task Type.
  - Time pickers for Start Time and End Time/Duration.
  - Real-time validation (e.g., end time must be after start time).
- **TaskList:**
  - Display tasks for the current day in a sequential list.
  - Show gaps between tasks clearly.

## Success Criteria
- Automated tests covering >80% of the persistence and logic layers.
- Ability to create, read, update, and delete tasks with persistence across page reloads.
- Responsive and accessible UI following Material Design guidelines.
