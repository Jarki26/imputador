import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';
import { i18n } from './i18n.svelte';

describe('WeeklyView.svelte Long Press', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should copy to recents AND check for merge on long press', async () => {
    const onTaskCopyToRecents = vi.fn();
    const startDate = new Date('2026-04-06'); // Monday
    const tasks = [
      {
        id: 1,
        title: 'Task 1',
        project: 'P1',
        type: 'General',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
      {
        id: 2,
        title: 'Task 1', // Same title
        project: 'P1',    // Same project
        type: 'General', // Same type
        startTime: new Date('2026-04-06T10:00:00Z'), // Adjacent
        endTime: new Date('2026-04-06T11:00:00Z'),
      },
    ];

    const { rerender } = render(WeeklyView, {
      props: { startDate, tasks, onTaskCopyToRecents },
    });

    const task2Block = screen.getAllByText('Task 1')[1].closest('.task-block');

    // Simulate long press (500ms timer in WeeklyView)
    await fireEvent.pointerDown(task2Block!, { pointerId: 1, button: 0 });
    
    await act(() => {
      vi.advanceTimersByTime(600);
    });

    // Should have copied to recents
    expect(onTaskCopyToRecents).toHaveBeenCalled();

    // Should show merge modal because Task 1 and Task 2 are identical and adjacent
    expect(await screen.findByText(/¿Combinar tareas idénticas?/i)).toBeDefined();

    // Click "No"
    const onTaskUpdate = vi.fn();
    await rerender({ onTaskUpdate }); // Inject mock

    const noBtn = screen.getByRole('button', { name: /No/i });
    await fireEvent.click(noBtn);

    // Should NOT have called onTaskUpdate because the task hasn't moved
    expect(onTaskUpdate).not.toHaveBeenCalled();
  });

  it('should copy to recents AND check for snap on long press', async () => {
    const onTaskCopyToRecents = vi.fn();
    const startDate = new Date('2026-04-06'); // Monday
    const tasks = [
      {
        id: 1,
        title: 'Task 1',
        project: 'P1',
        type: 'General',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
      {
        id: 2,
        title: 'Task 2',
        project: 'P2',
        type: 'General',
        startTime: new Date('2026-04-06T10:05:00Z'), // 5 min gap
        endTime: new Date('2026-04-06T11:00:00Z'),
      },
    ];

    const { rerender } = render(WeeklyView, {
      props: { startDate, tasks, onTaskCopyToRecents },
    });

    const task2Block = screen.getByText('Task 2').closest('.task-block');

    await fireEvent.pointerDown(task2Block!, { pointerId: 1, button: 0 });
    
    await act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onTaskCopyToRecents).toHaveBeenCalled();

    // Should show snap modal
    expect(await screen.findByText(/¿Cerrar el hueco?/i)).toBeDefined();
  });

  it('should copy to recents AND check for collision on long press', async () => {
    const onTaskCopyToRecents = vi.fn();
    const startDate = new Date('2026-04-06'); // Monday
    const tasks = [
      {
        id: 1,
        title: 'Task 1',
        project: 'P1',
        type: 'General',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
      {
        id: 2,
        title: 'Task 2',
        project: 'P2',
        type: 'General',
        startTime: new Date('2026-04-06T09:30:00Z'), // ALREADY colliding
        endTime: new Date('2026-04-06T10:30:00Z'),
      },
    ];

    render(WeeklyView, {
      props: { startDate, tasks, onTaskCopyToRecents },
    });

    const task2Block = screen.getByText('Task 2').closest('.task-block');

    await fireEvent.pointerDown(task2Block!, { pointerId: 1, button: 0 });
    
    await act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onTaskCopyToRecents).toHaveBeenCalled();

    // Should show collision modal
    expect(await screen.findByText(/Colisión Detectada/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Continuar de todas formas/i })).toBeDefined();
  });
});
