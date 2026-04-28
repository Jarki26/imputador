# Tech Stack: Imputador

## Core

- **Language:** TypeScript
- **Frontend Framework:** Svelte 5 (Runes).
- **Styling:** Vanilla CSS following Material Design 3 principles.

## Data Storage

- **Primary Database:** IndexedDB (in-browser) for high-performance, structured data storage without external dependencies.
- **Data Persistence:** Client-side only.

## Architecture

- **Type:** Single Page Application (SPA).
- **Client-Side Only:** All logic and data management will reside within the browser, ensuring privacy and offline capability.
- **Interactivity:** Native Pointer Events for grid-based interactions (Drag & Drop, Resizing) to ensure performance and cross-platform support.
- **History Management:** Reactive, session-based Undo/Redo stack implemented with Svelte 5 Runes.
- **Internationalization:** Custom, reactive i18n engine using Svelte 5 Runes for zero-dependency multi-language support.
- **View Customization:** Session-based vertical zoom functionality for the Weekly View using dynamic CSS variables and reactive state.
- **Excel Manipulation:**
  - **Library:** `xlsx` (SheetJS) for client-side generation and parsing of `.xlsx` files.
  - **Capability:** Bidirectional mapping for data portability (Export/Import foundation).
  - **Date Handling:** Bidirectional operations support custom token-based formatting (YYYY, MM, DD).

## External Integrations

- **Sesame HR API:** Direct client-side integration via standard `fetch` API for retrieving time logs and employee information.

## P2P Synchronization

- **Signaling:** `peerjs` for WebRTC connection negotiation using a public signaling server.
- **Connection:** Direct WebRTC Data Channels for end-to-end encrypted synchronization.

## Settings Backup & Restore

- **JSON-based Backup:** JSON for structured configuration export/import.
- **Scope:** Coverage of `config`, `companies`, and `projects` tables.

---

## Change Log

### 2026-04-26

- Added `peerjs` to the tech stack to support P2P synchronization between devices. This enables real-time data exchange without a persistent backend.
