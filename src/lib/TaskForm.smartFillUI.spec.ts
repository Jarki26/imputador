import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import TaskForm from './TaskForm.svelte';
import type { TaskStore } from './taskStore';
import type { ProjectStore } from './projectStore';
import { i18n } from './i18n.svelte';

describe('TaskForm.svelte Smart Fill UI', () => {
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
      addWithSmartFill: vi.fn().mockResolvedValue(undefined) as any,
    };
    mockProjectStore = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      upsertProject: vi.fn().mockResolvedValue(undefined) as any,
    };
  });

  it('should render Smart Fill toggle', () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });
    expect(screen.getByLabelText(/Relleno Inteligente/i)).toBeDefined();
  });

  it('should disable End Time when Smart Fill is active', async () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    const toggle = screen.getByLabelText(
      /Relleno Inteligente/i,
    ) as HTMLInputElement;
    const endTimeInput = screen.getByLabelText(
      /Hora de Fin/i,
    ) as HTMLInputElement;

    expect(endTimeInput.disabled).toBe(false);

    await fireEvent.click(toggle);

    expect(endTimeInput.disabled).toBe(true);
  });

  it('should call addWithSmartFill when form is submitted in Smart Fill mode', async () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    fireEvent.input(screen.getByLabelText(/Título/i), {
      target: { value: 'Fill me' },
    });
    fireEvent.input(screen.getByLabelText(/Hora de Inicio/i), {
      target: { value: '09:00' },
    });
    fireEvent.input(screen.getByLabelText(/Horas/i), {
      target: { value: '2' },
    });

    await fireEvent.click(screen.getByLabelText(/Relleno Inteligente/i));
    await fireEvent.click(
      screen.getByRole('button', { name: /Añadir Tarea/i }),
    );

    expect(mockTaskStore.addWithSmartFill).toHaveBeenCalled();
    expect(mockTaskStore.addTask).not.toHaveBeenCalled();
  });
});
