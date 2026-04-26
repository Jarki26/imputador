# Implementation Plan: Sesame CORS Fix

## Phase 1: Data & Service Layer

- [x] **Task: Update ConfigStore** [51990a4]
  - Add `getSesameProxyUrl()` and `setSesameProxyUrl(url: string | null)` to `src/lib/configStore.ts`.
- [x] **Task: Update SesameService** [fec295b]
  - Modify `src/lib/sesameService.ts` to accept an optional `proxyUrl`.
  - Implement a helper to prepend the proxy URL to Sesame HR endpoints.
- [x] **Task: Add Unit Tests for SesameService with Proxy** [fec295b]
  - Create `src/lib/sesameService.proxy.spec.ts` to verify URL construction with/without proxy.

## Phase 2: UI & Internationalization

- [x] **Task: Update Translations** [49c3eec]
  - Add `sesame_proxy_url`, `sesame_proxy_placeholder`, and `sesame_proxy_help` to all JSON files in `src/locales/`.
- [x] **Task: Update SesameSettings Component** [c1f9cbe]
  - Add a text input for the CORS Proxy URL in `src/lib/SesameSettings.svelte`.
  - Ensure the value is persisted in `ConfigStore`.
  - Pass the proxy URL to `sesameService` calls.

## Phase 3: Verification

- [x] **Task: Manual Verification** [c1f9cbe]
  - Verify that entering a proxy URL correctly redirects requests.
  - Verify that leaving it empty continues to work with direct calls.
- [x] **Task: Conductor - User Manual Verification 'Sesame CORS Fix' (Protocol in workflow.md)** [checkpoint: sesame_cors_fix_complete]
