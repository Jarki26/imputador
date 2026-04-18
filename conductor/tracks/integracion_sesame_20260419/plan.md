# Implementation Plan: Integración Sesame

## Phase 1: Sesame Configuration & Core API Service
- [ ] Task: Implement Sesame API client service
    - [ ] Create `sesameService.ts` for API interactions (login, me, checks).
    - [ ] Implement error handling and formatting for Sesame API responses.
    - [ ] Write unit tests for API endpoints and error mappings.
- [ ] Task: Integrate Sesame settings and authentication in UI
    - [ ] Add Sesame section to the Settings modal/page.
    - [ ] Implement login form and securely save credentials/token in IndexedDB config.
    - [ ] Implement logout functionality.
    - [ ] Write unit tests for Settings UI and config storage.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Sesame Configuration & Core API Service' (Protocol in workflow.md)

## Phase 2: Synchronization Logic & Weekly View Integration
- [ ] Task: Implement gap calculation logic
    - [ ] Create utility function to process `checkIn` and `checkOut` arrays and generate "Rest" tasks.
    - [ ] Ensure gaps are strictly bounded by the first and last check of each day.
    - [ ] Write unit tests for the gap calculation logic covering multiple scenarios (single gap, multiple gaps, no gaps).
- [ ] Task: Implement collision and overwrite logic for generated tasks
    - [ ] Integrate with existing `taskStore` or create a specific function for Sesame tasks insertion.
    - [ ] Apply the 3 rules for format matching, conflict resolution, and preservation of user tasks.
    - [ ] Write unit tests for the insertion and collision logic.
- [ ] Task: Add "Sync Sesame" to Weekly View
    - [ ] Add the sync button to the Weekly View UI.
    - [ ] Connect the button to fetch checks for the current week.
    - [ ] Provide user feedback (loading state, success, error toasts/alerts).
    - [ ] Write integration tests for the sync flow.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Synchronization Logic & Weekly View Integration' (Protocol in workflow.md)

## Phase 3: Final Review and Polish
- [ ] Task: Add i18n support
    - [ ] Add new translation strings for Sesame integration (Settings, Buttons, Error messages) to all locales.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Review and Polish' (Protocol in workflow.md)
