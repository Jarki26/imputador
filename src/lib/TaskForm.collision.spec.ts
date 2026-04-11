import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import TaskForm from './TaskForm.svelte';
import type { TaskStore } from './taskStore';
import type { ProjectStore } from './projectStore';

describe('TaskForm.svelte Collision Detection', () => {
  let mockTaskStore: vi.Mocked<Partial<TaskStore>>;
  let mockProjectStore: vi.Mocked<Partial<ProjectStore>>;

  beforeEach(() => {
    cleanup();
    mockTaskStore = {
      addTask: vi.fn().mockResolvedValue(1) as any,
      getTasksForDay: vi.fn().mockResolvedValue([]) as any,
      addWithOverwrite: vi.fn().mockResolvedValue(1) as any,
      addWithDisplacement: vi.fn().mockResolvedValue(1) as any,
    };
    mockProjectStore = {
      upsertProject: vi.fn().mockResolvedValue(undefined) as any,
    };
  });

  it('should detect collision and NOT call addTask immediately', async () => {
    const start = new Date(2026, 3, 11, 10, 0);
    const end = new Date(2026, 3, 11, 11, 0);

    // Mock existing task from 10:00 to 11:00 LOCAL
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

    // Fill form with colliding task (10:30 to 11:30 LOCAL)
    fireEvent.input(screen.getByLabelText(/Title/i), {
      target: { value: 'New Colliding Task' },
    });
    fireEvent.input(screen.getByLabelText(/Start Time/i), {
      target: { value: '2026-04-11T10:30' },
    });
    fireEvent.input(screen.getByLabelText(/End Time/i), {
      target: { value: '2026-04-11T11:30' },
    });

    const submitBtn = screen.getByRole('button', { name: /Add Task/i });
    await fireEvent.click(submitBtn);

    // Should NOT have called addTask yet because collision was detected
    expect(mockTaskStore.addTask).not.toHaveBeenCalled();

    // Should show collision modal
    expect(await screen.findByText(/Collision Detected/i)).toBeDefined();
  });
});
