import { describe, it, expect } from 'vitest';
import '../app.css';

describe('Global Layout Styles', () => {
  it('should have height 100% and overflow hidden on html and body', () => {
    const html = document.documentElement;
    const body = document.body;

    const htmlStyle = window.getComputedStyle(html);
    const bodyStyle = window.getComputedStyle(body);

    // Height 100% resolves to the viewport height in pixels
    expect(html.offsetHeight).toBe(window.innerHeight);
    expect(body.offsetHeight).toBe(window.innerHeight);

    expect(htmlStyle.overflow).toBe('hidden');
    expect(bodyStyle.overflow).toBe('hidden');
  });
});
