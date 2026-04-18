import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';
import { i18n } from './i18n.svelte';

describe('WeeklyView Zoom Functionality', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('en');
  });

  it('should render zoom controls', () => {
    render(WeeklyView, { props: { startDate: new Date('2026-04-06') } });

    // These buttons don't exist yet, so this should fail
    expect(screen.getByTitle(/Zoom In/i)).toBeDefined();
    expect(screen.getByTitle(/Zoom Out/i)).toBeDefined();
    expect(screen.getByTitle(/Reset Zoom/i)).toBeDefined();
  });

  it('should have default cell height of 60px (1x zoom)', () => {
    render(WeeklyView, { props: { startDate: new Date('2026-04-06') } });

    const hourCells = document.querySelectorAll('.hour-cell');
    expect(hourCells[0].clientHeight).toBe(60);
  });

  it('should increase cell height when zooming in', async () => {
    const { container } = render(WeeklyView, {
      props: { startDate: new Date('2026-04-06') },
    });

    const zoomInBtn = screen.getByTitle(/Zoom In/i);
    await fireEvent.click(zoomInBtn); // 1.1x

    const hourCells = container.querySelectorAll('.hour-cell');
    // 60 * 1.1 = 66
    // Note: We need to make sure the style is actually applied to the element
    expect(hourCells[0].getAttribute('style')).toContain('height: 66px');
  });

  it('should decrease cell height when zooming out', async () => {
    const { container } = render(WeeklyView, {
      props: { startDate: new Date('2026-04-06') },
    });

    const zoomOutBtn = screen.getByTitle(/Zoom Out/i);
    await fireEvent.click(zoomOutBtn); // 0.9x

    const hourCells = container.querySelectorAll('.hour-cell');
    // 60 * 0.9 = 54
    expect(hourCells[0].getAttribute('style')).toContain('height: 54px');
  });

  it('should restore default height when resetting zoom', async () => {
    const { container } = render(WeeklyView, {
      props: { startDate: new Date('2026-04-06') },
    });

    const zoomInBtn = screen.getByTitle(/Zoom In/i);
    const resetBtn = screen.getByTitle(/Reset Zoom/i);

    await fireEvent.click(zoomInBtn);
    await fireEvent.click(resetBtn);

    const hourCells = container.querySelectorAll('.hour-cell');
    expect(hourCells[0].getAttribute('style')).toContain('height: 60px');
  });

  describe('Interaction scaling', () => {
    it('should move a task correctly at 2x zoom', async () => {
      const task = {
        id: 1,
        title: 'Test Task',
        project: 'Project',
        type: 'DESARROLLO',
        startTime: new Date('2026-04-06T10:00:00'),
        endTime: new Date('2026-04-06T11:00:00'),
      };
      const onTaskUpdate = vi.fn();
      const { container } = render(WeeklyView, {
        props: {
          startDate: new Date('2026-04-06'),
          tasks: [task],
          onTaskUpdate,
        },
      });

      // Zoom in to 2x (from 1.0 to 2.0 with +0.1 step = 10 clicks)
      const zoomInBtn = screen.getByTitle(/Zoom In/i);
      for (let i = 0; i < 10; i++) {
        await fireEvent.click(zoomInBtn);
      }

      const taskElement = screen.getByText('Test Task').closest('.task-block')!;

      // Drag task down by 1 hour (60 minutes).
      // At 1x zoom, 15 minutes = 15 pixels.
      // At 2x zoom, 15 minutes = 30 pixels.
      // 1 hour at 2x zoom = 120 pixels.
      await fireEvent.pointerDown(taskElement, {
        clientY: 100,
        clientX: 100,
        button: 0,
      });
      // Moving 120 pixels down should result in 60 minutes move
      await fireEvent.pointerMove(taskElement, { clientY: 220, clientX: 100 });
      await fireEvent.pointerUp(taskElement);

      expect(onTaskUpdate).toHaveBeenCalled();
      const updatedTask = onTaskUpdate.mock.calls[0][0];
      expect(updatedTask.startTime.getHours()).toBe(11);
      expect(updatedTask.startTime.getMinutes()).toBe(0);
    });

    it('should resize a task correctly at 0.5x zoom', async () => {
      const task = {
        id: 2,
        title: 'Resize Task',
        project: 'Project',
        type: 'DESARROLLO',
        startTime: new Date('2026-04-06T10:00:00'),
        endTime: new Date('2026-04-06T11:00:00'),
      };
      const onTaskUpdate = vi.fn();
      const { container } = render(WeeklyView, {
        props: {
          startDate: new Date('2026-04-06'),
          tasks: [task],
          onTaskUpdate,
        },
      });

      // Zoom out to 0.5x (from 1.0 to 0.5 with -0.1 step = 5 clicks)
      const zoomOutBtn = screen.getByTitle(/Zoom Out/i);
      for (let i = 0; i < 5; i++) {
        await fireEvent.click(zoomOutBtn);
      }

      const resizeHandle = container.querySelector('.resize-handle')!;

      // Extend duration by 30 minutes.
      // At 0.5x zoom, 15 minutes = 7.5 pixels (rounded to 8 or something).
      // 30 minutes at 0.5x zoom = 15 pixels.
      await fireEvent.pointerDown(resizeHandle, {
        clientY: 100,
        clientX: 100,
        button: 0,
      });
      await fireEvent.pointerMove(resizeHandle, { clientY: 115, clientX: 100 });
      await fireEvent.pointerUp(resizeHandle);

      expect(onTaskUpdate).toHaveBeenCalled();
      const updatedTask = onTaskUpdate.mock.calls[0][0];
      // 10:00 to 11:30
      expect(updatedTask.endTime.getHours()).toBe(11);
      expect(updatedTask.endTime.getMinutes()).toBe(30);
    });
  });
});
