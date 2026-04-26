# Specification: P2P Synchronization

## Overview

This track implements peer-to-peer (P2P) synchronization between the desktop and mobile browser versions of Imputador without relying on a dedicated backend server for data storage. The goal is to allow seamless continuity of work across devices.

## Functional Requirements

- **WebRTC Connection:** Establish a direct P2P connection between devices using WebRTC.
- **Signaling Server:** Utilize a public/free signaling server (like PeerJS) to exchange initial connection details via a short, shareable ID.
- **Data Synchronization:** Sync the following data stores across connected devices:
  - Tasks & History
  - Settings & Configuration (goals, colors, etc.)
  - Projects & Task Types
- **Conflict Resolution:** Implement a "Last Write Wins" strategy based on update timestamps. If a record is modified on both devices independently, the one with the most recent timestamp will overwrite the older one.
- **Connection Management:** UI to generate a connection ID on one device and input it on another to pair them.
- **Sync Status:** Visual indicator of sync connection status (connected, syncing, disconnected, error).

## Non-Functional Requirements

- **Security:** Data transmitted over WebRTC is encrypted end-to-end by default. The signaling server is only used for connection negotiation, not data transfer.
- **Performance:** Synchronization should happen quietly in the background without blocking the UI.
- **Offline Resilience:** Changes made while disconnected should be queued and synchronized automatically once a connection is re-established.

## Acceptance Criteria

- [ ] A user can generate a pairing ID on the desktop app.
- [ ] A user can enter the pairing ID on the mobile app to establish a connection.
- [ ] Creating/Editing a task on one device updates the other device in real-time if connected.
- [ ] Modifying settings on one device updates the other device in real-time.
- [ ] When both devices make offline changes to the same task, the most recently updated version prevails upon reconnection.
- [ ] The app handles signaling server unavailability gracefully (e.g., showing an error message but keeping the app functional).

## Out of Scope

- Creating a custom, self-hosted signaling server.
- Synchronizing Sesame HR credentials (for security reasons, these should be entered locally on each device).
