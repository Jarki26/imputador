# Specification: Daily Enhancements & Weekly Goal UI

## Overview

This track addresses multiple UI/UX enhancements across the application: introducing daily navigation arrows, enabling task editing directly from the Daily View, ensuring automatic data reloading post-import, and visualizing the remaining weekly time against the configured goal.

## Functional Requirements

### 1. Daily View Navigation Arrows

- **Placement:** The Daily View header must include "Previous Day" and "Next Day" navigation arrows alongside the current date display.
- **Behavior:** Clicking the arrows will shift the current view backward or forward by one calendar day sequentially (including weekends).
- **Data Loading:** The view must reactively load the corresponding day's tasks.

### 2. Daily View Task Editing

- **Trigger:** Clicking anywhere on an existing task block in the Daily View must open the existing `TaskForm` modal, pre-populated with the task's data.
- **Saving Changes:** Saving changes from the modal must update the task and reactively reflect the changes in the Daily View.
- **Consistency:** The editing behavior and logic should mirror the existing implementation used in the Weekly View.

### 3. Excel Import Auto-Reload

- **Action:** Upon successful completion of an Excel import operation via the "Wipe & Import" functionality, the application state (stores) must be reactively updated.
- **Result:** The UI must immediately reflect the newly imported data without requiring a manual browser refresh (F5).

### 4. Weekly View Remaining Time & Progress

- **Placement:** The Weekly View header must display the remaining time required to meet the weekly hours target (default 41h).
- **Calculation:** Accounts for logged billable hours. According to guidelines, "Ausencia Facturable" hours reduce the effective weekly target.
- **Display:** The remaining time must be shown as text (e.g., "Remaining: Xh Ym") alongside a visual Progress Bar indicating completion towards the goal.

## Non-Functional Requirements

- **Reactivity:** State updates must leverage Svelte 5 Runes for seamless UI refreshes.
- **Accessibility:** New controls must be keyboard-accessible and provide appropriate ARIA labels.

## Acceptance Criteria

- [ ] User can navigate day by day backward and forward from the Daily View using UI arrows.
- [ ] User can click a task in the Daily View, edit it in the `TaskForm` modal, and see the update immediately.
- [ ] User imports an `.xlsx` file and the current view updates automatically to show the new data.
- [ ] The Weekly View header displays a progress bar and the correct remaining time, adjusting reactively when tasks are modified.
