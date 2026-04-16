# Product Definition: Imputador

## Overview

Imputador is a specialized task registration and time-tracking application designed for corporate environments. Its primary goal is to ensure that every minute of the workday is accounted for, eliminating gaps in daily time logs.

## Target Audience

- **Corporate Employees:** Professionals who need to report their hours accurately for project billing, resource allocation, and internal audits.

## Key Objectives

- **Total Hour Accuracy:** Maintaining a continuous, gapless log of work tasks, including breaks and justified absences.
- **Workflow Efficiency:** Providing sophisticated tools to manipulate time logs without manual calculations or overlapping errors.
- **Visual Clarity:** Offering a bird's-eye view of the week's productivity.

## Core Features

### 1. Gapless Time Tracking

- Tasks are registered with a start and end time.
- Sequential tasks share end/start times to ensure no gaps exist between them.
- Special "Rest" tasks are used to account for lunch breaks and other non-billable absences.

### 2. Outlook-style Weekly View

- A visual representation of the week, similar to the Outlook calendar.
- Completed tasks are color-coded using user-defined custom colors (with muted styling for non-billable tasks), supports interactive manipulation via drag-and-drop to move and resize tasks, and empty time slots are clearly highlighted as gaps.
- Daily totals (billable and non-billable) are displayed at the top of each column.
- Interactive controls for direct management:
    - **Week Navigation:** Quick arrows to switch between weeks.
    - **Daily Drill-down:** Clickable day headers to jump to the detailed Daily View.
    - **Direct Management:** Delete buttons on task blocks and long-press to copy existing tasks to favorites/recents.
    - **Smart Interaction:** Magnetic snapping to close small gaps and automatic merging of identical consecutive tasks.
    - **Action Locks:** Safety switches to prevent accidental movement, editing, or creation on touch devices.
    - **Goal Progress:** Visual progress bar and remaining time calculation in the header.
    - **Vertical Zoom:** Floating controls to adjust the grid scale (cell height), facilitating management of short-duration tasks.

### 3. Advanced Time Manipulation

- **Insertion with Overwrite:** Inserting a task into a range splits existing tasks to avoid overlaps.
- **Insertion with Displacement:** Inserting a task pushes subsequent tasks forward while maintaining their original durations.
- **Duration-based Editing:** Adjusting the end time by providing a duration (e.g., `01h 30m 00s`) from a given start time. Includes a **Duration Lock** feature that, when active, automatically shifts the end time when the start time is modified to maintain a constant duration.
- **Single-Day Enforcement:** Tasks are strictly restricted to a single calendar day to simplify logic and user mental model. The interface prevents tasks from crossing the midnight boundary.
- **Daily Navigation:** Arrows in the Daily View to quickly navigate between consecutive days.

### 4. Smart Gap Filling

- A specialized "filler" mode where the system automatically distributes a total duration across available empty slots in the day, with automatic carryover to subsequent days if needed.

### 5. Task Management

- Parametrizable task types from a closed list.
- Special "Ausencia Facturable" (Billable Absence) type: Counts toward weekly goal but not daily productivity. Rendered with a patterned/striped background.
- Task entities include: Title, Description, Project (Autocomplete with auto-save), Company (Autocomplete with auto-save and management), and Task Type (with personalizable background colors).
- **Direct Editing:** Ability to edit tasks directly from both Weekly and Daily Views.
- Quick-access list of the 10 most recently used tasks and companies.
- **Company Management:** A dedicated settings area to manually add, edit, or delete saved companies from the autocomplete suggestions.

### 6. Weekly Hour Goals

- Configurable weekly hours target (default 41h).
- Real-time comparison between logged billable hours and the weekly target in the Weekly View.
- Dynamic Target: "Ausencia Facturable" hours are subtracted from the weekly target to show remaining work needed.
- Visual distinction between billable and non-billable (Rest) hours in both daily and weekly totals.

### 7. User Assistance

- **Undo/Redo System:** Granular, session-based history stack allowing users to revert any manual task manipulation (Ctrl+Z / Ctrl+Y).
- **Interactive Tutorial:** A step-by-step guided overlay explaining core app features, view switching, and advanced manipulation logic.
- **Multi-language Support:** Full internationalization (i18n) of the user interface. Users can switch between English, Spanish, Portuguese, German, French, and Chinese. The selected preference is persisted locally.
- **Configurable Excel Export & Import:**
    - **Bidirectional Template Mapping:** Users can define a custom template to map task fields to Excel columns, supporting both export and import capabilities.
    - **Flexible Export:** Generate `.xlsx` files based on a selected date range and parameterized task type exclusion filters.
    - **Wipe & Import:** Ability to replace the entire local dataset with data from an Excel/CSV file, featuring a strict confirmation process and a summary of import results.
    - **Custom Date Formatting:** Users can define a custom date format (e.g., `DD/MM/YYYY`, `YYYY-MM-DD`) for bidirectional Excel operations. Includes strict parsing and proactive format warnings during import.
    - **Automatic Refresh:** The application automatically reloads all views after a successful import to reflect the new data immediately.
    - **Data Persistence:** Custom templates and exclusion settings are saved locally for consistency across sessions.

### 8. Settings Backup & Restore

- **JSON-based Backup:** Users can export all application configuration, company lists, project history, and Excel templates into a single `.json` file.
- **Full Environment Restore:** Ability to import the backup file into another device or browser to recreate the user's environment.
- **Overwrite Protection:** The import process uses a "Full Overwrite" approach with a confirmation prompt to ensure data integrity.
- **Automatic Reload:** The application automatically reloads after a successful import to apply the new settings immediately.

## User Experience Focus

- **Information Density:** A design that maximizes the visibility of the week's data, allowing for quick assessment of missing time and project distribution.
- **Smart Components:** Using autocomplete for projects, intuitive dropdowns for task types, and **split date/time selectors** with context-aware defaults (today's date or selected day) to minimize input overhead.
- **Smart Defaults:** Task creation automatically suggests a start time based on the preceding task's end time (in Weekly View) or the day's latest task (in Daily View) to maintain log continuity with zero effort.
