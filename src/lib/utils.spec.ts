import { describe, it, expect } from 'vitest';
import { calculateTotalHours } from './utils';
import type { Task } from './db';

describe('calculateTotalHours', () => {
  it('should return 0 for empty tasks', () => {
    expect(calculateTotalHours([])).toBe(0);
  });

  it('should correctly sum hours from billable tasks', () => {
    const tasks: Partial<Task>[] = [
      {
        startTime: new Date('2026-04-09T08:00:00'),
        endTime: new Date('2026-04-09T10:00:00'), // 2 hours
        type: 'General'
      },
      {
        startTime: new Date('2026-04-09T11:00:00'),
        endTime: new Date('2026-04-09T12:30:00'), // 1.5 hours
        type: 'Feature'
      }
    ];
    expect(calculateTotalHours(tasks as Task[])).toBe(3.5);
  });

  it('should exclude non-billable (Rest) tasks', () => {
    const tasks: Partial<Task>[] = [
      {
        startTime: new Date('2026-04-09T08:00:00'),
        endTime: new Date('2026-04-09T10:00:00'), // 2 hours
        type: 'General'
      },
      {
        startTime: new Date('2026-04-09T12:00:00'),
        endTime: new Date('2026-04-09T13:00:00'), // 1 hour (Rest)
        type: 'Rest'
      }
    ];
    expect(calculateTotalHours(tasks as Task[])).toBe(2);
  });
});
