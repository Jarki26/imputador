# Specification: Collision and Long-Press Enhancements

## Overview
This track introduces two main UX improvements to Imputador:
1. Replaces the "Cancel" button on the collision warning dialog (when modifying tasks) with a "Continuar de todas formas" (Continue anyway) button, allowing the creation/modification of tasks even if they collide with existing ones (permitting overlap).
2. Enhances the "long-press" action on a task. In addition to copying the task to recents, it will now trigger the same validation checks as if the task were displaced, prompting the user with a confirmation dialog to fill gaps or merge tasks if applicable.

## Functional Requirements
### 1. Collision Warning Dialog Modification
- When modifying a task and a time collision is detected, the dialog must replace the standard "Cancel" button with "Continuar de todas formas".
- Clicking "Continuar de todas formas" must bypass the collision prevention logic and save the task, allowing it to overlap in time with existing tasks.

### 2. Long-Press Action Enhancement
- The existing long-press functionality (copying the task to the recents list) must be preserved.
- Long-pressing a task must also evaluate the immediate surrounding tasks and gaps, using the same logic applied when a task is displaced.
- If the system detects that gaps can be filled or identical tasks can be merged, it must display a confirmation dialog to the user before applying these changes.

## Out of Scope
- Modifying the core drag-and-drop or initial creation insertion modes (Overwrite/Displace). This change applies specifically to the collision warning shown when modifying an existing task's times.