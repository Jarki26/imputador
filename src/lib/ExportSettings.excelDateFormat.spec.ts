import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import ExportSettings from './ExportSettings.svelte';
import { i18n } from './i18n.svelte';

describe('ExportSettings.svelte excelDateFormat', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  it('should render the date format input field', () => {
    render(ExportSettings, {
      props: {
        template: [],
        exclusions: [],
        excelDateFormat: 'DD/MM/YYYY',
        onSave: vi.fn(),
      },
    });

    // Check for the label or section title
    expect(screen.getByText(/Formato de Fecha \(Excel\)/i)).toBeDefined();
    // Check for the input with current value
    expect(screen.getByDisplayValue('DD/MM/YYYY')).toBeDefined();
  });

  it('should call onSave with updated date format', async () => {
    const onSave = vi.fn();
    render(ExportSettings, {
      props: {
        template: [],
        exclusions: [],
        excelDateFormat: 'DD/MM/YYYY',
        onSave,
      },
    });

    const input = screen.getByDisplayValue('DD/MM/YYYY') as HTMLInputElement;
    await fireEvent.input(input, { target: { value: 'YYYY-MM-DD' } });

    const saveBtn = screen.getByText(/Guardar Configuración/i);
    await fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      excelDateFormat: 'YYYY-MM-DD'
    }));
  });
});
