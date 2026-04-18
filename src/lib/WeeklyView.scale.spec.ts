import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';

describe('WeeklyView.svelte - Visual Scale', () => {
  it('should calculate exact heights proportional to task duration (1h = 60px)', () => {
    cleanup();
    const tasks = [
      {
        id: 1,
        title: '1 Hour Task',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'), // 1 hour
      },
      {
        id: 2,
        title: '30 Min Task',
        startTime: new Date('2026-04-06T11:00:00Z'),
        endTime: new Date('2026-04-06T11:30:00Z'), // 30 mins
      },
    ];

    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks } });

    const task1 = screen
      .getByText('1 Hour Task')
      .closest('.task-block') as HTMLElement;
    const task2 = screen
      .getByText('30 Min Task')
      .closest('.task-block') as HTMLElement;

    // 1 hour = 60px
    expect(task1.style.height).toBe('60px');
    // 30 mins = 30px
    expect(task2.style.height).toBe('30px');
  });
});
