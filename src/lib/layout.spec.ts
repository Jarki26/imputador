import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Page from '../routes/+page.svelte';
import '../app.css';

describe('Global Layout Styles', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should have height 100% and overflow hidden on html and body', () => {
    const html = document.documentElement;
    const body = document.body;

    const htmlStyle = window.getComputedStyle(html);
    const bodyStyle = window.getComputedStyle(body);

    expect(html.offsetHeight).toBe(window.innerHeight);
    expect(body.offsetHeight).toBe(window.innerHeight);

    expect(htmlStyle.overflow).toBe('hidden');
    expect(bodyStyle.overflow).toBe('hidden');
  });

  it('should have .app-container with height 100dvh', () => {
    render(Page);

    // Find the style tag or use a more direct way to check the CSS rule
    // In Vitest Playwright, styles are injected.
    // We can iterate through document.styleSheets
    let foundDvh = false;
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      try {
        for (let j = 0; j < sheet.cssRules.length; j++) {
          const rule = sheet.cssRules[j] as CSSStyleRule;
          if (
            rule.selectorText === '.app-container' ||
            rule.selectorText?.includes('.app-container')
          ) {
            if (rule.style.height === '100dvh') {
              foundDvh = true;
            }
          }
        }
      } catch (e) {
        // External stylesheets might throw security error
      }
    }

    expect(foundDvh).toBe(true);
  });
});
