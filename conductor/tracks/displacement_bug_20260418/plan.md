# Implementation Plan: Fix Extra Task Generation on Displacement Drag

## Phase 1: Setup and Reproduction Tests [checkpoint: 69f6b6f]
- [x] Task: Create a failing test in `src/lib/taskStore.editCollision.spec.ts` or `src/lib/taskStore.displacement.spec.ts` that explicitly reproduces the scenario: updating a task with displacement where the new bounds overlap with an earlier task, causing its "old self" to be incorrectly split and duplicated by recursive `pushConflict` calls.
- [x] Task: Run the test suite to ensure the new test fails as expected (Red Phase).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Setup and Reproduction Tests' (Protocol in workflow.md) 69f6b6f

## Phase 2: Fix Displacement Logic [checkpoint: 277e85d]
- [x] Task: Modify `pushConflict` in `src/lib/taskStore.collision.ts` to accept an array or Set of `excludeIds` instead of a single `excludeId`.
- [x] Task: Update the recursive calls within `pushConflict` to pass down the accumulated `excludeIds` (including the originally dragged task and any newly shifted tasks).
- [x] Task: Run the test suite and verify that the previously failing test now passes without generating the extra replica (Green Phase).
- [x] Task: Ensure all other tests related to displacement continue to pass (regression check).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Fix Displacement Logic' (Protocol in workflow.md) 277e85d

## Phase 3: Final Verification
- [ ] Task: Run the full test suite with coverage to verify >80% coverage for modified files.
- [ ] Task: Check code for linting/formatting errors.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Verification' (Protocol in workflow.md)