# Specification: Company Field in Task Registry

## Overview
Introduce a new "Company" field to the task registration system, functioning as an autocomplete input that automatically saves and suggests the 10 most frequently used entries. This field will be fully integrated into the existing Excel template mapping system, allowing bidirectional data portability.

## Functional Requirements
1. **Task Entity Update:** 
   - Add a "Company" (Empresa) field to the core Task entity.
   - The field is independent of the existing "Project" field.
2. **UI Integration:**
   - Add the new Company field as an autocomplete input in the task entry/editing form.
   - Position the Company field immediately before the Project field.
3. **Autocomplete & Suggestions:**
   - The field must support text input with an autocomplete dropdown.
   - The system must track the frequency/recency of used companies.
   - The dropdown will suggest the 10 most used companies.
   - New companies typed by the user will be automatically saved to the list upon task creation/update.
4. **Manageable List:**
   - Provide a mechanism (e.g., in settings) for users to manually add, edit, or remove entries from the saved company suggestions list.
5. **Excel Integration:**
   - Integrate the Company field into the existing Bidirectional Template Mapping configuration.
   - Users must be able to map a specific Excel column to the Company field for both Export and Import processes.

## Non-Functional Requirements
- **Data Persistence:** The list of saved companies and the task's company data must be persisted locally using IndexedDB, consistent with the rest of the application.
- **Performance:** Autocomplete suggestions should resolve instantly from local storage without noticeable latency.
- **Localization:** The field label ("Company" / "Empresa") and related UI elements must support the existing multi-language setup.

## Acceptance Criteria
- [ ] A user can type a new company name into the task form and save the task successfully.
- [ ] The newly entered company appears as an autocomplete suggestion for subsequent tasks.
- [ ] The autocomplete dropdown displays a maximum of 10 of the most frequently/recently used companies.
- [ ] The Company field is visibly located before the Project field in the UI.
- [ ] The user can map the Company field to an Excel column in the settings and successfully export tasks including this data.
- [ ] The user can navigate to a settings area to manage (add/edit/delete) the list of saved company suggestions.

## Out of Scope
- Hierarchical filtering of Projects based on the selected Company.
- Integration with external CRM or company databases.
