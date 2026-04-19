# Specification: UI/UX Improvements for Weekly Mode and Modals

## Overview
This track addresses two specific UI/UX issues:
1. Text selection within task blocks in the Weekly View conflicts visually and operationally with drag-and-drop actions.
2. Modals incorrectly close when a user clicks inside the modal, drags the mouse outside, and releases the mouse button (`mouseup`).

## Functional Requirements
- **Non-Selectable Task Blocks:** The text content inside draggable task blocks in the Weekly View must be rendered non-selectable (`user-select: none`).
- **Robust Modal Closing:** The base Modal component must be updated so that clicking on the backdrop only closes the modal if the initial `mousedown` also occurred on the backdrop. If a user starts a click (`mousedown`) inside the modal content and releases (`mouseup`) outside, the modal must remain open.

## Non-Functional Requirements
- **Consistency:** The modal fix must apply to all instances of the Modal component across the application.
- **UX:** The drag-and-drop experience in the Weekly View must feel smooth without text highlighting artifacts.

## Out of Scope
- Making headers or the background grid of the Weekly View non-selectable.
- Changes to the drag-and-drop logic itself.