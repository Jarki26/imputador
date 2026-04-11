# Implementation Plan: UX Improvements - Weekly View (4.1)

## Phase 1: Record Management [checkpoint: 32dfd1b]
- [x] Task: Implement Delete Task Button (28998a2)
    - [x] Write failing test for task deletion from `WeeklyView`.
    - [x] Implement UI button and connect to task deletion logic.
- [x] Task: Implement Merge Identical Tasks Prompt (2144e50)
    - [x] Write failing test for detecting consecutive identical tasks.
    - [x] Implement logic to detect identical adjacent tasks upon movement/editing.
    - [x] Implement confirmation popup and merge logic.
- [x] Task: Implement Copy to Recents (Long Press) (216ee56)
    - [x] Write failing test for triggering the copy action.
    - [x] Implement long-press gesture detector on task cards.
    - [x] Connect gesture to the recent tasks history addition logic.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Record Management' (32dfd1b)

## Phase 2: Navigation & Visualization [checkpoint: 8986700]
- [x] Task: Implement Week Navigation Arrows (b390fbc)
    - [x] Write failing tests for week navigation state changes.
    - [x] Add arrow buttons to the header and wire them to change the current week.
- [x] Task: Implement Daily View Access from Header (848452f)
    - [x] Write failing test for navigation to Daily View on day header click.
    - [x] Make day headers clickable and route to the specific day's view.
- [x] Task: Implement Mobile Time Column (Floating Overlay) (4e7adcb)
    - [x] Add CSS/styling tests or visual regression checks if applicable.
    - [x] Update CSS to make the time column sticky/floating during horizontal scroll on small screens.
- [x] Task: Adjust Visual Scale of Cells (a166ff9)
    - [x] Write failing tests verifying the calculated height styles based on task duration.
    - [x] Update rendering logic to ensure exact proportional heights (e.g., 30min = 50% height).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Navigation & Visualization' (8986700)

## Phase 3: Interaction & Control [checkpoint: baffdfb]
- [x] Task: Implement No-Gap Sequencing Prompt (a167ab8)
    - [x] Write failing test for detecting near-drops.
    - [x] Implement logic to detect when a task is dropped near another task.
    - [x] Implement confirmation popup proposing magnetic snapping.
- [x] Task: Implement Action Lock Switches (Floating Buttons) (df3b885)
    - [x] Write failing tests for action locks preventing state changes.
    - [x] Add floating action buttons (FABs) to toggle edit, move, and create locks.
    - [x] Enforce locks in the UI interaction handlers.
- [x] Task: Correct Edit Logic from Weekly View (c838576)
    - [x] Write failing tests covering division and displacement when editing directly from `WeeklyView`.
    - [x] Fix the underlying logic to apply the correct strategy (overwrite/displace) during inline edits.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Interaction & Control' (baffdfb)

## Phase 4: Post-Implementation Documentation
- [x] Task: Update Pending Tasks List (c8aeb0e)
    - [x] Check off all items in section 4.1 of `conductor/tareas_pendientes.md`.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Post-Implementation Documentation' (Protocol in workflow.md)