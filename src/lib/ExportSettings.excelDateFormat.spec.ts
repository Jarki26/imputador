import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import ExportSettings from './ExportSettings.svelte';
import { i18n } from './i18n.svelte';

const { mockParseFile, mockImportTasks } = vi.hoisted(() => ({
  mockParseFile: vi.fn(),
  mockImportTasks: vi.fn(),
}));

vi.mock('./importService', () => {
  return {
    ImportService: class {
      parseFile = mockParseFile;
      importTasks = mockImportTasks;
    },
  };
});

describe('ExportSettings - Excel Date Format Warning', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
    vi.clearAllMocks();
  });

  it('should display a warning message with the active date format when date parsing fails', async () => {
    mockParseFile.mockResolvedValue({
      tasks: [],
      errors: [{ row: 0, message: 'Invalid start date: 2026-04-14' }],
    });
    mockImportTasks.mockResolvedValue({ successCount: 0, errorCount: 1 });

    const { container } = render(ExportSettings, {
      props: {
        template: [],
        exclusions: [],
        excelDateFormat: 'DD/MM/YYYY',
        onSave: vi.fn(),
      },
    });

    const file = new File([''], 'test.xlsx');
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await fireEvent.change(input, { target: { files: [file] } });

    // Confirm import
    await screen.findByText(/Vaciar datos e importar/i);
    const confirmInput = screen.getByPlaceholderText('IMPORTAR');
    await fireEvent.input(confirmInput, { target: { value: 'IMPORTAR' } });
    const confirmBtn = screen.getByText(/Importar Archivo/i, {
      selector: 'button.confirm-btn',
    });
    await fireEvent.click(confirmBtn);

    // Check for results modal and warning
    await screen.findByText(/Importación Finalizada/i);

    // The warning message should contain the current format
    // In Spanish as per i18n.setLocale('es')
    expect(
      await screen.findByText(
        /Atención: No se pudieron procesar algunas fechas/i,
      ),
    ).toBeDefined();
    expect(
      screen.getByText(/El formato configurado actualmente es 'DD\/MM\/YYYY'/i),
    ).toBeDefined();
  });
});
