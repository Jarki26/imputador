import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import TaskForm from './TaskForm.svelte';
import type { TaskStore } from './taskStore';
import type { ProjectStore } from './projectStore';
import { i18n } from './i18n.svelte';

describe('TaskForm.svelte Collision Detection', () => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getPreviousTask: vi.fn().mockResolvedValue(null) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getNextTask: vi.fn().mockResolvedValue(null) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getPreviousTaskEndTime: vi.fn().mockResolvedValue(null) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getNextTaskStartTime: vi.fn().mockResolvedValue(null) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addWithOverwrite: vi.fn().mockResolvedValue(1) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addWithDisplacement: vi.fn().mockResolvedValue(1) as any,
    };
    mockProjectStore = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      upsertProject: vi.fn().mockResolvedValue(undefined) as any,
    };
  });

  it('should detect collision and NOT call addTask immediately', async () => {
    const today = new Date().toISOString().split('T')[0];
    const start = new Date(`${today}T10:00:00`);
    const end = new Date(`${today}T11:00:00`);

    // Mock existing task
    mockTaskStore.getTasksForDay.mockResolvedValue([
      {
        id: 1,
        title: 'Existing Task',
        startTime: start,
        endTime: end,
      },
    ]);

    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    // Fill form with colliding task
    fireEvent.input(screen.getByLabelText(/Título/i), {
      target: { value: 'New Colliding Task' },
    });
    fireEvent.input(screen.getByLabelText(/Fecha/i), {
      target: { value: today },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Inicio/i), {
      target: { value: '10:30' },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Fin/i), {
      target: { value: '11:30' },
    });

    const submitBtn = screen.getByRole('button', { name: /Añadir Tarea/i });
    await fireEvent.click(submitBtn);

    // Should NOT have called addTask yet because collision was detected
    expect(mockTaskStore.addTask).not.toHaveBeenCalled();

    // Should show collision modal
    expect(await screen.findByText(/Colisión Detectada/i)).toBeDefined();
  });

  it('should call addWithOverwrite when Overwrite is clicked in modal', async () => {
    const today = new Date().toISOString().split('T')[0];
    const start = new Date(`${today}T10:00:00`);
    const end = new Date(`${today}T11:00:00`);

    mockTaskStore.getTasksForDay.mockResolvedValue([
      {
        id: 1,
        title: 'Existing',
        startTime: start,
        endTime: end,
      },
    ]);

    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    fireEvent.input(screen.getByLabelText(/Título/i), {
      target: { value: 'New' },
    });
    fireEvent.input(screen.getByLabelText(/Fecha/i), {
      target: { value: today },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Inicio/i), {
      target: { value: '10:30' },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Fin/i), {
      target: { value: '11:30' },
    });

    await fireEvent.click(
      screen.getByRole('button', { name: /Añadir Tarea/i }),
    );

    const overwriteBtn = await screen.findByRole('button', {
      name: /Sobrescribir/i,
    });
    await fireEvent.click(overwriteBtn);

    expect(mockTaskStore.addWithOverwrite).toHaveBeenCalled();
    expect(mockTaskStore.addTask).not.toHaveBeenCalled();
  });

  it('should call addWithDisplacement when Displacement is clicked in modal', async () => {
    const today = new Date().toISOString().split('T')[0];
    const start = new Date(`${today}T10:00:00`);
    const end = new Date(`${today}T11:00:00`);

    mockTaskStore.getTasksForDay.mockResolvedValue([
      {
        id: 1,
        title: 'Existing',
        startTime: start,
        endTime: end,
      },
    ]);

    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    fireEvent.input(screen.getByLabelText(/Título/i), {
      target: { value: 'New' },
    });
    fireEvent.input(screen.getByLabelText(/Fecha/i), {
      target: { value: today },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Inicio/i), {
      target: { value: '10:30' },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Fin/i), {
      target: { value: '11:30' },
    });

    await fireEvent.click(
      screen.getByRole('button', { name: /Añadir Tarea/i }),
    );

    const displacementBtn = await screen.findByRole('button', {
      name: /Desplazamiento/i,
    });
    await fireEvent.click(displacementBtn);

    expect(mockTaskStore.addWithDisplacement).toHaveBeenCalled();
    expect(mockTaskStore.addTask).not.toHaveBeenCalled();
  });

  it('should call addTask when Continue Anyway is clicked in modal', async () => {
    const today = new Date().toISOString().split('T')[0];
    const start = new Date(`${today}T10:00:00`);
    const end = new Date(`${today}T11:00:00`);

    mockTaskStore.getTasksForDay.mockResolvedValue([
      {
        id: 1,
        title: 'Existing',
        startTime: start,
        endTime: end,
      },
    ]);

    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    fireEvent.input(screen.getByLabelText(/Título/i), {
      target: { value: 'New' },
    });
    fireEvent.input(screen.getByLabelText(/Fecha/i), {
      target: { value: today },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Inicio/i), {
      target: { value: '10:30' },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Fin/i), {
      target: { value: '11:30' },
    });

    await fireEvent.click(
      screen.getByRole('button', { name: /Añadir Tarea/i }),
    );

    const continueBtn = await screen.findByRole('button', {
      name: /Continuar de todas formas/i,
    });
    await fireEvent.click(continueBtn);

    // saveTask(..., 'normal') calls addTask or updateTask
    expect(mockTaskStore.addTask).toHaveBeenCalled();
  });

  it('should call updateTask when Continue Anyway is clicked in modal while editing', async () => {
    const today = new Date().toISOString().split('T')[0];
    const editingTask = {
      id: 99,
      title: 'Original Task',
      startTime: new Date(`${today}T08:00:00`),
      endTime: new Date(`${today}T09:00:00`),
    };

    // Colliding task
    mockTaskStore.getTasksForDay.mockResolvedValue([
      {
        id: 1,
        title: 'Collision Target',
        startTime: new Date(`${today}T10:00:00`),
        endTime: new Date(`${today}T11:00:00`),
      },
    ]);

    mockTaskStore.updateTask = vi.fn().mockResolvedValue(undefined) as any;

    render(TaskForm, {
      props: {
        taskStore: mockTaskStore,
        projectStore: mockProjectStore,
        editingTask,
      },
    });

    // Modify to collide
    fireEvent.input(screen.getByLabelText(/Hora de Inicio/i), {
      target: { value: '10:30' },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Fin/i), {
      target: { value: '11:30' },
    });

    await fireEvent.click(
      screen.getByRole('button', { name: /Actualizar Tarea/i }),
    );

    const continueBtn = await screen.findByRole('button', {
      name: /Continuar de todas formas/i,
    });
    await fireEvent.click(continueBtn);

    expect(mockTaskStore.updateTask).toHaveBeenCalledWith(99, expect.anything());
  });
});
