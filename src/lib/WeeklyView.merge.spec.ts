import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';
import { i18n } from './i18n.svelte';

describe('WeeklyView.svelte - Merge Tasks', () => {
  beforeEach(async () => {
    await i18n.setLocale('es');
  });

  it('should trigger a merge prompt when a task is moved adjacent to an identical one', async () => {
    cleanup();
    const onTaskUpdate = vi.fn();
    const tasks = [
      {
        id: 1,
        title: 'Task A',
        project: 'Project 1',
        type: 'General',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
      {
        id: 2,
        title: 'Task A',
        project: 'Project 1',
        type: 'General',
        startTime: new Date('2026-04-06T11:00:00Z'),
        endTime: new Date('2026-04-06T12:00:00Z'),
      },
    ];

    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks, onTaskUpdate } });

    // Find all task blocks with title 'Task A'
    const taskBlocks = screen.getAllByText('Task A').map(el => el.closest('.task-block'));
    const task2Block = taskBlocks[1];
    
    expect(task2Block).toBeDefined();

    // Trigger move
    // We move task 2 (starts at 11:00, 660px) to 10:00 (600px)
    await fireEvent.pointerDown(task2Block!, { clientY: 660, clientX: 100, pointerId: 1, button: 0 });
    // Move to 10:00
    await fireEvent.pointerMove(window, { clientY: 600, clientX: 100, pointerId: 1 });
    // Release
    await fireEvent.pointerUp(window, { clientY: 600, clientX: 100, pointerId: 1 });

    // Check if a merge prompt is visible
    expect(screen.getByText('¿Combinar tareas idénticas?')).toBeDefined();
  });

  it('should merge tasks when "Sí" is clicked', async () => {
    cleanup();
    const onTaskUpdate = vi.fn();
    const onTaskDelete = vi.fn();
    const tasks = [
      {
        id: 1,
        title: 'Task A',
        project: 'Project 1',
        type: 'General',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
      {
        id: 2,
        title: 'Task A',
        project: 'Project 1',
        type: 'General',
        startTime: new Date('2026-04-06T11:00:00Z'),
        endTime: new Date('2026-04-06T12:00:00Z'),
      },
    ];

    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks, onTaskUpdate, onTaskDelete } });

    const taskBlocks = screen.getAllByText('Task A').map(el => el.closest('.task-block'));
    const task2Block = taskBlocks[1];

    // Move task 2 to be adjacent to task 1
    await fireEvent.pointerDown(task2Block!, { clientY: 660, clientX: 100, pointerId: 1, button: 0 });
    await fireEvent.pointerMove(window, { clientY: 600, clientX: 100, pointerId: 1 });
    await fireEvent.pointerUp(window, { clientY: 600, clientX: 100, pointerId: 1 });

    // Click "Sí"
    const confirmButton = screen.getByText('Sí');
    await fireEvent.click(confirmButton);

    // Verify task 2 was deleted and task 1 was updated with combined range
    expect(onTaskDelete).toHaveBeenCalledWith(2);
    expect(onTaskUpdate).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      startTime: expect.any(Date),
      endTime: expect.any(Date)
    }));

    const mergedCall = onTaskUpdate.mock.calls[0][0];
    expect(mergedCall.startTime.getUTCHours()).toBe(9);
    expect(mergedCall.endTime.getUTCHours()).toBe(11);
  });
});
