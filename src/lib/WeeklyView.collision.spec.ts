import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';
import { i18n } from './i18n.svelte';

describe('WeeklyView.svelte Collision Move', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  it('should show collision modal when dragging a task to a colliding position', async () => {
    const onTaskUpdate = vi.fn();
    const startDate = new Date('2026-04-06'); // Monday
    const tasks = [
      {
        id: 1,
        title: 'Task 1',
        project: 'P1',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
      {
        id: 2,
        title: 'Task 2',
        project: 'P2',
        startTime: new Date('2026-04-06T11:00:00Z'),
        endTime: new Date('2026-04-06T12:00:00Z'),
      },
    ];

    render(WeeklyView, {
      props: { startDate, tasks, onTaskUpdate },
    });

    const task2Block = screen.getByText('Task 2').closest('.task-block');

    // Drag Task 2 to 09:30 (overlap with Task 1)
    // 09:00 is at y=0 relative to something, let's just say each hour is 60px.
    // Task 2 starts at 11:00. To move to 09:30, we need to move it up by 1.5 hours = 90px.
    await fireEvent.pointerDown(task2Block!, {
      clientY: 660,
      pointerId: 1,
      button: 0,
    }); // 11:00 is 11*60 = 660
    await fireEvent.pointerMove(window, { clientY: 570, pointerId: 1 }); // 09:30 is 9.5*60 = 570
    await fireEvent.pointerUp(window, { clientY: 570, pointerId: 1 });

    // Should show collision modal
    expect(await screen.findByText(/Colisión Detectada/i)).toBeDefined();

    // Verify "Continuar de todas formas" button exists
    const continueBtn = screen.getByRole('button', {
      name: /Continuar de todas formas/i,
    });
    expect(continueBtn).toBeDefined();

    // Click "Continuar de todas formas"
    await fireEvent.click(continueBtn);

    // Should call onTaskUpdate with 'normal' mode
    expect(onTaskUpdate).toHaveBeenCalledWith(expect.anything(), 'normal');
  });
});
