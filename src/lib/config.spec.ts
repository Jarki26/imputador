import { describe, it, expect } from 'vitest';
import { TASK_TYPES, getTaskType, isBillable } from './config';

describe('config', () => {
  it('should have a list of task types', () => {
    expect(TASK_TYPES.length).toBeGreaterThan(0);
  });

  it('should identify REST as non-billable', () => {
    const rest = getTaskType('REST');
    expect(rest).toBeDefined();
    expect(rest?.isBillable).toBe(false);
  });

  it('should identify DESARROLLO as billable', () => {
    const general = getTaskType('DESARROLLO');
    expect(general).toBeDefined();
    expect(general?.isBillable).toBe(true);
  });

  it('isBillable helper should work correctly', () => {
    expect(isBillable('REST')).toBe(false);
    expect(isBillable('DESARROLLO')).toBe(true);
    expect(isBillable('Unknown')).toBe(true); // Default to billable
  });
});
