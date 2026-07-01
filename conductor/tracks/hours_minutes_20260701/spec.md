# Specification: Formato de Horas HH:MM

## Overview
Crear una función utilitaria para formatear números (que representan horas en formato decimal) a una cadena de texto en formato `HH:MM`. Esta función se utilizará para actualizar la visualización de las horas en el resumen diario (jornada y descanso) y en las cabeceras de cada día del modo semanal.

## Functional Requirements
1. **Función de Formateo:**
   - Crear una función (ej. `formatHoursToHHMM`) en el archivo de utilidades correspondiente.
   - La función debe aceptar un número como entrada, representando las horas en formato decimal (ej. `2.5`).
   - Debe devolver una cadena en formato `HH:MM` (ej. `"02:30"`).
   - Debe rellenar con ceros a la izquierda tanto las horas como los minutos para mantener siempre dos dígitos (ej. `"08:30"`).
   - Debe soportar más de 24 horas acumuladas, mostrando el total sin reiniciar el contador (ej. `26.5` -> `"26:30"`).
2. **Actualización de la UI:**
   - Utilizar la nueva función en la vista de **resumen de horas de la jornada**.
   - Utilizar la nueva función en la vista de **resumen de horas de descanso**.
   - Utilizar la nueva función en las **cabeceras de cada día** dentro del modo semanal.

## Non-Functional Requirements
- La función debe ser pura, fácil de testear.
- Consistencia en toda la UI al mostrar acumulados de tiempo.

## Acceptance Criteria
- [ ] La función de utilería toma `2.5` y devuelve `"02:30"`.
- [ ] La función de utilería toma `25.25` y devuelve `"25:15"`.
- [ ] Las horas trabajadas y de descanso en la vista de resumen se muestran en formato `HH:MM`.
- [ ] Las horas en la cabecera de las columnas del modo semanal se muestran en formato `HH:MM`.
