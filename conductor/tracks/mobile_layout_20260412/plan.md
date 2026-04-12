# Implementation Plan: Mobile Layout Fix (Daily View)

## Phase 1: Layout Fixes
- [ ] Task: Update Global CSS
    - [ ] Edit `src/app.css` to add `height: 100%; overflow: hidden;` to the `html, body` selector.
- [ ] Task: Update App Container CSS
    - [ ] Edit `src/routes/+page.svelte` to change `.app-container` height from `100vh` to `100dvh`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Layout Fixes' (Protocol in workflow.md)