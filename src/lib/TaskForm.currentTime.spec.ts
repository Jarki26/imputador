import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import TaskForm from './TaskForm.svelte';
import { TaskStore } from './taskStore';
import { ProjectStore } from './projectStore';
import { CompanyStore } from './companyStore';
import { i18n } from './i18n.svelte';

describe('TaskForm.svelte - Current Time Tooltip', () => {
  let mockTaskStore: vi.Mocked<Partial<TaskStore>>;
  let mockProjectStore: vi.Mocked<Partial<ProjectStore>>;
  let mockCompanyStore: vi.Mocked<Partial<CompanyStore>>;

  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
    
    // Mock stores
    mockTaskStore = {
      addTask: vi.fn().mockResolvedValue(1) as any,
      getTasksForDay: vi.fn().mockResolvedValue([]) as any,
      getRecentTasks: vi.fn().mockResolvedValue([]) as any,
      getPreviousTask: vi.fn().mockResolvedValue(null),
      getNextTask: vi.fn().mockResolvedValue(null),
      getPreviousTaskEndTime: vi.fn().mockResolvedValue(null),
      getNextTaskStartTime: vi.fn().mockResolvedValue(null),
    };
    mockProjectStore = {
      upsertProject: vi.fn().mockResolvedValue(undefined) as any,
    };
    mockCompanyStore = {
        getRecentCompanies: vi.fn().mockResolvedValue([]) as any,
    };

    // Mock system time to 14:30:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-21T14:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should have a button to set current time for start and end time fields', () => {
    render(TaskForm, {
      props: { 
        taskStore: mockTaskStore as TaskStore, 
        projectStore: mockProjectStore as ProjectStore,
        companyStore: mockCompanyStore as CompanyStore
      },
    });

    // The specification says the tooltip should be "Ahora"
    const currentTimeBtns = screen.getAllByTitle(/Ahora/i);
    expect(currentTimeBtns).toHaveLength(2);

    expect(currentTimeBtns[0].getAttribute('aria-label')).toBe('Establecer hora actual');
    expect(currentTimeBtns[1].getAttribute('aria-label')).toBe('Establecer hora actual');
  });

  it('should set start time to current time when the button is clicked', async () => {
    render(TaskForm, {
      props: { 
        taskStore: mockTaskStore as TaskStore, 
        projectStore: mockProjectStore as ProjectStore,
        companyStore: mockCompanyStore as CompanyStore
      },
    });

    const startInput = screen.getByLabelText(/Hora de Inicio/i) as HTMLInputElement;
    const setStartTimeBtn = screen.getAllByTitle(/Ahora/i)[0];

    await fireEvent.click(setStartTimeBtn);

    expect(startInput.value).toBe('14:30');
  });

  it('should set end time to current time when the button is clicked', async () => {
    render(TaskForm, {
      props: { 
        taskStore: mockTaskStore as TaskStore, 
        projectStore: mockProjectStore as ProjectStore,
        companyStore: mockCompanyStore as CompanyStore
      },
    });

    const endInput = screen.getByLabelText(/Hora de Fin/i) as HTMLInputElement;
    const setEndTimeBtn = screen.getAllByTitle(/Ahora/i)[1];

    await fireEvent.click(setEndTimeBtn);

    expect(endInput.value).toBe('14:30');
  });
});
