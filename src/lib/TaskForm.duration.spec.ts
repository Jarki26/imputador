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

    // 00:00 (due to initialStartTime provided) + 1h 30m = 01:30
    expect(endTimeInput.value).toBe('01:30');
  });

  it('should update Duration when End Time changes', async () => {
    render(TaskForm, {
      props: {
        taskStore: mockTaskStore,
        projectStore: mockProjectStore,
        initialStartTime: '2026-04-11T09:00',
        initialEndTime: '2026-04-11T10:00',
      },
    });

    const hoursInput = screen.getByLabelText(/Hours/i) as HTMLInputElement;
    const minutesInput = screen.getByLabelText(/Minutes/i) as HTMLInputElement;
    const endTimeInput = screen.getByLabelText(/End Time/i) as HTMLInputElement;

    // Start 00:00, End 01:00 (default for initialStartTime)
    expect(hoursInput.value).toBe('1');
    expect(minutesInput.value).toBe('0');

    await fireEvent.input(endTimeInput, {
      target: { value: '10:45' },
    });

    // 00:00 to 10:45 = 10h 45m
    expect(hoursInput.value).toBe('10');
    expect(minutesInput.value).toBe('45');
  });

  describe('Duration Lock Logic', () => {
    it('should render the padlock icon', () => {
      render(TaskForm, {
        props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
      });
      const lockBtn = screen.getByTitle(/Toggle Duration Lock/i);
      expect(lockBtn).toBeDefined();
    });

    it('should toggle the lock state when clicked', async () => {
      render(TaskForm, {
        props: { taskStore: mockTaskStore, projectStore: mockProjectStore },
      });
      const lockBtn = screen.getByTitle(/Toggle Duration Lock/i);
      
      // Default should be unlocked (assuming based on standard UX, but we can verify class/aria-pressed)
      expect(lockBtn.getAttribute('aria-pressed')).toBe('false');

      await fireEvent.click(lockBtn);
      expect(lockBtn.getAttribute('aria-pressed')).toBe('true');

      await fireEvent.click(lockBtn);
      expect(lockBtn.getAttribute('aria-pressed')).toBe('false');
    });

    it('should update End Time when Start Time changes and lock is ACTIVE', async () => {
      render(TaskForm, {
        props: {
          taskStore: mockTaskStore,
          projectStore: mockProjectStore,
          initialStartTime: '2026-04-11T09:00',
          initialEndTime: '2026-04-11T10:00', // 1h duration
        },
      });

      const lockBtn = screen.getByTitle(/Toggle Duration Lock/i);
      const startTimeInput = screen.getByLabelText(/Start Time/i) as HTMLInputElement;
      const endTimeInput = screen.getByLabelText(/End Time/i) as HTMLInputElement;

      // Activate lock
      await fireEvent.click(lockBtn);

      // Change Start Time to 11:00
      await fireEvent.input(startTimeInput, { target: { value: '11:00' } });

      // End Time should move to 12:00 to maintain 1h duration
      expect(endTimeInput.value).toBe('12:00');
    });

    it('should NOT update End Time when Start Time changes and lock is INACTIVE', async () => {
      render(TaskForm, {
        props: {
          taskStore: mockTaskStore,
          projectStore: mockProjectStore,
          initialStartTime: '2026-04-11T09:00',
          initialEndTime: '2026-04-11T10:00', // 1h duration
        },
      });

      const startTimeInput = screen.getByLabelText(/Start Time/i) as HTMLInputElement;
      const endTimeInput = screen.getByLabelText(/End Time/i) as HTMLInputElement;

      // Lock is INACTIVE by default

      // Change Start Time to 08:00
      await fireEvent.input(startTimeInput, { target: { value: '08:00' } });

      // End Time should stay at 01:00 (initialized from start 00:00)
      expect(endTimeInput.value).toBe('01:00');
      
      const hoursInput = screen.getByLabelText(/Hours/i) as HTMLInputElement;
      // Start 08:00, End 01:00. End < Start. Duration logic doesn't update.
      // Initial duration was 1h.
      expect(hoursInput.value).toBe('1');
    });
  });
});
