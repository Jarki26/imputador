import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import TaskForm from './TaskForm.svelte';
import { TaskStore } from './taskStore';
import type { RecentTask } from './db';

describe('TaskForm Recent Tasks UI', () => {
  let mockTaskStore: any;

  beforeEach(() => {
    mockTaskStore = {
      getRecentTasks: vi.fn().mockResolvedValue([]),
      getTasksForDay: vi.fn().mockResolvedValue([]),
      addTask: vi.fn().mockResolvedValue(1),
      purgeHistory: vi.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the Recent Tasks dropdown when tasks are available', async () => {
    const recentTasks: RecentTask[] = [
      {
        title: 'Recent Task 1',
        description: 'Desc 1',
        project: 'Project 1',
        type: 'General',
        lastUsedAt: new Date(),
        isBillable: true,
      },
    ];
    mockTaskStore.getRecentTasks.mockResolvedValue(recentTasks);

    render(TaskForm, { taskStore: mockTaskStore as any });

    const select = await screen.findByLabelText(/Recent Tasks/i);
    expect(select).toBeDefined();
    expect(screen.getByText('Recent Task 1 (Project 1)')).toBeDefined();
  });

  it('should populate the form when a recent task is selected', async () => {
    const recentTasks: RecentTask[] = [
      {
        title: 'Recent Task 1',
        description: 'Desc 1',
        project: 'Project 1',
        type: 'Bug',
        lastUsedAt: new Date(),
        isBillable: true,
      },
    ];
    mockTaskStore.getRecentTasks.mockResolvedValue(recentTasks);

    render(TaskForm, { taskStore: mockTaskStore as any });

    const select = await screen.findByLabelText(/Recent Tasks/i);
    await fireEvent.change(select, { target: { value: '0' } });

    await waitFor(() => {
      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
      const projectInput = screen.getByLabelText('Project') as HTMLInputElement;
      const typeSelect = screen.getByLabelText('Task Type') as HTMLSelectElement;

      expect(titleInput.value).toBe('Recent Task 1');
      expect(descInput.value).toBe('Desc 1');
      expect(projectInput.value).toBe('Project 1');
      expect(typeSelect.value).toBe('Bug');
    });
  });
});
