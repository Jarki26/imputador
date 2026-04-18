# Specification: Weekly Goals and Visualization

## Overview

Implement the "Visualización y Objetivos Semanales" (Weekly Goals and Visualization) feature, fulfilling section 3 of the pending tasks. This allows users to configure a weekly hours target and visually track their progress against it in the Weekly View.

## Functional Requirements

1. **Weekly Hours Configuration:**
   - Provide a UI located in a Settings Modal or the main application Header to configure the weekly hours target.
   - The default value must be 41 hours.
   - The configured target must be persisted locally in IndexedDB.
   - Validate the input to ensure the value is between 1 and 60 hours.

2. **Comparative Computation:**
   - Calculate the total logged hours for the current week.
   - Display the logged hours versus the weekly target in the Weekly View.
   - The visualization will be a Simple Text format (e.g., "38 / 41h").

## Non-Functional Requirements

- Seamless integration with the existing IndexedDB storage mechanisms.
- The comparative computation must update dynamically as tasks are added, modified, or deleted.

## Acceptance Criteria

- [ ] User can open a settings UI and set a weekly hour target between 1 and 60.
- [ ] The default weekly target of 41h is applied if the user hasn't set one.
- [ ] The configured target persists across sessions (stored in IndexedDB).
- [ ] The Weekly View displays the accurate total of logged hours compared to the target (e.g., "Logged: 35h / Target: 41h").
- [ ] Updating the target immediately updates the Weekly View computation.

## Out of Scope

- Advanced graphical charts (progress bars, gauges) for the comparative computation.
- Monthly or yearly goal tracking.
