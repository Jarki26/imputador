# Implementation Plan: Weekly View Zoom Feature

## Phase 1: Core State and UI Controls
- [x] Task: Write tests for a reactive zoom state manager or verify `WeeklyView` component mounts with default 1x zoom. 1234567
- [x] Task: Implement a session-based reactive zoom state (e.g., using Svelte 5 Runes) initialized to `1.0`. Add methods to increase (e.g., +10%), decrease (e.g., -10%), and restore (1.0). 1234567
- [x] Task: Create a new Svelte component for the Zoom Controls (Floating Action Buttons: Zoom In, Zoom Out, Restore). 1234567
- [x] Task: Integrate Zoom Controls into the `WeeklyView.svelte` component. 1234567
- [ ] Task: Conductor - User Manual Verification 'Core State and UI Controls' (Protocol in workflow.md)

## Phase 2: Visual Grid and Task Scaling
- [ ] Task: Write tests for helper functions that calculate pixel heights and top offsets based on time durations and the current zoom multiplier.
- [ ] Task: Refactor `WeeklyView.svelte` to replace hardcoded vertical sizing (e.g., `PIXELS_PER_MINUTE`) with a dynamically computed value based on the zoom multiplier.
- [ ] Task: Ensure the background grid (hour/minute lines) renders correctly at different zoom levels.
- [ ] Task: Update the rendering logic for tasks in the Weekly View so their height and vertical position accurately reflect the current zoom multiplier.
- [ ] Task: Conductor - User Manual Verification 'Visual Grid and Task Scaling' (Protocol in workflow.md)

## Phase 3: Interaction Scaling
- [ ] Task: Write tests to ensure pointer event coordinate translation (Y-axis pixel to time) correctly accounts for the zoom multiplier.
- [ ] Task: Update the drag-and-drop logic for moving tasks to correctly calculate the new start time based on the zoomed grid.
- [ ] Task: Update the resize logic (dragging handles) to correctly calculate the new duration based on the zoomed grid.
- [ ] Task: Conductor - User Manual Verification 'Interaction Scaling' (Protocol in workflow.md)