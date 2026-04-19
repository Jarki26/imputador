## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: prettier, eslint, vitest
- **Terminal**: CMD

---

# Contexto del Proyecto - Imputador

Este documento define las bases y restricciones del proyecto para Gemini CLI.

## Definición del Proyecto

La definición detallada de funcionalidades, flujos de usuario y lógica de negocio se encuentra en:

- [Descripción del Proyecto](docs/Descripción.md)

## Stack Tecnológico

- **Frontend:** Svelte
- **Almacenamiento:** IndexedDB (en el navegador)
- **Lógica de Negocio:** JavaScript (gestión local en el navegador, sin persistencia externa)

## Restricciones de Entorno

- **Terminal:** PowerShell.
- **Concatenación de comandos:** No utilizar `&&`. Utilizar el punto y coma `;` para ejecutar comandos secuencialmente o ejecutarlos de forma independiente.

## Resumen de Funcionalidades Críticas

- **Registro de Tareas:** Seguimiento de jornada laboral sin huecos temporales.
- **Vistas:** Calendario semanal tipo Outlook y desglose diario.
- **Modos de Inserción:**
  - _Sobre-escritura:_ Divide registros existentes para encajar el nuevo.
  - _Desplazamiento:_ Empuja los registros posteriores manteniendo duraciones.
- **Relleno Automático:** Capacidad de repartir una duración total en los huecos disponibles del día.
