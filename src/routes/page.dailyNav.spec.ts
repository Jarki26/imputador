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
    },
  };
});

describe('Page Integration - Daily Navigation & Edit', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
    vi.clearAllMocks();
    mockGetTasksForWeek.mockResolvedValue([]);
  });

  it('should navigate to previous day and reload tasks', async () => {
    render(Page);

    // Switch to Daily View
    const dailyToggle = screen.getByRole('button', { name: /Vista Diaria/i });
    await fireEvent.click(dailyToggle);

    // Initial load + switch view might call getTasksForWeek multiple times depending on implementation
    const initialCalls = mockGetTasksForWeek.mock.calls.length;

    // Click Previous Day
    const prevBtn = screen.getByTitle(/Día Anterior/i);
    await fireEvent.click(prevBtn);

    expect(mockGetTasksForWeek.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  it('should open edit modal when clicking a task in daily view', async () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Task to Edit',
        project: 'Project A',
        type: 'General',
        startTime: new Date(2026, 3, 15, 9, 0),
        endTime: new Date(2026, 3, 15, 10, 0),
      },
    ];
    mockGetTasksForWeek.mockResolvedValue(mockTasks);

    render(Page);

    // Switch to Daily View
    const dailyToggle = screen.getByRole('button', { name: /Vista Diaria/i });
    await fireEvent.click(dailyToggle);

    // Click Task
    const taskItem = await screen.findByText('Task to Edit');
    await fireEvent.click(taskItem);

    // Modal should be open
    expect(
      screen.getByRole('heading', { name: /Actualizar Tarea/i }),
    ).toBeDefined();
    expect((screen.getByLabelText(/Título/i) as HTMLInputElement).value).toBe(
      'Task to Edit',
    );
  });
});
