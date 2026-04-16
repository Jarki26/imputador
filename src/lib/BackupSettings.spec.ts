import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import BackupSettings from './BackupSettings.svelte';
import { i18n } from './i18n.svelte';

describe('BackupSettings.svelte', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('en');
  });

  it('should render backup and restore buttons', () => {
    render(BackupSettings);
    expect(screen.getByText(/Backup & Restore/i)).toBeDefined();
    expect(screen.getByText(/Export Settings/i)).toBeDefined();
    expect(screen.getByText(/Import Settings/i)).toBeDefined();
  });

  it('should trigger file input on Import Settings click', async () => {
    const { container } = render(BackupSettings);
    const importBtn = screen.getByText(/Import Settings/i);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Mock click method of the hidden file input
    const clickSpy = vi.spyOn(fileInput, 'click');
    
    await fireEvent.click(importBtn);
    expect(clickSpy).toHaveBeenCalled();
  });
});
