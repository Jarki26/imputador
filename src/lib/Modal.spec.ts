import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Modal from './Modal.svelte';
import '../app.css';

describe('Modal Layout', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should have max-height 90dvh and overflow-y auto on .modal-content', () => {
    const { container } = render(Modal, {
      props: { show: true, title: 'Test Modal', onClose: () => {} },
    });
    const modalContent = container.querySelector(
      '.modal-content',
    ) as HTMLElement;

    expect(modalContent).toBeDefined();

    let foundRule = false;
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      try {
        for (let j = 0; j < sheet.cssRules.length; j++) {
          const rule = sheet.cssRules[j] as CSSStyleRule;
          if (rule.selectorText?.includes('.modal-content')) {
            if (
              rule.style.maxHeight === '90dvh' &&
              rule.style.overflowY === 'auto'
            ) {
              foundRule = true;
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }

    expect(foundRule).toBe(true);
  });
});
