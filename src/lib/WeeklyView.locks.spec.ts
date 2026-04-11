import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';

describe('WeeklyView.svelte - Action Locks', () => {
  it('should prevent moving a task when the movement lock is active', async () => {
    cleanup();
    const onTaskUpdate = vi.fn();
    const tasks = [
      {
        id: 1,
        title: 'Locked Task',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
    ];
    render(WeeklyView, { props: { tasks, onTaskUpdate } });

    // Find the move lock toggle (we'll use title or aria-label)
    const moveLockBtn = screen.getByTitle(/Lock Movement/i);
    expect(moveLockBtn).toBeDefined();

    // Activate the lock
    await fireEvent.click(moveLockBtn);

    // Try to move the task
    const taskBlock = screen.getByText('Locked Task').closest('.task-block');
    await fireEvent.pointerDown(taskBlock!, { clientY: 600, pointerId: 1, button: 0 });
    await fireEvent.pointerMove(window, { clientY: 660, pointerId: 1 });
    await fireEvent.pointerUp(window, { clientY: 660, pointerId: 1 });

    // onTaskUpdate should NOT have been called
    expect(onTaskUpdate).not.toHaveBeenCalled();
  });
});
