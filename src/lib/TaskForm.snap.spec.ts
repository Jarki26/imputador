import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/svelte';
import TaskForm from './TaskForm.svelte';
import type { TaskStore } from './taskStore';
import type { ProjectStore } from './projectStore';
import { i18n } from './i18n.svelte';

describe('TaskForm Snap Buttons', () => {
  let mockTaskStore: vi.Mocked<Partial<TaskStore>>;
  let mockProjectStore: vi.Mocked<Partial<ProjectStore>>;

  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
    mockTaskStore = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addTask: vi.fn().mockResolvedValue(1) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getTasksForDay: vi.fn().mockResolvedValue([]) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getRecentTasks: vi.fn().mockResolvedValue([]) as any,
      getPreviousTask: vi.fn().mockResolvedValue(null),
      getNextTask: vi.fn().mockResolvedValue(null),
      getPreviousTaskEndTime: vi.fn().mockResolvedValue(null),
      getNextTaskStartTime: vi.fn().mockResolvedValue(null),
    };
    mockProjectStore = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      upsertProject: vi.fn().mockResolvedValue(undefined) as any,
    };
  });

  it('should render snap buttons next to time inputs', () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });
    
    // Using test-id or looking for buttons with specific titles/tooltips
    expect(screen.getByTitle(/Ajustar al final de la tarea anterior/i)).toBeDefined();
    expect(screen.getByTitle(/Ajustar al inicio de la siguiente tarea/i)).toBeDefined();
  });

  it('should call getPreviousTaskEndTime when clicking start snap button', async () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    const snapBtn = screen.getByTitle(/Ajustar al final de la tarea anterior/i);
    await fireEvent.click(snapBtn);

    expect(mockTaskStore.getPreviousTaskEndTime).toHaveBeenCalled();
  });

  it('should call getNextTaskStartTime when clicking end snap button', async () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    const snapBtn = screen.getByTitle(/Ajustar al inicio de la siguiente tarea/i);
    await fireEvent.click(snapBtn);

    expect(mockTaskStore.getNextTaskStartTime).toHaveBeenCalled();
  });

  it('should update start time when getPreviousTaskEndTime returns a date', async () => {
    const prevEndTime = new Date(2026, 3, 19, 10, 0); // April 19, 10:00 local
    mockTaskStore.getPreviousTaskEndTime.mockResolvedValue(prevEndTime);

    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    const snapBtn = screen.getByTitle(/Ajustar al final de la tarea anterior/i);
    await fireEvent.click(snapBtn);

    const startTimeInput = screen.getByLabelText(/Hora de Inicio/i) as HTMLInputElement;
    await waitFor(() => expect(startTimeInput.value).toBe('10:00'));
  });

  it('should update end time when getNextTaskStartTime returns a date', async () => {
    const nextStartTime = new Date(2026, 3, 19, 11, 0); // April 19, 11:00 local
    mockTaskStore.getNextTaskStartTime.mockResolvedValue(nextStartTime);

    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    const snapBtn = screen.getByTitle(/Ajustar al inicio de la siguiente tarea/i);
    await fireEvent.click(snapBtn);

    const endTimeInput = screen.getByLabelText(/Hora de Fin/i) as HTMLInputElement;
    await waitFor(() => expect(endTimeInput.value).toBe('11:00'));
  });

  it('should disable start snap button when no preceding task exists', async () => {
    mockTaskStore.getPreviousTask.mockResolvedValue(null);

    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    const snapBtn = screen.getByTitle(/Ajustar al final de la tarea anterior/i) as HTMLButtonElement;
    await waitFor(() => expect(snapBtn.disabled).toBe(true));
  });

  it('should enable start snap button when preceding task exists', async () => {
    mockTaskStore.getPreviousTask.mockResolvedValue({ title: 'Prev' } as any);

    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    const snapBtn = screen.getByTitle(/Ajustar al final de la tarea anterior/i) as HTMLButtonElement;
    await waitFor(() => expect(snapBtn.disabled).toBe(false));
  });

  it('should disable end snap button when no succeeding task exists', async () => {
    mockTaskStore.getNextTask.mockResolvedValue(null);

    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    const snapBtn = screen.getByTitle(/Ajustar al inicio de la siguiente tarea/i) as HTMLButtonElement;
    await waitFor(() => expect(snapBtn.disabled).toBe(true));
  });

  it('should enable end snap button when succeeding task exists', async () => {
    mockTaskStore.getNextTask.mockResolvedValue({ title: 'Next' } as any);

    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    const snapBtn = screen.getByTitle(/Ajustar al inicio de la siguiente tarea/i) as HTMLButtonElement;
    await waitFor(() => expect(snapBtn.disabled).toBe(false));
  });
});
