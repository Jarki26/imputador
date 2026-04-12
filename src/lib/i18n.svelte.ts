import { browser } from '$app/environment';

type Translations = Record<string, any>;

class I18n {
  locale = $state('es');
  private translations = $state<Record<string, Translations>>({});

  // Use Vite's glob import for locales
  private locales = import.meta.glob('/src/locales/*.json');

  constructor() {
    if (browser) {
      const storedLocale = localStorage.getItem('imputador_locale');
      if (storedLocale) {
        this.locale = storedLocale;
      }
    }
    this.loadTranslations(this.locale);
  }

  async setLocale(newLocale: string) {
    await this.loadTranslations(newLocale);
    this.locale = newLocale;
    if (browser) {
      localStorage.setItem('imputador_locale', newLocale);
    }
  }

  private async loadTranslations(locale: string) {
    if (this.translations[locale]) return;

    const path = `/src/locales/${locale}.json`;
    const loader = this.locales[path];

    if (loader) {
      try {
        const mod = (await loader()) as { default: Translations };
        this.translations[locale] = mod.default;
      } catch (e) {
        console.error(`Failed to load locale: ${locale}`, e);
      }
    } else {
      console.warn(`Locale file not found: ${path}`);
    }
  }

  setTranslations(locale: string, dict: Translations) {
    this.translations[locale] = dict;
  }

  t(key: string, vars: Record<string, string> = {}): string {
    const keys = key.split('.');
    let value: any = this.translations[this.locale];

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') return key;

    // Replace placeholders {var}
    let result = value;
    for (const [v, replacement] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{${v}\\}`, 'g'), replacement);
    }

    return result;
  }
}

export const i18n = new I18n();
