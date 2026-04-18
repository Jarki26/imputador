# Specification: Configurable Excel Export & Import Foundation

## 1. Overview

The goal of this track is to implement a feature that allows users to export their task logs into a formatted Excel (`.xlsx`) file. Users will be able to define a bidirectional custom template that dictates how data is mapped to spreadsheet columns and specify date ranges for the export. Furthermore, the template structure will be designed to support reading an Excel file back into the application, enabling data overwrite in the local database based on the same mapping.

## 2. Functional Requirements

- **Bidirectional Template Configuration:** The user must be able to define a custom template for Excel data mapping. This includes:
  - Mapping dynamic task fields (Start Date, Start Time, End Date, End Time, Project, Task Type, Description, Duration) to specific spreadsheet columns.
  - Defining custom columns with fixed, static values for the export.
  - The data model of this template must support bidirectional mapping (Export/Import), meaning it defines how to write data to columns AND how to read data from those columns to construct task entities.
- **Task Type Exclusion Filter:** The configuration must include a parameterizable filter to select which task types should be explicitly excluded from the exported Excel file.
- **Trigger Export:** Provide a UI element (e.g., button in Settings or an Export menu) to initiate the export process.
- **Date Range Selection:** Upon triggering the export, prompt the user to select a custom Start Date and End Date.
- **Excel Generation:** Generate a valid `.xlsx` file based on the configured template, applying the date range and task type exclusion filters before generation.
- **Import Data (Foundation):** The system's architecture and the template data structure must be prepared to read an Excel file and parse its rows back into task objects. The actual UI/workflow for overwriting the database might be finalized here or in a subsequent track, but the core structural capability must be established.

## 3. Non-Functional Requirements

- **Client-Side Generation & Parsing:** Both generating and parsing the `.xlsx` files must happen entirely within the browser using a library like `xlsx` (SheetJS) or `exceljs`.
- **Persistence:** The custom template and exclusion filters must be saved locally (e.g., IndexedDB or `localStorage`) to persist across sessions.
- **Performance:** Generating or reading files should be reasonably fast and not block the main thread unnecessarily.

## 4. Acceptance Criteria

- **AC1:** The settings/configuration area includes UI to define the template mapping (dynamic fields and fixed values) and the task type exclusion filter.
- **AC2:** Clicking the export button opens a date range dialog and generates a `.xlsx` file containing the filtered tasks formatted exactly according to the template.
- **AC3:** Tasks belonging to the excluded types do not appear in the generated Excel file.
- **AC4:** The template data model clearly demonstrates bidirectional capability (e.g., defining a column key that maps to a specific property on the task entity for both writing and reading).
- **AC5:** The exported `.xlsx` file can be opened in Microsoft Excel without warnings or data corruption.

## 5. Out of Scope

- Direct integration with cloud storage (e.g., Google Drive, OneDrive).
- Scheduled or automated background exports/imports.
