import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import ExportSettings from './ExportSettings.svelte';
import { i18n } from './i18n.svelte';

describe('ExportSettings - Filename Format', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  const mockProps = {
    template: [],
    exclusions: [],
    excelDateFormat: 'DD/MM/YYYY',
    excelFilenameFormat: 'export_{START_YYYY}',
    onSave: vi.fn(),
  };

  it('should render filename format input with initial value', () => {
    render(ExportSettings, { props: mockProps });
    const input = screen.getByLabelText(/Formato de nombre de archivo/i) as HTMLInputElement;
    expect(input.value).toBe('export_{START_YYYY}');
  });

  it('should show error and disable save when invalid characters are entered', async () => {
    const onSave = vi.fn();
    render(ExportSettings, { props: { ...mockProps, onSave } });
    
    const input = screen.getByLabelText(/Formato de nombre de archivo/i);
    await fireEvent.input(input, { target: { value: 'export/filename' } }); // '/' is invalid

    expect(screen.getByText(/El nombre contiene caracteres no válidos/i)).toBeDefined();
    
    const saveBtn = screen.getByText(/Guardar Configuración/i);
    expect((saveBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('should call onSave with updated filename format', async () => {
    const onSave = vi.fn();
    render(ExportSettings, { props: { ...mockProps, onSave } });
    
    const input = screen.getByLabelText(/Formato de nombre de archivo/i);
    await fireEvent.input(input, { target: { value: 'new_format_{END_MM}' } });

    const saveBtn = screen.getByText(/Guardar Configuración/i);
    await fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      excelFilenameFormat: 'new_format_{END_MM}'
    }));
  });
});
