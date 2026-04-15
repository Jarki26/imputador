# Specification: Custom Excel Date Format

## 1. Overview
Introduce a setting that allows users to define a custom date format for both importing and exporting Excel files. The format will utilize standard `dayjs`-style tokens (e.g., `YYYY/MM/DD`, `DD/MM/YYYY`). A fallback warning will be displayed if imported dates fail to match the configured format.

## 2. Functional Requirements
- **Configuration Option:** Add an input field within the existing Excel Import/Export settings section to configure the "Excel Date Format".
- **Default Format:** If no format is specified by the user, the system will default to `DD/MM/YYYY`.
- **Export Behavior:** All date values exported to Excel will be formatted according to the configured date format string.
- **Import Behavior:** When reading an Excel file, the system will attempt to parse date columns using the exact configured format string.
- **Error Handling & Feedback:** During an import, if any date cell fails to parse using the configured format, the final import result window will display an explicit warning message. This warning will remind the user of the currently active date format setting (e.g., "Warning: Some dates could not be parsed. The expected format is currently set to 'DD/MM/YYYY'.").

## 3. Non-Functional Requirements
- **Token Standard:** The format string parsing and formatting must behave similarly to `dayjs` syntax (using tokens like `YYYY`, `MM`, `DD`).
- **State Persistence:** The chosen format must be persisted alongside existing user configuration/settings.