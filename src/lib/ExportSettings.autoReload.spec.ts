import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import ExportSettings from './ExportSettings.svelte';
import { i18n } from './i18n.svelte';

describe('ExportSettings - Auto Reload', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  it('should call onImportComplete callback after successful import', async () => {
    const onImportComplete = vi.fn();
    const { container } = render(ExportSettings, {
      props: { 
        template: [], 
        exclusions: [], 
        onSave: vi.fn(),
        onImportComplete 
      },
    });

    // Mock file selection
    const file = new File([''], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await fireEvent.change(input, { target: { files: [file] } });

    // Confirm dialog
    await screen.findByText(/Vaciar datos e importar/i);
    const confirmInput = screen.getByPlaceholderText('IMPORTAR');
    await fireEvent.input(confirmInput, { target: { value: 'IMPORTAR' } });

    const confirmBtn = screen.getByText(/Importar Archivo/i, { selector: 'button.confirm-btn' });
    await fireEvent.click(confirmBtn);

    // Wait for results modal to appear, ensuring confirmImport finished
    expect(await screen.findByText(/Importación Finalizada/i)).toBeDefined();

    // Check if callback was called
    expect(onImportComplete).toHaveBeenCalled();
  });
});
