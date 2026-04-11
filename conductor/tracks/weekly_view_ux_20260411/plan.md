# Implementation Plan: UX Improvements - Weekly View (4.1)

## Phase 1: Record Management
- [x] Task: Implement Delete Task Button (28998a2)
    - [ ] Write failing test for task deletion from `WeeklyView`.
    - [ ] Implement UI button and connect to task deletion logic.
- [x] Task: Implement Merge Identical Tasks Prompt (2144e50)
    - [ ] Write failing test for detecting consecutive identical tasks.
    - [ ] Implement logic to detect identical adjacent tasks upon movement/editing.
    - [ ] Implement confirmation popup and merge logic.
- [x] Task: Implement Copy to Recents (Long Press) (216ee56)
    - [ ] Write failing test for triggering the copy action.
    - [ ] Implement long-press gesture detector on task cards.
    - [ ] Connect gesture to the recent tasks history addition logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Record Management' (Protocol in workflow.md)

## Phase 2: Navigation & Visualization
- [ ] Task: Implement Week Navigation Arrows
    - [ ] Write failing tests for week navigation state changes.
    - [ ] Add arrow buttons to the header and wire them to change the current week.
- [ ] Task: Implement Daily View Access from Header
    - [ ] Write failing test for navigation to Daily View on day header click.
    - [ ] Make day headers clickable and route to the specific day's view.
- [ ] Task: Implement Mobile Time Column (Floating Overlay)
    - [ ] Add CSS/styling tests or visual regression checks if applicable.
    - [ ] Update CSS to make the time column sticky/floating during horizontal scroll on small screens.
- [ ] Task: Adjust Visual Scale of Cells
    - [ ] Write failing tests verifying the calculated height styles based on task duration.
    - [ ] Update rendering logic to ensure exact proportional heights (e.g., 30min = 50% height).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Navigation & Visualization' (Protocol in workflow.md)

## Phase 3: Interaction & Control
- [ ] Task: Implement No-Gap Sequencing Prompt
    - [ ] Write failing test for detecting near-drops.
    - [ ] Implement logic to detect when a task is dropped near another task.
    - [ ] Implement confirmation popup proposing magnetic snapping.
- [ ] Task: Implement Action Lock Switches (Floating Buttons)
    - [ ] Write failing tests for action locks preventing state changes.
    - [ ] Add floating action buttons (FABs) to toggle edit, move, and create locks.
    - [ ] Enforce locks in the UI interaction handlers.
- [ ] Task: Correct Edit Logic from Weekly View
    - [ ] Write failing tests covering division and displacement when editing directly from `WeeklyView`.
    - [ ] Fix the underlying logic to apply the correct strategy (overwrite/displace) during inline edits.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Interaction & Control' (Protocol in workflow.md)

## Phase 4: Post-Implementation Documentation
- [ ] Task: Update Pending Tasks List
    - [ ] Check off all items in section 4.1 of `conductor/tareas_pendientes.md`.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Post-Implementation Documentation' (Protocol in workflow.md)