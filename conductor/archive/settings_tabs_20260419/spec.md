# Specification: Tabbed Settings Menu

## Overview

Refactor the current Settings menu into a tabbed layout to group configuration options logically and improve the user experience. The menu will use a vertical sidebar layout for the tabs.

## Functional Requirements

- **Vertical Tabbed Navigation:** The settings modal must include a vertical sidebar on the left side to navigate between different configuration categories, with the selected category's content displayed on the right.
- **Categorization:** Settings must be grouped into the following functional categories:
  - **General:** Weekly Target, Language, Task Colors, and the main Save button.
  - **Task Options:** Companies Settings, Bulk Edit.
  - **Data Management:** Export/Import Settings, Backup Settings.
  - **Integrations:** Sesame Integration Settings.
- **State Preservation:** Ensure that the current state-saving behavior of the sub-components works seamlessly inside the new tabbed layout.

## Non-Functional Requirements

- **Design Consistency:** All sections within the tabs must maintain a coherent and uniform visual style. Spacing, typography, button styles, and form inputs must align with the application's overall Material Design 3 theme.
- **Responsive Layout:** The vertical layout should be responsive, adapting cleanly on smaller screens (e.g., collapsing the sidebar or stacking vertically).

## Out of Scope

- Adding new configuration settings not currently present in the app.
- Changing the underlying business logic or data structures of existing settings components.
