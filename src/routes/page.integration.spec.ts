import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import Page from './+page.svelte';
import { i18n } from '$lib/i18n.svelte';

// We need a way to access the methods of the instance created inside the component
let mockGetTasksForWeek = vi.fn().mockResolvedValue([]);
let mockGetTasksForDay = vi.fn().mockResolvedValue([]);
let mockGetLatestTaskOfDay = vi.fn().mockResolvedValue(null);
let mockGetClosestPrecedingTask = vi.fn().mockResolvedValue(null);
let mockGetRecentTasks = vi.fn().mockResolvedValue([]);
let mockGetPreviousTask = vi.fn().mockResolvedValue(null);
let mockGetNextTask = vi.fn().mockResolvedValue(null);
let mockGetPreviousTaskEndTime = vi.fn().mockResolvedValue(null);
let mockGetNextTaskStartTime = vi.fn().mockResolvedValue(null);

vi.mock('$lib/taskStore', () => {
  return {
    TaskStore: class {
      getTasksForWeek = mockGetTasksForWeek;
      getTasksForDay = mockGetTasksForDay;
      getLatestTaskOfDay = mockGetLatestTaskOfDay;
      getClosestPrecedingTask = mockGetClosestPrecedingTask;
      getRecentTasks = mockGetRecentTasks;
      getPreviousTask = mockGetPreviousTask;
      getNextTask = mockGetNextTask;
      getPreviousTaskEndTime = mockGetPreviousTaskEndTime;
      getNextTaskStartTime = mockGetNextTaskStartTime;
      // Other methods needed by +page.svelte
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
      getExcelFilenameFormat = vi.fn().mockResolvedValue('imputador_{START_YYYY}{START_MM}{START_DD}_{END_YYYY}{END_MM}{END_DD}');
      getSesameToken = vi.fn().mockResolvedValue(null);
      getSesameUserId = vi.fn().mockResolvedValue(null);
      getSesameEmail = vi.fn().mockResolvedValue(null);
      getSesameProxyUrl = vi.fn().mockResolvedValue(null);
      setExcelDateFormat = vi.fn().mockResolvedValue(undefined);
      setWeeklyHoursTarget = vi.fn().mockResolvedValue(undefined);
      setExcelFilenameFormat = vi.fn().mockResolvedValue(undefined);
      setSesameToken = vi.fn().mockResolvedValue(undefined);
      setSesameUserId = vi.fn().mockResolvedValue(undefined);
      setSesameEmail = vi.fn().mockResolvedValue(undefined);
      setSesameProxyUrl = vi.fn().mockResolvedValue(undefined);
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

describe('Page Integration - Smart Default Start Time', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
    vi.clearAllMocks();

    // Reset defaults
    mockGetTasksForWeek.mockResolvedValue([]);
    mockGetTasksForDay.mockResolvedValue([]);
    mockGetLatestTaskOfDay.mockResolvedValue(null);
    mockGetClosestPrecedingTask.mockResolvedValue(null);
    mockGetRecentTasks.mockResolvedValue([]);
    mockGetPreviousTask.mockResolvedValue(null);
    mockGetNextTask.mockResolvedValue(null);
    mockGetPreviousTaskEndTime.mockResolvedValue(null);
    mockGetNextTaskStartTime.mockResolvedValue(null);
  });

  it('Daily View: "Add Task" should use the latest task end time', async () => {
    const latestTask = {
      title: 'Latest Task',
      endTime: new Date(2026, 3, 13, 10, 30), // 10:30 local
    };
    mockGetLatestTaskOfDay.mockResolvedValue(latestTask);

    render(Page);

    // Switch to Daily View
    const dailyToggle = screen.getByRole('button', { name: /Vista Diaria/i });
    await fireEvent.click(dailyToggle);

    // Click Add Task
    const addBtn = screen.getByRole('button', { name: /Añadir/i });
    await fireEvent.click(addBtn);

    // Check TaskForm initialStartTime
    // Use getAllByText and pick the one in the header (usually first)
    expect(screen.getAllByText(/Añadir Tarea/i).length).toBeGreaterThan(0);

    const startTimeInput = screen.getByLabelText(
      /Hora de Inicio/i,
    ) as HTMLInputElement;
    expect(startTimeInput.value).toBe('10:30');
  });

  it('Weekly View: clicking an empty slot should use the closest preceding task end time', async () => {
    const precedingTask = {
      title: 'Preceding Task',
      endTime: new Date(2026, 3, 13, 9, 15), // 09:15 local
    };
    mockGetClosestPrecedingTask.mockResolvedValue(precedingTask);

    render(Page);

    // Find a slot in Weekly View (Monday 10:00)
    const dayColumns = document.querySelectorAll('.day-column');
    const mondayColumn = dayColumns[0];
    const hourCells = mondayColumn.querySelectorAll('.hour-cell');

    // Click 10:00 slot
    await fireEvent.click(hourCells[10]);

    const startTimeInput = screen.getByLabelText(
      /Hora de Inicio/i,
    ) as HTMLInputElement;
    expect(startTimeInput.value).toBe('09:15');
  });
});
