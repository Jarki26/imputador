# Implementation Plan: Offline Task Type and Sesame Gap Fills

## Phase 1: Core Logic and Store Updates (OFFLINE Task Type)
- [x] Task: Update the `TASK_TYPES` constant in `src/lib/config.ts` to include the `OFFLINE` type with a default muted color. 000a32f
- [x] Task: Write tests for `src/lib/taskStore.ts` (or relevant logic) to ensure `OFFLINE` tasks are excluded from daily billable/rest totals. 458cad2
- [x] Task: Implement the logic in `src/lib/taskStore.ts` to exclude `OFFLINE` tasks from daily totals. 458cad2
- [x] Task: Write tests for the weekly totals components (e.g., `WeeklyView.svelte`, `WeeklyHeader.svelte`) to ensure `OFFLINE` tasks don't count towards the weekly goal. ad4bf36
- [x] Task: Implement the logic in the weekly totals components to exclude `OFFLINE` tasks from the weekly goal. ad4bf36
- [x] Task: Add translation keys for `type_offline` and the description "Fuera de la oficina" across all locale files (`src/locales/*.json`). ad4bf36
- [x] Task: Conductor - User Manual Verification 'Phase 1: Core Logic and Store Updates' (Protocol in workflow.md) ad4bf36

## Phase 2: Sesame Integration Updates (Gap Calculation & Sync)
- [x] Task: Write tests for `calculateGapsFromChecks` in `src/lib/sesameSync.spec.ts` to verify it generates `OFFLINE` tasks from `00:00` to the first check-in and from the last check-out to `23:59`. 6c6df8e
- [x] Task: Implement the new logic in `calculateGapsFromChecks` (in `src/lib/sesameSync.ts`) to return both the existing `REST` gaps and the new `OFFLINE` boundaries. 6c6df8e
- [x] Task: Write tests for `syncSesameTasks` in `src/lib/sesameSync.spec.ts` to verify the new collision policy: replacing both existing Sesame `REST` and `OFFLINE` tasks when a new Sesame task is inserted. 6c6df8e
- [x] Task: Implement the updated collision policy in `syncSesameTasks` (`src/lib/sesameSync.ts`) to overwrite any existing Sesame task (`REST` or `OFFLINE`) that conflicts with incoming Sesame data. 6c6df8e
- [x] Task: Conductor - User Manual Verification 'Phase 2: Sesame Integration Updates' (Protocol in workflow.md) 360ec75
