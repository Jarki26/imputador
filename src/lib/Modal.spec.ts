import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import Modal from './Modal.svelte';
import '../app.css';

describe('Modal', () => {
  beforeEach(() => {
    cleanup();
  });

  describe('Layout', () => {
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

  describe('Closing Behavior', () => {
    it('should close when clicking the backdrop (mousedown and mouseup on backdrop)', async () => {
      const onClose = vi.fn();
      render(Modal, {
        props: { show: true, title: 'Test Modal', onClose },
      });

      const backdrop = document.querySelector('.modal-backdrop')!;

      await fireEvent.mouseDown(backdrop);
      await fireEvent.mouseUp(backdrop);

      expect(onClose).toHaveBeenCalled();
    });

    it('should NOT close when mousedown is inside and mouseup is on backdrop', async () => {
      const onClose = vi.fn();
      render(Modal, {
        props: { show: true, title: 'Test Modal', onClose },
      });

      const backdrop = document.querySelector('.modal-backdrop')!;
      const content = document.querySelector('.modal-content')!;

      await fireEvent.mouseDown(content);
      await fireEvent.mouseUp(backdrop);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should close when pressing Escape', async () => {
      const onClose = vi.fn();
      render(Modal, {
        props: { show: true, title: 'Test Modal', onClose },
      });

      await fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('should close when clicking the close button', async () => {
      const onClose = vi.fn();
      render(Modal, {
        props: { show: true, title: 'Test Modal', onClose },
      });

      const closeBtn = document.querySelector('.close-btn')!;
      await fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
