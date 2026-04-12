# Specification: Mobile Layout Fix (Daily View)

## Overview
Fix rendering and scrolling issues on mobile devices when using the daily mode. The top and bottom parts of the screen are not visible, and the browser prevents scrolling beyond the visible area.

## Functional Requirements
1.  **Strict Layout Frame:** Ensure the application fits exactly within the mobile browser's visible viewport, accounting for dynamic toolbars (like address bars).
2.  **Scrollable Content:** Prevent the `body` from scrolling and delegate all scrolling to internal containers (like `.daily-section`).

## Implementation Details
*   Modify `src/app.css` to restrict the HTML and Body elements.
*   Update `src/routes/+page.svelte` to utilize the dynamic viewport height (`dvh`) unit instead of the static viewport height (`vh`) unit.

## Acceptance Criteria
*   [ ] The application container height is set to `100dvh`.
*   [ ] `html` and `body` are restricted to `height: 100%` and `overflow: hidden`.
*   [ ] The Daily View is fully visible and scrollable on mobile devices without cutting off the top header or bottom history controls.