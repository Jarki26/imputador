import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import TaskForm from './TaskForm.svelte';
import type { TaskStore } from './taskStore';
import type { ProjectStore } from './projectStore';

describe('TaskForm.svelte', () => {
  let mockTaskStore: vi.Mocked<Partial<TaskStore>>;
  let mockProjectStore: vi.Mocked<Partial<ProjectStore>>;

  beforeEach(() => {
    cleanup();
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
    expect(screen.getByLabelText(/Title/i)).toBeDefined();
    expect(screen.getByLabelText(/Description/i)).toBeDefined();
    expect(screen.getByLabelText(/Project/i)).toBeDefined();
    expect(screen.getByLabelText(/Task Type/i)).toBeDefined();
    expect(screen.getByLabelText(/Date/i)).toBeDefined();
    expect(screen.getByLabelText(/Start Time/i)).toBeDefined();
    expect(screen.getByLabelText(/End Time/i)).toBeDefined();
  });

  it('should show error if times are missing', async () => {
    render(TaskForm, {
      props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
    });

    // Clear default values
    fireEvent.input(screen.getByLabelText(/Start Time/i), { target: { value: '' } });
    fireEvent.input(screen.getByLabelText(/End Time/i), { target: { value: '' } });

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
    fireEvent.input(screen.getByLabelText(/Date/i), {
      target: { value: '2026-04-09' },
    });
    fireEvent.input(screen.getByLabelText(/Start Time/i), {
      target: { value: '09:00' },
    });
    fireEvent.input(screen.getByLabelText(/End Time/i), {
      target: { value: '10:00' },
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
    fireEvent.input(screen.getByLabelText(/Date/i), {
      target: { value: '2026-04-09' },
    });
    fireEvent.input(screen.getByLabelText(/Start Time/i), {
      target: { value: '09:00' },
    });
    fireEvent.input(screen.getByLabelText(/End Time/i), {
      target: { value: '10:00' },
    });

    const submitBtn = screen.getByRole('button', { name: /Add Task/i });
    await fireEvent.click(submitBtn);

    expect(await screen.findByText(/Failed to save task/i)).toBeDefined();
  });

  describe('Default Date Behavior', () => {
    it('should default the date to today if no date is provided', () => {
      const today = new Date().toISOString().split('T')[0];
      render(TaskForm, {
        props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
      });

      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
      expect(dateInput.value).toBe(today);
    });

    it('should respect the initialStartTime if provided and set time to 00:00', () => {
      const customDate = '2026-05-20T10:00';
      const expectedDate = '2026-05-20';
      const expectedTime = '00:00';
      render(TaskForm, {
        props: { 
          taskStore: mockTaskStore, 
          projectStore: mockProjectStore,
          initialStartTime: customDate
        },
      });

      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
      const startTimeInput = screen.getByLabelText(/Start Time/i) as HTMLInputElement;
      expect(dateInput.value).toBe(expectedDate);
      expect(startTimeInput.value).toBe(expectedTime);
    });
  });

  describe('Single-Day Restriction', () => {
    it('should show error if task crosses to next day', async () => {
      render(TaskForm, {
        props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
      });

      fireEvent.input(screen.getByLabelText(/Title/i), {
        target: { value: 'Cross-day Task' },
      });
      fireEvent.input(screen.getByLabelText(/Project/i), {
        target: { value: 'Project X' },
      });
      fireEvent.input(screen.getByLabelText(/Date/i), {
        target: { value: '2026-04-09' },
      });
      // Set start time to 23:30
      fireEvent.input(screen.getByLabelText(/Start Time/i), {
        target: { value: '23:30' },
      });
      
      // Since it's a split input, we can't easily cross day with just the "End Time" input bound to the same date.
      // But the logic in handleSubmit checks the derived full strings.
      // If we manually change the derived endTime string to next day...
      // Wait, the UI doesn't allow changing the date of end time separately.
      // But we can simulate a case where the logic *might* cross day if duration is long.
      
      const hoursInput = screen.getByLabelText(/Hours/i) as HTMLInputElement;
      await fireEvent.input(hoursInput, { target: { value: '1' } }); // 23:30 + 1h = 00:30 next day

      const submitBtn = screen.getByRole('button', { name: /Add Task/i });
      await fireEvent.click(submitBtn);

      expect(
        await screen.findByText(/End time must be after start time \(tasks cannot cross midnight\)/i),
      ).toBeDefined();
      expect(mockTaskStore.addTask).not.toHaveBeenCalled();
    });
  });
});
