# Specification: Settings Backup & Restore (JSON)

## Overview
This track implements a foundational backup and restore system for application settings. It allows users to export their configuration, company lists, project history, and Excel templates into a single JSON file, which can then be imported into another device or browser to restore their environment.

## Functional Requirements
1.  **Data Export:**
    - Aggregate data from `configStore`, `companyStore`, `projectStore`, and `exportConfigStore`.
    - Generate a JSON file containing this data.
    - Trigger a browser download of the file (e.g., `imputador_settings_YYYYMMDD.json`).
2.  **Data Import:**
    - Provide a file upload interface in the UI.
    - Parse and validate the uploaded JSON file.
    - **Overwrite Strategy:** Replace the entire content of the corresponding local stores with the imported data.
    - Trigger a UI refresh if necessary to reflect the new settings.
3.  **User Interface:**
    - Add a new "Backup & Restore" section at the bottom of the existing `Settings.svelte` modal.
    - Include "Export Settings" and "Import Settings" buttons.
4.  **Validation & Error Handling:**
    - Basic schema validation: Ensure the JSON has the expected top-level keys.
    - Error message for invalid files or parsing failures.

## Acceptance Criteria
- [ ] Exporting produces a `.json` file containing all selected data categories.
- [ ] Importing a valid file immediately updates the app configuration, company list, project history, and Excel templates.
- [ ] The import process uses a "Full Overwrite" approach as requested.
- [ ] Invalid JSON files are rejected with a user-friendly error message without corrupting existing data.

## Out of Scope
- Exporting task logs (this is handled by Excel Export/Import).
- Partial merging of settings.
- Cloud-based synchronization.
