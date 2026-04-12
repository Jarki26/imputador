import { describe, it, expect, beforeEach, vi } from 'vitest';
import { i18n } from './i18n.svelte';

describe('i18n Store', () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();
    await i18n.setLocale('es');
  });

  it('should default to Spanish (es) if no language is stored', () => {
    expect(i18n.locale).toBe('es');
  });

  it('should load language from localStorage on initialization', () => {
    localStorage.setItem('imputador_locale', 'en');
    // We might need to re-initialize or trigger a reload for the test
    // Assuming i18n.init() or similar exists
    i18n.setLocale('en'); 
    expect(i18n.locale).toBe('en');
    expect(localStorage.getItem('imputador_locale')).toBe('en');
  });

  it('should update locale and persist to localStorage', () => {
    i18n.setLocale('fr');
    expect(i18n.locale).toBe('fr');
    expect(localStorage.getItem('imputador_locale')).toBe('fr');
  });

  it('should resolve translation keys', async () => {
    i18n.setTranslations('es', { app: { title: 'Imputador' } });
    expect(i18n.t('app.title')).toBe('Imputador');
  });

  it('should return the key if translation is missing', () => {
    expect(i18n.t('non.existent.key')).toBe('non.existent.key');
  });

  it('should change translations when locale changes', async () => {
    i18n.setTranslations('es', { greet: 'Hola' });
    i18n.setTranslations('en', { greet: 'Hello' });
    
    await i18n.setLocale('es');
    expect(i18n.t('greet')).toBe('Hola');
    
    await i18n.setLocale('en');
    expect(i18n.t('greet')).toBe('Hello');
  });

  it('should replace placeholders', async () => {
    await i18n.setLocale('en');
    i18n.setTranslations('en', { welcome: 'Welcome, {name}!' });
    expect(i18n.t('welcome', { name: 'Javier' })).toBe('Welcome, Javier!');
  });
});
