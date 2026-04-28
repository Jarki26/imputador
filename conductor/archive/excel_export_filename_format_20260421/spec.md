# Specification: Configurable Excel Export Filename Format

## Overview

This feature introduces a new setting within the "Data Management" (Gestión de Datos) tab that allows users to customize the filename of the exported Excel files. The feature will support dynamic tokens to inject the export date range (years, months, days) along with static text, enabling highly customized naming conventions without manual renaming. Time-based tokens (hours, minutes, seconds) are excluded as per requirements.

## Functional Requirements

- **Setting Location:** A new text input field must be added to the "Data Management" settings tab, labeled "Formato de nombre de archivo" (Filename format).
- **Static & Dynamic Content:** The input must accept any static text mixed with specific placeholder tokens enclosed in curly braces `{}`.
- **Supported Tokens:** The system must support the following tokens based on the export's selected date range:
  - `{START_YYYY}`: 4-digit year of the start date.
  - `{START_MM}`: 2-digit month of the start date.
  - `{START_DD}`: 2-digit day of the start date.
  - `{END_YYYY}`: 4-digit year of the end date.
  - `{END_MM}`: 2-digit month of the end date.
  - `{END_DD}`: 2-digit day of the end date.
- **Default Value:** If the user has not configured a format or leaves it blank, it should default to a sensible pattern like `imputador_{START_YYYY}{START_MM}{START_DD}_{END_YYYY}{END_MM}{END_DD}`.
- **Validation:**
  - The application must validate the input field in real-time.
  - If the user types characters that are invalid for OS filenames (`\`, `/`, `:`, `*`, `?`, `"`, `<`, `>`, `|`), an inline error message must be displayed.
  - The "Save" button for the settings must be disabled while the error is present.
- **Export Process:** When an export is triggered, the system must replace the tokens in the user's custom pattern with the actual date values of the selected export range and append the `.xlsx` extension to generate the final filename.

## Non-Functional Requirements

- **Persistence:** The custom filename format must be saved in the `config` store in IndexedDB and included in the application's JSON backup/restore process.
- **I18n:** The new setting label, help text, and error message must be fully internationalized (added to all translation files).

## Acceptance Criteria

- [ ] A new input field for the filename format exists in the Data Management settings.
- [ ] The field supports `{START_YYYY}`, `{START_MM}`, `{START_DD}`, `{END_YYYY}`, `{END_MM}`, `{END_DD}` tokens mixed with text.
- [ ] Typing an invalid character (`/ \ : * ? " < > |`) shows a validation error and disables saving.
- [ ] Saving the settings persists the format to IndexedDB.
- [ ] Triggering an export generates an Excel file named strictly according to the saved pattern and the selected date range.

## Out of Scope

- Time-based tokens (hours, minutes, seconds).
- Conditional tokens or complex formatting logic beyond simple text replacement.
