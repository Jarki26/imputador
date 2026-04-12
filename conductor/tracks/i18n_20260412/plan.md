# Implementation Plan: Internationalization (I18n)

## Phase 1: Core i18n Engine & Storage
- [ ] Task: Write Failing Tests - i18n Rune and Storage
    - [ ] Create `src/lib/i18n.spec.ts` to test the custom reactive store and language switching logic.
    - [ ] Add tests in `i18n.spec.ts` for `localStorage` persistence and default 'es' fallback.
- [ ] Task: Implement i18n Engine
    - [ ] Create `src/lib/i18n.ts` with a custom Svelte 5 `$state` rune for the current language and dictionary.
    - [ ] Implement a `$derived` state or function to resolve translation keys.
    - [ ] Implement `localStorage` integration to load/save the selected language.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core i18n Engine & Storage' (Protocol in workflow.md)

## Phase 2: Translation Dictionaries
- [ ] Task: Write Failing Tests - Dictionary Loading
    - [ ] Add tests in `i18n.spec.ts` to verify dictionaries load correctly based on the selected language.
- [ ] Task: Implement Translation Dictionaries
    - [ ] Create dictionary files (e.g., `src/locales/`): `en.json`, `es.json`, `pt.json`, `de.json`, `fr.json`, `zh.json`.
    - [ ] Populate `en.json` with all existing English UI texts.
    - [ ] Translate and populate the other language files.
    - [ ] Update `i18n.ts` to load the appropriate dictionary.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Translation Dictionaries' (Protocol in workflow.md)

## Phase 3: UI Integration - Settings & Selector
- [ ] Task: Write Failing Tests - Settings UI
    - [ ] Add tests in `src/lib/Settings.spec.ts` for the new language selector component.
    - [ ] Verify the selector updates the i18n store and persists the choice.
- [ ] Task: Implement Language Selector
    - [ ] Update `src/lib/Settings.svelte` to include a dropdown for language selection.
    - [ ] Add options with flag emojis: 🇬🇧 EN, 🇪🇸 ES, 🇵🇹 PT, 🇩🇪 DE, 🇫🇷 FR, 🇨🇳 ZH.
    - [ ] Bind the selector to the custom i18n engine.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI Integration - Settings & Selector' (Protocol in workflow.md)

## Phase 4: Application-Wide Localization
- [ ] Task: Write Failing Tests - UI Localization
    - [ ] Update existing tests (e.g., `TaskForm.spec.ts`, `WeeklyView.spec.ts`) to mock or account for the i18n engine instead of hardcoded strings.
- [ ] Task: Implement App-Wide Localization
    - [ ] Replace all hardcoded English UI strings in `.svelte` files with calls to the i18n translation function.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Application-Wide Localization' (Protocol in workflow.md)

## Phase 5: Documentation Update
- [ ] Task: Update Pending Tasks Document
    - [ ] Modify `conductor/tareas_pendientes.md` to mark all items in section 5 (Internationalization) as completed (`[x]`).
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Documentation Update' (Protocol in workflow.md)