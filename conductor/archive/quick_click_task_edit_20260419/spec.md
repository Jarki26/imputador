# Specification: Improve Task Update Event Detection

## Overview
This track addresses an issue where the edit modal inadvertently opens during interactions that are not intended to edit a task, specifically when dragging a task or performing a long-press. The goal is to refine the definition of a "click" to trigger the edit modal more precisely.

## Functional Requirements
- The application must differentiate between a deliberate click, a drag action, and a long-press on a task block.
- The edit modal must ONLY open when a "Quick Click" is detected.
- A "Quick Click" is defined as a pointer interaction (`pointerdown` followed by `pointerup`) that satisfies BOTH of the following conditions:
  1. **Time Threshold:** The duration between press and release is short (e.g., under 250ms, specifically shorter than the long-press threshold).
  2. **Movement Threshold:** The pointer moves very little or not at all between press and release (e.g., less than 5 pixels).
- If the pointer is held down beyond the Time Threshold, it should be considered a long-press, and releasing the pointer must NOT trigger the edit modal.
- If the pointer moves beyond the Movement Threshold, it should be considered a drag, and releasing the pointer must NOT trigger the edit modal.

## Non-Functional Requirements
- The interaction must feel responsive and natural, without introducing noticeable delays for users who intentionally click to edit.
- The implementation should utilize Svelte 5 runes or native Pointer Events for consistency across desktop and mobile devices.

## Acceptance Criteria
- [ ] Clicking quickly and cleanly on a task block opens the edit modal immediately.
- [ ] Clicking and holding on a task block (long-press) performs the intended long-press action (e.g., copy to recents) but does NOT open the edit modal when released.
- [ ] Clicking and dragging a task block performs the intended move/resize action, and releasing the drag does NOT open the edit modal.

## Out of Scope
- Changes to the underlying data model for tasks.
- Visual redesign of the edit modal itself.
- Changes to the drag-and-drop or long-press behaviors themselves (only preventing the edit modal from firing as a side effect).