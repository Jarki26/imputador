# Implementation Plan: Sesame CORS Fix

## Phase 1: Data & Service Layer
- [ ] **Task: Update ConfigStore**
    - Add `getSesameProxyUrl()` and `setSesameProxyUrl(url: string | null)` to `src/lib/configStore.ts`.
- [ ] **Task: Update SesameService**
    - Modify `src/lib/sesameService.ts` to accept an optional `proxyUrl`.
    - Implement a helper to prepend the proxy URL to Sesame HR endpoints.
- [ ] **Task: Add Unit Tests for SesameService with Proxy**
    - Create `src/lib/sesameService.proxy.spec.ts` to verify URL construction with/without proxy.

## Phase 2: UI & Internationalization
- [ ] **Task: Update Translations**
    - Add `sesame_proxy_url`, `sesame_proxy_placeholder`, and `sesame_proxy_help` to all JSON files in `src/locales/`.
- [ ] **Task: Update SesameSettings Component**
    - Add a text input for the CORS Proxy URL in `src/lib/SesameSettings.svelte`.
    - Ensure the value is persisted in `ConfigStore`.
    - Pass the proxy URL to `sesameService` calls.

## Phase 3: Verification
- [ ] **Task: Manual Verification**
    - Verify that entering a proxy URL correctly redirects requests.
    - Verify that leaving it empty continues to work with direct calls.
- [ ] **Task: Conductor - User Manual Verification 'Sesame CORS Fix' (Protocol in workflow.md)**
