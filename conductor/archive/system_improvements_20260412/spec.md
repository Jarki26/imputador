# Specification: System Improvements (Section 4.3)

## Overview

This track implements the final system improvements defined in section 4.3 of `tareas_pendientes.md`, focusing on user assistance (Undo/Redo and an Interactive Tutorial) and business logic enhancements (Billable Absence task type).

## Functional Requirements

### 1. Undo/Redo System (History Stack)

- Implement a granular Undo/Redo stack that tracks user actions (creation, editing, deletion, displacement, smart fill).
- Provide UI controls (buttons or keyboard shortcuts like Ctrl+Z/Ctrl+Y) to Undo and Redo the last actions.
- The history stack should be maintained per session, tracking state changes.

### 2. Interactive Tutorial

- Implement an interactive, step-by-step tutorial overlay.
- **Scope covered:**
  - Basic Entry (create, edit, delete tasks).
  - Advanced Manipulation (overwrite, displacement, smart fill).
  - Weekly View (navigation, drag-and-drop).
  - Settings (goal configuration) and using the new Undo/Redo system.
- The tutorial should be triggerable manually from a Help/Settings menu.

### 3. "Ausencia Facturable" (Billable Absence) Task Type

- Add a new task type: "Ausencia Facturable" (e.g., paid leave, medical appointment).
- **Business Logic:**
  - It does NOT count as actual "Work" hours in the daily productivity summaries.
  - It DOES count towards fulfilling the weekly goal (effectively deducting from the remaining hours needed to reach the 41h target).
- **Visual Representation:**
  - Rendered with a patterned/striped background in the Weekly View and Daily View to clearly distinguish it from regular work (solid colors) and non-billable rest (muted colors).

## Acceptance Criteria

- [ ] Users can undo and redo a sequence of task manipulations correctly without data corruption.
- [ ] The interactive tutorial can be launched, navigated step-by-step, and closed.
- [ ] Creating an "Ausencia Facturable" task visually applies a striped pattern.
- [ ] "Ausencia Facturable" duration counts towards the weekly goal but is categorized separately from active work.
- [ ] Section 4.3 in `conductor/tareas_pendientes.md` is marked as complete.
