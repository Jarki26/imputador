import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import TaskForm from './TaskForm.svelte';
import type { TaskStore } from './taskStore';
import type { ProjectStore } from './projectStore';

describe('TaskForm.svelte Duration Editing', () => {
  let mockTaskStore: vi.Mocked<Partial<TaskStore>>;
  let mockProjectStore: vi.Mocked<Partial<ProjectStore>>;

  beforeEach(() => {
    cleanup();
    mockTaskStore = {
      addTask: vi.fn().mockResolvedValue(1) as any,
      getTasksForDay: vi.fn().mockResolvedValue([]) as any,
    };
    mockProjectStore = {
      upsertProject: vi.fn().mockResolvedValue(undefined) as any,
    };
  });

  it('should render duration inputs (Hours and Minutes)', () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });
    expect(screen.getByLabelText(/Hours/i)).toBeDefined();
    expect(screen.getByLabelText(/Minutes/i)).toBeDefined();
  });

  it('should update End Time when Duration (Hours/Minutes) changes', async () => {
    render(TaskForm, {
      props: {
        taskStore: mockTaskStore,
        projectStore: mockProjectStore,
        initialStartTime: '2026-04-11T09:00',
      },
    });

    const hoursInput = screen.getByLabelText(/Hours/i) as HTMLInputElement;
    const minutesInput = screen.getByLabelText(/Minutes/i) as HTMLInputElement;
    const endTimeInput = screen.getByLabelText(/End Time/i) as HTMLInputElement;

    await fireEvent.input(hoursInput, { target: { value: '1' } });
    await fireEvent.input(minutesInput, { target: { value: '30' } });

    // 09:00 + 1h 30m = 10:30
    expect(endTimeInput.value).toBe('2026-04-11T10:30');
  });

  it('should update Duration when End Time changes', async () => {
    render(TaskForm, {
      props: {
        taskStore: mockTaskStore,
        projectStore: mockProjectStore,
        initialStartTime: '2026-04-11T09:00',
        initialEndTime: '2026-04-11T10:00', // Initial 1h
      },
    });

    const hoursInput = screen.getByLabelText(/Hours/i) as HTMLInputElement;
    const minutesInput = screen.getByLabelText(/Minutes/i) as HTMLInputElement;
    const endTimeInput = screen.getByLabelText(/End Time/i) as HTMLInputElement;

    expect(hoursInput.value).toBe('1');
    expect(minutesInput.value).toBe('0');

    await fireEvent.input(endTimeInput, {
      target: { value: '2026-04-11T10:45' },
    });

    // 09:00 to 10:45 = 1h 45m
    expect(hoursInput.value).toBe('1');
    expect(minutesInput.value).toBe('45');
  });
});
