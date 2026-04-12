# Implementation Plan: Mobile Layout Fix (Daily View)

## Phase 1: Layout Fixes
- [x] Task: Update Global CSS e7b64d1
    - [ ] Edit `src/app.css` to add `height: 100%; overflow: hidden;` to the `html, body` selector.
- [x] Task: Update App Container CSS d58575d
    - [ ] Edit `src/routes/+page.svelte` to change `.app-container` height from `100vh` to `100dvh`.
- [x] Task: Fix Modal Scrolling c92a5a7
    - [ ] Edit `src/lib/Modal.svelte` to add `max-height: 90dvh; overflow-y: auto;` to `.modal-content`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Layout Fixes' (Protocol in workflow.md)