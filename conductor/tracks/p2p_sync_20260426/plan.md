# Implementation Plan: P2P Synchronization

## Phase 1: Setup and Infrastructure [x] (Checkpoint: bff08ec)

- [x] Task: Integrate Signaling Server (15ce3b3)
  - [x] Sub-task: Write tests for signaling service (PeerJS initialization, ID generation, connection handling).
  - [x] Sub-task: Implement `signalingService.ts` wrapping PeerJS.
- [x] Task: Establish WebRTC Connection (231d0f4)
  - [x] Sub-task: Write tests for P2P data channel creation and message handling.
  - [x] Sub-task: Implement `p2pConnection.ts` to manage the WebRTC lifecycle.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Setup and Infrastructure' (Protocol in workflow.md) (bff08ec)

## Phase 2: Sync Engine and Conflict Resolution

- [x] Task: Data Serialization and Deserialization (fbb14fd)
  - [ ] Sub-task: Write tests for exporting/importing tasks, settings, and projects to/from sync payloads.
  - [ ] Sub-task: Implement payload generation and parsing logic.
- [x] Task: Conflict Resolution Logic (Last Write Wins) (b3920c7)
  - [ ] Sub-task: Write tests for conflict resolution (newer timestamps override older ones).
  - [ ] Sub-task: Implement `syncEngine.ts` to merge incoming data with local IndexedDB data.
- [~] Task: Background Syncing
  - [ ] Sub-task: Write tests for queuing offline changes and syncing upon reconnection.
  - [ ] Sub-task: Implement offline queue and automatic retry mechanism.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Sync Engine and Conflict Resolution' (Protocol in workflow.md)

## Phase 3: User Interface

- [ ] Task: Connection Management UI
  - [ ] Sub-task: Write tests for pairing UI components (generating ID, inputting ID).
  - [ ] Sub-task: Implement `SyncSettings.svelte` or add to existing settings to manage pairing.
- [ ] Task: Sync Status Indicators
  - [ ] Sub-task: Write tests for status indicator component (connected, syncing, error).
  - [ ] Sub-task: Implement `SyncStatus.svelte` and integrate it into the global header/layout.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: User Interface' (Protocol in workflow.md)
