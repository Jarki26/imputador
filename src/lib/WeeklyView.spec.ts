import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
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
});
