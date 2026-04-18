# Specification: Definir colores por tipo de tarea personalizables desde ajustes

## Overview

This feature introduces the ability for users to customize the background colors associated with different task types directly from the application settings. This customization will enhance visual clarity in both the Weekly and Daily views, allowing users to quickly identify task categories at a glance.

## Functional Requirements

- **Color Selection UI:** The settings interface will include a section to manage task types and their associated colors.
- **Color Input:** The UI will support both a curated predefined palette for quick selection and a custom color picker (hex/rgb) for precise control.
- **Application of Colors:**
  - **Weekly View:** The background color of the task blocks in the Weekly grid will reflect the assigned color of their respective task types.
  - **Daily View:** Task items in the daily list will incorporate the assigned color (e.g., as a background or indicator).
- **Default State:** By default, all task types will be assigned a single neutral color until explicitly customized by the user.
- **Persistence:** The custom color mappings for task types will be saved persistently (via IndexedDB, aligned with existing application data management).

## Non-Functional Requirements

- **Accessibility:** Ensure that text color on task blocks dynamically adjusts (e.g., black or white) to maintain contrast against the custom background color.
- **Performance:** Applying colors in the grid should not negatively impact the rendering performance of the Weekly or Daily views.

## Acceptance Criteria

- [ ] Users can navigate to a settings page/modal to view a list of all task types.
- [ ] Users can select a color for any task type using either a predefined palette or a custom color picker.
- [ ] New colors are immediately saved and persisted across sessions.
- [ ] The Weekly View displays task blocks using the custom colors.
- [ ] The Daily View displays task items using the custom colors.
- [ ] Uncustomized task types default to a standard neutral color.

## Out of Scope

- Exporting or importing color metadata via the Excel feature.
