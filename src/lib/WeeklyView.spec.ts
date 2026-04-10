import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';

describe('WeeklyView.svelte', () => {
  it('should render a 7-day grid', () => {
    cleanup();
    render(WeeklyView, { props: { startDate: new Date('2026-04-06') } }); // Monday
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    days.forEach(day => {
      expect(screen.getByText(new RegExp(day, 'i'))).toBeDefined();
    });
  });

  it('should render a time axis', () => {
    cleanup();
    render(WeeklyView, { props: { startDate: new Date('2026-04-06') } });
    
    // Check for some hours
    expect(screen.getByText('08:00')).toBeDefined();
    expect(screen.getByText('12:00')).toBeDefined();
    expect(screen.getByText('18:00')).toBeDefined();
  });

  it('should display daily totals', () => {
    cleanup();
    const tasks = [
      {
        id: 1,
        title: 'Task 1',
        project: 'Project A',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:00:00Z'), // 1 hour
      }
    ];
    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks } });
    
    expect(screen.getByText(/Total: 1\.00h/i)).toBeDefined();
  });

  it('should calculate daily total excluding overlapping time', () => {
    cleanup();
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
      }
    ];
    // Total should be from 09:00 to 11:00 = 2.00h, NOT 1h + 1.5h = 2.5h
    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks } });
    
    expect(screen.getByText(/Total: 2\.00h/i)).toBeDefined();
  });

  it('should render task blocks on the grid', () => {
    cleanup();
    const tasks = [
      {
        id: 1,
        title: 'Weekly Task',
        description: 'Weekly Desc',
        project: 'Project Weekly',
        type: 'Feature',
        startTime: new Date('2026-04-06T09:00:00Z'),
        endTime: new Date('2026-04-06T10:30:00Z'), // 1.5 hours
      }
    ];

    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks } });

    expect(screen.getByText('Weekly Task')).toBeDefined();
    expect(screen.getByText('Project Weekly')).toBeDefined();
    expect(screen.getAllByText(/1\.50h/i)).toHaveLength(2);
  });

  it('should highlight overlapping tasks with an error state', () => {
    cleanup();
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
      }
    ];

    render(WeeklyView, { props: { startDate: new Date('2026-04-06'), tasks } });

    const task1 = screen.getByText('Task 1').closest('.task-block');
    const task2 = screen.getByText('Task 2').closest('.task-block');

    expect(task1?.classList.contains('has-overlap')).toBe(true);
    expect(task2?.classList.contains('has-overlap')).toBe(true);
  });

  it('should trigger onSlotClick when an empty slot is clicked', async () => {
    cleanup();
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
});
