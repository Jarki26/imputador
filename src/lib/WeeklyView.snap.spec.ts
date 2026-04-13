import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';
import { i18n } from './i18n.svelte';

describe('WeeklyView.svelte - No-Gap Snapping', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  it('should trigger a snap prompt when a task is dropped near another one (e.g. 5 min gap)', async () => {
    const onTaskUpdate = vi.fn();
    const tasks = [
      {
        id: 1,
        title: 'Task 1',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
      {
        id: 2,
        title: 'Task 2',
        startTime: new Date('2026-04-06T11:00:00Z'),
        endTime: new Date('2026-04-06T12:00:00Z'),
      },
    ];

    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks, onTaskUpdate } });

    // Find Task 2
    const task2Block = screen.getByText('Task 2').closest('.task-block');
    
    // Simulate moving Task 2 to 10:15 (gap of 15 mins)
    // start at 11:00 (660px), move to 10:15 (615px)
    await fireEvent.pointerDown(task2Block!, { clientY: 660, clientX: 100, pointerId: 1, button: 0 });
    await fireEvent.pointerMove(window, { clientY: 615, clientX: 100, pointerId: 1 });
    
    await act(async () => {
      await fireEvent.pointerUp(window, { clientY: 615, clientX: 100, pointerId: 1 });
    });

    // Check if a snap prompt is visible
    expect(screen.getByText(i18n.t('weekly.snap_title'))).toBeDefined();
  });

  it('should snap the task when "Sí" is clicked', async () => {
    const onTaskUpdate = vi.fn();
    const tasks = [
      {
        id: 1,
        title: 'Task 1',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
      {
        id: 2,
        title: 'Task 2',
        startTime: new Date('2026-04-06T11:00:00Z'),
        endTime: new Date('2026-04-06T12:00:00Z'),
      },
    ];

    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks, onTaskUpdate } });

    const task2Block = screen.getByText('Task 2').closest('.task-block');

    // Move Task 2 to 10:15
    await fireEvent.pointerDown(task2Block!, { clientY: 660, clientX: 100, pointerId: 1, button: 0 });
    await fireEvent.pointerMove(window, { clientY: 615, clientX: 100, pointerId: 1 });
    await act(async () => {
      await fireEvent.pointerUp(window, { clientY: 615, clientX: 100, pointerId: 1 });
    });

    // Click "Sí"
    const confirmButton = screen.getByText(i18n.t('common.yes'));
    await fireEvent.click(confirmButton);

    expect(onTaskUpdate).toHaveBeenCalledWith(expect.objectContaining({
      id: 2,
      startTime: expect.any(Date)
    }));

    const snappedCall = onTaskUpdate.mock.calls[0][0];
    // Should be snapped to 10:00 (Task 1 end time)
    expect(snappedCall.startTime.getUTCHours()).toBe(10);
    expect(snappedCall.startTime.getUTCMinutes()).toBe(0);
  });
});
