import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import TaskColorSettings from './TaskColorSettings.svelte';
import { i18n } from './i18n.svelte';
import { TASK_TYPES } from './config';

describe('TaskColorSettings.svelte', () => {
  const defaultProps = {
    colors: {} as Record<string, string>,
    onSaveColor: vi.fn(),
  };

  beforeEach(async () => {
    cleanup();
    vi.clearAllMocks();
    await i18n.setLocale('es');
  });

  it('should render all task types', () => {
    render(TaskColorSettings, { props: defaultProps });
    TASK_TYPES.forEach((type) => {
      expect(screen.getByText(type.name)).toBeDefined();
    });
  });

  it('should use defaultColor from config for OFFLINE if no custom color exists', () => {
    render(TaskColorSettings, { props: defaultProps });

    // Find OFFLINE item
    const offlineHeader = screen.getByText('OFFLINE').closest('.type-header') as HTMLElement;
    const colorDot = offlineHeader.querySelector('.color-dot') as HTMLElement;

    // #f1f5f9 is rgb(241, 245, 249)
    expect(colorDot.style.backgroundColor).toBe('rgb(241, 245, 249)');
  });

  it('should use custom color if provided', () => {
    const props = {
      ...defaultProps,
      colors: { OFFLINE: '#ff0000' },
    };
    render(TaskColorSettings, { props });

    const offlineHeader = screen.getByText('OFFLINE').closest('.type-header') as HTMLElement;
    const colorDot = offlineHeader.querySelector('.color-dot') as HTMLElement;

    expect(colorDot.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });
});
