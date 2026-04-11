# Specification: UX Improvements - Weekly View (4.1)

## Overview
This track implements the UX improvements for the Weekly View as defined in section 4.1 of the pending tasks. It focuses on task management, navigation, visualization, interaction, and mobile responsiveness. Once completed, the corresponding pending tasks will be marked as done.

## Functional Requirements

### 1. Record Management
- **Delete Task:** Introduce a button to delete tasks directly from the `WeeklyView`.
- **Merge Identical Tasks:** Automatically prompt the user to combine consecutive identical records (same project and task type) into a single record.
- **Copy to Recents (Templates):** Allow users to copy existing records to the recent tasks history via a **Long Press** action on the task card.

### 2. Navigation & Visualization
- **Week Navigation:** Add a functional arrow selector to navigate between previous and next weeks.
- **Daily View Access:** Clicking/tapping the header of a specific day in the weekly view must navigate to the detailed Daily View for that date.
- **Mobile Time Column:** Ensure the time/hours column remains visible on mobile devices by implementing a **Floating Overlay** that stays visible during horizontal scrolling.
- **Scale Adjustments:** Fix visual proportions so that task cells accurately reflect duration (e.g., a 30-minute task must occupy exactly 50% of the height of an hour cell).

### 3. Interaction & Control
- **No-Gap Sequencing:** When moving a task near another, display a **Confirmation Popup** suggesting automatic snapping to avoid time gaps.
- **Action Lock Switches:** Implement **Floating Buttons** on touch devices to act as toggle switches for locking specific actions (e.g., locking editing, moving, or accidental creation) to prevent touch misclicks.
- **Edit Logic Correction:** Fix the task division/displacement logic when editing records directly from the weekly view (currently broken or missing compared to the daily form logic).

### 4. Post-Implementation Documentation
- Update `conductor/tareas_pendientes.md` to mark all items under section 4.1 as completed (`[x]`).

## Acceptance Criteria
- All features listed above are fully functional in `WeeklyView.svelte`.
- Mobile layout works flawlessly without horizontal scrolling issues.
- `tareas_pendientes.md` is updated at the end of the track.

## Out of Scope
- Changes to other components (`TaskForm.svelte`) outside of the weekly view context.
- Implementing features from sections 4.2, 4.3, or 5 of the pending tasks list.