# Implementation Plan: Custom Task Colors

## Phase 1: Setup & Data Model
- [x] Task: Update data types to include color mapping for task types. [9c52ba9]
    - [x] Update types/interfaces for task configuration.
    - [x] Write tests to ensure color mapping logic handles default neutral colors.
- [ ] Task: Update local persistence (IndexedDB/Store).
    - [ ] Add save/load logic for custom task colors in the relevant store (e.g., configStore).
    - [ ] Write tests verifying persistence and retrieval of custom colors.
- [ ] Task: Conductor - User Manual Verification 'Setup & Data Model' (Protocol in workflow.md)

## Phase 2: Settings UI (Color Selection)
- [ ] Task: Create ColorPicker component.
    - [ ] Implement a curated predefined color palette.
    - [ ] Implement a custom hex/rgb color input fallback.
    - [ ] Write component tests.
- [ ] Task: Integrate ColorPicker into Settings.
    - [ ] Add a section in `Settings.svelte` to list task types.
    - [ ] Bind the ColorPicker to each task type.
    - [ ] Ensure changes trigger persistence.
    - [ ] Write component tests for Settings integration.
- [ ] Task: Conductor - User Manual Verification 'Settings UI' (Protocol in workflow.md)

## Phase 3: Integration (Weekly & Daily Views)
- [ ] Task: Apply colors in Weekly View.
    - [ ] Update `WeeklyView.svelte` to dynamically style task block backgrounds based on the task type's custom color.
    - [ ] Ensure fallback to the neutral default color.
    - [ ] Ensure text contrast is accessible.
- [ ] Task: Apply colors in Daily View.
    - [ ] Update `TaskList.svelte` or `TaskForm.svelte` (list items) to display the custom color indicator/background.
    - [ ] Ensure fallback to the neutral default color.
- [ ] Task: Conductor - User Manual Verification 'Integration' (Protocol in workflow.md)