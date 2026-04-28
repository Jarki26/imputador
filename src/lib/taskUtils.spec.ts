import { describe, it, expect } from 'vitest';
import {
  calculateTotalHours,
  calculateWorkHours,
  calculateRestHours,
} from './taskUtils';
import type { Task } from './db';

describe('taskUtils', () => {
  const baseTask: Partial<Task> = {
    startTime: new Date('2026-04-19T08:00:00'),
    endTime: new Date('2026-04-19T10:00:00'), // 2 hours
  };

  it('calculateTotalHours should exclude OFFLINE tasks', () => {
    const tasks: Task[] = [
      { ...baseTask, type: 'DESARROLLO' } as Task,
      {
        ...baseTask,
        startTime: new Date('2026-04-19T10:00:00'),
        endTime: new Date('2026-04-19T11:00:00'),
        type: 'OFFLINE',
      } as Task,
    ];
    // Should only count the 2 hours of DESARROLLO
    expect(calculateTotalHours(tasks)).toBe(2);
  });

  it('calculateWorkHours should exclude OFFLINE tasks', () => {
    const tasks: Task[] = [
      { ...baseTask, type: 'DESARROLLO' } as Task,
      {
        ...baseTask,
        startTime: new Date('2026-04-19T10:00:00'),
        endTime: new Date('2026-04-19T11:00:00'),
        type: 'OFFLINE',
      } as Task,
    ];
    // Should only count the 2 hours of DESARROLLO
    expect(calculateWorkHours(tasks)).toBe(2);
  });

  it('calculateTotalHours should include AUSENCIA FACTURABLE but calculateWorkHours should NOT', () => {
    const tasks: Task[] = [
      { ...baseTask, type: 'AUSENCIA FACTURABLE' } as Task,
    ];
    expect(calculateTotalHours(tasks)).toBe(2);
    expect(calculateWorkHours(tasks)).toBe(0);
  });

  it('calculateRestHours should include REST but exclude OFFLINE and AUSENCIA FACTURABLE', () => {
    const tasks: Task[] = [
      { ...baseTask, type: 'REST' } as Task,
      {
        ...baseTask,
        startTime: new Date('2026-04-19T10:00:00'),
        endTime: new Date('2026-04-19T11:00:00'),
        type: 'OFFLINE',
      } as Task,
      {
        ...baseTask,
        startTime: new Date('2026-04-19T11:00:00'),
        endTime: new Date('2026-04-19T12:00:00'),
        type: 'AUSENCIA FACTURABLE',
      } as Task,
    ];
    // Only the 2 hours of REST
    expect(calculateRestHours(tasks)).toBe(2);
  });
});
