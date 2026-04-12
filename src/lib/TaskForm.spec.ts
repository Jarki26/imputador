import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import TaskForm from './TaskForm.svelte';
import type { TaskStore } from './taskStore';
import type { ProjectStore } from './projectStore';
import { i18n } from './i18n.svelte';

describe('TaskForm.svelte', () => {
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
    };
    mockProjectStore = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      upsertProject: vi.fn().mockResolvedValue(undefined) as any,
    };
  });

  it('should render all form fields', () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });
    expect(screen.getByLabelText(/Título/i)).toBeDefined();
    expect(screen.getByLabelText(/Descripción/i)).toBeDefined();
    expect(screen.getByLabelText(/Proyecto/i)).toBeDefined();
    expect(screen.getByLabelText(/Tipo de Tarea/i)).toBeDefined();
    expect(screen.getByLabelText(/Fecha/i)).toBeDefined();
    expect(screen.getByLabelText(/Hora de Inicio/i)).toBeDefined();
    expect(screen.getByLabelText(/Hora de Fin/i)).toBeDefined();
  });

  it('should show error if times are missing', async () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    // Clear default values
    fireEvent.input(screen.getByLabelText(/Hora de Inicio/i), { target: { value: '' } });
    fireEvent.input(screen.getByLabelText(/Hora de Fin/i), { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: /Añadir Tarea/i });
    await fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Por favor, introduce horas de inicio y fin válidas/i),
    ).toBeDefined();
    expect(mockTaskStore.addTask).not.toHaveBeenCalled();
  });

  it('should call addTask when form is valid and submitted', async () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    fireEvent.input(screen.getByLabelText(/Título/i), {
      target: { value: 'New Task' },
    });
    fireEvent.input(screen.getByLabelText(/Proyecto/i), {
      target: { value: 'Project X' },
    });
    fireEvent.input(screen.getByLabelText(/Fecha/i), {
      target: { value: '2026-04-09' },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Inicio/i), {
      target: { value: '09:00' },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Fin/i), {
      target: { value: '10:00' },
    });

    const submitBtn = screen.getByRole('button', { name: /Añadir Tarea/i });
    await fireEvent.click(submitBtn);

    expect(mockTaskStore.addTask).toHaveBeenCalled();
  });

  it('should show error if addTask fails', async () => {
    mockTaskStore.addTask.mockRejectedValue(new Error('DB Error'));
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    fireEvent.input(screen.getByLabelText(/Título/i), {
      target: { value: 'New Task' },
    });
    fireEvent.input(screen.getByLabelText(/Proyecto/i), {
      target: { value: 'Project X' },
    });
    fireEvent.input(screen.getByLabelText(/Fecha/i), {
      target: { value: '2026-04-09' },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Inicio/i), {
      target: { value: '09:00' },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Fin/i), {
      target: { value: '10:00' },
    });

    const submitBtn = screen.getByRole('button', { name: /Añadir Tarea/i });
    await fireEvent.click(submitBtn);

    expect(await screen.findByText(/Error al guardar la tarea/i)).toBeDefined();
  });

  describe('Default Date Behavior', () => {
    it('should default the date to today if no date is provided', () => {
      const today = new Date().toISOString().split('T')[0];
      render(TaskForm, {
        props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
      });

      const dateInput = screen.getByLabelText(/Fecha/i) as HTMLInputElement;
      expect(dateInput.value).toBe(today);
    });

    it('should respect the initialStartTime if provided and its time', () => {
      const customDate = '2026-05-20T10:00';
      const expectedDate = '2026-05-20';
      const expectedTime = '10:00';
      render(TaskForm, {
        props: { 
          taskStore: mockTaskStore, 
          projectStore: mockProjectStore,
          initialStartTime: customDate
        },
      });

      const dateInput = screen.getByLabelText(/Fecha/i) as HTMLInputElement;
      const startTimeInput = screen.getByLabelText(/Hora de Inicio/i) as HTMLInputElement;
      expect(dateInput.value).toBe(expectedDate);
      expect(startTimeInput.value).toBe(expectedTime);
    });
  });

  describe('Single-Day Restriction', () => {
    it('should show error if task crosses to next day', async () => {
      render(TaskForm, {
        props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
      });

      fireEvent.input(screen.getByLabelText(/Título/i), {
        target: { value: 'Cross-day Task' },
      });
      fireEvent.input(screen.getByLabelText(/Proyecto/i), {
        target: { value: 'Project X' },
      });
      fireEvent.input(screen.getByLabelText(/Fecha/i), {
        target: { value: '2026-04-09' },
      });
      // Set start time to 23:30
      fireEvent.input(screen.getByLabelText(/Hora de Inicio/i), {
        target: { value: '23:30' },
      });
      
      const hoursInput = screen.getByLabelText(/Horas/i) as HTMLInputElement;
      await fireEvent.input(hoursInput, { target: { value: '1' } }); // 23:30 + 1h = 00:30 next day

      const submitBtn = screen.getByRole('button', { name: /Añadir Tarea/i });
      await fireEvent.click(submitBtn);

      expect(
        await screen.findByText(/La hora de fin debe ser posterior a la de inicio \(las tareas no pueden cruzar la medianoche\)/i),
      ).toBeDefined();
      expect(mockTaskStore.addTask).not.toHaveBeenCalled();
    });
  });
});
