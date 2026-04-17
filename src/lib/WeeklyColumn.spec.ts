import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WeeklyColumn from './WeeklyColumn.svelte';
import { i18n } from './i18n.svelte';

describe('WeeklyColumn.svelte', () => {
  const day = new Date('2026-04-06');
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const pixelsPerMinute = 1;

  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  it('should render 24 hour cells', () => {
    render(WeeklyColumn, {
      props: {
        day,
        hours,
        pixelsPerMinute,
        tasks: [],
        taskTypeColors: {},
        locks: { move: false, edit: false, create: false },
        dragInfo: null,
      },
    });

    const cells = document.querySelectorAll('.hour-cell');
    expect(cells).toHaveLength(24);
  });

  it('should render tasks for the day', () => {
    const tasks = [
      {
        id: 1,
        title: 'Task A',
        project: 'Project A',
        type: 'DESARROLLO',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
    ];

    render(WeeklyColumn, {
      props: {
        day,
        hours,
        pixelsPerMinute,
        tasks,
        taskTypeColors: {},
        locks: { move: false, edit: false, create: false },
        dragInfo: null,
      },
    });

    expect(screen.getByText('Task A')).toBeDefined();
    expect(screen.getByText('Project A')).toBeDefined();
  });

  it('should trigger onSlotClick when a cell is clicked', async () => {
    const onSlotClick = vi.fn();
    render(WeeklyColumn, {
      props: {
        day,
        hours,
        pixelsPerMinute,
        tasks: [],
        taskTypeColors: {},
        locks: { move: false, edit: false, create: false },
        dragInfo: null,
        onSlotClick,
      },
    });

    const cells = document.querySelectorAll('.hour-cell');
    await fireEvent.click(cells[9]); // 09:00

    expect(onSlotClick).toHaveBeenCalledWith(day, 9);
  });

  it('should trigger onTaskClick when a task is clicked', async () => {
    const onTaskClick = vi.fn();
    const task = {
      id: 1,
      title: 'Clickable',
      project: 'P',
      type: 'DESARROLLO',
      startTime: new Date('2026-04-06T09:00:00Z'),
      endTime: new Date('2026-04-06T10:00:00Z'),
    };

    render(WeeklyColumn, {
      props: {
        day,
        hours,
        pixelsPerMinute,
        tasks: [task],
        taskTypeColors: {},
        locks: { move: false, edit: false, create: false },
        dragInfo: null,
        onTaskClick,
      },
    });

    const taskBlock = screen.getByText('Clickable').closest('.task-block');
    await fireEvent.click(taskBlock!);

    expect(onTaskClick).toHaveBeenCalled();
    // We expect the original task or at least something with the same ID
    expect(onTaskClick.mock.calls[0][0].id).toBe(1);
  });

  it('should trigger onPointerDown when starting a drag', async () => {
    const onPointerDown = vi.fn();
    const task = {
      id: 1,
      title: 'Draggable',
      project: 'P',
      type: 'DESARROLLO',
      startTime: new Date('2026-04-06T09:00:00Z'),
      endTime: new Date('2026-04-06T10:00:00Z'),
    };

    render(WeeklyColumn, {
      props: {
        day,
        hours,
        pixelsPerMinute,
        tasks: [task],
        taskTypeColors: {},
        locks: { move: false, edit: false, create: false },
        dragInfo: null,
        onPointerDown,
      },
    });

    const taskBlock = screen.getByText('Draggable').closest('.task-block');
    await fireEvent.pointerDown(taskBlock!, { button: 0 });

    expect(onPointerDown).toHaveBeenCalled();
  });
});
