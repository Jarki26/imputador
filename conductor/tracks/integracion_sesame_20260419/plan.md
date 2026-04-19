# Implementation Plan: Integración Sesame

## Phase 1: Sesame Configuration & Core API Service [checkpoint: 069842a]
- [x] Task: Implement Sesame API client service (6b2c499)
    - [ ] Create `sesameService.ts` for API interactions (login, me, checks).
    - [ ] Implement error handling and formatting for Sesame API responses.
    - [ ] Write unit tests for API endpoints and error mappings.
- [x] Task: Integrate Sesame settings and authentication in UI (577525c)
    - [ ] Add Sesame section to the Settings modal/page.
    - [ ] Implement login form and securely save credentials/token in IndexedDB config.
    - [ ] Implement logout functionality.
    - [ ] Write unit tests for Settings UI and config storage.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Sesame Configuration & Core API Service' (Protocol in workflow.md) (069842a)

## Phase 2: Synchronization Logic & Weekly View Integration [checkpoint: 96feb2f]
- [x] Task: Implement gap calculation logic (0e6f813)
    - [ ] Create utility function to process `checkIn` and `checkOut` arrays and generate "Rest" tasks.
    - [ ] Ensure gaps are strictly bounded by the first and last check of each day.
    - [ ] Write unit tests for the gap calculation logic covering multiple scenarios (single gap, multiple gaps, no gaps).
- [x] Task: Implement collision and overwrite logic for generated tasks (674acc5)
    - [ ] Integrate with existing `taskStore` or create a specific function for Sesame tasks insertion.
    - [ ] Apply the 3 rules for format matching, conflict resolution, and preservation of user tasks.
    - [ ] Write unit tests for the insertion and collision logic.
- [x] Task: Add "Sync Sesame" to Weekly View (f7899e5)
    - [ ] Add the sync button to the Weekly View UI.
    - [ ] Connect the button to fetch checks for the current week.
    - [ ] Provide user feedback (loading state, success, error toasts/alerts).
    - [ ] Write integration tests for the sync flow.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Synchronization Logic & Weekly View Integration' (Protocol in workflow.md) (96feb2f)

## Phase 3: Final Review and Polish
- [ ] Task: Add i18n support
    - [ ] Add new translation strings for Sesame integration (Settings, Buttons, Error messages) to all locales.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Review and Polish' (Protocol in workflow.md)
