# Implementation Plan: Company Field in Task Registry

## Phase 1: Foundation (Data Model & Storage)
- [x] Task: Update Task and Company Data Models f12e3f3
    - [x] Write unit tests for the new Company entity properties.
    - [x] Write unit tests for the Task entity ensuring the new Company property is handled.
    - [x] Implement the TypeScript interfaces and class modifications.
- [ ] Task: Implement IndexedDB Storage for Companies
    - [ ] Write unit tests for Company data persistence (adding new companies, reading, listing top 10 used).
    - [ ] Implement IndexedDB repository/service logic for handling Companies.
- [ ] Task: Conductor - User Manual Verification 'Foundation (Data Model & Storage)' (Protocol in workflow.md)

## Phase 2: UI Implementation (Task Entry Form)
- [ ] Task: Create Company Autocomplete Component
    - [ ] Write unit tests for component rendering, user input, and suggestion display.
    - [ ] Implement the Svelte 5 Company autocomplete input component.
- [ ] Task: Integrate Company Field into Task Form
    - [ ] Write unit tests for placing the component before the Project field and handling form submission.
    - [ ] Implement form submission and bidirectional data binding for the new field.
- [ ] Task: Conductor - User Manual Verification 'UI Implementation (Task Entry Form)' (Protocol in workflow.md)

## Phase 3: Settings & Management (Company List)
- [ ] Task: Create Company Management UI in Settings
    - [ ] Write unit tests for viewing, adding, editing, and deleting companies in the settings view.
    - [ ] Implement the UI components and integrate with the underlying storage service.
- [ ] Task: Conductor - User Manual Verification 'Settings & Management (Company List)' (Protocol in workflow.md)

## Phase 4: Excel Integration
- [ ] Task: Update Bidirectional Template Mapping
    - [ ] Write unit tests for mapping the Company field to Excel columns (Export and Import).
    - [ ] Implement Excel export and import mapping logic utilizing `xlsx`.
- [ ] Task: Update UI for Template Mapping
    - [ ] Write unit tests for the user configuration of the Company field mapping.
    - [ ] Implement the mapping configuration Svelte UI.
- [ ] Task: Conductor - User Manual Verification 'Excel Integration' (Protocol in workflow.md)
