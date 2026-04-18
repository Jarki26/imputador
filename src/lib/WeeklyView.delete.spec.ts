import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';
import { i18n } from './i18n.svelte';

describe('WeeklyView.svelte - Delete Task', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  it('should trigger onTaskDelete when the delete button is clicked', async () => {
    const onTaskDelete = vi.fn();
    const tasks = [
      {
        id: 1,
        title: 'Task to Delete',
        project: 'Project D',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
        type: 'General',
      },
    ];
    render(WeeklyView, {
      props: { tasks, onTaskDelete, startDate: new Date('2026-04-06') },
    });

    // Find the task block
    const taskBlock = screen.getByText('Task to Delete').closest('.task-block');
    expect(taskBlock).toBeDefined();

    // Find the delete button within the task block - Using 'Eliminar' which is common.delete
    const deleteButton = screen.getByTitle(/Eliminar/i);
    expect(deleteButton).toBeDefined();

    // Click the delete button
    await fireEvent.click(deleteButton);

    // Verify the callback was triggered with the correct task ID
    expect(onTaskDelete).toHaveBeenCalledWith(1);
  });
});
