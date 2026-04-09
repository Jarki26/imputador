import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import TaskForm from './TaskForm.svelte';

describe('TaskForm.svelte', () => {
  let mockTaskStore: any;
  let mockProjectStore: any;

  beforeEach(() => {
    cleanup();
    mockTaskStore = {
      addTask: vi.fn().mockResolvedValue(1),
    };
    mockProjectStore = {
      upsertProject: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('should render all form fields', () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });
    expect(screen.getByLabelText(/Title/i)).toBeDefined();
    expect(screen.getByLabelText(/Description/i)).toBeDefined();
    expect(screen.getByLabelText(/Project/i)).toBeDefined();
    expect(screen.getByLabelText(/Task Type/i)).toBeDefined();
    expect(screen.getByLabelText(/Start Time/i)).toBeDefined();
    expect(screen.getByLabelText(/End Time/i)).toBeDefined();
  });

  it('should show error if times are missing', async () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    const submitBtn = screen.getByRole('button', { name: /Add Task/i });
    await fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Please provide valid start and end times/i),
    ).toBeDefined();
    expect(mockTaskStore.addTask).not.toHaveBeenCalled();
  });

  it('should call addTask when form is valid and submitted', async () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    fireEvent.input(screen.getByLabelText(/Title/i), {
      target: { value: 'New Task' },
    });
    fireEvent.input(screen.getByLabelText(/Project/i), {
      target: { value: 'Project X' },
    });
    fireEvent.input(screen.getByLabelText(/Start Time/i), {
      target: { value: '2026-04-09T09:00' },
    });
    fireEvent.input(screen.getByLabelText(/End Time/i), {
      target: { value: '2026-04-09T10:00' },
    });

    const submitBtn = screen.getByRole('button', { name: /Add Task/i });
    await fireEvent.click(submitBtn);

    expect(mockTaskStore.addTask).toHaveBeenCalled();
  });

  it('should show error if addTask fails', async () => {
    mockTaskStore.addTask.mockRejectedValue(new Error('DB Error'));
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    fireEvent.input(screen.getByLabelText(/Title/i), {
      target: { value: 'New Task' },
    });
    fireEvent.input(screen.getByLabelText(/Project/i), {
      target: { value: 'Project X' },
    });
    fireEvent.input(screen.getByLabelText(/Start Time/i), {
      target: { value: '2026-04-09T09:00' },
    });
    fireEvent.input(screen.getByLabelText(/End Time/i), {
      target: { value: '2026-04-09T10:00' },
    });

    const submitBtn = screen.getByRole('button', { name: /Add Task/i });
    await fireEvent.click(submitBtn);

    expect(await screen.findByText(/Failed to save task/i)).toBeDefined();
  });
});
