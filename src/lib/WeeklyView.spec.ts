import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';
import { i18n } from './i18n.svelte';

describe('WeeklyView.svelte', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  it('should render a 7-day grid', () => {
    render(WeeklyView, { props: { startDate: new Date('2026-04-06') } }); // Monday

    const days = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];
    days.forEach((day) => {
      expect(screen.getByText(new RegExp(day, 'i'))).toBeDefined();
    });
  });

  it('should render a time axis', () => {
    render(WeeklyView, { props: { startDate: new Date('2026-04-06') } });

    // Check for some hours
    expect(screen.getByText('08:00')).toBeDefined();
    expect(screen.getByText('12:00')).toBeDefined();
    expect(screen.getByText('18:00')).toBeDefined();
  });

  it('should display daily totals', () => {
    const tasks = [
      {
        id: 1,
        title: 'Task 1',
        project: 'Project A',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'), // 1 hour
      },
    ];
    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks } });

    expect(screen.getAllByTitle('Horas Facturables')[0]).toHaveTextContent('1.00h');
  });

  it('should display weekly total vs target', () => {
    const tasks = [
      {
        id: 1,
        title: 'Task 1',
        project: 'Project A',
        type: 'DESARROLLO',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T11:00:00Z'), // 2 hours
      },
      {
        id: 2,
        title: 'Rest',
        project: '-',
        type: 'REST',
        startTime: new Date('2026-04-06T13:00:00Z'),
        endTime: new Date('2026-04-06T14:00:00Z'), // 1 hour (excluded)
      },
    ];
    render(WeeklyView, {
      props: { startDate: new Date('2026-04-06'), tasks, weeklyTarget: 41 },
    });

    // Registrado: 2.00h / Objetivo: 41.00h
    expect(screen.getByText(/Registrado: 2\.00h \/ Objetivo: 41\.00h/i)).toBeDefined();
  });

  it('should exclude REST tasks from daily total', () => {
    const tasks = [
      {
        id: 1,
        title: 'Work',
        type: 'DESARROLLO',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T11:00:00Z'), // 2 hours
      },
      {
        id: 2,
        title: 'Lunch',
        type: 'REST',
        startTime: new Date('2026-04-06T13:00:00Z'),
        endTime: new Date('2026-04-06T14:00:00Z'), // 1 hour
      },
    ];
    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks } });

    expect(screen.getAllByTitle('Horas Facturables')[0]).toHaveTextContent('2.00h');
    expect(screen.getAllByTitle('Horas de Descanso/No facturables')[0]).toHaveTextContent('1.00h');
  });

  it('should calculate daily total excluding overlapping time', () => {
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
        startTime: new Date('2026-04-06T09:30:00Z'),
        endTime: new Date('2026-04-06T11:00:00Z'),
      },
    ];
    // Total should be from 09:00 to 11:00 = 2.00h, NOT 1h + 1.5h = 2.5h
    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks } });

    expect(screen.getAllByTitle('Horas Facturables')[0]).toHaveTextContent('2.00h');
  });

  it('should render task blocks on the grid', () => {
    const tasks = [
      {
        id: 1,
        title: 'Weekly Task',
        description: 'Weekly Desc',
        project: 'Project Weekly',
        type: 'Feature',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:30:00Z'), // 1.5 hours
      },
    ];

    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks } });

    expect(screen.getByText('Weekly Task')).toBeDefined();
    expect(screen.getByText('Project Weekly')).toBeDefined();
    expect(screen.getAllByText(/1\.50h/i)).toHaveLength(3);
  });

  it('should highlight overlapping tasks with an error state', () => {
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
        startTime: new Date('2026-04-06T09:30:00Z'),
        endTime: new Date('2026-04-06T11:00:00Z'),
      },
    ];

    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks } });

    const task1 = screen.getByText('Task 1').closest('.task-block');
    const task2 = screen.getByText('Task 2').closest('.task-block');

    expect(task1?.classList.contains('has-overlap')).toBe(true);
    expect(task2?.classList.contains('has-overlap')).toBe(true);
  });

  it('should trigger onSlotClick when an empty slot is clicked', async () => {
    const onSlotClick = vi.fn();
    const startDate = new Date('2026-04-06'); // Monday
    render(WeeklyView, { props: { startDate, onSlotClick } });

    // Find the first hour cell (00:00) of the first day (Monday)
    const dayColumns = document.querySelectorAll('.day-column');
    const mondayColumn = dayColumns[0];
    const hourCells = mondayColumn.querySelectorAll('.hour-cell');

    // Click on 09:00 slot (index 9)
    await fireEvent.click(hourCells[9]);

    expect(onSlotClick).toHaveBeenCalled();
    const calledDate = onSlotClick.mock.calls[0][0];
    expect(calledDate.getFullYear()).toBe(2026);
    expect(calledDate.getMonth()).toBe(3); // April
    expect(calledDate.getDate()).toBe(6);
    expect(calledDate.getHours()).toBe(9);
  });

  it('should trigger onTaskClick when a task block is clicked', async () => {
    const onTaskClick = vi.fn();
    const tasks = [
      {
        id: 1,
        title: 'Clickable Task',
        project: 'Project X',
        startTime: new Date('2026-04-06T10:00:00Z'),
        endTime: new Date('2026-04-06T11:00:00Z'),
      },
    ];
    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks, onTaskClick } });

    const taskBlock = screen.getByText('Clickable Task').closest('.task-block');
    await fireEvent.click(taskBlock!);

    expect(onTaskClick).toHaveBeenCalledWith(expect.objectContaining(tasks[0]));
  });

  it('should trigger onTaskUpdate when a task is dragged to a new time', async () => {
    const onTaskUpdate = vi.fn();
    const tasks = [
      {
        id: 1,
        title: 'Draggable Task',
        project: 'Project D',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
    ];
    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks, onTaskUpdate } });

    const taskBlock = screen.getByText('Draggable Task').closest('.task-block');

    // Simulate drag start
    await fireEvent.pointerDown(taskBlock!, { clientY: 0, pointerId: 1 });
    // Move 60px down (1 hour)
    await fireEvent.pointerMove(taskBlock!, { clientY: 60, pointerId: 1 });
    // Release
    await fireEvent.pointerUp(taskBlock!, { clientY: 60, pointerId: 1 });

    expect(onTaskUpdate).toHaveBeenCalled();
    const updatedTask = onTaskUpdate.mock.calls[0][0];
    // Original was 09:00, moved 1 hour down -> should be 10:00
    expect(new Date(updatedTask.startTime).getUTCHours()).toBe(10);
    expect(new Date(updatedTask.endTime).getUTCHours()).toBe(11);
  });

  it('should trigger onTaskUpdate when a task is resized', async () => {
    const onTaskUpdate = vi.fn();
    const tasks = [
      {
        id: 1,
        title: 'Resizable Task',
        project: 'Project R',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'),
      },
    ];
    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks, onTaskUpdate } });

    const taskBlock = screen.getByText('Resizable Task').closest('.task-block');
    const resizeHandle = taskBlock?.querySelector('.resize-handle');

    // Simulate resize start
    await fireEvent.pointerDown(resizeHandle!, { clientY: 60, pointerId: 2 });
    // Move 30px down (30 mins)
    await fireEvent.pointerMove(resizeHandle!, { clientY: 90, pointerId: 2 });
    // Release
    await fireEvent.pointerUp(resizeHandle!, { clientY: 90, pointerId: 2 });

    expect(onTaskUpdate).toHaveBeenCalled();
    const updatedTask = onTaskUpdate.mock.calls[0][0];
    expect(new Date(updatedTask.startTime).getUTCHours()).toBe(9);
    expect(new Date(updatedTask.endTime).getUTCHours()).toBe(10);
    expect(new Date(updatedTask.endTime).getUTCMinutes()).toBe(30);
  });

  it('should remove has-overlap class when tasks no longer overlap', async () => {
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
        startTime: new Date('2026-04-06T09:30:00Z'), // Overlaps
        endTime: new Date('2026-04-06T11:00:00Z'),
      },
    ];

    const { rerender } = render(WeeklyView, {
      props: { startDate: new Date('2026-04-06'), tasks },
    });

    let task1 = screen.getByText('Task 1').closest('.task-block');
    let task2 = screen.getByText('Task 2').closest('.task-block');

    expect(task1?.classList.contains('has-overlap')).toBe(true);
    expect(task2?.classList.contains('has-overlap')).toBe(true);

    // Resolve overlap by moving Task 2
    const updatedTasks = [
      tasks[0],
      {
        ...tasks[1],
        startTime: new Date('2026-04-06T10:00:00Z'), // No longer overlaps
        endTime: new Date('2026-04-06T11:30:00Z'),
      },
    ];

    await rerender({ tasks: updatedTasks });

    task1 = screen.getByText('Task 1').closest('.task-block');
    task2 = screen.getByText('Task 2').closest('.task-block');

    expect(task1?.classList.contains('has-overlap')).toBe(false);
    expect(task2?.classList.contains('has-overlap')).toBe(false);
  });

  it('should remove has-overlap class during drag when overlap is resolved', async () => {
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
        startTime: new Date('2026-04-06T09:30:00Z'), // Overlaps
        endTime: new Date('2026-04-06T11:00:00Z'),
      },
    ];

    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks } });

    let task1 = screen.getByText('Task 1').closest('.task-block');
    let task2 = screen.getByText('Task 2').closest('.task-block');

    expect(task1?.classList.contains('has-overlap')).toBe(true);
    expect(task2?.classList.contains('has-overlap')).toBe(true);

    // Start dragging Task 2
    await fireEvent.pointerDown(task2!, {
      clientY: 30,
      pointerId: 3,
      button: 0,
    });

    // Move Task 2 down by 60px (1 hour) -> starts at 10:30, no longer overlaps
    await fireEvent.pointerMove(window, { clientY: 90, pointerId: 3 });

    // In Svelte 5, the UI should update
    task1 = screen.getByText('Task 1').closest('.task-block');
    task2 = screen.getByText('Task 2').closest('.task-block');

    expect(task1?.classList.contains('has-overlap')).toBe(false);
    // Task 2 should also not have it (using the dragged version)
    expect(task2?.classList.contains('has-overlap')).toBe(false);
  });

  it('should display remaining weekly time', async () => {
    const tasks = [
      {
        id: 1,
        title: 'Work',
        type: 'DESARROLLO',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T14:00:00Z'), // 5 hours
      },
      {
        id: 2,
        title: 'Absence',
        type: 'AUSENCIA FACTURABLE',
        startTime: new Date('2026-04-07T09:00:00Z'),
        endTime: new Date('2026-04-07T11:00:00Z'), // 2 hours
      },
    ];
    // Goal: 41h. Absence: 2h. Effective goal: 39h. Logged work: 5h. Remaining: 34h.
    render(WeeklyView, {
      props: { startDate: new Date('2026-04-06'), tasks, weeklyTarget: 41 },
    });

    // Check for "Restante: 34.00h"
    expect(screen.getByText(/Restante: 34\.00h/i)).toBeDefined();

    // Check for progress bar
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeDefined();
    // 5 logged / 39 goal = ~12.82%
    expect(progressBar.getAttribute('aria-valuenow')).toBe('12.82');
  });
});
