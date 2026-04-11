import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';

describe('WeeklyView.svelte - Delete Task', () => {
  it('should trigger onTaskDelete when the delete button is clicked', async () => {
    cleanup();
    const onTaskDelete = vi.fn();
    const tasks = [
      {
        id: 1,
        title: 'Task to Delete',
        project: 'Project D',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
    ];
    render(WeeklyView, { props: { tasks, onTaskDelete } });

    // Find the task block
    const taskBlock = screen.getByText('Task to Delete').closest('.task-block');
    expect(taskBlock).toBeDefined();

    // Find the delete button within the task block
    // We'll use a title or aria-label for the button
    const deleteButton = screen.getByTitle(/Delete Task/i);
    expect(deleteButton).toBeDefined();

    // Click the delete button
    await fireEvent.click(deleteButton);

    // Verify the callback was triggered with the correct task ID
    expect(onTaskDelete).toHaveBeenCalledWith(1);
  });
});
