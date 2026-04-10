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
- Completed tasks are color-coded, and empty time slots are clearly highlighted as gaps.
- Daily totals are displayed at the top of each column.

### 3. Advanced Time Manipulation

- **Insertion with Overwrite:** Inserting a task into a range splits existing tasks to avoid overlaps.
- **Insertion with Displacement:** Inserting a task pushes subsequent tasks forward while maintaining their original durations.
- **Duration-based Editing:** Adjusting the end time by providing a duration (e.g., `01h 30m 00s`) from a given start time.

### 4. Smart Gap Filling

- A specialized "filler" mode where the system automatically distributes a total duration across available empty slots in the day.

### 5. Task Management

- Parametrizable task types from a closed list.
- Task entities include: Title, Description, Project (Autocomplete with auto-save), and Task Type.
- Quick-access list of the 10 most recently used tasks.

## User Experience Focus

- **Information Density:** A design that maximizes the visibility of the week's data, allowing for quick assessment of missing time and project distribution.
- **Smart Components:** Using autocomplete for projects and intuitive dropdowns for task types to speed up data entry.
