# Implementation Plan - Weekly View Implementation

## Phase 1: Core Weekly View Structure & Navigation [checkpoint: f86ccde]

- [x] **Task: Create Basic WeeklyView Component (TDD)** (da2dc2c)
  - [x] Write failing tests for rendering a 7-day grid and time axis.
  - [x] Implement the basic visual structure of `WeeklyView.svelte` using CSS Grid/Flexbox.
  - [x] Write tests for displaying daily totals.
  - [x] Implement logic to calculate and display daily totals.
- [x] **Task: Update Routing and Navigation (TDD)** (da2dc2c)
  - [x] Write failing tests for a toggle mechanism to switch between Daily and Weekly views on `+page.svelte`.
  - [x] Implement the view toggle, defaulting to the Weekly View.
  - [x] Ensure existing Daily View functionality is preserved when toggled.
- [x] **Task: Conductor - User Manual Verification 'Core Weekly View Structure & Navigation' (Protocol in workflow.md)** (f86ccde)

## Phase 2: Task Rendering & Information Display

- [x] **Task: Enhance TaskStore for Weekly Data Retrieval (TDD)** (f291e25)
  - [x] Write failing tests for a new method `getTasksForWeek(startDate: Date)` in `TaskStore`.
  - [x] Implement `getTasksForWeek` to efficiently fetch tasks for the displayed 7 days.
- [x] **Task: Render Task Blocks in WeeklyView (TDD)** (f291e25)
  - [x] Write failing tests for rendering task data as absolute/relative positioned blocks within the grid based on their start and end times.
  - [x] Implement the block rendering logic in `WeeklyView.svelte` or a new `TaskBlock.svelte` component.
  - [x] Display Title, Project, Duration, and Type Color within the blocks.
- [x] **Task: Implement Overlap Error Highlighting (TDD)** (f291e25)
  - [x] Write failing tests for detecting overlapping tasks and applying an 'error' CSS class.
  - [x] Implement the overlap detection logic and visual highlighting in the rendering process.
- [ ] **Task: Conductor - User Manual Verification 'Task Rendering & Information Display' (Protocol in workflow.md)**

## Phase 3: Interactive Features (Click & Add/Edit)

- [x] **Task: Implement Click-to-Add functionality (TDD)** (132b5d1)
  - [x] Write failing tests for capturing click events on empty grid slots and calculating the correct start/end times.
  - [x] Implement the click handler to open the `TaskForm` (potentially in a modal or side panel) pre-filled with the calculated times.
- [x] **Task: Implement Click-to-Edit functionality (TDD)** (e851ba2)
  - [x] Write failing tests for capturing click events on existing task blocks.
  - [x] Implement the click handler to open the `TaskForm` populated with the clicked task's data.
- [ ] **Task: Conductor - User Manual Verification 'Interactive Features (Click & Add/Edit)' (Protocol in workflow.md)**

## Phase 4: Advanced Interactions (Drag & Drop) - *Stretch Goal*

- [ ] **Task: Research and Select Drag-and-Drop Library (or Native HTML5)**
  - [ ] Evaluate Svelte-specific dnd libraries vs native HTML5 Drag and Drop API for performance and ease of use in a grid context. Document choice in `tech-stack.md` if external library added.
- [ ] **Task: Implement Drag to Move Task (TDD)**
  - [ ] Write failing tests for updating a task's start and end times when dragged to a new slot.
  - [ ] Implement the drag-to-move logic and visual feedback during dragging.
- [ ] **Task: Implement Drag to Resize Duration (TDD)**
  - [ ] Write failing tests for updating a task's end time when its bottom edge is dragged.
  - [ ] Implement the drag-to-resize logic and visual feedback.
- [ ] **Task: Conductor - User Manual Verification 'Advanced Interactions (Drag & Drop)' (Protocol in workflow.md)**
