# Specification: Offline Task Type and Sesame Gap Fills

## 1. Overview

Introduce a new task type `OFFLINE` that represents time outside the office. This type will be used by the Sesame HR integration to automatically fill the gaps between `00:00` and the first work registry, and from the last work registry to `23:59`. These offline blocks will not count towards billable hours, rest hours, or the weekly goal.

## 2. Functional Requirements

- **New Task Type `OFFLINE`**: Add `OFFLINE` to the parameterized list of task types.
- **Totals Exclusion**: `OFFLINE` tasks must be completely excluded from daily billable totals, daily rest totals, and weekly goal calculations.
- **Sesame Integration - Gap Calculation**:
  - The Sesame sync process must generate `OFFLINE` tasks to fill the periods before and after the workday.
  - Specifically, create a task from `00:00:00` to the `checkIn` time of the first work registry of the day.
  - Create another task from the `checkOut` time of the last work registry of the day to `23:59:59.999`.
- **Sesame Offline Task Properties**:
  - Description: "Fuera de la oficina" (translatable via i18n).
  - Project: "sesame"
  - Type: `OFFLINE`
- **Collision Policy**:
  - When inserting a new Sesame `OFFLINE` task or `REST` (Descanso) task, it should overwrite any existing Sesame `REST` or Sesame `OFFLINE` tasks that conflict with its timeframe.
  - It should allow overlapping with manually created, non-Sesame tasks, leaving conflict resolution to the user.

## 3. UI/UX Details

- The new `OFFLINE` type must have a distinct default color in the Task Type settings (e.g., a muted grey or distinct pattern) to differentiate it visually from billable and rest hours without being distracting.
- "Fuera de la oficina" must be fully translated across all supported locales.

## 4. Edge Cases

- Days with no Sesame check-ins should generate a single `OFFLINE` task from `00:00` to `23:59` if the sync includes those days.
- Very short gaps (less than a minute) should be ignored to prevent visual clutter, similar to the existing `REST` logic.

## 5. Out of Scope

- Modifying the existing logic for calculating `REST` gaps _between_ work blocks.
- Synchronizing `OFFLINE` tasks back to Sesame HR.
