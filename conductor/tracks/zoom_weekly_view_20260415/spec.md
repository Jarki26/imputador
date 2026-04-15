# Specification: Weekly View Zoom Feature

## Overview
Introduce a zoom functionality in the Weekly View specifically to adjust the height of the time cells (vertical zoom). This allows users to magnify the calendar grid to interact more easily with short-duration tasks. The interaction encompasses zooming in, zooming out, and restoring to the default scale.

## Functional Requirements
1. **Vertical Zoom Control:**
    - Increase or decrease the height of the hour/minute slots in the weekly calendar grid.
    - Zooming must only affect the vertical scale (height of cells/tasks); horizontal dimensions (column widths) remain unchanged.
2. **UI Controls (Floating Action):**
    - Implement a set of floating action buttons in the corner of the Weekly View.
    - Buttons required:
        - Zoom In (Magnifying glass with '+')
        - Zoom Out (Magnifying glass with '-')
        - Restore/Reset (to default 1x scale)
3. **Zoom Granularity:**
    - The zoom should operate in continuous, granular incremental steps (e.g., +/- 10% or similar per click).
    - Minimum and maximum zoom limits must be established to prevent visual breakage.
4. **Interaction Integrity:**
    - All existing mouse/touch interactions with tasks (drag & drop to move, resize duration, click, hover) MUST continue functioning correctly regardless of the current zoom level.
    - The visual representation of tasks must scale proportionally with the grid height.

## Non-Functional Requirements
1. **Persistence:**
    - The zoom level is session-based. It must reset to the default scale (1x) whenever the user reloads the application.
2. **Performance:**
    - Adjusting the zoom should be visually smooth and performant, without significant lag when recalculating grid and task heights.

## Acceptance Criteria
- [ ] A user can click a floating "Zoom In" button to increase the height of time cells incrementally.
- [ ] A user can click a floating "Zoom Out" button to decrease the height of time cells incrementally, up to a defined minimum.
- [ ] A user can click a floating "Restore" button to immediately return the grid to its default cell height.
- [ ] Upon reloading the page, the zoom level resets to the default size.
- [ ] Tasks can still be moved (drag-and-drop) accurately to new time slots while zoomed in/out.
- [ ] Task durations can still be modified by dragging their borders accurately while zoomed in/out.

## Out of Scope
- Horizontal zooming (adjusting column width).
- Zoom functionality in the Daily View or other views.
- Saving the zoom preference to local storage or backend.