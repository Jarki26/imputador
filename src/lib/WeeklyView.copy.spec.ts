import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';
import { i18n } from './i18n.svelte';

describe('WeeklyView.svelte - Copy to Recents (Long Press)', () => {
  beforeEach(async () => {
    await i18n.setLocale('es');
  });

  it('should trigger onTaskCopyToRecents when a task is long-pressed', async () => {
    cleanup();
    vi.useFakeTimers();
    const onTaskCopyToRecents = vi.fn();
    const tasks = [
      {
        id: 1,
        title: 'Task to Copy',
        project: 'Project C',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
        type: 'General',
      },
    ];
    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks, onTaskCopyToRecents } });

    const taskBlock = screen.getByText('Task to Copy').closest('.task-block');
    expect(taskBlock).toBeDefined();

    // Start long press
    await fireEvent.pointerDown(taskBlock!, { button: 0, pointerId: 1 });
    
    // Fast-forward time by 600ms (typical long press threshold is 500ms)
    await act(() => {
      vi.advanceTimersByTime(600);
    });

    // Release
    await fireEvent.pointerUp(taskBlock!, { pointerId: 1 });

    expect(onTaskCopyToRecents).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Task to Copy',
      project: 'Project C'
    }));
    
    vi.useRealTimers();
  });
});
