import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import TaskList from './TaskList.svelte';
import type { Task } from './db';

describe('TaskList.svelte', () => {
  it('should render empty state message', () => {
    cleanup();
    render(TaskList, { props: { tasks: [] } });
    expect(screen.getByText(/No tasks for this day/i)).toBeDefined();
  });

  it('should render a list of tasks', () => {
    cleanup();
    const tasks: Task[] = [
      {
        id: 1,
        title: 'Task 1',
        description: 'Desc 1',
        project: 'Project A',
        type: 'General',
        startTime: new Date('2026-04-09T09:00:00Z'),
        endTime: new Date('2026-04-09T10:00:00Z'),
      },
      {
        id: 2,
        title: 'Task 2',
        description: 'Desc 2',
        project: 'Project B',
        type: 'Feature',
        startTime: new Date('2026-04-09T10:00:00Z'),
        endTime: new Date('2026-04-09T11:00:00Z'),
      },
    ];

    render(TaskList, { props: { tasks } });
    expect(screen.getByText('Task 1')).toBeDefined();
    expect(screen.getByText('Task 2')).toBeDefined();
  });

  it('should highlight gaps between tasks', () => {
    cleanup();
    const tasks: Task[] = [
      {
        id: 1,
        title: 'Task 1',
        description: 'Desc 1',
        project: 'Project A',
        type: 'General',
        startTime: new Date('2026-04-09T09:00:00Z'),
        endTime: new Date('2026-04-09T10:00:00Z'),
      },
      {
        id: 2,
        title: 'Task 2',
        description: 'Desc 2',
        project: 'Project B',
        type: 'Feature',
        startTime: new Date('2026-04-09T11:00:00Z'),
        endTime: new Date('2026-04-09T12:00:00Z'),
      },
    ];

    render(TaskList, { props: { tasks } });
    // Gap is between 10:00 and 11:00
    expect(screen.getByText(/Gap detected/i)).toBeDefined();
  });
});
