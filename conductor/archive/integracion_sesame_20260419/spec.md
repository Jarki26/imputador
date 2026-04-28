# Specification: Integración Sesame

## 1. Overview

Integrate Sesame HR into Imputador to automatically generate "Rest" (Descanso) tasks based on the user's clock-in/clock-out times. The integration will retrieve time logs from Sesame and create rest gaps within the bounds of the first and last work registry of the day.

## 2. Functional Requirements

### 2.1 Settings & Authentication

- **Settings Section:** Add a new section in the application settings for Sesame HR.
- **Login Form:** Inputs for `user` (email) and `password`.
- **Storage:** Credentials will be stored in standard client-side storage (IndexedDB/LocalStorage).
- **Authentication Flow:**
  1. Call `POST https://back-eu4.sesametime.com/api/v3/security/login` to obtain the auth token.
  2. Call `GET https://back-eu4.sesametime.com/api/v3/security/me` to obtain the user's `id`.
  3. Store the token and user `id` for subsequent API calls.
- **Logout:** A logout button in the settings that clears stored Sesame credentials, token, and user ID.

### 2.2 Sync Execution

- **Manual Trigger:** Add a "Sync Sesame" button to the Weekly View.
- **Fetch Checks:** Upon clicking sync, fetch checks for the currently displayed week (`from` Monday to `to` Sunday).
  - API: `GET https://back-eu4.sesametime.com/api/v3/employees/{{id}}/checks?from={{week_start}}&to={{week_end}}&includeOut=true`
- **Error Handling:** Gracefully handle API errors (422, 404, 401, 403, 409, 429, 500, 503) and display informative messages to the user.

### 2.3 Rest Task Generation & Conflict Resolution

- **Calculation:** For each day, identify gaps between consecutive `checkOut` and `checkIn` events, but ONLY between the very first `checkIn` of the day and the final `checkOut` of the day.
- **Task Format:**
  - Title: "Descanso"
  - Project: "sesame"
  - Type: "Rest"
- **Insertion Logic:**
  1. If an identical "Descanso" task (exact same start and end time, matching Title/Project/Type format) already exists, skip insertion.
  2. If an existing task matches the "Descanso" format but its times conflict with the new gap, remove the existing "Descanso" task and insert the new one.
  3. If there is a conflict with _any other_ type of task, insert the new "Descanso" task and allow the user to resolve the resulting overlap manually in the UI.
- **No Data:** Days without checks will be silently ignored.

## 3. Non-Functional Requirements

- **Security:** Do not expose the password unnecessarily in the UI or logs.
- **Client-Side:** All API calls will be made directly from the browser to Sesame HR.

## 4. Acceptance Criteria

- User can enter Sesame credentials in settings and log in.
- User can log out, clearing their Sesame data.
- Clicking the sync button fetches checks for the active week.
- Appropriate "Rest" tasks are created to fill the time between work blocks.
- Existing auto-generated rests are updated/replaced if the checks change.
- User-created tasks conflicting with generated rests are preserved, producing an overlap state for manual resolution.
- Clear error messages are shown for network or API failures.
