import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';
import { i18n } from './i18n.svelte';

describe('WeeklyView.svelte - Action Locks', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  it('should prevent moving a task when the movement lock is active', async () => {
    const onTaskUpdate = vi.fn();
    const tasks = [
      {
        id: 1,
        title: 'Locked Task',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
    ];
    render(WeeklyView, {
      props: { startDate: new Date('2026-04-06'), tasks, onTaskUpdate },
    });

    // Find the move lock toggle (we'll use title or aria-label)
    const moveLockBtn = screen.getByTitle(i18n.t('weekly.lock_move'));
    expect(moveLockBtn).toBeDefined();

    // Activate the lock
    await fireEvent.click(moveLockBtn);

    // Try to move the task
    const taskBlock = screen.getByText('Locked Task').closest('.task-block');
    await fireEvent.pointerDown(taskBlock!, {
      clientY: 600,
      pointerId: 1,
      button: 0,
    });
    await fireEvent.pointerMove(window, { clientY: 660, pointerId: 1 });
    await fireEvent.pointerUp(window, { clientY: 660, pointerId: 1 });

    // onTaskUpdate should NOT have been called
    expect(onTaskUpdate).not.toHaveBeenCalled();
  });
});
