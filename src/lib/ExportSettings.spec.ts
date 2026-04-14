import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import ExportSettings from './ExportSettings.svelte';
import { i18n } from './i18n.svelte';
import type { ColumnMapping } from './exportConfigStore';

describe('ExportSettings.svelte', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  const mockTemplate: ColumnMapping[] = [
    { columnName: 'Col 1', taskField: 'project' },
    { columnName: 'Col 2', fixedValue: 'Fixed' },
  ];

  const mockExclusions = ['REST'];

  it('should render template mappings', () => {
    render(ExportSettings, {
      props: {
        template: mockTemplate,
        exclusions: mockExclusions,
        onSave: vi.fn(),
      },
    });
    expect(screen.getByDisplayValue('Col 1')).toBeDefined();
    expect(screen.getByDisplayValue('Col 2')).toBeDefined();
  });

  it('should allow adding a new mapping', async () => {
    const onSave = vi.fn();
    render(ExportSettings, {
      props: {
        template: mockTemplate,
        exclusions: mockExclusions,
        onSave,
      },
    });

    const addBtn = screen.getByText(/Añadir Columna/i);
    await fireEvent.click(addBtn);

    const inputs = screen.getAllByPlaceholderText(/Nombre Columna/i);
    expect(inputs.length).toBe(3);
  });

  it('should allow deleting a mapping', async () => {
    const onSave = vi.fn();
    render(ExportSettings, {
      props: {
        template: mockTemplate,
        exclusions: mockExclusions,
        onSave,
      },
    });

    const deleteBtns = screen.getAllByTitle(/Eliminar/i);
    await fireEvent.click(deleteBtns[0]);

    const inputs = screen.getAllByPlaceholderText(/Nombre Columna/i);
    expect(inputs.length).toBe(1);
  });

  it('should toggle task type exclusions', async () => {
    const onSave = vi.fn();
    render(ExportSettings, {
      props: { template: mockTemplate, exclusions: [], onSave },
    });

    const checkbox = screen.getByLabelText(/REST/i) as HTMLInputElement;
    await fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    await fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it('should call onSave with updated data', async () => {
    const onSave = vi.fn();
    render(ExportSettings, {
      props: {
        template: mockTemplate,
        exclusions: mockExclusions,
        onSave,
      },
    });

    const saveBtn = screen.getByText(/Guardar Configuración/i);
    await fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledWith({
      template: expect.any(Array),
      exclusions: expect.any(Array),
    });
  });

  it('should render the Import File button', () => {
    render(ExportSettings, {
      props: {
        template: mockTemplate,
        exclusions: mockExclusions,
        onSave: vi.fn(),
      },
    });

    const importBtn = screen.getByText(/Importar Archivo/i);
    expect(importBtn).toBeDefined();
  });

  it('should show wipe confirmation dialog after file selection', async () => {
    const { container } = render(ExportSettings, {
      props: { template: mockTemplate, exclusions: [], onSave: vi.fn() },
    });

    const file = new File([''], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/Vaciar datos e importar/i)).toBeDefined();
    expect(screen.getByText(/Escribe 'IMPORTAR' para confirmar/i)).toBeDefined();
  });

  it('should show results modal after successful import', async () => {
    const { container } = render(ExportSettings, {
      props: { template: mockTemplate, exclusions: [], onSave: vi.fn() },
    });

    const file = new File([''], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await fireEvent.change(input, { target: { files: [file] } });

    // Wait for confirm dialog
    await screen.findByText(/Vaciar datos e importar/i);

    const confirmInput = screen.getByPlaceholderText('IMPORTAR');
    await fireEvent.input(confirmInput, { target: { value: 'IMPORTAR' } });

    const confirmBtn = screen.getByText(/Importar Archivo/i, { selector: 'button.confirm-btn' });
    await fireEvent.click(confirmBtn);

    // Results modal should appear
    expect(await screen.findByText(/Importación Finalizada/i)).toBeDefined();
    // Assuming success: 0, errors: 0 for the mock
    expect(screen.getByText(/Éxito: 0, Errores: 0/i)).toBeDefined();
  });
});
