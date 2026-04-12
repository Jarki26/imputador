# Tareas Pendientes - Proyecto Imputador

Esta lista identifica las funcionalidades definidas en `docs/Descripción.md` que aún no han sido implementadas en los tracks finalizados.

## 1. Lógica de Inserción y Edición Avanzada

- [x] **Implementar Inserción con Sobre-escritura:**
  - Lógica para dividir registros existentes cuando un nuevo registro solapa parcialmente.
  - Pruebas unitarias para casos de solape al inicio, medio y fin.
- [x] **Implementar Inserción con Desplazamiento:**
  - Lógica para "empujar" tareas posteriores al insertar una nueva en medio de una secuencia.
  - Asegurar que las duraciones de las tareas desplazadas se mantengan intactas.
- [x] **Modo Relleno de Huecos (Smart Fill):**
  - Checkbox en el formulario de creación.
  - Algoritmo para repartir una duración total entre los huecos disponibles del día.
- [x] **Edición por Duración:**
  - Permitir al usuario introducir `00h 00m 00s` en lugar de hora de fin para calcular el término del registro.

## 2. Gestión de Proyectos y Tareas Recientes

- [x] **Sistema de Tareas Recientes:**
  - Almacenar las últimas 10 tareas únicas utilizadas.
  - Mostrar estas tareas en un desplegable rápido en el formulario.
- [x] **Purger de Historial:**
  - Lógica para eliminar del historial tareas que no se hayan usado en las últimas 2 semanas.
- [x] **Tipos de Tarea Parametrizables:**
  - Definir la "lista cerrada" de valores para tipos de tarea.
  - Asegurar que el tipo "Descanso" tenga el tratamiento adecuado (no facturable/justificado).

## 3. Visualización y Objetivos Semanales

- [x] **Configuración de Horas Semanales:**
  - Interfaz para editar el objetivo de horas (default 41h).
  - Persistencia de esta configuración en IndexedDB.
- [x] **Cómputo Comparativo:**
  - Mostrar en la Vista Semanal el total de horas realizadas frente al objetivo semanal.

## 4. Mejoras de UX

### 4.1 Vista Semanal (`WeeklyView.svelte`)
- [x] **Gestión de Registros:**
    - Botón para eliminar tareas directamente desde la vista.
    - Proponer combinación automática de registros consecutivos idénticos (mismo proyecto/tarea).
    - Copiar registros existentes al historial de tareas recientes (plantillas rápidas).
- [x] **Navegación y Visualización:**
    - Selector de flechas para navegar entre semanas.
    - Acceso a la vista diaria al pulsar en la cabecera de un día.
    - Mantener columna de horas visible en dispositivos móviles.
    - Ajustar escala visual de celdas (ej: que 30min ocupe exactamente la mitad de la celda).
- [x] **Interacción y Control:**
    - Sugerir secuenciación sin huecos al mover tareas cerca de otras.
    - Switches de bloqueo para acciones táctiles (bloquear edición, movimiento o creación accidental).
    - Corregir lógica de división/desplazamiento al editar registros desde esta vista.

### 4.2 Formulario de Tareas (`TaskForm.svelte`)
- [x] **Lógica de Entrada:** ✅ 2026-04-12
    - Botón para bloquear duración (ajusta la hora de fin automáticamente al cambiar el inicio).
    - Cargar por defecto la fecha del día seleccionado al abrir el formulario.
    - Restringir registros a un único día para simplificar selectores de hora.

### 4.3 Sistema General
- [x] **Persistencia y Ayuda:** ✅ 2026-04-12
    - Sistema de historial (Deshacer/Rehacer) o puntos de restauración.
    - Tutorial interactivo de funcionalidades.
- [x] **Lógica de Negocio:** ✅ 2026-04-12
    - Nuevo tipo "Ausencia Facturable" (no cuenta como trabajo pero descuenta del objetivo semanal).

## 5. Características de Interoperabilidad (Futuro)

- [ ] **Módulo de Excel:**
  - Exportación de registros diarios/semanales.
  - Importación de datos externos.
- [ ] **Sincronización P2P:**
  - Investigación e implementación de sincronización entre navegador móvil y escritorio sin servidor intermedio.

---

_Documento generado automáticamente basado en el análisis de la descripción del producto y el archivo de tracks._
