import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import Page from './+page.svelte';
import { i18n } from '$lib/i18n.svelte';

let mockGetTasksForWeek = vi.fn().mockResolvedValue([]);

vi.mock('$lib/taskStore', () => {
  return {
    TaskStore: class {
      getTasksForWeek = mockGetTasksForWeek;
      getTasksForDay = vi.fn().mockResolvedValue([]);
      getLatestTaskOfDay = vi.fn().mockResolvedValue(null);
      getClosestPrecedingTask = vi.fn().mockResolvedValue(null);
      getRecentTasks = vi.fn().mockResolvedValue([]);
      updateTask = vi.fn().mockResolvedValue(undefined);
      updateWithOverwrite = vi.fn().mockResolvedValue(undefined);
      updateWithDisplacement = vi.fn().mockResolvedValue(undefined);
      deleteTask = vi.fn().mockResolvedValue(undefined);
      upsertRecentTask = vi.fn().mockResolvedValue(undefined);
      getPreviousTask = vi.fn().mockResolvedValue(null);
      getNextTask = vi.fn().mockResolvedValue(null);
      getPreviousTaskEndTime = vi.fn().mockResolvedValue(null);
      getNextTaskStartTime = vi.fn().mockResolvedValue(null);
    },
  };
});

vi.mock('$lib/configStore', () => {
  return {
    ConfigStore: class {
      getWeeklyHoursTarget = vi.fn().mockResolvedValue(41);
      getExcelDateFormat = vi.fn().mockResolvedValue('DD/MM/YYYY');
      setExcelDateFormat = vi.fn().mockResolvedValue(undefined);
      setWeeklyHoursTarget = vi.fn().mockResolvedValue(undefined);
      getAllTaskTypeColors = vi.fn().mockResolvedValue({});
      setTaskTypeColor = vi.fn().mockResolvedValue(undefined);
    },
  };
});

vi.mock('$lib/exportConfigStore', () => {
  return {
    ExportConfigStore: class {
      getTemplate = vi.fn().mockResolvedValue([]);
      getExclusions = vi.fn().mockResolvedValue([]);
      setTemplate = vi.fn().mockResolvedValue(undefined);
      setExclusions = vi.fn().mockResolvedValue(undefined);
    },
  };
});

vi.mock('$lib/importService', () => {
  return {
    ImportService: class {
      parseFile = vi
        .fn()
        .mockResolvedValue({ tasks: [{ title: 'Imported' }], errors: [] });
      importTasks = vi
        .fn()
        .mockResolvedValue({ successCount: 1, errorCount: 0 });
    },
  };
});

describe('Page Integration - Import Reload', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
    vi.clearAllMocks();
    mockGetTasksForWeek.mockResolvedValue([]);
  });

  it('should reload tasks when import is complete', async () => {
    const { container } = render(Page);

    // Initial load calls getTasksForWeek
    expect(mockGetTasksForWeek).toHaveBeenCalledTimes(1);

    // Open Settings
    const settingsBtn = screen.getByTitle(/Ajustes/i);
    await fireEvent.click(settingsBtn);

    // Select file (triggers handleFileChange in ExportSettings)
    const file = new File([''], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await fireEvent.change(input, { target: { files: [file] } });

    // Confirm dialog
    await screen.findByText(/Vaciar datos e importar/i);
    const confirmInput = screen.getByPlaceholderText('IMPORTAR');
    await fireEvent.input(confirmInput, { target: { value: 'IMPORTAR' } });

    const confirmBtn = screen.getByText(/Importar Archivo/i, {
      selector: 'button.confirm-btn',
    });
    await fireEvent.click(confirmBtn);

    // Wait for results modal
    await screen.findByText(/Importación Finalizada/i);

    // getTasksForWeek should have been called again (total 2 times)
    expect(mockGetTasksForWeek).toHaveBeenCalledTimes(2);
  });
});
