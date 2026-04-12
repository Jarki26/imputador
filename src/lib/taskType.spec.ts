import { describe, it, expect } from 'vitest';
import { TASK_TYPES, getTaskType, countsTowardGoal, isBillable } from './config';
import { calculateTotalHours } from './utils';
import type { Task } from './db';

describe('Ausencia Facturable Task Type', () => {
  it('should be defined in TASK_TYPES', () => {
    const type = getTaskType('Ausencia Facturable');
    expect(type).toBeDefined();
    expect(type?.name).toBe('Ausencia Facturable');
  });

  it('should NOT be billable (not active work)', () => {
    expect(isBillable('Ausencia Facturable')).toBe(false);
  });

  it('should count toward the weekly goal', () => {
    expect(countsTowardGoal('Ausencia Facturable')).toBe(true);
  });

  it('calculateTotalHours should include Ausencia Facturable but exclude Rest', () => {
    const tasks: Partial<Task>[] = [
      {
        startTime: new Date('2026-04-12T08:00:00'),
        endTime: new Date('2026-04-12T10:00:00'), // 2 hours (General)
        type: 'General'
      },
      {
        startTime: new Date('2026-04-12T10:00:00'),
        endTime: new Date('2026-04-12T11:00:00'), // 1 hour (Rest)
        type: 'Rest'
      },
      {
        startTime: new Date('2026-04-12T11:00:00'),
        endTime: new Date('2026-04-12T13:00:00'), // 2 hours (Ausencia Facturable)
        type: 'Ausencia Facturable'
      }
    ];
    // Total should be 2 (General) + 2 (Ausencia Facturable) = 4
    expect(calculateTotalHours(tasks as Task[])).toBe(4);
  });
});
