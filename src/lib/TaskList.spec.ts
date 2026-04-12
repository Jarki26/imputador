import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import TaskList from './TaskList.svelte';
import type { Task } from './db';
import { i18n } from './i18n.svelte';

describe('TaskList.svelte', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  it('should render empty state message', () => {
    render(TaskList, { props: { tasks: [] } });
    expect(screen.getByText(/No hay tareas para este día/i)).toBeDefined();
  });

  it('should render a list of tasks', () => {
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
    expect(screen.getByText(/Hueco detectado/i)).toBeDefined();
  });

  it('should apply is-billable-absence class to Ausencia Facturable tasks', () => {
    const tasks: Task[] = [
      {
        id: 1,
        title: 'Absence',
        description: 'Medical',
        project: 'Admin',
        type: 'Ausencia Facturable',
        startTime: new Date('2026-04-12T09:00:00Z'),
        endTime: new Date('2026-04-12T10:00:00Z'),
      },
    ];

    const { container } = render(TaskList, { props: { tasks } });
    const taskItem = container.querySelector('.task-item');
    expect(taskItem?.classList.contains('is-billable-absence')).toBe(true);
  });
});
