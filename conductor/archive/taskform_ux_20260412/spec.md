# Specification: TaskForm UX Improvements (Section 4.2)

## Overview
This track implements essential User Experience enhancements to the `TaskForm.svelte` component as outlined in section 4.2 of the pending tasks. The primary goal is to simplify data entry, reduce cognitive load when inputting durations, and ensure data consistency by preventing cross-day tasks.

## Functional Requirements
1. **Duration Lock (Botón para bloquear duración):**
   - The form MUST include a "padlock icon" situated between the start and end time inputs.
   - When the lock is ACTIVE, modifying the start time MUST automatically adjust the end time to maintain the currently specified duration.
   - When the lock is INACTIVE, modifying the start time MUST maintain the end time and adjust the duration.
   - Modifying the duration directly while locked should either be disabled or adjust the end time.

2. **Default Date Selection (Cargar por defecto la fecha):**
   - When the TaskForm is opened without a specific date context provided, it MUST default to the current date (today).
   - If opened from a specific day in the WeeklyView, it should respect that selected date.

3. **Single-Day Restriction (Restringir registros a un único día):**
   - The form MUST restrict the task to a single date.
   - The date selector MUST only allow selecting a single day, eliminating complex multi-day duration pickers.
   - If a user inputs a start time and a duration that pushes the end time past 23:59 of the selected date, the form MUST display a validation error and prevent saving.

## Non-Functional Requirements
- **Usability:** The padlock icon should clearly indicate its state (locked/unlocked) visually.

## Acceptance Criteria
- [ ] A padlock icon is present between start and end time inputs.
- [ ] Toggling the padlock updates its visual state.
- [ ] Changing the start time with the padlock active correctly shifts the end time, keeping the duration constant.
- [ ] Opening the form without a pre-selected date automatically populates the date field with today's date.
- [ ] The date selector only allows choosing a single date.
- [ ] Attempting to save a task whose duration extends into the next calendar day triggers a visible validation error and fails to save.

## Out of Scope
- Major redesign of the TaskForm UI outside of adding the lock icon.
- Automated splitting of cross-day tasks (handled via validation error instead).