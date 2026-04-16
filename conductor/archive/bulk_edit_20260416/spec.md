# Specification: Bulk Task & Project Editor

## Overview
This track introduces a specialized tool for mass-editing tasks and projects within a user-defined date range. It addresses the need to correct historical data (e.g., when a project was misnamed or when multiple identical tasks need a consistent update) without manual one-by-one editing.

## Functional Requirements

### 1. Tool Access
- A new section "Mantenimiento / Edición Masiva" will be added to the Settings view.

### 2. Date Range Selection
- Users must select a **Start Date** and an **End Date** using a calendar-style selector.

### 3. Bulk Operations

#### A. Rename Project (Broad)
- **Source:** Select an existing project from the autocomplete history.
- **Target:** Enter a new name for the project.
- **Action:**
    - Update the `project` field of ALL tasks within the selected date range that match the source project name.
    - Update the project name in the global `projects` history/autocomplete list.

#### B. Mass Update Identical Tasks (Narrow)
- **Source Template:** Select a combination of `Title`, `Project`, `Company`, and `Task Type` that matches existing tasks.
- **Target Values:** Define the new values for any of these four fields.
- **Action:**
    - Find all tasks in the date range that match the **entire** source template.
    - Update only the specified fields with the new target values.

### 4. Safety & Feedback
- **Summary Preview:** Show a count of how many tasks will be affected before applying.
- **Confirmation:** Require final confirmation.
- **Undo Support:** Operation must be undoable as a single action.

## Acceptance Criteria
- [ ] User can navigate to the Bulk Editor from Settings.
- [ ] User can select a date range using a calendar.
- [ ] Renaming a project "A" to "B" in a range updates all tasks and history.
- [ ] Updating identical tasks only affects tasks that match the template exactly.
- [ ] The operation can be undone.
