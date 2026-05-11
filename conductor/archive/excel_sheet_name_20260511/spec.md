# Specification: Parameterizable Excel Sheet Name

## Overview
Currently, the default name for the exported Excel sheet is "Task". This track changes the default name to "Hoja1" and makes it parameterizable within the "Exportar datos" configuration section to avoid future errors and increase flexibility.

## Functional Requirements
- **Default Value:** The default sheet name for Excel exports MUST be "Hoja1".
- **Configuration Field:** Add a new text input field in the "Exportar datos" settings.
- **UI Label:** The label for the new field MUST be "Nombre hoja".
- **Persistence:** The configured sheet name MUST be saved and loaded with the rest of the application's configuration.
- **Export Logic:** The Excel export function MUST use the configured sheet name instead of a hardcoded value.

## Non-Functional Requirements
- **Validation:** No specific validation logic (e.g., character restrictions, length limits) will be implemented for the sheet name input at this time.

## Out of Scope
- Validation for invalid Excel sheet names.
- Dynamic sheet name generation based on content.