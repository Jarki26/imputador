# Specification: Sesame CORS Fix (Bug)

## Overview

Currently, the Sesame HR integration in the production/deployed environment fails due to CORS (Cross-Origin Resource Sharing) restrictions. The Sesame HR backend (`back-eu4.sesametime.com`) does not include the necessary `Access-Control-Allow-Origin` headers for the application's origin, blocking client-side `fetch` requests. This track aims to fix this by routing all Sesame HR API calls through a CORS proxy.

## Functional Requirements

- **Proxy Configuration:** Add a new setting in the "Integrations" tab to configure a CORS proxy URL.
- **API Redirection:** Update the `sesameService.ts` to prepend the configured proxy URL to all Sesame HR API endpoints.
- **Protocol Support:** Ensure the proxy correctly forwards the `Authorization` header and handles preflight requests properly.
- **Default Behavior:** If no proxy is configured, attempt direct calls (for local development or if Sesame updates their CORS policy).

## Non-Functional Requirements

- **Security:** Ensure the configured proxy URL is persisted locally (IndexedDB/configStore) and only accessible by the application.
- **Privacy:** Users should be warned that using a public CORS proxy may expose their sensitive data (login/token) to the proxy owner.
- **Performance:** Routing through a proxy should not significantly impact the responsiveness of the synchronization process.

## Acceptance Criteria

- [ ] Users can enter a custom CORS proxy URL in the Sesame integration settings.
- [ ] Login to Sesame HR works in the production environment via the proxy.
- [ ] Synchronizing time logs (checks) works in the production environment via the proxy.
- [ ] If no proxy is provided, the integration still functions (for environments where CORS is not an issue).

## Out of Scope

- Hosting or providing a default CORS proxy server (the user must provide their own endpoint).
- Implementing a proxy server from scratch (the fix is client-side).
