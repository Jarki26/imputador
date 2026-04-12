import { browser } from '$app/environment';

type Translations = Record<string, string>;

class I18n {
  locale = $state('es');
  private translations = $state<Record<string, Translations>>({});

  constructor() {
    if (browser) {
      const storedLocale = localStorage.getItem('imputador_locale');
      if (storedLocale) {
        this.locale = storedLocale;
      }
    }
  }

  setLocale(newLocale: string) {
    this.locale = newLocale;
    if (browser) {
      localStorage.setItem('imputador_locale', newLocale);
    }
  }

  setTranslations(locale: string, dict: Translations) {
    this.translations[locale] = dict;
  }

  t(key: string): string {
    const currentDict = this.translations[this.locale];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    return key;
  }
}

export const i18n = new I18n();
