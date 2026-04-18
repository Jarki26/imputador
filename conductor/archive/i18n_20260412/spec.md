# Specification: Internationalization (I18n)

## Overview

Implement a comprehensive internationalization system for Imputador to support multiple languages. The system will rely on a custom Svelte 5 rune-based implementation for reactivity and minimal external dependencies.

## Functional Requirements

1.  **Translation Dictionary:**
    - Create a structured JSON-based dictionary for all UI text (buttons, messages, popups, dropdowns).
    - Use a separate JSON file per language (e.g., `en.json`, `es.json`).
    - Initial language structure must cover the existing English texts.
    - Translate the dictionary into Spanish, Portuguese, German, French, and Chinese.

2.  **Language Selection & Persistence:**
    - Add a language selector dropdown in the application settings interface.
    - The dropdown must include representative flag emojis for each language (🇬🇧 EN, 🇪🇸 ES, 🇵🇹 PT, 🇩🇪 DE, 🇫🇷 FR, 🇨🇳 ZH).
    - Persist the user's selected language using `localStorage`.
    - Set the default application language to Spanish.

3.  **Custom I18n Engine:**
    - Develop a custom Svelte 5 reactive store (using runes like `$state` and `$derived`) to manage the current language and handle text resolution.
    - Ensure instant UI updates without requiring a full page reload when the language is changed.

## Non-Functional Requirements

- **Performance:** Loading of translation files should be efficient (e.g., dynamic imports).
- **Dependency Management:** Avoid adding external i18n libraries.

## Acceptance Criteria

- [ ] All UI texts are replaced with reactive translation variables.
- [ ] The application defaults to Spanish on first load.
- [ ] Changing the language via the Settings selector immediately updates all visible text.
- [ ] The selected language is remembered across browser sessions (via `localStorage`).
- [ ] The translation dictionaries for EN, ES, PT, DE, FR, and ZH are populated and correct.

## Out of Scope

- Dynamic localization of user-generated content (e.g., Task Titles, Descriptions, Project names).
- Right-to-Left (RTL) layout support.
