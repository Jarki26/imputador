import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import TaskList from './TaskList.svelte';
import type { Task } from './db';
import { i18n } from './i18n.svelte';

describe('TaskList.svelte - Colors', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Task with color',
      description: 'Desc 1',
      project: 'Project A',
      type: 'Meeting',
      startTime: new Date('2026-04-09T09:00:00Z'),
      endTime: new Date('2026-04-09T10:00:00Z'),
    },
    {
      id: 2,
      title: 'Task without color',
      description: 'Desc 2',
      project: 'Project B',
      type: 'Code',
      startTime: new Date('2026-04-09T10:00:00Z'),
      endTime: new Date('2026-04-09T11:00:00Z'),
    },
  ];

  it('should apply custom background and text color to a task', () => {
    const taskTypeColors = {
      'Meeting': '#ff0000', // Red
    };

    const { container } = render(TaskList, { props: { tasks, taskTypeColors } });
    const taskItems = container.querySelectorAll('.task-item');
    
    // First task should have red background
    const coloredTask = Array.from(taskItems).find(el => el.textContent?.includes('Task with color')) as HTMLElement;
    expect(coloredTask.style.backgroundColor).toBe('rgb(255, 0, 0)');
    // Contrast color should be white for red
    expect(coloredTask.style.color).toBe('white');
  });

  it('should not apply custom color if not in taskTypeColors', () => {
    const taskTypeColors = {
      'Meeting': '#ff0000',
    };

    const { container } = render(TaskList, { props: { tasks, taskTypeColors } });
    const taskItems = container.querySelectorAll('.task-item');
    
    const uncoloredTask = Array.from(taskItems).find(el => el.textContent?.includes('Task without color')) as HTMLElement;
    expect(uncoloredTask.style.backgroundColor).toBe('');
    expect(uncoloredTask.style.color).toBe('');
  });
});
