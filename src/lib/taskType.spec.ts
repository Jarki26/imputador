import { describe, it, expect } from 'vitest';
import {
  TASK_TYPES,
  getTaskType,
  countsTowardGoal,
  isBillable,
} from './config';
import {
  calculateTotalHours,
  calculateWorkHours,
  calculateGoalAbsenceHours,
} from './taskUtils';
import type { Task } from './db';

describe('Ausencia Facturable Task Type', () => {
  it('should be defined in TASK_TYPES', () => {
    const type = getTaskType('AUSENCIA FACTURABLE');
    expect(type).toBeDefined();
    expect(type?.name).toBe('AUSENCIA FACTURABLE');
  });

  it('should NOT be billable (not active work)', () => {
    expect(isBillable('AUSENCIA FACTURABLE')).toBe(false);
  });

  it('should count toward the weekly goal', () => {
    expect(countsTowardGoal('AUSENCIA FACTURABLE')).toBe(true);
  });

  it('calculateWorkHours should only include General/Feature/Bug etc', () => {
    const tasks: Partial<Task>[] = [
      {
        startTime: new Date('2026-04-12T08:00:00'),
        endTime: new Date('2026-04-12T10:00:00'), // 2 hours (General -> DESARROLLO)
        type: 'DESARROLLO',
      },
      {
        startTime: new Date('2026-04-12T10:00:00'),
        endTime: new Date('2026-04-12T11:00:00'), // 1 hour (Rest -> REST)
        type: 'REST',
      },
      {
        startTime: new Date('2026-04-12T11:00:00'),
        endTime: new Date('2026-04-12T13:00:00'), // 2 hours (Ausencia Facturable -> AUSENCIA FACTURABLE)
        type: 'AUSENCIA FACTURABLE',
      },
    ];
    // Work should be 2
    expect(calculateWorkHours(tasks as Task[])).toBe(2);
    // Goal Absence should be 2
    expect(calculateGoalAbsenceHours(tasks as Task[])).toBe(2);
  });
});
