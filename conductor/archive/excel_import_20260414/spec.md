# Specification: Excel Data Import

## 1. Overview

The goal is to implement a feature allowing users to import time tracking data from Excel (.xlsx) and CSV (.csv) files. This operation replaces the current dataset. The import process utilizes the existing custom template mapping defined in the Export settings. Upon completion, a summary popup will indicate the number of successfully imported records and any errors encountered.

## 2. Functional Requirements

- **File Upload:** Users can upload a file (.xlsx or .csv) from the Settings/Export Menu.
- **Data Wiping:** Before processing, the system must present a strict confirmation dialog (e.g., asking the user to confirm via text input) because the import will completely wipe the existing database.
- **Field Mapping:** The system must use the currently defined Export Template configuration to map columns from the uploaded file to the internal task schema.
- **Data Processing:** The system iterates through the file's rows:
  - **Validation:** Validate fields (dates, times, durations, task types).
  - **Error Handling (Skip & Continue):** If a row is invalid, it is skipped and logged as an error, but the import process continues for the remaining rows.
  - **Insertion:** Valid rows are inserted into the application's local database.
- **Feedback/Summary:** After processing the file, a popup modal must display:
  - Number of successfully inserted records.
  - Number of records that failed validation.

## 3. UI/UX

- **Location:** Add an "Import File" button alongside the existing "Export" functionality in the Settings/Export Menu.
- **Wipe Confirmation Dialog:** A modal requesting explicit confirmation before proceeding with the destructive action.
- **Results Modal:** A popup displaying the final statistics (Successes vs. Errors).

## 4. Technical Considerations

- **Library:** Utilize the existing library (likely `xlsx`) used for exporting to read the incoming files.
- **State Management:** Ensure the central data store is properly reset and populated without causing UI desyncs or reactivity issues.

## 5. Out of Scope

- Merging imported data with existing data.
- Automated fetching of data from external cloud providers (e.g., Google Drive, OneDrive).
